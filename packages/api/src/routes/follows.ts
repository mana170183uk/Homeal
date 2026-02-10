import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate } from "../middleware/auth";

const router = Router();

// POST /api/v1/follows/:chefId — follow a chef
router.post("/:chefId", authenticate, async (req: Request, res: Response) => {
  try {
    const follow = await prisma.chefFollow.create({
      data: { userId: req.user!.userId, chefId: req.params.chefId as string },
    });
    res.status(201).json({ success: true, data: follow });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to follow";
    if (message.includes("Unique constraint")) {
      res.json({ success: true, data: { message: "Already following" } });
    } else {
      res.status(500).json({ success: false, error: message });
    }
  }
});

// DELETE /api/v1/follows/:chefId — unfollow a chef
router.delete("/:chefId", authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.chefFollow.deleteMany({
      where: { userId: req.user!.userId, chefId: req.params.chefId as string },
    });
    res.json({ success: true, data: { message: "Unfollowed" } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to unfollow";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/follows/check/:chefId — check if following
router.get("/check/:chefId", authenticate, async (req: Request, res: Response) => {
  try {
    const follow = await prisma.chefFollow.findUnique({
      where: {
        userId_chefId: { userId: req.user!.userId, chefId: req.params.chefId as string },
      },
    });
    res.json({ success: true, data: { following: !!follow } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Check failed";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/follows/my — list chefs I follow
router.get("/my", authenticate, async (req: Request, res: Response) => {
  try {
    const follows = await prisma.chefFollow.findMany({
      where: { userId: req.user!.userId },
      include: {
        chef: {
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: follows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch follows";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
