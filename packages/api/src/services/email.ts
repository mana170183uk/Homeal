import jwt from "jsonwebtoken";
import {
  newChefNotificationHtml,
  chefApprovedHtml,
  chefRejectedHtml,
} from "./emailTemplates";

const RESEND_API = "https://api.resend.com/emails";

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

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Email] Resend API error ${res.status}: ${body}`);
      return false;
    }

    console.log(`[Email] Sent "${subject}" to ${to}`);
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
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "homealforuk@gmail.com";
  const apiBase = process.env.API_URL || "https://homeal-api.azurewebsites.net";
  const superAdminPanelUrl = process.env.SUPER_ADMIN_URL || "https://homeal-superadmin.azurewebsites.net";

  const approveToken = generateActionToken(params.chefId, "approve");
  const rejectToken = generateActionToken(params.chefId, "reject");

  const approveUrl = `${apiBase}/api/v1/approve-action?action=approve&chefId=${params.chefId}&token=${approveToken}`;
  const rejectUrl = `${apiBase}/api/v1/approve-action?action=reject&chefId=${params.chefId}&token=${rejectToken}`;

  return sendEmail({
    to: superAdminEmail,
    subject: `New Chef Registration: ${params.kitchenName}`,
    html: newChefNotificationHtml({
      chefName: params.chefName,
      kitchenName: params.kitchenName,
      chefEmail: params.chefEmail,
      approveUrl,
      rejectUrl,
      superAdminPanelUrl,
    }),
  });
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
