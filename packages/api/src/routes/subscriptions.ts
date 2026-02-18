import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";
import {
  createStripeProduct,
  createStripePrice,
  createCheckoutSession,
  cancelStripeSubscription,
  pauseStripeSubscription,
  resumeStripeSubscription,
  deactivateStripeProduct,
} from "../services/stripe";

const router = Router();

// ─── Chef endpoints (plan management) ──────────────────────────────

// POST /api/v1/subscriptions/plans — chef creates a tiffin plan
router.post(
  "/plans",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) {
        res.status(404).json({ success: false, error: "Chef not found" });
        return;
      }

      const { name, description, frequency, price, mealsPerDay, isVeg } = req.body;

      if (!name || !frequency || !price) {
        res.status(400).json({ success: false, error: "name, frequency, and price are required" });
        return;
      }

      if (!["WEEKLY", "MONTHLY"].includes(frequency)) {
        res.status(400).json({ success: false, error: "frequency must be WEEKLY or MONTHLY" });
        return;
      }

      // Create Stripe Product + Price
      let stripeProductId: string | null = null;
      let stripePriceId: string | null = null;

      if (process.env.STRIPE_SECRET_KEY) {
        try {
          const product = await createStripeProduct(
            `${chef.kitchenName} — ${name}`,
            description
          );
          stripeProductId = product.id;

          const stripePrice = await createStripePrice(
            product.id,
            Math.round(price * 100), // pence
            frequency === "WEEKLY" ? "week" : "month"
          );
          stripePriceId = stripePrice.id;
        } catch (stripeErr) {
          console.error("[Subscriptions] Stripe product creation failed:", stripeErr);
          // Continue without Stripe — plan can still be created locally
        }
      }

      const plan = await prisma.tiffinPlan.create({
        data: {
          chefId: chef.id,
          name,
          description: description || null,
          frequency,
          price: parseFloat(price),
          mealsPerDay: parseInt(mealsPerDay) || 1,
          isVeg: isVeg === true,
          stripeProductId,
          stripePriceId,
        },
      });

      res.status(201).json({ success: true, data: plan });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create plan";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// GET /api/v1/subscriptions/plans/mine — chef's own plans
router.get(
  "/plans/mine",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) {
        res.status(404).json({ success: false, error: "Chef not found" });
        return;
      }

      const plans = await prisma.tiffinPlan.findMany({
        where: { chefId: chef.id },
        include: { _count: { select: { subscriptions: true } } },
        orderBy: { createdAt: "desc" },
      });

      res.json({ success: true, data: plans });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch plans";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// GET /api/v1/subscriptions/plans/:chefId — public: list chef's active plans
