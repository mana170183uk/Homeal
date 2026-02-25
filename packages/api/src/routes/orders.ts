import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";
import { notifyChefNewOrder, notifyOrderUpdate } from "../services/socket";
import { ORDER_AUTO_REJECT_MINUTES } from "@homeal/shared";
import Stripe from "stripe";

const router = Router();

// POST /api/v1/orders - place order
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { chefId, addressId, items, specialInstructions, paymentMethod, deliveryMethod } = req.body;
    const isPickup = deliveryMethod === "pickup";

    if (!chefId || !items?.length) {
      res.status(400).json({ success: false, error: "chefId and items are required" });
      return;
    }
    if (!isPickup && !addressId) {
      res.status(400).json({ success: false, error: "Delivery address is required for delivery orders" });
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

    const deliveryFee = isPickup ? 0 : 0.30;
    const total = subtotal + deliveryFee;

    const order = await prisma.order.create({
      data: {
        userId: req.user!.userId,
        chefId,
        addressId: addressId || null,
        subtotal,
        deliveryFee,
        total,
        specialInstructions,
        deliveryMethod: isPickup ? "PICKUP" : "DELIVERY",
        items: { create: orderItems },
        payment: {
          create: {
            chefId,
            amount: total,
            platformFee: 0,
            chefPayout: total,
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

    // If CARD payment, create Stripe checkout session
    if (paymentMethod === "CARD" && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const lineItems = order.items.map((oi: any) => ({
          price_data: {
            currency: "gbp",
            product_data: { name: oi.menuItem?.name || oi.menuItemId },
            unit_amount: Math.round(oi.price * 100),
          },
          quantity: oi.quantity,
        }));
        // Add delivery fee as a line item if applicable
        if (order.deliveryFee > 0) {
          lineItems.push({
            price_data: {
              currency: "gbp",
              product_data: { name: "Delivery Fee" },
              unit_amount: Math.round(order.deliveryFee * 100),
            },
            quantity: 1,
          });
        }
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: lineItems,
          metadata: { orderId: order.id, chefId },
          success_url: `${req.headers.origin || "https://homeal.uk"}/orders/${order.id}?payment=success`,
          cancel_url: `${req.headers.origin || "https://homeal.uk"}/orders/${order.id}?payment=cancelled`,
        });
        // Store Stripe session ID on payment record
        if (order.payment) {
          await prisma.payment.update({
            where: { id: order.payment.id },
            data: { stripePaymentId: session.id },
          });
        }
        res.status(201).json({ success: true, data: { ...order, checkoutUrl: session.url } });
        return;
      } catch (stripeErr) {
        console.error("[Orders] Stripe checkout creation failed:", stripeErr);
        // Fall through to return order without checkout URL (COD fallback)
      }
    }

    res.status(201).json({ success: true, data: order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/orders/batch - place multiple orders (multi-vendor cart)
router.post("/batch", authenticate, async (req: Request, res: Response) => {
  try {
    const { orders: orderRequests } = req.body;

    if (!Array.isArray(orderRequests) || orderRequests.length === 0) {
      res.status(400).json({ success: false, error: "orders array is required" });
      return;
    }

    if (orderRequests.length > 3) {
      res.status(400).json({ success: false, error: "Maximum 3 orders at a time" });
      return;
    }

    const createdOrders: Array<{ id: string }> = [];

    // Process each order in a transaction
    await prisma.$transaction(async (tx) => {
      for (const orderReq of orderRequests) {
        const { chefId, addressId, items, specialInstructions, paymentMethod, deliveryMethod } = orderReq;
        const isPickup = deliveryMethod === "pickup";

        if (!chefId || !items?.length) {
          throw new Error("Each order must have chefId and items");
        }
        if (!isPickup && !addressId) {
          throw new Error("Delivery address is required for delivery orders");
        }

        const chef = await tx.chef.findUnique({ where: { id: chefId } });
        if (!chef) {
          throw new Error(`Chef not found: ${chefId}`);
        }

        // Check vacation
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const today = new Date(todayStr + "T00:00:00.000Z");
        if (chef.vacationStart && chef.vacationEnd && today >= chef.vacationStart && today <= chef.vacationEnd) {
          throw new Error(`${chef.kitchenName} is currently on holiday`);
        }

        // Check order cutoff time
        if (chef.orderCutoffTime) {
          const [cutH, cutM] = chef.orderCutoffTime.split(":").map(Number);
          const ukHour = now.getUTCHours();
          const ukMin = now.getUTCMinutes();
          if (ukHour > cutH || (ukHour === cutH && ukMin >= cutM)) {
            throw new Error(`Ordering closed for ${chef.kitchenName}. Cutoff time is ${chef.orderCutoffTime}.`);
          }
        }

        // Check daily order cap
        if (chef.dailyOrderCap) {
          const todayStart = new Date(todayStr + "T00:00:00.000Z");
          const todayEnd = new Date(todayStr + "T23:59:59.999Z");
          const todayOrderCount = await tx.order.count({
            where: {
              chefId,
              createdAt: { gte: todayStart, lte: todayEnd },
              status: { notIn: ["CANCELLED", "REJECTED"] },
            },
          });
          if (todayOrderCount >= chef.dailyOrderCap) {
            throw new Error(`${chef.kitchenName} has reached its daily order limit`);
          }
        }

        // Calculate totals
        const menuItems = await tx.menuItem.findMany({
          where: { id: { in: items.map((i: { menuItemId: string }) => i.menuItemId) } },
        });

        // Validate stock
        for (const item of items as Array<{ menuItemId: string; quantity: number }>) {
          const menuItem = menuItems.find((m) => m.id === item.menuItemId);
          if (!menuItem) throw new Error(`Item not found: ${item.menuItemId}`);
          if (!menuItem.isAvailable) throw new Error(`"${menuItem.name}" is no longer available`);
          if (menuItem.stockCount !== null && menuItem.stockCount < item.quantity) {
            throw new Error(`"${menuItem.name}" only has ${menuItem.stockCount} left in stock`);
          }
        }

        let subtotal = 0;
        const orderItems = items.map((item: { menuItemId: string; quantity: number; notes?: string }) => {
          const menuItem = menuItems.find((m: (typeof menuItems)[number]) => m.id === item.menuItemId);
          const price = menuItem?.price || 0;
          subtotal += price * item.quantity;
          return { menuItemId: item.menuItemId, quantity: item.quantity, price, notes: item.notes };
        });

        const deliveryFee = isPickup ? 0 : 0.30;
        const orderTotal = subtotal + deliveryFee;
        const order = await tx.order.create({
          data: {
            userId: req.user!.userId,
            chefId,
            addressId: addressId || null,
            subtotal,
            deliveryFee,
            total: orderTotal,
            specialInstructions,
            deliveryMethod: isPickup ? "PICKUP" : "DELIVERY",
            items: { create: orderItems },
            payment: {
              create: {
                chefId,
                amount: orderTotal,
                platformFee: 0,
                chefPayout: orderTotal,
                method: paymentMethod === "COD" ? "COD" : "CARD",
                status: "PENDING",
              },
            },
          },
        });

        // Decrement stock counts
        for (const item of items as Array<{ menuItemId: string; quantity: number }>) {
          const menuItem = menuItems.find((m) => m.id === item.menuItemId);
          if (menuItem?.stockCount !== null && menuItem?.stockCount !== undefined) {
            const newCount = Math.max(0, menuItem.stockCount - item.quantity);
            await tx.menuItem.update({
              where: { id: item.menuItemId },
              data: {
                stockCount: newCount,
                ...(newCount === 0 ? { isAvailable: false } : {}),
              },
            });
          }
        }

        createdOrders.push({ id: order.id });

        // Notify chef via Socket.IO (outside transaction, fire and forget)
        setTimeout(() => {
          notifyChefNewOrder(chefId, { orderId: order.id, order });
        }, 0);

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
      }
    });

    res.status(201).json({ success: true, data: createdOrders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to place orders";
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
        user: { select: { name: true, email: true, phone: true } },
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
        chef: {
          select: {
            id: true,
            kitchenName: true,
            address: true,
            postcode: true,
            city: true,
            latitude: true,
            longitude: true,
            contactPhone: true,
            user: { select: { name: true, avatar: true } },
          },
        },
        user: { select: { name: true, email: true, phone: true } },
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

    // After payment is completed, include location data:
    // - For customers (pickup): include chef's address/postcode/location
    // - For chefs (delivery): customer address is already included via order.address
    const isPaid = order.payment?.status === "COMPLETED" || order.payment?.method === "COD";
    const orderData: any = { ...order };
    if (isPaid || isChef || isAdmin) {
      orderData.chefLocation = {
        address: order.chef.address || null,
        postcode: order.chef.postcode || null,
        city: order.chef.city || null,
        latitude: order.chef.latitude || null,
        longitude: order.chef.longitude || null,
        contactPhone: order.chef.contactPhone || null,
      };
    }

    res.json({ success: true, data: orderData });
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
