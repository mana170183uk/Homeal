import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// GET /api/v1/menus/:chefId
router.get("/:chefId", async (req: Request, res: Response) => {
  try {
    const menus = await prisma.menu.findMany({
      where: { chefId: req.params.chefId, isActive: true },
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
      const item = await prisma.menuItem.create({
        data: { ...req.body, menuId: req.params.menuId },
      });
      res.status(201).json({ success: true, data: item });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add item";
      res.status(500).json({ success: false, error: message });
    }
  }
);

export default router;
