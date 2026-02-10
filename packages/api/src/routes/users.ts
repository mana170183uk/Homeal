import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/v1/users/me
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { chef: true, addresses: true },
    });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    // Add approval status for chef users
    let approvalStatus: string | undefined;
    let trialEndsAt: Date | null = null;
    if (user.chef) {
      if (user.chef.rejectedAt) approvalStatus = "rejected";
      else if (user.chef.isVerified) approvalStatus = "approved";
      else approvalStatus = "pending";
      trialEndsAt = user.chef.trialEndsAt;
    }
    res.json({ success: true, data: { ...user, approvalStatus, trialEndsAt } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/v1/users/me
router.patch("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const { name, avatar, dietaryPrefs } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, avatar, dietaryPrefs },
    });
    res.json({ success: true, data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/users/addresses
router.post("/addresses", authenticate, async (req: Request, res: Response) => {
  try {
    const address = await prisma.address.create({
      data: { ...req.body, userId: req.user!.userId },
    });
    res.status(201).json({ success: true, data: address });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add address";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/v1/users/addresses
router.get("/addresses", authenticate, async (req: Request, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: addresses });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch addresses";
    res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/v1/users/addresses/:id
router.patch("/addresses/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const addressId = req.params.id as string;
    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ success: false, error: "Address not found" });
      return;
    }

    const { label, line1, line2, city, state, zipCode, latitude, longitude, isDefault } = req.body;

    // If setting as default, unset other defaults first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: { label, line1, line2, city, state, zipCode, latitude, longitude, isDefault },
    });
    res.json({ success: true, data: address });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update address";
    res.status(500).json({ success: false, error: message });
  }
});

// DELETE /api/v1/users/addresses/:id
router.delete("/addresses/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const addressId = req.params.id as string;
    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ success: false, error: "Address not found" });
      return;
    }
    await prisma.address.delete({ where: { id: addressId } });
    res.json({ success: true, data: { id: addressId } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete address";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
