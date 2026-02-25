import jwt from "jsonwebtoken";
import prisma from "@homeal/db";
import {
  newChefNotificationHtml,
  chefApprovedHtml,
  chefRejectedHtml,
  adminAccessRequestHtml,
  adminAccessApprovedHtml,
  adminAccessRejectedHtml,
  emailVerificationHtml,
  passwordResetHtml,
} from "./emailTemplates";
import { firebaseAdminAuth } from "../lib/firebaseAdmin";

const RESEND_API = "https://api.resend.com/emails";

async function getAllSuperAdminEmails(): Promise<string[]> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN", isActive: true },
      select: { email: true },
    });
    const emails = admins.map(a => a.email).filter(Boolean) as string[];
    if (emails.length > 0) return emails;
  } catch (err) {
    console.error("[Email] Failed to query super admin emails:", err);
  }
  // Fallback to env var
  const fallback = process.env.SUPER_ADMIN_EMAIL || "admin@homeal.uk";
  return [fallback];
}

async function getAllSuperAdminIds(): Promise<string[]> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN", isActive: true },
      select: { id: true },
    });
    return admins.map(a => a.id);
  } catch (err) {
    console.error("[Email] Failed to query super admin IDs:", err);
    return [];
  }
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Homeal <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not set — skipping email");
    return false;
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    const body = await res.json().catch(() => null) as { id?: string; message?: string } | null;

    if (!res.ok) {
      console.error(`[Email] Resend API error ${res.status}:`, JSON.stringify(body));
      return false;
    }

    console.log(`[Email] Sent "${subject}" to ${to} (messageId: ${body?.id || "unknown"})`);
    return true;
  } catch (err) {
    console.error("[Email] Failed to send:", err);
    return false;
  }
}

function generateActionToken(chefId: string, action: string): string {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign({ chefId, action }, secret, { expiresIn: "7d" });
}

export async function notifySuperAdminNewChef(params: {
  chefId: string;
  chefName: string;
  kitchenName: string;
  chefEmail: string;
}): Promise<boolean> {
  const apiBase = process.env.API_URL || "https://homeal-api.azurewebsites.net";
  const superAdminPanelUrl = process.env.SUPER_ADMIN_URL || "https://homeal-superadmin.azurewebsites.net";

  const approveToken = generateActionToken(params.chefId, "approve");
  const rejectToken = generateActionToken(params.chefId, "reject");

  const approveUrl = `${apiBase}/api/v1/approve-action?action=approve&chefId=${params.chefId}&token=${approveToken}`;
  const rejectUrl = `${apiBase}/api/v1/approve-action?action=reject&chefId=${params.chefId}&token=${rejectToken}`;

  const html = newChefNotificationHtml({
    chefName: params.chefName,
    kitchenName: params.kitchenName,
    chefEmail: params.chefEmail,
    approveUrl,
    rejectUrl,
    superAdminPanelUrl,
  });

  // Send to ALL super admins
  const emails = await getAllSuperAdminEmails();
  console.log(`[Email] Sending new chef notification to ${emails.length} super admins: ${emails.join(", ")}`);
  const results = await Promise.allSettled(
    emails.map(email => sendEmail({
      to: email,
      subject: `New Home Maker Registration: ${params.kitchenName}`,
      html,
    }))
  );
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      console.log(`[Email] → ${emails[i]}: ${r.value ? "sent" : "FAILED (sendEmail returned false)"}`);
    } else {
      console.error(`[Email] → ${emails[i]}: REJECTED — ${r.reason}`);
    }
  });

  // Create in-app notifications for all super admins
  try {
    const adminIds = await getAllSuperAdminIds();
    if (adminIds.length > 0) {
      await prisma.notification.createMany({
        data: adminIds.map(userId => ({
          userId,
          type: "SYSTEM",
          title: "New Home Maker Registration",
          body: `${params.kitchenName} (${params.chefName}) has registered and is awaiting approval.`,
        })),
      });
    }
  } catch (err) {
    console.error("[Email] Failed to create in-app notifications:", err);
  }

  return results.some(r => r.status === "fulfilled" && r.value === true);
}

export async function sendChefApprovalEmail(params: {
  chefEmail: string;
  chefName: string;
  kitchenName: string;
  trialEndsAt: Date;
}): Promise<boolean> {
  const dashboardUrl = process.env.ADMIN_WEB_URL || "https://homeal-admin.azurewebsites.net";

  return sendEmail({
    to: params.chefEmail,
    subject: "Welcome to Homeal — Your Kitchen is Approved!",
    html: chefApprovedHtml({
      chefName: params.chefName,
      kitchenName: params.kitchenName,
      trialEndsAt: params.trialEndsAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      dashboardUrl,
    }),
  });
}

function generateAdminActionToken(requestId: string, action: string): string {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign({ requestId, action, type: "admin_access" }, secret, { expiresIn: "7d" });
}

