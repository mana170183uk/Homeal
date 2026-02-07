import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@homeal/db";

const router = Router();

// POST /api/v1/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, firebaseUid, role } = req.body;

    const user = await prisma.user.create({
      data: { name, email, phone, firebaseUid, role: role || "CUSTOMER" },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: process.env.JWT_EXPIRY || "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
    );

    res.status(201).json({
      success: true,
      data: { user, token, refreshToken },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    res.status(400).json({ success: false, error: message });
  }
});

// POST /api/v1/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.body;

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { chef: true },
    });

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: process.env.JWT_EXPIRY || "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
    );

    res.json({ success: true, data: { user, token, refreshToken } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "dev-refresh-secret"
    ) as { userId: string; role: string };

    const token = jwt.sign(
      { userId: payload.userId, role: payload.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: process.env.JWT_EXPIRY || "15m" }
    );

    res.json({ success: true, data: { token } });
  } catch {
    res.status(401).json({ success: false, error: "Invalid refresh token" });
  }
});

export default router;
