import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";
import { SEARCH_RADIUS_MILES_DEFAULT } from "@homeal/shared";

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
      where: { isVerified: true, isOnline: true },
      include: {
        user: { select: { name: true, avatar: true } },
        menus: {
          where: { isActive: true },
          include: { items: { where: { isAvailable: true }, take: 5 } },
          take: 1,
        },
      },
      take: 50,
    });

    // If lat/lng provided, filter by distance and sort
    if (!isNaN(lat) && !isNaN(lng)) {
      const chefsWithDistance = chefs
        .filter((chef) => chef.latitude != null && chef.longitude != null)
        .map((chef) => ({
          ...chef,
          distance: Math.round(
            haversineDistanceMiles(lat, lng, chef.latitude!, chef.longitude!) * 10
          ) / 10,
        }))
        .filter((chef) => chef.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

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
