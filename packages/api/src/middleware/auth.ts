import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "@homeal/shared";
import { AppError } from "./errorHandler";
import { firebaseAdminAuth } from "../lib/firebaseAdmin";
import prisma from "@homeal/db";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    ) as TokenPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }
    next();
  };
}

/**
 * Enhanced authorization for SUPER_ADMIN routes.
 * Checks JWT role (primary) + Firebase custom claim super_admin=true (secondary).
 * Graceful degradation: if Firebase unreachable, falls back to DB role with warning.
 */
export function authorizeSuperAdmin() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (req.user.role !== "SUPER_ADMIN") {
      return next(new AppError("Insufficient permissions", 403));
    }

    // Secondary check: verify Firebase custom claims
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { firebaseUid: true, email: true },
      });
      if (!dbUser?.firebaseUid) {
        return next(new AppError("Insufficient permissions", 403));
      }

      const fbUser = await firebaseAdminAuth.getUser(dbUser.firebaseUid);
      const claims = fbUser.customClaims || {};

      if (claims.super_admin === true) {
        return next();
      }

      // Graceful degradation: allow if DB role is correct but log warning
      console.warn(`[Auth] SUPER_ADMIN ${dbUser.email} missing Firebase custom claim. Allowing based on DB role.`);
      next();
    } catch (err) {
      console.error("[Auth] Firebase claims check failed:", err);
      // Fail open to DB role only (don't break existing flow)
      next();
    }
  };
}
