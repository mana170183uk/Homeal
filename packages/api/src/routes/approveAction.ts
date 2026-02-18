import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@homeal/db";
import { sendChefApprovalEmail, sendChefRejectionEmail, sendAdminAccessApprovedEmail, sendAdminAccessRejectedEmail } from "../services/email";

const router = Router();

function renderPage(title: string, message: string, isSuccess: boolean): string {
  const color = isSuccess ? "#10B981" : "#EF4444";
  const icon = isSuccess ? "&#10003;" : "&#10007;";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} - Homeal</title></head>
<body style="margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;background:#FFF0F3;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="max-width:480px;margin:20px;background:#fff;border-radius:16px;padding:40px;border:1px solid #FFD6E0;text-align:center;">
    <h1 style="margin:0 0 16px;font-size:28px;">
      <span style="color:#2D8B3D;">Ho</span><span style="color:#FF8534;">me</span><span style="color:#2D8B3D;">al</span>
    </h1>
    <div style="display:inline-block;background:${isSuccess ? "#ECFDF5" : "#FEF2F2"};border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;color:${color};margin:16px 0;">${icon}</div>
    <h2 style="color:#2D2D3F;font-size:20px;margin:16px 0 8px;">${title}</h2>
    <p style="color:#4A4A65;font-size:14px;line-height:1.6;">${message}</p>
    <a href="${process.env.SUPER_ADMIN_URL || "https://homeal-superadmin.azurewebsites.net"}"
       style="display:inline-block;margin-top:24px;background:#8B5CF6;color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
      Open Super Admin Panel
    </a>
  </div>
