import { Router, Request, Response } from "express";
import prisma from "@homeal/db";

const router = Router();

// Haversine formula: returns distance in miles
function haversineDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8;
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

// GET /api/v1/products/categories — list active categories
// Optional query: ?type=FOOD|PRODUCT
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const where: Record<string, unknown> = { isActive: true };
    if (type === "FOOD" || type === "PRODUCT") {
      where.type = type;
    }
    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/products — list all available products across verified chefs
// Query params: category, search, veg, lat, lng, radius, limit, offset
router.get("/", async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category as string | undefined;
    const categoryType = req.query.categoryType as string | undefined;
    const search = req.query.search as string | undefined;
    const vegOnly = req.query.veg === "true";
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 40, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    // Build where clause for menu items
    const itemWhere: Record<string, unknown> = {
      isAvailable: true,
      menu: {
        isActive: true,
        chef: { isVerified: true },
      },
    };

    if (categoryId && categoryId !== "all") {
      itemWhere.categoryId = categoryId;
    }
    // Filter by category type (FOOD or PRODUCT)
    if (categoryType === "FOOD" || categoryType === "PRODUCT") {
      itemWhere.category = { ...((itemWhere.category as object) || {}), type: categoryType };
    }
    if (vegOnly) {
      itemWhere.isVeg = true;
    }
    if (search) {
      itemWhere.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: itemWhere,
        include: {
          category: true,
          menu: {
            include: {
              chef: {
                include: {
                  user: { select: { name: true, avatar: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.menuItem.count({ where: itemWhere }),
    ]);

    // Map to flat product objects with chef info + optional distance
    const hasLocation = !isNaN(lat) && !isNaN(lng);
    const products = items
      .map((item) => {
        const chef = item.menu.chef;
        let distance: number | null = null;
        if (hasLocation && chef.latitude != null && chef.longitude != null) {
          distance =
            Math.round(haversineDistanceMiles(lat, lng, chef.latitude, chef.longitude) * 10) / 10;
        }
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          isVeg: item.isVeg,
          calories: item.calories,
          prepTime: item.prepTime,
          servingSize: item.servingSize,
          allergens: item.allergens,
          ingredients: item.ingredients,
          eggOption: item.eggOption,
          category: item.category,
          chef: {
            id: chef.id,
            kitchenName: chef.kitchenName,
            bannerImage: chef.bannerImage,
            avgRating: chef.avgRating,
            totalReviews: chef.totalReviews,
            isOnline: chef.isOnline,
            distance,
            user: chef.user,
          },
        };
      })
      // If radius filter is set with location, only include items within range
      .filter((p) => {
        if (hasLocation && radius > 0 && p.chef.distance != null) {
          return p.chef.distance <= radius;
        }
        return true;
      });

    res.json({ success: true, data: { products, total, limit, offset } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/products/:id — single product detail
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id as string },
      include: {
        category: true,
        menu: {
          include: {
            chef: {
              include: {
                user: { select: { name: true, avatar: true } },
                menus: {
                  where: { isActive: true },
                  include: { items: { where: { isAvailable: true }, take: 6 } },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      res.status(404).json({ success: false, error: "Product not found" });
      return;
    }

    const chef = item.menu.chef;
    // Get more items from same chef for "More from this seller"
    const moreItems = chef.menus
      .flatMap((m) => m.items)
      .filter((i) => i.id !== item.id)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        isVeg: item.isVeg,
        calories: item.calories,
        prepTime: item.prepTime,
        servingSize: item.servingSize,
        allergens: item.allergens,
        ingredients: item.ingredients,
        category: item.category,
        chef: {
          id: chef.id,
          kitchenName: chef.kitchenName,
          bannerImage: chef.bannerImage,
          avgRating: chef.avgRating,
          totalReviews: chef.totalReviews,
          latitude: chef.latitude,
          longitude: chef.longitude,
          user: chef.user,
        },
        moreFromSeller: moreItems.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          image: i.image,
          isVeg: i.isVeg,
        })),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch product";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
