import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// PATCH /api/v1/reviews/:id/reply — chef replies to a review
router.patch(
  "/:id/reply",
  authenticate,
  authorize("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const reviewId = req.params.id as string;
      const { reply } = req.body;

      if (!reply) {
        res.status(400).json({ success: false, error: "Reply text is required" });
        return;
      }

      // Verify the review belongs to this chef
      const chef = await prisma.chef.findUnique({ where: { userId: req.user!.userId } });
      if (!chef) { res.status(404).json({ success: false, error: "Chef not found" }); return; }

      const review = await prisma.review.findUnique({ where: { id: reviewId } });
      if (!review) { res.status(404).json({ success: false, error: "Review not found" }); return; }
      if (review.chefId !== chef.id) { res.status(403).json({ success: false, error: "Not your review" }); return; }

      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { reply },
        include: { user: { select: { name: true, avatar: true } } },
      });

      res.json({ success: true, data: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reply to review";
      res.status(500).json({ success: false, error: message });
    }
  }
);

export default router;
