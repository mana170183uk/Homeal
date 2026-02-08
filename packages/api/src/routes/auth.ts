import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@homeal/db";

const router = Router();

const JWT_EXPIRY = "15m";
const JWT_REFRESH_EXPIRY = "7d";

function signToken(payload: object, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
}

// POST /api/v1/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, firebaseUid, role } = req.body;

    const user = await prisma.user.create({
      data: { name, email, phone, firebaseUid, role: role || "CUSTOMER" },
    });

    const tokenPayload = { userId: user.id, role: user.role };
    const token = signToken(tokenPayload, process.env.JWT_SECRET || "dev-secret", JWT_EXPIRY);
    const refreshToken = signToken(tokenPayload, process.env.JWT_REFRESH_SECRET || "dev-refresh-secret", JWT_REFRESH_EXPIRY);

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

    const tokenPayload = { userId: user.id, role: user.role };
    const token = signToken(tokenPayload, process.env.JWT_SECRET || "dev-secret", JWT_EXPIRY);
    const refreshToken = signToken(tokenPayload, process.env.JWT_REFRESH_SECRET || "dev-refresh-secret", JWT_REFRESH_EXPIRY);

    res.json({ success: true, data: { user, token, refreshToken } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/auth/test-login (for testing without Firebase)
router.post("/test-login", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { chef: true },
    });

    if (!user) {
      res.status(404).json({ success: false, error: "User not found. Run seed to create test users." });
      return;
    }

    const tokenPayload = { userId: user.id, role: user.role };
    const token = signToken(tokenPayload, process.env.JWT_SECRET || "dev-secret", JWT_EXPIRY);
    const refreshToken = signToken(tokenPayload, process.env.JWT_REFRESH_SECRET || "dev-refresh-secret", JWT_REFRESH_EXPIRY);

    res.json({ success: true, data: { user, token, refreshToken } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Test login failed";
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

    const token = signToken(
      { userId: payload.userId, role: payload.role },
      process.env.JWT_SECRET || "dev-secret",
      JWT_EXPIRY
    );

    res.json({ success: true, data: { token } });
  } catch {
    res.status(401).json({ success: false, error: "Invalid refresh token" });
  }
});

export default router;