</body></html>`;
}

// GET /api/v1/approve-action?action=approve|reject&chefId=xxx&token=xxx
router.get("/", async (req: Request, res: Response) => {
  try {
    const { action, chefId, token } = req.query as Record<string, string>;

    if (!action || !chefId || !token) {
      res.status(400).send(renderPage("Invalid Link", "This link is missing required parameters.", false));
      return;
    }

    // Verify JWT token
    const secret = process.env.JWT_SECRET || "dev-secret";
    let payload: { chefId: string; action: string };
    try {
      payload = jwt.verify(token, secret) as { chefId: string; action: string };
    } catch {
      res.status(400).send(renderPage("Link Expired", "This action link has expired. Please use the Super Admin Panel instead.", false));
      return;
    }

    if (payload.chefId !== chefId || payload.action !== action) {
      res.status(400).send(renderPage("Invalid Link", "This link is invalid. Please use the Super Admin Panel instead.", false));
      return;
    }

    const chef = await prisma.chef.findUnique({
      where: { id: chefId },
      include: { user: true },
    });

    if (!chef) {
      res.status(404).send(renderPage("Home Maker Not Found", "The Home Maker account could not be found.", false));
      return;
    }

    if (action === "approve") {
      if (chef.isVerified) {
        res.send(renderPage("Already Approved", `${chef.kitchenName} has already been approved.`, true));
        return;
      }

      const now = new Date();
      const trialEndsAt = new Date(now);
      trialEndsAt.setMonth(trialEndsAt.getMonth() + 3);

      await prisma.chef.update({
        where: { id: chefId },
        data: {
          isVerified: true,
          isOnline: true,
          approvedAt: now,
          rejectedAt: null,
          rejectionReason: null,
          trialEndsAt,
          plan: "UNLIMITED",
        },
      });

      // Send welcome email
      if (chef.user.email) {
        sendChefApprovalEmail({
          chefEmail: chef.user.email,
          chefName: chef.user.name,
          kitchenName: chef.kitchenName,
          trialEndsAt,
        }).catch((err) => console.error("[ApproveAction] Failed to send approval email:", err));
      }

      res.send(renderPage(
        "Home Maker Approved!",
        `<strong>${chef.kitchenName}</strong> has been approved. A welcome email has been sent to ${chef.user.email}. The 3-month free Unlimited plan starts today.`,
        true
      ));
    } else if (action === "reject") {
      if (chef.rejectedAt) {
        res.send(renderPage("Already Rejected", `${chef.kitchenName} has already been rejected.`, false));
        return;
      }

      await prisma.chef.update({
        where: { id: chefId },
        data: {
          isVerified: false,
          rejectedAt: new Date(),
        },
      });

      if (chef.user.email) {
        sendChefRejectionEmail({
          chefEmail: chef.user.email,
          chefName: chef.user.name,
        }).catch((err) => console.error("[ApproveAction] Failed to send rejection email:", err));
      }

      res.send(renderPage(
        "Home Maker Rejected",
        `<strong>${chef.kitchenName}</strong> has been rejected. A notification email has been sent to ${chef.user.email}.`,
        false
      ));
    } else if (action === "approve_admin") {
      const requestId = req.query.requestId as string;
      if (!requestId) {
        res.status(400).send(renderPage("Invalid Link", "Missing request ID.", false));
        return;
      }

      // Verify token has requestId
      const adminPayload = jwt.verify(token, secret) as { requestId: string; action: string; type: string };
      if (adminPayload.requestId !== requestId || adminPayload.type !== "admin_access") {
        res.status(400).send(renderPage("Invalid Link", "This link is invalid.", false));
        return;
      }

      const request = await prisma.adminAccessRequest.findUnique({ where: { id: requestId } });
      if (!request) {
        res.status(404).send(renderPage("Request Not Found", "The access request could not be found.", false));
        return;
      }

      if (request.status === "APPROVED") {
        res.send(renderPage("Already Approved", `${request.name} has already been granted Super Admin access.`, true));
        return;
      }

      // Create the user with ADMIN role (SUPER_ADMIN is reserved for the platform owner)
      await prisma.user.upsert({
        where: { firebaseUid: request.firebaseUid },
        update: { role: "ADMIN" },
        create: {
          name: request.name,
          email: request.email,
          firebaseUid: request.firebaseUid,
          role: "ADMIN",
        },
      });

      await prisma.adminAccessRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED", reviewedAt: new Date() },
      });

      // Send approval email
      sendAdminAccessApprovedEmail({
        email: request.email,
        name: request.name,
      }).catch((err) => console.error("[ApproveAction] Failed to send admin access approved email:", err));

      res.send(renderPage(
        "Admin Access Granted!",
        `<strong>${request.name}</strong> (${request.email}) now has Super Admin access. They have been notified by email.`,
        true
      ));

    } else if (action === "reject_admin") {
      const requestId = req.query.requestId as string;
      if (!requestId) {
        res.status(400).send(renderPage("Invalid Link", "Missing request ID.", false));
        return;
      }

      const adminPayload = jwt.verify(token, secret) as { requestId: string; action: string; type: string };
      if (adminPayload.requestId !== requestId || adminPayload.type !== "admin_access") {
        res.status(400).send(renderPage("Invalid Link", "This link is invalid.", false));
        return;
      }

      const request = await prisma.adminAccessRequest.findUnique({ where: { id: requestId } });
      if (!request) {
        res.status(404).send(renderPage("Request Not Found", "The access request could not be found.", false));
        return;
      }

      if (request.status === "REJECTED") {
        res.send(renderPage("Already Rejected", `${request.name}'s request has already been rejected.`, false));
        return;
      }

      await prisma.adminAccessRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED", reviewedAt: new Date() },
      });

      // Send rejection email
      sendAdminAccessRejectedEmail({
        email: request.email,
        name: request.name,
      }).catch((err) => console.error("[ApproveAction] Failed to send admin access rejected email:", err));

      res.send(renderPage(
        "Request Rejected",
        `<strong>${request.name}</strong>'s Super Admin access request has been rejected. They have been notified by email.`,
        false
      ));

    } else {
      res.status(400).send(renderPage("Invalid Action", "Unknown action. Please use the Super Admin Panel.", false));
    }
  } catch (error) {
    console.error("[ApproveAction] Error:", error);
    res.status(500).send(renderPage("Error", "Something went wrong. Please try again from the Super Admin Panel.", false));
  }
});

export default router;
