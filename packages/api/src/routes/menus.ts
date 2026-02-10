import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";
import { notifyChefFollowers } from "../services/notifications";

const router = Router();

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

// GET /api/v1/menus/:chefId — public menu (only available items)
router.get("/:chefId", async (req: Request, res: Response) => {
  try {
    const chefId = req.params.chefId as string;
    const menus = await prisma.menu.findMany({
      where: { chefId, isActive: true },
      include: {
        items: {
          where: { isAvailable: true },
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
});

// POST /api/v1/menus - create menu (chef only)
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

      const menu = await prisma.menu.create({
        data: { ...req.body, chefId: chef.id },
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
