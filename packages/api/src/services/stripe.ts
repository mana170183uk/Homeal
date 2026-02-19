import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

export async function createStripeProduct(name: string, description?: string) {
  return getStripe().products.create({
    name,
    description: description || undefined,
    metadata: { source: "homeal" },
  });
}

export async function createStripePrice(
  productId: string,
  unitAmount: number, // in pence
  interval: "week" | "month"
) {
  return getStripe().prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: "gbp",
    recurring: { interval },
  });
}

export async function createCheckoutSession({
  customerId,
  customerEmail,
  priceId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId?: string;
  customerEmail?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return getStripe().checkout.sessions.create({
    mode: "subscription",
    ...(customerId ? { customer: customerId } : { customer_email: customerEmail }),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId);
}

export async function pauseStripeSubscription(subscriptionId: string) {
  return getStripe().subscriptions.update(subscriptionId, {
    pause_collection: { behavior: "void" },
  });
}

export async function resumeStripeSubscription(subscriptionId: string) {
  return getStripe().subscriptions.update(subscriptionId, {
    pause_collection: null as unknown as Stripe.SubscriptionUpdateParams.PauseCollection,
  });
}

export function constructWebhookEvent(body: Buffer, signature: string) {
  return getStripe().webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ""
  );
}

export async function deactivateStripeProduct(productId: string) {
  return getStripe().products.update(productId, { active: false });
}

export default getStripe;
