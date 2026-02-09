import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@homeal/db";
import { notifySuperAdminNewChef } from "../services/email";

const router = Router();

const JWT_EXPIRY = "15m";
const JWT_REFRESH_EXPIRY = "7d";

function getApprovalStatus(chef: { isVerified: boolean; rejectedAt: Date | null; trialEndsAt: Date | null } | null) {
  if (!chef) return undefined;
  if (chef.rejectedAt) return { approvalStatus: "rejected" as const, trialEndsAt: null };
  if (chef.isVerified) return { approvalStatus: "approved" as const, trialEndsAt: chef.trialEndsAt };
  return { approvalStatus: "pending" as const, trialEndsAt: null };
}

function signToken(payload: object, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
}

// POST /api/v1/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, firebaseUid, role, kitchenName } = req.body;

    // Convert empty phone to null to avoid unique constraint collisions
    const cleanPhone = phone && phone.trim() ? phone.trim() : null;

    // Validate SUPER_ADMIN registration: only allowed if no super admin exists yet
    let finalRole = role || "CUSTOMER";
    if (finalRole === "SUPER_ADMIN" || finalRole === "ADMIN") {
      const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });
      if (existingSuperAdmin) {
        res.status(403).json({ success: false, error: "A Super Admin already exists. Contact the platform administrator." });
        return;
      }
      finalRole = "SUPER_ADMIN";
    }

    const user = await prisma.user.create({
      data: { name, email, phone: cleanPhone, firebaseUid, role: finalRole },
    });

    // If registering as CHEF, create Chef record (pending approval)
    let chef = null;
    if (user.role === "CHEF") {
      chef = await prisma.chef.create({
        data: {
          userId: user.id,
          kitchenName: kitchenName || `${name}'s Kitchen`,
          isVerified: false,
        },
      });

      // Notify super admin (fire-and-forget)
      if (email) {
        notifySuperAdminNewChef({
          chefId: chef.id,
          chefName: name,
          kitchenName: chef.kitchenName,
          chefEmail: email,
        }).catch((err) => console.error("[Register] Failed to notify super admin:", err));
      }
    }

    const tokenPayload = { userId: user.id, role: user.role };
    const token = signToken(tokenPayload, process.env.JWT_SECRET || "dev-secret", JWT_EXPIRY);
    const refreshToken = signToken(tokenPayload, process.env.JWT_REFRESH_SECRET || "dev-refresh-secret", JWT_REFRESH_EXPIRY);

    const responseUser = chef
      ? { ...user, chef, approvalStatus: "pending" as const }
      : user;

    res.status(201).json({
      success: true,
      data: { user: responseUser, token, refreshToken },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    // Return user-friendly messages for common constraint violations
    if (message.includes("Unique constraint") && message.includes("email")) {
      res.status(409).json({ success: false, error: "An account with this email already exists. Please log in instead." });
    } else if (message.includes("Unique constraint") && message.includes("phone")) {
      res.status(409).json({ success: false, error: "This phone number is already registered. Please use a different number or log in." });
    } else if (message.includes("Unique constraint") && message.includes("firebaseUid")) {
      res.status(409).json({ success: false, error: "This account already exists. Please log in instead." });
    } else {
      res.status(400).json({ success: false, error: "Registration failed. Please try again." });
    }
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

    const approval = getApprovalStatus(user.chef);

    res.json({ success: true, data: { user, token, refreshToken, ...approval } });
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

    const approval = getApprovalStatus(user.chef);

    res.json({ success: true, data: { user, token, refreshToken, ...approval } });
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