router.get("/plans/:chefId", async (req: Request, res: Response) => {
  try {
    const plans = await prisma.tiffinPlan.findMany({
      where: { chefId: req.params.chefId as string, isActive: true },
      orderBy: { price: "asc" },
    });

    res.json({ success: true, data: plans });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch plans";
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/v1/subscriptions/plans/:planId — update plan
router.patch(
  "/plans/:planId",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) {
        res.status(404).json({ success: false, error: "Chef not found" });
        return;
      }

      const plan = await prisma.tiffinPlan.findFirst({
        where: { id: req.params.planId as string, chefId: chef.id },
      });

      if (!plan) {
        res.status(404).json({ success: false, error: "Plan not found" });
        return;
      }

      const { name, description, mealsPerDay, isVeg, isActive } = req.body;

      const updated = await prisma.tiffinPlan.update({
        where: { id: plan.id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(mealsPerDay !== undefined ? { mealsPerDay: parseInt(mealsPerDay) } : {}),
          ...(isVeg !== undefined ? { isVeg } : {}),
          ...(isActive !== undefined ? { isActive } : {}),
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update plan";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// DELETE /api/v1/subscriptions/plans/:planId — deactivate plan
router.delete(
  "/plans/:planId",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) {
        res.status(404).json({ success: false, error: "Chef not found" });
        return;
      }

      const plan = await prisma.tiffinPlan.findFirst({
        where: { id: req.params.planId as string, chefId: chef.id },
      });

      if (!plan) {
        res.status(404).json({ success: false, error: "Plan not found" });
        return;
      }

      // Deactivate in Stripe
      if (plan.stripeProductId && process.env.STRIPE_SECRET_KEY) {
        try {
          await deactivateStripeProduct(plan.stripeProductId);
        } catch (err) {
          console.error("[Subscriptions] Failed to deactivate Stripe product:", err);
        }
      }

      await prisma.tiffinPlan.update({
        where: { id: plan.id },
        data: { isActive: false },
      });

      res.json({ success: true, data: { message: "Plan deactivated" } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete plan";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// GET /api/v1/subscriptions/subscribers — chef's subscribers
router.get(
  "/subscribers",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) {
        res.status(404).json({ success: false, error: "Chef not found" });
        return;
      }

      const subscribers = await prisma.subscription.findMany({
        where: { chefId: chef.id },
        include: {
          user: { select: { name: true, email: true } },
          tiffinPlan: { select: { name: true, frequency: true, price: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ success: true, data: subscribers });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch subscribers";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// ─── Customer endpoints ────────────────────────────────────────────

// POST /api/v1/subscriptions/checkout — create Stripe checkout session
router.post("/checkout", authenticate, async (req: Request, res: Response) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      res.status(400).json({ success: false, error: "planId is required" });
      return;
    }

    const plan = await prisma.tiffinPlan.findUnique({
      where: { id: planId },
      include: { chef: true },
    });

    if (!plan || !plan.isActive) {
      res.status(404).json({ success: false, error: "Plan not found or inactive" });
      return;
    }

    if (!plan.stripePriceId) {
      res.status(400).json({ success: false, error: "This plan is not yet configured for online payment" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const customerUrl = process.env.CUSTOMER_URL || "https://homeal.uk";

    const session = await createCheckoutSession({
      customerEmail: user.email || undefined,
      priceId: plan.stripePriceId,
      successUrl: `${customerUrl}/subscriptions?success=true`,
      cancelUrl: `${customerUrl}/chef/${plan.chefId}?cancelled=true`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        chefId: plan.chefId,
      },
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create checkout";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/subscriptions/my — customer's subscriptions
router.get("/my", authenticate, async (req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user!.userId },
      include: {
        chef: { select: { id: true, kitchenName: true } },
        tiffinPlan: { select: { name: true, frequency: true, price: true, mealsPerDay: true, isVeg: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: subscriptions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch subscriptions";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/subscriptions/:id/pause — pause subscription
router.post("/:id/pause", authenticate, async (req: Request, res: Response) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { id: req.params.id as string, userId: req.user!.userId },
    });

    if (!sub) {
      res.status(404).json({ success: false, error: "Subscription not found" });
      return;
    }

    if (sub.status !== "ACTIVE") {
      res.status(400).json({ success: false, error: "Only active subscriptions can be paused" });
      return;
    }

    if (sub.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
      try {
        await pauseStripeSubscription(sub.stripeSubscriptionId);
      } catch (err) {
        console.error("[Subscriptions] Failed to pause Stripe subscription:", err);
      }
    }

    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "PAUSED" },
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to pause subscription";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/subscriptions/:id/resume — resume paused subscription
router.post("/:id/resume", authenticate, async (req: Request, res: Response) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { id: req.params.id as string, userId: req.user!.userId },
    });

    if (!sub) {
      res.status(404).json({ success: false, error: "Subscription not found" });
      return;
    }

    if (sub.status !== "PAUSED") {
      res.status(400).json({ success: false, error: "Only paused subscriptions can be resumed" });
      return;
    }

    if (sub.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
      try {
        await resumeStripeSubscription(sub.stripeSubscriptionId);
      } catch (err) {
        console.error("[Subscriptions] Failed to resume Stripe subscription:", err);
      }
    }

    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "ACTIVE" },
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to resume subscription";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/subscriptions/:id/cancel — cancel subscription
router.post("/:id/cancel", authenticate, async (req: Request, res: Response) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { id: req.params.id as string, userId: req.user!.userId },
    });

    if (!sub) {
      res.status(404).json({ success: false, error: "Subscription not found" });
      return;
    }

    if (sub.status === "CANCELLED") {
      res.status(400).json({ success: false, error: "Already cancelled" });
      return;
    }

    if (sub.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
      try {
        await cancelStripeSubscription(sub.stripeSubscriptionId);
      } catch (err) {
        console.error("[Subscriptions] Failed to cancel Stripe subscription:", err);
      }
    }

    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "CANCELLED", endDate: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to cancel subscription";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