export async function notifySuperAdminAccessRequest(params: {
  requestId: string;
  requesterName: string;
  requesterEmail: string;
}): Promise<boolean> {
  const apiBase = process.env.API_URL || "https://homeal-api.azurewebsites.net";
  const superAdminPanelUrl = process.env.SUPER_ADMIN_URL || "https://homeal-superadmin.azurewebsites.net";

  const approveToken = generateAdminActionToken(params.requestId, "approve_admin");
  const rejectToken = generateAdminActionToken(params.requestId, "reject_admin");

  const approveUrl = `${apiBase}/api/v1/approve-action?action=approve_admin&requestId=${params.requestId}&token=${approveToken}`;
  const rejectUrl = `${apiBase}/api/v1/approve-action?action=reject_admin&requestId=${params.requestId}&token=${rejectToken}`;

  const html = adminAccessRequestHtml({
    requesterName: params.requesterName,
    requesterEmail: params.requesterEmail,
    approveUrl,
    rejectUrl,
    superAdminPanelUrl,
  });

  // Send to ALL super admins
  const emails = await getAllSuperAdminEmails();
  const results = await Promise.allSettled(
    emails.map(email => sendEmail({
      to: email,
      subject: `Super Admin Access Request: ${params.requesterName}`,
      html,
    }))
  );

  // Create in-app notifications for all super admins
  try {
    const adminIds = await getAllSuperAdminIds();
    if (adminIds.length > 0) {
      await prisma.notification.createMany({
        data: adminIds.map(userId => ({
          userId,
          type: "SYSTEM",
          title: "Super Admin Access Request",
          body: `${params.requesterName} (${params.requesterEmail}) has requested Super Admin access.`,
        })),
      });
    }
  } catch (err) {
    console.error("[Email] Failed to create in-app notifications:", err);
  }

  return results.some(r => r.status === "fulfilled" && r.value === true);
}

export async function sendAdminAccessApprovedEmail(params: {
  email: string;
  name: string;
}): Promise<boolean> {
  const loginUrl = process.env.SUPER_ADMIN_URL || "https://homeal-superadmin.azurewebsites.net";

  return sendEmail({
    to: params.email,
    subject: "Homeal Super Admin Access Approved!",
    html: adminAccessApprovedHtml({
      name: params.name,
      loginUrl,
    }),
  });
}

export async function sendAdminAccessRejectedEmail(params: {
  email: string;
  name: string;
}): Promise<boolean> {
  return sendEmail({
    to: params.email,
    subject: "Homeal Super Admin Access Request Update",
    html: adminAccessRejectedHtml({
      name: params.name,
    }),
  });
}

export async function sendChefRejectionEmail(params: {
  chefEmail: string;
  chefName: string;
  reason?: string;
}): Promise<boolean> {
  return sendEmail({
    to: params.chefEmail,
    subject: "Homeal Registration Update",
    html: chefRejectedHtml({
      chefName: params.chefName,
      reason: params.reason,
    }),
  });
}

export async function sendVerificationEmail(params: {
  email: string;
  userName: string;
}): Promise<boolean> {
  try {
    const actionUrl = `${process.env.CUSTOMER_WEB_URL || "https://homeal.uk"}/auth/action`;
    const verifyUrl = await firebaseAdminAuth.generateEmailVerificationLink(
      params.email,
      { url: actionUrl }
    );

    // Replace Firebase's default action URL with our custom branded page
    const url = new URL(verifyUrl);
    const oobCode = url.searchParams.get("oobCode");
    const apiKey = url.searchParams.get("apiKey");
    const brandedUrl = `${actionUrl}?mode=verifyEmail&oobCode=${oobCode}&apiKey=${apiKey}&lang=en`;

    return sendEmail({
      to: params.email,
      subject: "Verify your email for Homeal",
      html: emailVerificationHtml({
        userName: params.userName,
        verifyUrl: brandedUrl,
      }),
    });
  } catch (err) {
    console.error("[Email] Failed to send verification email:", err);
    return false;
  }
}

export async function sendPasswordResetEmail(params: {
  email: string;
  userName: string;
}): Promise<boolean> {
  try {
    const actionUrl = `${process.env.CUSTOMER_WEB_URL || "https://homeal.uk"}/auth/action`;
    const resetUrl = await firebaseAdminAuth.generatePasswordResetLink(
      params.email,
      { url: actionUrl }
    );

    // Replace Firebase's default action URL with our custom branded page
    const url = new URL(resetUrl);
    const oobCode = url.searchParams.get("oobCode");
    const apiKey = url.searchParams.get("apiKey");
    const brandedUrl = `${actionUrl}?mode=resetPassword&oobCode=${oobCode}&apiKey=${apiKey}&lang=en`;

    return sendEmail({
      to: params.email,
      subject: "Reset your password for Homeal",
      html: passwordResetHtml({
        userName: params.userName,
        resetUrl: brandedUrl,
      }),
    });
  } catch (err) {
    console.error("[Email] Failed to send password reset email:", err);
    return false;
  }
}
