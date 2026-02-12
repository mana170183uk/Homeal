import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";
import { notifyChefNewOrder, notifyOrderUpdate } from "../services/socket";
import { ORDER_AUTO_REJECT_MINUTES, COMMISSION_RATE_DEFAULT } from "@homeal/shared";

const router = Router();

// POST /api/v1/orders - place order
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { chefId, addressId, items, specialInstructions, paymentMethod } = req.body;

    if (!chefId || !addressId || !items?.length) {
      res.status(400).json({ success: false, error: "chefId, addressId, and items are required" });
      return;
    }

    // Validate chef availability
    const chef = await prisma.chef.findUnique({ where: { id: chefId } });
    if (!chef) {
      res.status(404).json({ success: false, error: "Chef not found" });
      return;
    }

    // Check vacation
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const today = new Date(todayStr + "T00:00:00.000Z");
    if (chef.vacationStart && chef.vacationEnd && today >= chef.vacationStart && today <= chef.vacationEnd) {
      res.status(400).json({ success: false, error: "This kitchen is currently on holiday" });
      return;
    }

    // Check order cutoff time
    if (chef.orderCutoffTime) {
      const [cutH, cutM] = chef.orderCutoffTime.split(":").map(Number);
      const ukHour = now.getUTCHours();
      const ukMin = now.getUTCMinutes();
      if (ukHour > cutH || (ukHour === cutH && ukMin >= cutM)) {
        res.status(400).json({ success: false, error: `Ordering closed for today. Cutoff time is ${chef.orderCutoffTime}.` });
        return;
      }
    }

    // Check daily order cap
    if (chef.dailyOrderCap) {
      const todayStart = new Date(todayStr + "T00:00:00.000Z");
      const todayEnd = new Date(todayStr + "T23:59:59.999Z");
      const todayOrderCount = await prisma.order.count({
        where: {
          chefId,
          createdAt: { gte: todayStart, lte: todayEnd },
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
      });
      if (todayOrderCount >= chef.dailyOrderCap) {
        res.status(400).json({ success: false, error: `This kitchen has reached its daily order limit (${chef.dailyOrderCap})` });
        return;
      }
    }

    // Calculate totals
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i: { menuItemId: string }) => i.menuItemId) } },
    });

    // Validate stock availability
    for (const item of items as Array<{ menuItemId: string; quantity: number }>) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) {
        res.status(400).json({ success: false, error: `Item not found: ${item.menuItemId}` });
        return;
      }
      if (!menuItem.isAvailable) {
        res.status(400).json({ success: false, error: `"${menuItem.name}" is no longer available` });
        return;
      }
      if (menuItem.stockCount !== null && menuItem.stockCount < item.quantity) {
        res.status(400).json({ success: false, error: `"${menuItem.name}" only has ${menuItem.stockCount} left in stock` });
        return;
      }
    }

    let subtotal = 0;
    const orderItems = items.map((item: { menuItemId: string; quantity: number; notes?: string }) => {
      const menuItem = menuItems.find((m: (typeof menuItems)[number]) => m.id === item.menuItemId);
      const price = menuItem?.price || 0;
      subtotal += price * item.quantity;
      return { menuItemId: item.menuItemId, quantity: item.quantity, price, notes: item.notes };
    });

    const deliveryFee = 0.30;
    const total = subtotal + deliveryFee;

    const commissionRate = (chef.commissionRate ?? COMMISSION_RATE_DEFAULT) / 100;
    const platformFee = Math.round(total * commissionRate * 100) / 100;
    const chefPayout = Math.round((total - platformFee) * 100) / 100;

    const order = await prisma.order.create({
      data: {
        userId: req.user!.userId,
        chefId,
        addressId,
        subtotal,
        deliveryFee,
        total,
        specialInstructions,
        items: { create: orderItems },
        payment: {
          create: {
            chefId,
            amount: total,
            platformFee,
            chefPayout,
            method: paymentMethod === "COD" ? "COD" : "CARD",
            status: paymentMethod === "COD" ? "PENDING" : "PENDING",
          },
        },
      },
      include: {
        items: { include: { menuItem: true } },
        address: true,
        payment: true,
        chef: { include: { user: { select: { name: true } } } },
      },
    });

    // Decrement stock counts
    for (const item of items as Array<{ menuItemId: string; quantity: number }>) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (menuItem?.stockCount !== null && menuItem?.stockCount !== undefined) {
        const newCount = Math.max(0, menuItem.stockCount - item.quantity);
        await prisma.menuItem.update({
          where: { id: item.menuItemId },
          data: {
            stockCount: newCount,
            ...(newCount === 0 ? { isAvailable: false } : {}),
          },
        });
      }
    }

    // Notify chef via Socket.IO
    notifyChefNewOrder(chefId, { orderId: order.id, order });

    // Auto-reject timer
    setTimeout(async () => {
      const current = await prisma.order.findUnique({ where: { id: order.id } });
      if (current?.status === "PLACED") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "REJECTED" },
        });
        notifyOrderUpdate(req.user!.userId, {
          orderId: order.id,
          status: "REJECTED",
          reason: "Auto-rejected: Chef did not respond",
        });
      }
    }, ORDER_AUTO_REJECT_MINUTES * 60 * 1000);

    res.status(201).json({ success: true, data: order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/orders - list user orders
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const where =
      req.user!.role === "CHEF"
        ? { chef: { userId: req.user!.userId } }
        : { userId: req.user!.userId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: true } },
        chef: { include: { user: { select: { name: true } } } },
        user: { select: { name: true, email: true } },
        address: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ success: true, data: orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/orders/:id - single order detail
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: {
        items: { include: { menuItem: true } },
        chef: { include: { user: { select: { name: true, avatar: true } } } },
        user: { select: { name: true, email: true } },
        address: true,
        payment: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    // Only allow the customer, the chef, or a super-admin to view
    const isCustomer = order.userId === req.user!.userId;
    const isChef = await prisma.chef.findFirst({
      where: { id: order.chefId, userId: req.user!.userId },
    });
    const isAdmin = req.user!.role === "SUPER_ADMIN" || req.user!.role === "ADMIN";

    if (!isCustomer && !isChef && !isAdmin) {
      res.status(403).json({ success: false, error: "Not authorized to view this order" });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch order";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/orders/:id/cancel - customer cancellation
router.post("/:id/cancel", authenticate, async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id as string } });

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    if (order.userId !== req.user!.userId) {
      res.status(403).json({ success: false, error: "Not authorized" });
      return;
    }

    if (order.status !== "PLACED") {
      res.status(400).json({ success: false, error: "Can only cancel orders that have not been accepted yet" });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    notifyChefNewOrder(order.chefId, {
      orderId: order.id,
      status: "CANCELLED",
      reason: "Cancelled by customer",
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to cancel order";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/orders/earnings — chef earnings breakdown
router.get(
  "/earnings",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

      const [todayEarnings, weekEarnings, monthEarnings, totalEarnings, recentPayments] = await Promise.all([
        prisma.payment.aggregate({
          where: { chefId: chef.id, status: "COMPLETED", createdAt: { gte: todayStart } },
          _sum: { chefPayout: true },
          _count: true,
        }),
        prisma.payment.aggregate({
          where: { chefId: chef.id, status: "COMPLETED", createdAt: { gte: weekStart } },
          _sum: { chefPayout: true },
          _count: true,
        }),
        prisma.payment.aggregate({
          where: { chefId: chef.id, status: "COMPLETED", createdAt: { gte: monthStart } },
          _sum: { chefPayout: true },
          _count: true,
        }),
        prisma.payment.aggregate({
          where: { chefId: chef.id, status: "COMPLETED" },
          _sum: { chefPayout: true },
          _count: true,
        }),
        prisma.payment.findMany({
          where: { chefId: chef.id },
          include: {
            order: {
              include: {
                user: { select: { name: true } },
                items: { include: { menuItem: { select: { name: true } } } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      ]);

      res.json({
        success: true,
        data: {
          today: { amount: todayEarnings._sum.chefPayout || 0, orders: todayEarnings._count },
          week: { amount: weekEarnings._sum.chefPayout || 0, orders: weekEarnings._count },
          month: { amount: monthEarnings._sum.chefPayout || 0, orders: monthEarnings._count },
          total: { amount: totalEarnings._sum.chefPayout || 0, orders: totalEarnings._count },
          transactions: recentPayments,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch earnings";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// PATCH /api/v1/orders/:id/status - update order status (chef only)
router.patch(
  "/:id/status",
  authenticate,
  authorize("CHEF", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const orderId = req.params.id as string;
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(status === "DELIVERED" ? { actualDelivery: new Date() } : {}),
        },
      });

      // Mark payment as completed when order is delivered (COD)
      if (status === "DELIVERED") {
        await prisma.payment.updateMany({
          where: { orderId, status: "PENDING" },
          data: { status: "COMPLETED" },
        });
      }

      notifyOrderUpdate(order.userId, { orderId: order.id, status: order.status });

      res.json({ success: true, data: order });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update order";
      res.status(500).json({ success: false, error: message });
    }
  }
);

export default router;
