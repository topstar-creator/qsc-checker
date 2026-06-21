import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY?.startsWith("sk_")
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const STORE_PRICE_PER_MONTH = 3000;

export async function createStripeCustomer(
  email: string,
  companyName: string
): Promise<string | null> {
  if (!stripe) return `cus_demo_${Date.now()}`;

  const customer = await stripe.customers.create({
    email,
    name: companyName,
  });
  return customer.id;
}

export async function createSubscriptionWithTrial(
  customerId: string,
  storeCount: number
): Promise<{ subscriptionId: string; trialEnd: Date } | null> {
  if (!stripe) {
    const trialEnd = new Date();
    trialEnd.setMonth(trialEnd.getMonth() + 3);
    return { subscriptionId: `sub_demo_${Date.now()}`, trialEnd };
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return null;

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId, quantity: Math.max(1, storeCount) }],
    trial_period_days: 90,
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });

  return {
    subscriptionId: subscription.id,
    trialEnd: new Date(subscription.trial_end! * 1000),
  };
}

export async function updateSubscriptionQuantity(
  subscriptionId: string,
  storeCount: number
): Promise<void> {
  if (!stripe || subscriptionId.startsWith("sub_demo")) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) return;

  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: itemId, quantity: Math.max(1, storeCount) }],
  });
}

export function isTrialActive(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return false;
  return new Date() < trialEndsAt;
}

export function getBillingStatus(
  status: string,
  trialEndsAt: Date | null
): { label: string; color: string } {
  if (status === "trialing" || isTrialActive(trialEndsAt)) {
    return { label: "無料トライアル中", color: "text-teal-700 bg-teal-100" };
  }
  if (status === "active") {
    return { label: "契約中", color: "text-green-700 bg-green-100" };
  }
  if (status === "past_due") {
    return { label: "支払い遅延", color: "text-red-700 bg-red-100" };
  }
  return { label: status, color: "text-gray-700 bg-gray-100" };
}
