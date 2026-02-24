import { Router, Request, Response } from "express";
import prisma from "@homeal/db";
import { constructWebhookEvent } from "../services/stripe";
import express from "express";

const router = Router();

// Stripe webhooks require raw body — use raw parser for this route
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    if (!sig) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    let event;
    try {
      event = constructWebhookEvent(req.body as Buffer, sig);
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const metadata = session.metadata || {};

          // Handle one-time order payment
          if (metadata.orderId) {
            const { orderId } = metadata;
            const payment = await prisma.payment.findFirst({
              where: { stripePaymentId: session.id },
            });
            if (payment) {
              await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "COMPLETED" },
              });
              console.log(`[Stripe Webhook] Order payment completed: ${orderId}`);
            } else {
              // Fallback: find by orderId
              await prisma.payment.updateMany({
                where: { orderId, status: "PENDING" },
                data: { status: "COMPLETED" },
              });
              console.log(`[Stripe Webhook] Order payment completed (fallback): ${orderId}`);
            }
            break;
          }

          // Handle subscription checkout
          const { userId, planId, chefId } = metadata;

          if (!userId || !planId || !chefId) {
            console.warn("[Stripe Webhook] Missing metadata in checkout session:", session.id);
            break;
          }

          const plan = await prisma.tiffinPlan.findUnique({ where: { id: planId } });
          if (!plan) {
            console.warn("[Stripe Webhook] Plan not found:", planId);
            break;
          }

          const stripeSubscriptionId = session.subscription as string;
          const stripeCustomerId = session.customer as string;

          // Calculate dates
          const now = new Date();
          const endDate = new Date(now);
          if (plan.frequency === "WEEKLY") {
            endDate.setFullYear(endDate.getFullYear() + 1); // 1 year for weekly
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1); // 1 year for monthly
          }

          // Calculate next delivery
          const nextDelivery = new Date(now);
          if (plan.frequency === "WEEKLY") {
            nextDelivery.setDate(nextDelivery.getDate() + 7);
          } else {
            nextDelivery.setMonth(nextDelivery.getMonth() + 1);
          }

          await prisma.subscription.create({
            data: {
              userId,
              chefId,
              tiffinPlanId: planId,
              name: plan.name,
              plan: plan.frequency,
              price: plan.price,
              startDate: now,
              endDate,
              status: "ACTIVE",
              frequency: plan.frequency,
              nextDelivery,
              stripeSubscriptionId,
              stripeCustomerId,
            },
          });

          console.log(`[Stripe Webhook] Subscription created for user ${userId}, plan ${planId}`);
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription as string;

          if (subscriptionId) {
            const sub = await prisma.subscription.findFirst({
              where: { stripeSubscriptionId: subscriptionId },
              include: { tiffinPlan: true },
            });

            if (sub && sub.tiffinPlan) {
              // Advance next delivery date
              const nextDelivery = new Date(sub.nextDelivery || new Date());
              if (sub.tiffinPlan.frequency === "WEEKLY") {
                nextDelivery.setDate(nextDelivery.getDate() + 7);
              } else {
                nextDelivery.setMonth(nextDelivery.getMonth() + 1);
              }

              await prisma.subscription.update({
                where: { id: sub.id },
                data: { nextDelivery, status: "ACTIVE" },
              });

              console.log(`[Stripe Webhook] Next delivery updated for subscription ${sub.id}`);
            }
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (sub) {
            let status = sub.status;
            if (subscription.status === "active") status = "ACTIVE";
            else if (subscription.status === "paused") status = "PAUSED";
            else if (subscription.status === "past_due") status = "ACTIVE"; // Keep active, will retry

            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status },
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: "CANCELLED", endDate: new Date() },
            });
            console.log(`[Stripe Webhook] Subscription cancelled: ${sub.id}`);
          }
          break;
        }

        default:
          // Unhandled event type — no action
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error("[Stripe Webhook] Processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

export default router;
