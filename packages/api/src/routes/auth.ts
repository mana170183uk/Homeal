import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@homeal/db";
import { authenticate } from "../middleware/auth";
import { notifySuperAdminNewChef, notifySuperAdminAccessRequest, sendVerificationEmail, sendPasswordResetEmail } from "../services/email";
import { setFirebaseCustomClaims, firebaseAdminAuth } from "../lib/firebaseAdmin";

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
    const { name, email, phone, firebaseUid, role, kitchenName, sellerType, businessName, address, postcode } = req.body;

    // Convert empty phone to null to avoid unique constraint collisions
    const cleanPhone = phone && phone.trim() ? phone.trim() : null;

    // Validate required fields for CUSTOMER
    let finalRole = role || "CUSTOMER";
    if (finalRole === "CUSTOMER") {
      if (!address || !address.trim()) {
        res.status(400).json({ success: false, error: "Address is required." });
        return;
      }
      if (!postcode || !postcode.trim()) {
        res.status(400).json({ success: false, error: "Postcode is required." });
        return;
      }
    }

    // Validate SUPER_ADMIN registration: only allowed if no super admin exists yet
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

    // Set Firebase custom claims for role enforcement
    if (firebaseUid) {
      setFirebaseCustomClaims(firebaseUid, {
        role: finalRole,
        ...(finalRole === "SUPER_ADMIN" ? { super_admin: true } : {}),
      }).catch((err: unknown) => console.error("[Register] Failed to set Firebase claims:", err));
    }

    // If registering as CHEF, create Chef record (pending approval)
    let chef = null;
    if (user.role === "CHEF") {
      // Geocode postcode if provided
      let latitude: number | undefined;
      let longitude: number | undefined;
      let geoCity: string | undefined;
      let geoCounty: string | undefined;
      if (postcode) {
        try {
          const geoRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.replace(/\s+/g, ""))}`);
          const geoData = await geoRes.json() as { status: number; result?: { latitude: number; longitude: number; admin_district: string | null; admin_county: string | null } };
          if (geoData.status === 200 && geoData.result) {
            latitude = geoData.result.latitude;
            longitude = geoData.result.longitude;
            if (geoData.result.admin_district) geoCity = geoData.result.admin_district;
            if (geoData.result.admin_county) geoCounty = geoData.result.admin_county;
          }
        } catch (err) {
          console.warn("[Register] Postcode geocoding failed:", err);
        }
      }

      chef = await prisma.chef.create({
        data: {
          userId: user.id,
          kitchenName: kitchenName || businessName || `${name}'s Kitchen`,
          businessName: businessName || null,
          sellerType: sellerType || "KITCHEN",
          cakeEnabled: sellerType === "CAKE_BAKERY" || sellerType === "CAKE",
          bakeryEnabled: sellerType === "CAKE_BAKERY" || sellerType === "BAKERY" || sellerType === "CAKE",
          address: address || null,
          postcode: postcode || null,
          city: geoCity || null,
          county: geoCounty || null,
          contactPhone: phone || null,
          contactPerson: name || null,
          latitude,
          longitude,
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

    // If registering as CUSTOMER, create default Address record
    if (user.role === "CUSTOMER" && address && postcode) {
      let custLat: number | undefined;
      let custLng: number | undefined;
      let custCity = "";
      if (postcode) {
        try {
          const geoRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.replace(/\s+/g, ""))}`);
          const geoData = await geoRes.json() as { status: number; result?: { latitude: number; longitude: number; admin_district: string | null; admin_county: string | null } };
          if (geoData.status === 200 && geoData.result) {
            custLat = geoData.result.latitude;
            custLng = geoData.result.longitude;
            if (geoData.result.admin_district) custCity = geoData.result.admin_district;
          }
        } catch (err) {
          console.warn("[Register] Customer postcode geocoding failed:", err);
        }
      }

      await prisma.address.create({
        data: {
          userId: user.id,
          label: "Home",
          line1: address.trim(),
          city: custCity || "Unknown",
          state: "England",
          zipCode: postcode.trim().toUpperCase(),
          latitude: custLat,
          longitude: custLng,
          isDefault: true,
        },
      });
    }

    // Send verification email server-side (more reliable than client-side fire-and-forget)
    if (email) {
      sendVerificationEmail({ email, userName: name || "there" })
        .then((sent) => {
          if (sent) console.log(`[Register] Verification email sent to ${email}`);
          else console.warn(`[Register] Failed to send verification email to ${email}`);
        })
        .catch((err) => console.error("[Register] Verification email error:", err));
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

    // SERVER-SIDE email verification — check Firebase directly (never trust client)
    let emailVerified = false;
    try {
      const fbUser = await firebaseAdminAuth.getUser(firebaseUid);
      emailVerified = fbUser.emailVerified;
    } catch (err) {
      console.error(`[Login] Firebase getUser failed for ${firebaseUid}:`, err);
      // Fall back to DB record if Firebase unreachable
      emailVerified = !!user.emailVerifiedAt;
    }

    // Track email verification timestamp (once)
    if (emailVerified && !user.emailVerifiedAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    }

    // Enforce email verification for all roles
    if (!emailVerified && !user.emailVerifiedAt) {
      res.status(403).json({
        success: false,
        error: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      });
      return;
    }

    // Server-side chef approval enforcement
    if (user.role === "CHEF" && user.chef) {
      if (user.chef.rejectedAt) {
        res.status(403).json({
          success: false,
          error: "Your Home Maker application has been rejected. Please contact support@homeal.uk for more information.",
          code: "CHEF_REJECTED",
        });
        return;
      }
      if (!user.chef.isVerified) {
        res.status(403).json({
          success: false,
          error: "Your Home Maker application is still pending approval. You will receive an email once approved.",
          code: "CHEF_PENDING",
        });
        return;
      }
    }

    const tokenPayload = { userId: user.id, role: user.role };
    const token = signToken(tokenPayload, process.env.JWT_SECRET || "dev-secret", JWT_EXPIRY);
    const refreshToken = signToken(tokenPayload, process.env.JWT_REFRESH_SECRET || "dev-refresh-secret", JWT_REFRESH_EXPIRY);

    const approval = getApprovalStatus(user.chef);
    const hasChefProfile = !!user.chef;

    res.json({ success: true, data: { user, token, refreshToken, hasChefProfile, ...approval } });
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
    const hasChefProfile = !!user.chef;

    res.json({ success: true, data: { user, token, refreshToken, hasChefProfile, ...approval } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Test login failed";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/auth/request-admin-access
router.post("/request-admin-access", async (req: Request, res: Response) => {
  try {
    const { name, email, firebaseUid } = req.body;

    if (!name || !email || !firebaseUid) {
      res.status(400).json({ success: false, error: "Name, email, and firebaseUid are required." });
      return;
    }

    // Check if a request already exists for this email or firebaseUid
    const existing = await prisma.adminAccessRequest.findFirst({
      where: { OR: [{ email }, { firebaseUid }] },
    });

    if (existing) {
      if (existing.status === "PENDING") {
        res.json({ success: true, data: { status: "PENDING", message: "Your access request is already pending approval." } });
        return;
      }
      if (existing.status === "APPROVED") {
        res.json({ success: true, data: { status: "APPROVED", message: "Your access has already been approved. Please log in." } });
        return;
      }
      if (existing.status === "REJECTED") {
        res.status(403).json({ success: false, error: "Your access request was previously rejected. Contact the platform administrator." });
        return;
      }
    }

    // Create the request
    const request = await prisma.adminAccessRequest.create({
      data: { name, email, firebaseUid },
    });

    // Send notification email to super admin (fire-and-forget)
    notifySuperAdminAccessRequest({
      requestId: request.id,
      requesterName: name,
      requesterEmail: email,
    }).catch((err) => console.error("[Auth] Failed to send admin access request email:", err));

    res.status(201).json({
      success: true,
      data: { status: "PENDING", message: "Your request has been submitted. You will receive an email once approved." },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    if (message.includes("Unique constraint")) {
      res.json({ success: true, data: { status: "PENDING", message: "Your access request is already pending approval." } });
    } else {
      res.status(500).json({ success: false, error: "Failed to submit request. Please try again." });
    }
  }
});

// GET /api/v1/auth/check-admin-request?firebaseUid=xxx
router.get("/check-admin-request", async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.query.firebaseUid as string;
    if (!firebaseUid) {
      res.status(400).json({ success: false, error: "firebaseUid is required" });
      return;
    }

    const request = await prisma.adminAccessRequest.findFirst({
      where: { firebaseUid },
    });

    if (!request) {
      res.json({ success: true, data: { status: "NONE" } });
      return;
    }

    res.json({ success: true, data: { status: request.status } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Check failed";
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

    // Re-read role + verification from DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, emailVerifiedAt: true, firebaseUid: true, isActive: true },
    });
    if (!user) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ success: false, error: "Account deactivated" });
      return;
    }

    // Re-check email verification on refresh
    if (!user.emailVerifiedAt && user.firebaseUid) {
      try {
        const fbUser = await firebaseAdminAuth.getUser(user.firebaseUid);
        if (!fbUser.emailVerified) {
          res.status(403).json({ success: false, error: "Please verify your email before continuing.", code: "EMAIL_NOT_VERIFIED" });
          return;
        }
        // Backfill verification timestamp
        await prisma.user.update({ where: { id: payload.userId }, data: { emailVerifiedAt: new Date() } });
      } catch {
        // Firebase unavailable — allow if DB has no record either, err on side of availability
      }
    }

    const token = signToken(
      { userId: payload.userId, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      JWT_EXPIRY
    );

    res.json({ success: true, data: { token } });
  } catch {
    res.status(401).json({ success: false, error: "Invalid refresh token" });
  }
});

// GET /api/v1/auth/me — fresh user data from DB (for role re-sync)
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { chef: true },
    });

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const approval = getApprovalStatus(user.chef);
    const hasChefProfile = !!user.chef;

    res.json({ success: true, data: { user, hasChefProfile, ...approval } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/auth/send-verification
router.post("/send-verification", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }

    // Look up user name for personalisation
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true },
    });

    const sent = await sendVerificationEmail({
      email,
      userName: user?.name || "there",
    });

    if (sent) {
      res.json({ success: true, data: { message: "Verification email sent" } });
    } else {
      res.status(500).json({ success: false, error: "Failed to send verification email" });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send verification email";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/v1/auth/send-password-reset
router.post("/send-password-reset", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }

    // Look up user name for personalisation
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true },
    });

    if (!user) {
      // Don't reveal whether the email exists — always return success
      res.json({ success: true, data: { message: "If an account exists with this email, a password reset link has been sent." } });
      return;
    }

    const sent = await sendPasswordResetEmail({
      email,
      userName: user.name,
    });

    // Always return success to prevent email enumeration
    res.json({ success: true, data: { message: "If an account exists with this email, a password reset link has been sent." } });
    if (!sent) {
      console.error(`[Auth] Failed to send password reset email to ${email}`);
    }
  } catch (error: unknown) {
    // Always return success to prevent email enumeration
    res.json({ success: true, data: { message: "If an account exists with this email, a password reset link has been sent." } });
  }
});

export default router;
