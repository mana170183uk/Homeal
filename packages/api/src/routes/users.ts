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
    res.json({ success: true, data: user });
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
    });
    res.json({ success: true, data: addresses });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch addresses";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
