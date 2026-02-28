import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";
import { notifyChefFollowers } from "../services/notifications";

const router = Router();

// Helper: parse YYYY-MM-DD to Date at midnight UTC
function parseDate(str: string): Date {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    throw new Error(`Invalid date format: "${str}" (expected YYYY-MM-DD)`);
  }
  const d = new Date(str + "T00:00:00.000Z");
  if (isNaN(d.getTime())) throw new Error(`Invalid date: "${str}"`);
  return d;
}

// Helper: format Date to YYYY-MM-DD
function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ===================== SCHEDULE ENDPOINTS =====================

// GET /api/v1/menus/my/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get(
  "/my/schedule",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const now = new Date();
      const fromStr = (req.query.from as string) || formatDate(now);
      const toDate = new Date(now);
      toDate.setDate(toDate.getDate() + 13);
      const toStr = (req.query.to as string) || formatDate(toDate);

      const from = parseDate(fromStr);
      const to = parseDate(toStr);

      // Fetch menus in range
      const menus = await prisma.menu.findMany({
        where: { chefId: chef.id, date: { gte: from, lte: to } },
        include: { items: { include: { category: true }, orderBy: { sortOrder: "asc" } } },
        orderBy: { date: "asc" },
      });

      // Fetch order counts per day in range
      const orders = await prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          chefId: chef.id,
          createdAt: { gte: from, lte: new Date(to.getTime() + 86400000) },
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
        _count: true,
      });

      // Build order count map by date
      const orderCountMap: Record<string, number> = {};
      for (const o of orders) {
        const dateKey = formatDate(o.createdAt);
        orderCountMap[dateKey] = (orderCountMap[dateKey] || 0) + o._count;
      }

      // Build schedule array
      const schedule: Array<{
        date: string;
        menu: (typeof menus)[number] | null;
        orderCount: number;
      }> = [];

      let currentTime = from.getTime();
      const toTime = to.getTime();
      while (currentTime <= toTime) {
        const current = new Date(currentTime);
        const dateKey = formatDate(current);
        const menu = menus.find((m) => formatDate(m.date) === dateKey) || null;
        schedule.push({
          date: dateKey,
          menu,
          orderCount: orderCountMap[dateKey] || 0,
        });
        currentTime += 86400000;
      }

      // Fetch templates
      const templates = await prisma.menuTemplate.findMany({
        where: { chefId: chef.id },
        orderBy: { updatedAt: "desc" },
      });

      res.json({
        success: true,
        data: {
          schedule,
          templates,
          dailyOrderCap: chef.dailyOrderCap,
          orderCutoffTime: chef.orderCutoffTime,
          vacationStart: chef.vacationStart ? formatDate(chef.vacationStart) : null,
          vacationEnd: chef.vacationEnd ? formatDate(chef.vacationEnd) : null,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch schedule";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/v1/menus/schedule/:date — create or update menu for a date
router.post(
  "/schedule/:date",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const date = parseDate(req.params.date as string);
      const { name, isClosed, notes } = req.body;

      const menu = await prisma.menu.upsert({
        where: { chefId_date: { chefId: chef.id, date } },
        update: {
          ...(name !== undefined ? { name } : {}),
          ...(isClosed !== undefined ? { isClosed } : {}),
          ...(notes !== undefined ? { notes: notes || null } : {}),
        },
        create: {
          chefId: chef.id,
          name: name || `Menu for ${req.params.date}`,
          date,
          isClosed: isClosed || false,
          notes: notes || null,
        },
        include: { items: { include: { category: true }, orderBy: { sortOrder: "asc" } } },
      });

      res.json({ success: true, data: menu });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update schedule";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/v1/menus/schedule/:date/copy — copy menu to target dates
router.post(
  "/schedule/:date/copy",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const sourceDate = parseDate(req.params.date as string);
      const { targetDates } = req.body as { targetDates: string[] };

      if (!targetDates?.length) {
        res.status(400).json({ success: false, error: "targetDates required" });
        return;
      }

      const sourceMenu = await prisma.menu.findUnique({
        where: { chefId_date: { chefId: chef.id, date: sourceDate } },
        include: { items: true },
      });

      if (!sourceMenu) {
        res.status(404).json({ success: false, error: "No menu found for source date" });
        return;
      }

      const created: string[] = [];
      const skipped: string[] = [];

      for (const dateStr of targetDates) {
        const targetDate = parseDate(dateStr);
        const existing = await prisma.menu.findUnique({
          where: { chefId_date: { chefId: chef.id, date: targetDate } },
        });

        if (existing) {
          skipped.push(dateStr);
          continue;
        }

        const newMenu = await prisma.menu.create({
          data: {
            chefId: chef.id,
            name: `Menu for ${dateStr}`,
            date: targetDate,
            isClosed: sourceMenu.isClosed,
            notes: sourceMenu.notes,
          },
        });

        if (sourceMenu.items.length > 0) {
          await prisma.menuItem.createMany({
            data: sourceMenu.items.map((item, idx) => ({
              menuId: newMenu.id,
              categoryId: item.categoryId,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              isVeg: item.isVeg,
              isAvailable: true,
              stockCount: item.stockCount,
              offerPrice: item.offerPrice,
              calories: item.calories,
              allergens: item.allergens,
              ingredients: item.ingredients,
              prepTime: item.prepTime,
              servingSize: item.servingSize,
              eggOption: item.eggOption,
              sortOrder: idx,
            })),
          });
        }

        created.push(dateStr);
      }

      res.json({ success: true, data: { created, skipped } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to copy menu";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/v1/menus/schedule/copy-week — copy entire week to next week
router.post(
  "/schedule/copy-week",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const { sourceWeekStart } = req.body as { sourceWeekStart: string };
      if (!sourceWeekStart) {
        res.status(400).json({ success: false, error: "sourceWeekStart required (Monday YYYY-MM-DD)" });
        return;
      }

      const sourceStart = parseDate(sourceWeekStart);
      const created: string[] = [];
      const skipped: string[] = [];

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const sourceDate = new Date(sourceStart.getTime() + dayOffset * 86400000);

        const targetDate = new Date(sourceDate.getTime() + 7 * 86400000);

        const sourceMenu = await prisma.menu.findUnique({
          where: { chefId_date: { chefId: chef.id, date: sourceDate } },
          include: { items: true },
        });

        if (!sourceMenu) continue;

        const existing = await prisma.menu.findUnique({
          where: { chefId_date: { chefId: chef.id, date: targetDate } },
        });

        const targetDateStr = formatDate(targetDate);
        if (existing) {
          skipped.push(targetDateStr);
          continue;
        }

        const newMenu = await prisma.menu.create({
          data: {
            chefId: chef.id,
            name: `Menu for ${targetDateStr}`,
            date: targetDate,
            isClosed: sourceMenu.isClosed,
            notes: sourceMenu.notes,
          },
        });

        if (sourceMenu.items.length > 0) {
          await prisma.menuItem.createMany({
            data: sourceMenu.items.map((item, idx) => ({
              menuId: newMenu.id,
              categoryId: item.categoryId,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              isVeg: item.isVeg,
              isAvailable: true,
              stockCount: item.stockCount,
              offerPrice: item.offerPrice,
              calories: item.calories,
              allergens: item.allergens,
              ingredients: item.ingredients,
              prepTime: item.prepTime,
              servingSize: item.servingSize,
              eggOption: item.eggOption,
              sortOrder: idx,
            })),
          });
        }

        created.push(targetDateStr);
      }

      res.json({ success: true, data: { created, skipped } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to copy week";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// PATCH /api/v1/menus/schedule/:date/close — toggle day closed
router.patch(
  "/schedule/:date/close",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const date = parseDate(req.params.date as string);

      // If body specifies isClosed, use it; otherwise toggle current value
      const existing = await prisma.menu.findUnique({
        where: { chefId_date: { chefId: chef.id, date } },
      });
      const newIsClosed = req.body.isClosed !== undefined ? Boolean(req.body.isClosed) : !(existing?.isClosed ?? false);

      const menu = await prisma.menu.upsert({
        where: { chefId_date: { chefId: chef.id, date } },
        update: { isClosed: newIsClosed },
        create: {
          chefId: chef.id,
          name: `Menu for ${req.params.date}`,
          date,
          isClosed: newIsClosed,
        },
        include: { items: { include: { category: true } } },
      });

      res.json({ success: true, data: menu });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to toggle close";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/v1/menus/schedule/:date/items — add item to a date's menu
router.post(
  "/schedule/:date/items",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const date = parseDate(req.params.date as string);

      // Ensure menu exists for this date
      const menu = await prisma.menu.upsert({
        where: { chefId_date: { chefId: chef.id, date } },
        update: {},
        create: {
          chefId: chef.id,
          name: `Menu for ${req.params.date}`,
          date,
        },
      });

      const { name, description, price, image, isVeg, calories, allergens, ingredients, prepTime, servingSize, categoryId, stockCount, offerPrice, isAvailable, eggOption } = req.body;

      // Get next sortOrder
      const lastItem = await prisma.menuItem.findFirst({
        where: { menuId: menu.id },
        orderBy: { sortOrder: "desc" },
      });

      const item = await prisma.menuItem.create({
        data: {
          menuId: menu.id,
          name,
          description: description || null,
          price: parseFloat(price),
          image: image || null,
          isVeg: isVeg !== undefined ? isVeg : true,
          calories: calories ? parseInt(calories) : null,
          allergens: allergens || null,
          ingredients: ingredients || null,
          prepTime: prepTime ? parseInt(prepTime) : null,
          servingSize: servingSize || null,
          categoryId: categoryId || null,
          stockCount: stockCount !== undefined && stockCount !== null && stockCount !== "" ? parseInt(stockCount) : null,
          offerPrice: offerPrice ? parseFloat(offerPrice) : null,
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          eggOption: eggOption || null,
          sortOrder: (lastItem?.sortOrder || 0) + 1,
        },
        include: { category: true },
      });

      notifyChefFollowers(chef.id, `${chef.kitchenName} added a new item!`, `"${item.name}" is now available`, { chefId: chef.id }).catch(console.error);

      res.status(201).json({ success: true, data: item });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add item";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/v1/menus/schedule/:date/bulk-price — bulk update pricing
router.post(
  "/schedule/:date/bulk-price",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const date = parseDate(req.params.date as string);
      const { adjustmentType, value, itemIds } = req.body as {
        adjustmentType: "percentage" | "fixed";
        value: number;
        itemIds?: string[];
      };

      if (!adjustmentType || value === undefined) {
        res.status(400).json({ success: false, error: "adjustmentType and value required" });
        return;
      }

      const menu = await prisma.menu.findUnique({
        where: { chefId_date: { chefId: chef.id, date } },
        include: { items: true },
      });

      if (!menu) {
        res.status(404).json({ success: false, error: "No menu for this date" });
        return;
      }

      const itemsToUpdate = itemIds
        ? menu.items.filter((i) => itemIds.includes(i.id))
        : menu.items;

      let updated = 0;
      for (const item of itemsToUpdate) {
        let newPrice: number;
        if (adjustmentType === "percentage") {
          newPrice = Math.round(item.price * (1 + value / 100) * 100) / 100;
        } else {
          newPrice = Math.round((item.price + value) * 100) / 100;
        }
        if (newPrice < 0) newPrice = 0;

        await prisma.menuItem.update({
          where: { id: item.id },
          data: { price: newPrice },
        });
        updated++;
      }

      res.json({ success: true, data: { updated } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to bulk update prices";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// ===================== ORIGINAL ENDPOINTS =====================

// GET /api/v1/menus/my — chef's own menus (includes unavailable items)
router.get(
  "/my",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({
        where: { userId: req.user!.userId },
      });
      if (!chef) {
        res.status(404).json({ success: false, error: "Chef profile not found" });
        return;
      }

      const menus = await prisma.menu.findMany({
        where: { chefId: chef.id },
        include: {
          items: {
            include: { category: true },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { date: "desc" },
      });
      res.json({ success: true, data: menus });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch menus";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// GET /api/v1/menus/:chefId — public menu (date-aware, only available items)
router.get("/:chefId", async (req: Request, res: Response) => {
  try {
    const chefId = req.params.chefId as string;
    const dateParam = req.query.date as string | undefined;

    // Check vacation
    const chef = await prisma.chef.findUnique({ where: { id: chefId }, select: { vacationStart: true, vacationEnd: true, orderCutoffTime: true, dailyOrderCap: true } });
    const now = new Date();
    const today = new Date(now.toISOString().slice(0, 10) + "T00:00:00.000Z");

    if (chef?.vacationStart && chef?.vacationEnd) {
      if (today >= chef.vacationStart && today <= chef.vacationEnd) {
        res.json({ success: true, data: [], vacation: true, vacationEnd: formatDate(chef.vacationEnd) });
        return;
      }
    }

    if (dateParam) {
      // Return menu for specific date
      const date = parseDate(dateParam);
      const menu = await prisma.menu.findUnique({
        where: { chefId_date: { chefId, date } },
        include: {
          items: {
            where: { isAvailable: true },
            include: { category: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      if (!menu) {
        res.json({ success: true, data: [], isClosed: false, date: dateParam });
        return;
      }

      res.json({
        success: true,
        data: [menu],
        isClosed: menu.isClosed,
        notes: menu.notes,
        date: dateParam,
        orderCutoffTime: chef?.orderCutoffTime || null,
        dailyOrderCap: chef?.dailyOrderCap || null,
      });
    } else {
      // Legacy: return all active menus
      const menus = await prisma.menu.findMany({
        where: { chefId, isActive: true, isClosed: false },
        include: {
          items: {
            where: { isAvailable: true },
            include: { category: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { date: "desc" },
      });
      res.json({ success: true, data: menus });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch menus";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/menus - create or find menu for date (chef only)
router.post(
  "/",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({
        where: { userId: req.user!.userId },
      });
      if (!chef) {
        res.status(404).json({ success: false, error: "Chef profile not found" });
        return;
      }

      const { name, date: dateStr, ...rest } = req.body;
      const date = dateStr ? parseDate(dateStr) : new Date(new Date().toISOString().split("T")[0] + "T00:00:00.000Z");

      const menu = await prisma.menu.upsert({
        where: { chefId_date: { chefId: chef.id, date } },
        update: {},
        create: { name: name || "Menu", date, chefId: chef.id, ...rest },
        include: { items: true },
      });
      res.status(201).json({ success: true, data: menu });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create menu";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/v1/menus/:menuId/items - add menu item (chef only)
router.post(
  "/:menuId/items",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      // Verify ownership
      const menu = await prisma.menu.findUnique({ where: { id: req.params.menuId as string }, include: { chef: true } });
      if (!menu) { res.status(404).json({ success: false, error: "Menu not found" }); return; }
      if (menu.chef.userId !== req.user!.userId) { res.status(403).json({ success: false, error: "Not your menu" }); return; }

      const { name, description, price, image, isVeg, calories, allergens, ingredients, prepTime, servingSize, categoryId, stockCount, offerPrice, isAvailable, eggOption } = req.body;
      const item = await prisma.menuItem.create({
        data: {
          menuId: menu.id,
          name,
          description: description || null,
          price: parseFloat(price),
          image: image || null,
          isVeg: isVeg !== undefined ? isVeg : true,
          calories: calories ? parseInt(calories) : null,
          allergens: allergens || null,
          ingredients: ingredients || null,
          prepTime: prepTime ? parseInt(prepTime) : null,
          servingSize: servingSize || null,
          categoryId: categoryId || null,
          stockCount: stockCount !== undefined && stockCount !== null && stockCount !== "" ? parseInt(stockCount) : null,
          offerPrice: offerPrice ? parseFloat(offerPrice) : null,
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          eggOption: eggOption || null,
        },
        include: { category: true },
      });
      // Notify followers
      notifyChefFollowers(menu.chef.id, `${menu.chef.kitchenName} added a new item!`, `"${item.name}" is now available`, { chefId: menu.chef.id }).catch(console.error);
      res.status(201).json({ success: true, data: item });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add item";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// PATCH /api/v1/menus/:menuId/items/:itemId — edit menu item
router.patch(
  "/:menuId/items/:itemId",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const menu = await prisma.menu.findUnique({ where: { id: req.params.menuId as string }, include: { chef: true } });
      if (!menu) { res.status(404).json({ success: false, error: "Menu not found" }); return; }
      if (menu.chef.userId !== req.user!.userId) { res.status(403).json({ success: false, error: "Not your menu" }); return; }

      const existing = await prisma.menuItem.findFirst({ where: { id: req.params.itemId as string, menuId: menu.id } });
      if (!existing) { res.status(404).json({ success: false, error: "Item not found" }); return; }

      const updates: Record<string, unknown> = {};
      const { name, description, price, image, isVeg, calories, allergens, ingredients, prepTime, servingSize, categoryId, stockCount, offerPrice, isAvailable, eggOption } = req.body;
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description || null;
      if (price !== undefined) updates.price = parseFloat(price);
      if (image !== undefined) updates.image = image || null;
      if (isVeg !== undefined) updates.isVeg = isVeg;
      if (calories !== undefined) updates.calories = calories ? parseInt(calories) : null;
      if (allergens !== undefined) updates.allergens = allergens || null;
      if (ingredients !== undefined) updates.ingredients = ingredients || null;
      if (prepTime !== undefined) updates.prepTime = prepTime ? parseInt(prepTime) : null;
      if (servingSize !== undefined) updates.servingSize = servingSize || null;
      if (categoryId !== undefined) updates.categoryId = categoryId || null;
      if (stockCount !== undefined) updates.stockCount = stockCount !== null && stockCount !== "" ? parseInt(stockCount) : null;
      if (offerPrice !== undefined) updates.offerPrice = offerPrice ? parseFloat(offerPrice) : null;
      if (isAvailable !== undefined) updates.isAvailable = isAvailable;
      if (eggOption !== undefined) updates.eggOption = eggOption || null;

      const item = await prisma.menuItem.update({
        where: { id: existing.id },
        data: updates,
        include: { category: true },
      });
      // Notify followers
      notifyChefFollowers(menu.chef.id, `${menu.chef.kitchenName} updated their menu`, `"${item.name}" has been updated`, { chefId: menu.chef.id }).catch(console.error);
      res.json({ success: true, data: item });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update item";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// DELETE /api/v1/menus/:menuId/items/:itemId — delete menu item
router.delete(
  "/:menuId/items/:itemId",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const menu = await prisma.menu.findUnique({ where: { id: req.params.menuId as string }, include: { chef: true } });
      if (!menu) { res.status(404).json({ success: false, error: "Menu not found" }); return; }
      if (menu.chef.userId !== req.user!.userId) { res.status(403).json({ success: false, error: "Not your menu" }); return; }

      const existing = await prisma.menuItem.findFirst({ where: { id: req.params.itemId as string, menuId: menu.id } });
      if (!existing) { res.status(404).json({ success: false, error: "Item not found" }); return; }

      // Check if any orders reference this item
      const orderCount = await prisma.orderItem.count({ where: { menuItemId: existing.id } });
      if (orderCount > 0) {
        // Soft delete — just mark unavailable
        await prisma.menuItem.update({ where: { id: existing.id }, data: { isAvailable: false } });
        res.json({ success: true, data: { message: "Item hidden (has order history)" } });
      } else {
        await prisma.menuItem.delete({ where: { id: existing.id } });
        res.json({ success: true, data: { message: "Item deleted" } });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete item";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// PATCH /api/v1/menus/:menuId/items/:itemId/toggle — toggle availability
router.patch(
  "/:menuId/items/:itemId/toggle",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const menu = await prisma.menu.findUnique({ where: { id: req.params.menuId as string }, include: { chef: true } });
      if (!menu) { res.status(404).json({ success: false, error: "Menu not found" }); return; }
      if (menu.chef.userId !== req.user!.userId) { res.status(403).json({ success: false, error: "Not your menu" }); return; }

      const existing = await prisma.menuItem.findFirst({ where: { id: req.params.itemId as string, menuId: menu.id } });
      if (!existing) { res.status(404).json({ success: false, error: "Item not found" }); return; }

      const item = await prisma.menuItem.update({
        where: { id: existing.id },
        data: { isAvailable: !existing.isAvailable },
        include: { category: true },
      });
      res.json({ success: true, data: item });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to toggle item";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// PATCH /api/v1/menus/:menuId/items/:itemId/stock — update stock count
router.patch(
  "/:menuId/items/:itemId/stock",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const menu = await prisma.menu.findUnique({ where: { id: req.params.menuId as string }, include: { chef: true } });
      if (!menu) { res.status(404).json({ success: false, error: "Menu not found" }); return; }
      if (menu.chef.userId !== req.user!.userId) { res.status(403).json({ success: false, error: "Not your menu" }); return; }

      const existing = await prisma.menuItem.findFirst({ where: { id: req.params.itemId as string, menuId: menu.id } });
      if (!existing) { res.status(404).json({ success: false, error: "Item not found" }); return; }

      const { stockCount } = req.body;
      const item = await prisma.menuItem.update({
        where: { id: existing.id },
        data: { stockCount: stockCount !== null && stockCount !== undefined ? parseInt(stockCount) : null },
        include: { category: true },
      });
      res.json({ success: true, data: item });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update stock";
      res.status(500).json({ success: false, error: message });
    }
  }
);

export default router;
