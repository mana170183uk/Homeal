import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// GET /api/v1/templates — list chef's menu templates
router.get(
  "/",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const templates = await prisma.menuTemplate.findMany({
        where: { chefId: chef.id },
        orderBy: { updatedAt: "desc" },
      });

      // Parse items JSON for each template
      const parsed = templates.map((t) => ({
        ...t,
        items: JSON.parse(t.items),
      }));

      res.json({ success: true, data: parsed });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch templates";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/v1/templates — create a menu template
router.post(
  "/",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const { name, items } = req.body;
      if (!name || !items) {
        res.status(400).json({ success: false, error: "name and items required" });
        return;
      }

      const template = await prisma.menuTemplate.create({
        data: {
          chefId: chef.id,
          name,
          items: JSON.stringify(items),
        },
      });

      res.status(201).json({ success: true, data: { ...template, items } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create template";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/v1/templates/:id/apply — apply template to specific dates
router.post(
  "/:id/apply",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const template = await prisma.menuTemplate.findFirst({
        where: { id: req.params.id as string, chefId: chef.id },
      });
      if (!template) { res.status(404).json({ success: false, error: "Template not found" }); return; }

      const { dates } = req.body as { dates: string[] };
      if (!dates?.length) {
        res.status(400).json({ success: false, error: "dates required" });
        return;
      }

      const templateItems = JSON.parse(template.items) as Array<Record<string, unknown>>;
      const created: string[] = [];
      const skipped: string[] = [];

      for (const dateStr of dates) {
        const date = new Date(dateStr + "T00:00:00.000Z");

        const existing = await prisma.menu.findUnique({
          where: { chefId_date: { chefId: chef.id, date } },
        });
        if (existing) { skipped.push(dateStr); continue; }

        const menu = await prisma.menu.create({
          data: {
            chefId: chef.id,
            name: template.name,
            date,
          },
        });

        if (templateItems.length > 0) {
          await prisma.menuItem.createMany({
            data: templateItems.map((item, idx) => ({
              menuId: menu.id,
              name: item.name as string,
              description: (item.description as string) || null,
              price: parseFloat(String(item.price)),
              image: (item.image as string) || null,
              isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : true,
              calories: item.calories ? parseInt(String(item.calories)) : null,
              allergens: (item.allergens as string) || null,
              prepTime: item.prepTime ? parseInt(String(item.prepTime)) : null,
              servingSize: (item.servingSize as string) || null,
              categoryId: (item.categoryId as string) || null,
              stockCount: item.stockCount !== undefined && item.stockCount !== null ? parseInt(String(item.stockCount)) : null,
              offerPrice: item.offerPrice ? parseFloat(String(item.offerPrice)) : null,
              eggOption: (item.eggOption as string) || null,
              sortOrder: idx,
            })),
          });
        }

        created.push(dateStr);
      }

      res.json({ success: true, data: { created, skipped } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to apply template";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// DELETE /api/v1/templates/:id — delete template
router.delete(
  "/:id",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const template = await prisma.menuTemplate.findFirst({
        where: { id: req.params.id as string, chefId: chef.id },
      });
      if (!template) { res.status(404).json({ success: false, error: "Template not found" }); return; }

      await prisma.menuTemplate.delete({ where: { id: template.id } });
      res.json({ success: true, data: { message: "Template deleted" } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete template";
      res.status(500).json({ success: false, error: message });
    }
  }
);

export default router;
