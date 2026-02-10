import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/v1/notifications — list my notifications + unread count
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: req.user!.userId, isRead: false },
      }),
    ]);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch notifications";
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/v1/notifications/:id/read — mark one as read
router.patch("/:id/read", authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id as string },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to mark as read";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/notifications/read-all — mark all as read
router.post("/read-all", authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to mark all as read";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
