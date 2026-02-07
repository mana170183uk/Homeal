import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// GET /api/v1/chefs - list nearby chefs
router.get("/", async (req: Request, res: Response) => {
  try {
    // const lat = req.query.lat as string | undefined;
    // const lng = req.query.lng as string | undefined;
    const chefs = await prisma.chef.findMany({
      where: { isVerified: true, isOnline: true },
      include: {
        user: { select: { name: true, avatar: true } },
        menus: {
          where: { isActive: true },
          include: { items: { where: { isAvailable: true }, take: 5 } },
          take: 1,
        },
      },
      take: 20,
    });
    res.json({ success: true, data: chefs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch chefs";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/chefs/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const chef = await prisma.chef.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, avatar: true } },
        menus: { where: { isActive: true }, include: { items: true } },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        services: { where: { isActive: true } },
      },
    });
    if (!chef) {
      res.status(404).json({ success: false, error: "Chef not found" });
      return;
    }
    res.json({ success: true, data: chef });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch chef";
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/v1/chefs/me - update chef profile
router.patch(
  "/me",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.update({
        where: { userId: req.user!.userId },
        data: req.body,
      });
      res.json({ success: true, data: chef });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Update failed";
      res.status(500).json({ success: false, error: message });
    }
  }
);

export default router;
