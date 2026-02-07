import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";
import { notifyChefNewOrder, notifyOrderUpdate } from "../services/socket";
import { ORDER_AUTO_REJECT_MINUTES } from "@homeal/shared";

const router = Router();

// POST /api/v1/orders - place order
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { chefId, addressId, items, specialInstructions, promoCode } = req.body;

    // Calculate totals
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i: { menuItemId: string }) => i.menuItemId) } },
    });

    let subtotal = 0;
    const orderItems = items.map((item: { menuItemId: string; quantity: number; notes?: string }) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      const price = menuItem?.price || 0;
      subtotal += price * item.quantity;
      return { menuItemId: item.menuItemId, quantity: item.quantity, price, notes: item.notes };
    });

    const deliveryFee = 30;
    const total = subtotal + deliveryFee;

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
      },
      include: { items: { include: { menuItem: true } }, address: true },
    });

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
        address: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json({ success: true, data: orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/v1/orders/:id/status - update order status (chef only)
router.patch(
  "/:id/status",
  authenticate,
  authorize("CHEF", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: { status },
      });

      notifyOrderUpdate(order.userId, { orderId: order.id, status: order.status });

      res.json({ success: true, data: order });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update order";
      res.status(500).json({ success: false, error: message });
    }
  }
);

export default router;
