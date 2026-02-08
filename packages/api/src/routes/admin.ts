import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";
import {
  sendChefApprovalEmail,
  sendChefRejectionEmail,
} from "../services/email";

const router = Router();

// All admin routes require SUPER_ADMIN role
router.use(authenticate, authorize("SUPER_ADMIN"));

// GET /api/v1/admin/chefs?status=pending|approved|rejected
router.get("/chefs", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;

    let where: Record<string, unknown> = {};
    if (status === "pending") {
      where = { isVerified: false, rejectedAt: null };
    } else if (status === "approved") {
      where = { isVerified: true };
    } else if (status === "rejected") {
      where = { rejectedAt: { not: null } };
    }

    const chefs = await prisma.chef.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        _count: { select: { orders: true, menus: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stats
    const [total, approved, pending, rejected] = await Promise.all([
      prisma.chef.count(),
      prisma.chef.count({ where: { isVerified: true } }),
      prisma.chef.count({ where: { isVerified: false, rejectedAt: null } }),
      prisma.chef.count({ where: { rejectedAt: { not: null } } }),
    ]);

    res.json({
      success: true,
      data: {
        chefs,
        stats: { total, approved, pending, rejected },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch chefs";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/admin/chefs/:id/approve
router.post("/chefs/:id/approve", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const chef = await prisma.chef.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!chef) {
      res.status(404).json({ success: false, error: "Chef not found" });
      return;
    }

    if (chef.isVerified) {
      res.status(400).json({ success: false, error: "Chef is already approved" });
      return;
    }

    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setMonth(trialEndsAt.getMonth() + 3);

    await prisma.chef.update({
      where: { id },
      data: {
        isVerified: true,
        approvedAt: now,
        rejectedAt: null,
        rejectionReason: null,
        trialEndsAt,
        plan: "UNLIMITED",
      },
    });

    // Send welcome email (fire-and-forget)
    if (chef.user.email) {
      sendChefApprovalEmail({
        chefEmail: chef.user.email,
        chefName: chef.user.name,
        kitchenName: chef.kitchenName,
        trialEndsAt,
      }).catch((err) => console.error("[Admin] Failed to send approval email:", err));
    }

    res.json({ success: true, data: { message: "Chef approved successfully" } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to approve chef";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/admin/chefs/:id/reject
router.post("/chefs/:id/reject", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const reason = req.body.reason as string | undefined;

    const chef = await prisma.chef.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!chef) {
      res.status(404).json({ success: false, error: "Chef not found" });
      return;
    }

    await prisma.chef.update({
      where: { id },
      data: {
        isVerified: false,
        rejectedAt: new Date(),
        rejectionReason: reason || null,
      },
    });

    // Send rejection email (fire-and-forget)
    if (chef.user.email) {
      sendChefRejectionEmail({
        chefEmail: chef.user.email,
        chefName: chef.user.name,
        reason,
      }).catch((err) => console.error("[Admin] Failed to send rejection email:", err));
    }

    res.json({ success: true, data: { message: "Chef rejected" } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reject chef";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/admin/chefs/:id/extend-trial
router.post("/chefs/:id/extend-trial", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const months = (req.body.months as number) || 3;

    const chef = await prisma.chef.findUnique({ where: { id } });

    if (!chef) {
      res.status(404).json({ success: false, error: "Chef not found" });
      return;
    }

    if (!chef.isVerified) {
      res.status(400).json({ success: false, error: "Chef is not approved" });
      return;
    }

    const base = chef.trialEndsAt && chef.trialEndsAt > new Date() ? chef.trialEndsAt : new Date();
    const newTrialEnd = new Date(base);
    newTrialEnd.setMonth(newTrialEnd.getMonth() + months);

    const updated = await prisma.chef.update({
      where: { id },
      data: { trialEndsAt: newTrialEnd },
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to extend trial";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
