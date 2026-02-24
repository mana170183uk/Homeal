import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";
import { SEARCH_RADIUS_MILES_DEFAULT } from "@homeal/shared";
import { notifyChefFollowers } from "../services/notifications";

const router = Router();

// Haversine formula: returns distance in miles between two lat/lng points
function haversineDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/v1/chefs/geocode?postcode=SW1A1AA - geocode a UK postcode
router.get("/geocode", async (req: Request, res: Response) => {
  try {
    const postcode = (req.query.postcode as string || "").replace(/\s+/g, "").toUpperCase();
    if (!postcode) {
      res.status(400).json({ success: false, error: "Postcode is required" });
      return;
    }

    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    const data = (await response.json()) as {
      status: number;
      result?: { postcode: string; latitude: number; longitude: number; admin_district?: string; region?: string };
    };

    if (data.status !== 200 || !data.result) {
      res.status(404).json({ success: false, error: "Invalid postcode" });
      return;
    }

    res.json({
      success: true,
      data: {
        postcode: data.result.postcode,
        lat: data.result.latitude,
        lng: data.result.longitude,
        area: data.result.admin_district || data.result.region,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Geocoding failed";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/chefs - list nearby chefs (with optional geolocation filtering)
router.get("/", async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || SEARCH_RADIUS_MILES_DEFAULT;

    const chefs = await prisma.chef.findMany({
      where: { isVerified: true },
      include: {
        user: { select: { name: true, avatar: true } },
        menus: {
          where: { isActive: true },
          include: { items: { where: { isAvailable: true }, take: 5 } },
          take: 1,
        },
        badges: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          select: { type: true, label: true },
        },
      },
      take: 50,
    });

    // If lat/lng provided, filter by distance and sort
    if (!isNaN(lat) && !isNaN(lng)) {
      type ChefRow = (typeof chefs)[number];
      const chefsWithDistance = chefs
        .filter((chef: ChefRow) => chef.latitude != null && chef.longitude != null)
        .map((chef: ChefRow) => ({
          ...chef,
          distance: Math.round(
            haversineDistanceMiles(lat, lng, chef.latitude!, chef.longitude!) * 10
          ) / 10,
        }))
        .filter((chef: ChefRow & { distance: number }) => chef.distance <= radius)
        .sort((a: ChefRow & { distance: number }, b: ChefRow & { distance: number }) => a.distance - b.distance);

      res.json({ success: true, data: chefsWithDistance });
      return;
    }

    res.json({ success: true, data: chefs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch chefs";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/chefs/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const chefId = req.params.id as string;
    const chef = await prisma.chef.findUnique({
      where: { id: chefId },
      include: {
        user: { select: { name: true, avatar: true } },
        menus: { where: { isActive: true }, include: { items: true } },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        services: { where: { isActive: true } },
        badges: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          select: { type: true, label: true },
        },
      },
    });
    if (!chef) {
      res.status(404).json({ success: false, error: "Chef not found" });
      return;
    }

    // Check if request is authenticated (optional — no middleware required)
    const authHeader = req.headers.authorization;
    const isAuthenticated = !!(authHeader && authHeader.startsWith("Bearer ") && authHeader.length > 10);

    if (!isAuthenticated) {
      // Mask reviewer names: "John" → "J***"
      const maskedReviews = chef.reviews.map((r: any) => ({
        ...r,
        user: {
          ...r.user,
          name: r.user.name ? r.user.name.charAt(0).toUpperCase() + "***" : "User",
          avatar: null,
        },
      }));
      // Omit operating hours for guests
      res.json({
        success: true,
        data: { ...chef, reviews: maskedReviews, operatingHours: null },
      });
      return;
    }

    res.json({ success: true, data: chef });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch chef";
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/v1/chefs/me - update chef profile (whitelisted fields)
const ALLOWED_CHEF_FIELDS = [
  "kitchenName", "description", "cuisineTypes", "bannerImage", "latitude", "longitude",
  "deliveryRadius", "isOnline", "operatingHours", "bankDetails", "sellerType", "businessName",
  "cakeEnabled", "bakeryEnabled", "dailyOrderCap", "orderCutoffTime", "vacationStart", "vacationEnd",
  "address", "city", "county", "postcode", "contactPhone", "contactPerson",
];

router.patch(
  "/me",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const data: Record<string, unknown> = {};
      for (const key of ALLOWED_CHEF_FIELDS) {
        if (req.body[key] !== undefined) {
          // Parse date fields
          if ((key === "vacationStart" || key === "vacationEnd") && req.body[key]) {
            data[key] = new Date(req.body[key] + "T00:00:00.000Z");
          } else if ((key === "vacationStart" || key === "vacationEnd") && !req.body[key]) {
            data[key] = null;
          } else {
            data[key] = req.body[key];
          }
        }
      }
      // Auto-geocode if postcode changed
      if (data.postcode && typeof data.postcode === "string") {
        try {
          const geoRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent((data.postcode as string).replace(/\s+/g, ""))}`);
          const geoData = await geoRes.json() as { status: number; result?: { latitude: number; longitude: number; admin_district: string | null; admin_county: string | null } };
          if (geoData.status === 200 && geoData.result) {
            data.latitude = geoData.result.latitude;
            data.longitude = geoData.result.longitude;
            if (geoData.result.admin_district && !data.city) data.city = geoData.result.admin_district;
            if (geoData.result.admin_county && !data.county) data.county = geoData.result.admin_county;
          }
        } catch { /* geocode failed — skip */ }
      }

      const chef = await prisma.chef.update({
        where: { userId: req.user!.userId },
        data,
      });
      // Notify followers of profile update
      notifyChefFollowers(chef.id, `${chef.kitchenName} updated their profile`, "Check out what's new!", { chefId: chef.id }).catch(console.error);
      res.json({ success: true, data: chef });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Update failed";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// ==================== PAYMENT CONFIG ====================

// GET /api/v1/chefs/me/payment-config — masked payment settings
router.get(
  "/me/payment-config",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({
        where: { userId: req.user!.userId },
        select: { paymentConfig: true, stripeAccountId: true },
      });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      let config = { stripeEnabled: false, paypalEnabled: false, stripeConnectEnabled: false };
      if (chef.paymentConfig) {
        try {
          const raw = JSON.parse(chef.paymentConfig);
          config = {
            stripeEnabled: !!raw.stripeSecretKey,
            paypalEnabled: !!raw.paypalClientId,
            stripeConnectEnabled: !!chef.stripeAccountId,
          };
        } catch { /* invalid JSON */ }
      }
      config.stripeConnectEnabled = !!chef.stripeAccountId;
      res.json({ success: true, data: config });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch payment config";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// PUT /api/v1/chefs/me/payment-config — save payment keys (server-side only)
router.put(
  "/me/payment-config",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const { stripeSecretKey, stripePublishableKey, paypalClientId, paypalSecretKey } = req.body;
      const paymentConfig = JSON.stringify({
        stripeSecretKey: stripeSecretKey || null,
        stripePublishableKey: stripePublishableKey || null,
        paypalClientId: paypalClientId || null,
        paypalSecretKey: paypalSecretKey || null,
      });
      await prisma.chef.update({
        where: { userId: req.user!.userId },
        data: { paymentConfig },
      });
      res.json({ success: true, data: { message: "Payment settings saved" } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save payment config";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/v1/chefs/me/payment-config/test — test payment connection
router.post(
  "/me/payment-config/test",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const { provider } = req.body;
      const chef = await prisma.chef.findUnique({
        where: { userId: req.user!.userId },
        select: { paymentConfig: true },
      });
      if (!chef?.paymentConfig) {
        res.status(400).json({ success: false, error: "No payment config saved" });
        return;
      }

      const config = JSON.parse(chef.paymentConfig);

      if (provider === "stripe" && config.stripeSecretKey) {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(config.stripeSecretKey);
        await stripe.balance.retrieve();
        res.json({ success: true, data: { provider: "stripe", status: "connected" } });
      } else if (provider === "paypal" && config.paypalClientId) {
        res.json({ success: true, data: { provider: "paypal", status: "keys_saved" } });
      } else {
        res.status(400).json({ success: false, error: `${provider} not configured` });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Connection test failed";
      res.status(400).json({ success: false, error: `Connection failed: ${message}` });
    }
  }
);

// POST /api/v1/chefs/me/stripe-connect — initiate Stripe Connect onboarding
router.post(
  "/me/stripe-connect",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        res.status(500).json({ success: false, error: "Platform Stripe not configured" });
        return;
      }
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      let accountId = chef.stripeAccountId;
      if (!accountId) {
        const account = await stripe.accounts.create({ type: "express", country: "GB" });
        accountId = account.id;
        await prisma.chef.update({ where: { id: chef.id }, data: { stripeAccountId: accountId } });
      }

      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${req.headers.origin || "https://admin.homeal.uk"}/?page=settings&stripe=retry`,
        return_url: `${req.headers.origin || "https://admin.homeal.uk"}/?page=settings&stripe=success`,
        type: "account_onboarding",
      });

      res.json({ success: true, data: { url: accountLink.url } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Stripe Connect setup failed";
      res.status(500).json({ success: false, error: message });
    }
  }
);

export default router;
