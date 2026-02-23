import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorizeSuperAdmin } from "../middleware/auth";
import {
  sendChefApprovalEmail,
  sendChefRejectionEmail,
  sendAdminAccessApprovedEmail,
  sendAdminAccessRejectedEmail,
} from "../services/email";
import { firebaseAdminAuth, deleteFirebaseUserByEmail, setFirebaseCustomClaims } from "../lib/firebaseAdmin";

const router = Router();

// All admin routes require SUPER_ADMIN role + Firebase custom claim verification
router.use(authenticate, authorizeSuperAdmin());

// GET /api/v1/admin/notifications — recent events for the bell icon
router.get("/notifications", async (_req: Request, res: Response) => {
  try {
    // Gather recent events from the last 30 days
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [pendingChefs, recentChefs, recentCustomers, adminRequests] = await Promise.all([
      // Pending chef registrations
      prisma.chef.findMany({
        where: { isVerified: false, rejectedAt: null },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      // Recently approved/rejected chefs
      prisma.chef.findMany({
        where: { OR: [{ approvedAt: { gte: since } }, { rejectedAt: { gte: since } }] },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      // Recent customers
      prisma.user.findMany({
        where: { role: "CUSTOMER", createdAt: { gte: since } },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      // Pending admin access requests
      prisma.adminAccessRequest.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Build notification items
    type NotifItem = { id: string; type: string; title: string; message: string; time: Date; actionId?: string };
    const items: NotifItem[] = [];

    for (const req of adminRequests) {
      items.push({
        id: `admin-req-${req.id}`,
        type: "admin_request",
        title: "Admin Access Request",
        message: `${req.name} (${req.email}) requested Super Admin access`,
        time: req.createdAt,
        actionId: req.id,
      });
    }

    for (const chef of pendingChefs) {
      items.push({
        id: `chef-pending-${chef.id}`,
        type: "chef_pending",
        title: "New Home Maker Registration",
        message: `${chef.kitchenName} (${chef.user.name}) is waiting for approval`,
        time: chef.createdAt,
        actionId: chef.id,
      });
    }

    for (const c of recentCustomers) {
      items.push({
        id: `customer-${c.id}`,
        type: "customer_joined",
        title: "New Customer",
        message: `${c.name} joined the platform`,
        time: c.createdAt,
      });
    }

    for (const chef of recentChefs) {
      if (chef.approvedAt && chef.approvedAt >= since) {
        items.push({
          id: `chef-approved-${chef.id}`,
          type: "chef_approved",
          title: "Home Maker Approved",
          message: `${chef.kitchenName} was approved`,
          time: chef.approvedAt,
        });
      }
    }

    // Sort by time descending
    items.sort((a, b) => b.time.getTime() - a.time.getTime());

    const unreadCount = pendingChefs.length + adminRequests.length;

    res.json({ success: true, data: { notifications: items.slice(0, 30), unreadCount } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch notifications";
    res.status(500).json({ success: false, error: message });
  }
});

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
        isOnline: true,
        approvedAt: now,
        rejectedAt: null,
        rejectionReason: null,
        trialEndsAt,
        plan: "UNLIMITED",
      },
    });

    console.log(`[Audit] Chef approved: ${chef.kitchenName} (${chef.user.email}) by userId=${req.user!.userId} at ${new Date().toISOString()}`);

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

    console.log(`[Audit] Chef rejected: ${chef.kitchenName} (${chef.user.email}) by userId=${req.user!.userId} reason="${reason || "none"}" at ${new Date().toISOString()}`);

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

// GET /api/v1/admin/access-requests
router.get("/access-requests", async (_req: Request, res: Response) => {
  try {
    const requests = await prisma.adminAccessRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: { requests } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch access requests";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/admin/access-requests/:id/approve
router.post("/access-requests/:id/approve", async (req: Request, res: Response) => {
  try {
    // Only the platform owner can approve admin access requests
    const ownerEmail = process.env.PLATFORM_OWNER_EMAIL || "homealforuk@gmail.com";
    const approver = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { email: true } });
    if (!approver || approver.email !== ownerEmail) {
      res.status(403).json({ success: false, error: "Only the platform owner can approve admin access requests." });
      return;
    }

    const id = req.params.id as string;

    const request = await prisma.adminAccessRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ success: false, error: "Request not found" });
      return;
    }

    if (request.status === "APPROVED") {
      res.status(400).json({ success: false, error: "Already approved" });
      return;
    }

    // Grant SUPER_ADMIN role (this flow is specifically for super admin access requests)
    await prisma.user.upsert({
      where: { firebaseUid: request.firebaseUid },
      update: { role: "SUPER_ADMIN" },
      create: {
        name: request.name,
        email: request.email,
        firebaseUid: request.firebaseUid,
        role: "SUPER_ADMIN",
      },
    });

    // Set Firebase custom claims for the newly approved super admin
    try {
      const fbUser = await firebaseAdminAuth.getUser(request.firebaseUid);
      await setFirebaseCustomClaims(fbUser.uid, { role: "SUPER_ADMIN", super_admin: true });
      console.log(`[Audit] Super admin access approved: ${request.email} by ${approver.email} at ${new Date().toISOString()}`);
    } catch (err) {
      console.error(`[Admin] Failed to set Firebase claims for ${request.email}:`, err);
    }

    await prisma.adminAccessRequest.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date() },
    });

    sendAdminAccessApprovedEmail({
      email: request.email,
      name: request.name,
    }).catch((err) => console.error("[Admin] Failed to send admin access approved email:", err));

    res.json({ success: true, data: { message: `${request.name} has been granted Super Admin access.` } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to approve request";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/admin/access-requests/:id/reject
router.post("/access-requests/:id/reject", async (req: Request, res: Response) => {
  try {
    // Only the platform owner can reject admin access requests
    const ownerEmail = process.env.PLATFORM_OWNER_EMAIL || "homealforuk@gmail.com";
    const approver = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { email: true } });
    if (!approver || approver.email !== ownerEmail) {
      res.status(403).json({ success: false, error: "Only the platform owner can reject admin access requests." });
      return;
    }

    const id = req.params.id as string;

    const request = await prisma.adminAccessRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ success: false, error: "Request not found" });
      return;
    }

    if (request.status === "REJECTED") {
      res.status(400).json({ success: false, error: "Already rejected" });
      return;
    }

    await prisma.adminAccessRequest.update({
      where: { id },
      data: { status: "REJECTED", reviewedAt: new Date() },
    });

    console.log(`[Audit] Admin access rejected: ${request.email} by ${approver.email} at ${new Date().toISOString()}`);

    sendAdminAccessRejectedEmail({
      email: request.email,
      name: request.name,
    }).catch((err) => console.error("[Admin] Failed to send admin access rejected email:", err));

    res.json({ success: true, data: { message: `${request.name}'s request has been rejected.` } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reject request";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/admin/orders — all platform orders
router.get("/orders", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

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

// GET /api/v1/admin/dashboard-stats — aggregated platform stats
router.get("/dashboard-stats", async (_req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayOrders, todayRevenue, totalChefs, totalCustomers, totalOrders, totalRevenue] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.chef.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        todayOrders,
        todayRevenue: todayRevenue._sum.total || 0,
        totalChefs,
        totalCustomers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    res.status(500).json({ success: false, error: message });
  }
});

// ==================== CATEGORY CRUD ====================

// GET /api/v1/admin/categories
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/admin/categories
router.post("/categories", async (req: Request, res: Response) => {
  try {
    const { name, icon, sortOrder, type } = req.body;
    if (!name) { res.status(400).json({ success: false, error: "Name is required" }); return; }
    const category = await prisma.category.create({
      data: { name, icon: icon || null, sortOrder: sortOrder || 0, type: type || "FOOD", isActive: true },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/v1/admin/categories/:id
router.patch("/categories/:id", async (req: Request, res: Response) => {
  try {
    const { name, icon, sortOrder, isActive, type } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (icon !== undefined) updates.icon = icon;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (isActive !== undefined) updates.isActive = isActive;
    if (type !== undefined) updates.type = type;
    const category = await prisma.category.update({
      where: { id: req.params.id as string },
      data: updates,
    });
    res.json({ success: true, data: category });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    res.status(500).json({ success: false, error: message });
  }
});

// DELETE /api/v1/admin/categories/:id — soft delete (deactivate)
router.delete("/categories/:id", async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id as string },
      data: { isActive: false },
    });
    res.json({ success: true, data: category });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    res.status(500).json({ success: false, error: message });
  }
});

// ==================== PROMO CODE CRUD ====================

// GET /api/v1/admin/promos
router.get("/promos", async (_req: Request, res: Response) => {
  try {
    const promos = await prisma.promoCode.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });
    // Stats
    const now = new Date();
    const active = promos.filter(p => p.isActive && p.validUntil > now).length;
    const expired = promos.filter(p => p.validUntil <= now).length;
    const totalRedemptions = promos.reduce((sum, p) => sum + p.usedCount, 0);
    const totalDiscount = promos.reduce((sum, p) => sum + (p.discountValue * p.usedCount), 0);

    res.json({ success: true, data: { promos, stats: { active, expired, totalRedemptions, totalDiscount } } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch promos";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/admin/promos
router.post("/promos", async (req: Request, res: Response) => {
  try {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, validFrom, validUntil } = req.body;
    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      res.status(400).json({ success: false, error: "code, discountType, discountValue, validFrom, validUntil required" });
      return;
    }
    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: true,
      },
    });
    res.status(201).json({ success: true, data: promo });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create promo";
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/v1/admin/promos/:id
router.patch("/promos/:id", async (req: Request, res: Response) => {
  try {
    const updates: Record<string, unknown> = {};
    const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, validFrom, validUntil, isActive } = req.body;
    if (code !== undefined) updates.code = code.toUpperCase();
    if (description !== undefined) updates.description = description;
    if (discountType !== undefined) updates.discountType = discountType;
    if (discountValue !== undefined) updates.discountValue = parseFloat(discountValue);
    if (minOrderValue !== undefined) updates.minOrderValue = parseFloat(minOrderValue);
    if (maxDiscount !== undefined) updates.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (usageLimit !== undefined) updates.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (validFrom !== undefined) updates.validFrom = new Date(validFrom);
    if (validUntil !== undefined) updates.validUntil = new Date(validUntil);
    if (isActive !== undefined) updates.isActive = isActive;

    const promo = await prisma.promoCode.update({
      where: { id: req.params.id as string },
      data: updates,
    });
    res.json({ success: true, data: promo });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update promo";
    res.status(500).json({ success: false, error: message });
  }
});

// DELETE /api/v1/admin/promos/:id — deactivate
router.delete("/promos/:id", async (req: Request, res: Response) => {
  try {
    const promo = await prisma.promoCode.update({
      where: { id: req.params.id as string },
      data: { isActive: false },
    });
    res.json({ success: true, data: promo });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete promo";
    res.status(500).json({ success: false, error: message });
  }
});

// ==================== SUPER ADMINS ====================

// GET /api/v1/admin/super-admins
router.get("/super-admins", async (_req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      select: {
        id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: admins });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch super admins";
    res.status(500).json({ success: false, error: message });
  }
});

// ==================== CUSTOMERS ====================

// GET /api/v1/admin/customers
router.get("/customers", async (_req: Request, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true, name: true, email: true, phone: true, isActive: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total spent per customer
    const customerData = await Promise.all(
      customers.map(async (c) => {
        const spent = await prisma.order.aggregate({
          where: { userId: c.id, status: { not: "CANCELLED" } },
          _sum: { total: true },
        });
        return { ...c, totalSpent: spent._sum.total || 0 };
      })
    );

    res.json({ success: true, data: customerData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch customers";
    res.status(500).json({ success: false, error: message });
  }
});

// ==================== REVENUE STATS ====================

// GET /api/v1/admin/revenue-stats
router.get("/revenue-stats", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [todayStats, weekStats, monthStats, totalStats, recentPayments] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: todayStart } },
        _sum: { amount: true, platformFee: true, chefPayout: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: weekStart } },
        _sum: { amount: true, platformFee: true, chefPayout: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: monthStart } },
        _sum: { amount: true, platformFee: true, chefPayout: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true, platformFee: true, chefPayout: true },
        _count: true,
      }),
      prisma.payment.findMany({
        include: {
          order: { include: { user: { select: { name: true } }, chef: { include: { user: { select: { name: true } } } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    res.json({
      success: true,
      data: {
        today: { revenue: todayStats._sum.amount || 0, platformFee: todayStats._sum.platformFee || 0, chefPayout: todayStats._sum.chefPayout || 0, orders: todayStats._count },
        week: { revenue: weekStats._sum.amount || 0, platformFee: weekStats._sum.platformFee || 0, chefPayout: weekStats._sum.chefPayout || 0, orders: weekStats._count },
        month: { revenue: monthStats._sum.amount || 0, platformFee: monthStats._sum.platformFee || 0, chefPayout: monthStats._sum.chefPayout || 0, orders: monthStats._count },
        total: { revenue: totalStats._sum.amount || 0, platformFee: totalStats._sum.platformFee || 0, chefPayout: totalStats._sum.chefPayout || 0, orders: totalStats._count },
        transactions: recentPayments,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch revenue stats";
    res.status(500).json({ success: false, error: message });
  }
});

// ==================== FIREBASE SYNC ====================

// DELETE /api/v1/admin/firebase-user?email=xxx — delete a ghost Firebase user (not in DB)
router.delete("/firebase-user", async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ success: false, error: "email query parameter is required" });
      return;
    }

    // Safety check: refuse if user exists in DB
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (dbUser) {
      res.status(409).json({ success: false, error: "User exists in the database. Use proper account deletion instead." });
      return;
    }

    const deleted = await deleteFirebaseUserByEmail(email);
    if (deleted) {
      res.json({ success: true, data: { message: `Firebase account for ${email} deleted. They can now re-register.` } });
    } else {
      res.json({ success: true, data: { message: `No Firebase account found for ${email}.` } });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete Firebase user";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/admin/firebase-sync — find and clean ghost Firebase users (in Firebase but not DB)
router.post("/firebase-sync", async (_req: Request, res: Response) => {
  try {
    // List all Firebase users and check against DB
    const ghosts: string[] = [];
    let nextPageToken: string | undefined;

    do {
      const listResult = await firebaseAdminAuth.listUsers(100, nextPageToken);

      for (const fbUser of listResult.users) {
        if (!fbUser.email) continue;
        const dbUser = await prisma.user.findFirst({
          where: { OR: [{ email: fbUser.email }, { firebaseUid: fbUser.uid }] },
        });
        if (!dbUser) {
          // Ghost user — exists in Firebase but not in DB
          await firebaseAdminAuth.deleteUser(fbUser.uid);
          ghosts.push(fbUser.email);
        }
      }

      nextPageToken = listResult.pageToken;
    } while (nextPageToken);

    res.json({
      success: true,
      data: {
        message: `Sync complete. Cleaned ${ghosts.length} ghost Firebase account(s).`,
        cleaned: ghosts,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Firebase sync failed";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
