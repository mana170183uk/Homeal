import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// POST /api/v1/categories/suggest — chef suggests a new category
router.post(
  "/suggest",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) {
        res.status(404).json({ success: false, error: "Chef not found" });
        return;
      }

      const { name, description } = req.body;
      if (!name?.trim()) {
        res.status(400).json({ success: false, error: "Category name is required" });
        return;
      }

      // Check if already suggested by this chef
      const existing = await prisma.categorySuggestion.findFirst({
        where: { chefId: chef.id, name: name.trim(), status: "PENDING" },
      });
      if (existing) {
        res.status(400).json({ success: false, error: "You already have a pending suggestion for this category" });
        return;
      }

      const suggestion = await prisma.categorySuggestion.create({
        data: {
          chefId: chef.id,
          name: name.trim(),
          description: description?.trim() || null,
        },
      });

      res.status(201).json({ success: true, data: suggestion });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to suggest category";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// GET /api/v1/categories/suggestions — super-admin: list all suggestions
router.get(
  "/suggestions",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  async (_req: Request, res: Response) => {
    try {
      const suggestions = await prisma.categorySuggestion.findMany({
        include: {
          chef: { select: { kitchenName: true, user: { select: { name: true, email: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ success: true, data: suggestions });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch suggestions";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// PATCH /api/v1/categories/suggestions/:id — super-admin: approve or reject
router.patch(
  "/suggestions/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body; // "APPROVED" | "REJECTED"
      const id = req.params.id as string;

      if (!["APPROVED", "REJECTED"].includes(status)) {
        res.status(400).json({ success: false, error: "status must be APPROVED or REJECTED" });
        return;
      }

      const suggestion = await prisma.categorySuggestion.findUnique({ where: { id } });
      if (!suggestion) {
        res.status(404).json({ success: false, error: "Suggestion not found" });
        return;
      }

      if (suggestion.status !== "PENDING") {
        res.status(400).json({ success: false, error: "Suggestion already reviewed" });
        return;
      }

      let approvedCategoryId: string | null = null;

      if (status === "APPROVED") {
        // Create a new Category
        const category = await prisma.category.create({
          data: {
            name: suggestion.name,
          },
        });
        approvedCategoryId = category.id;

        // Award "Menu Innovator" badge to the chef (expires in 30 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await prisma.chefBadge.create({
          data: {
            chefId: suggestion.chefId,
            type: "MENU_INNOVATOR",
            label: "Menu Innovator",
            expiresAt,
          },
        });
      }

      const updated = await prisma.categorySuggestion.update({
        where: { id },
        data: { status, approvedCategoryId },
      });

      res.json({ success: true, data: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update suggestion";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// GET /api/v1/categories/badges/:chefId — public: get chef's active badges
router.get("/badges/:chefId", async (req: Request, res: Response) => {
  try {
    const badges = await prisma.chefBadge.findMany({
      where: {
        chefId: req.params.chefId as string,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { awardedAt: "desc" },
    });

    res.json({ success: true, data: badges });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch badges";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
