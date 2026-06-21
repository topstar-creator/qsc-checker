import { NextResponse } from "next/server";
import { stripe } from "@/lib/billing/stripe";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  if (!stripe) {
    persistDb();

    return NextResponse.json({ received: true, demo: true });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = await ensureDbReady();

  switch (event.type) {
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as { id: string; status: string; customer: string };
      await db
        .update(subscriptions)
        .set({ status: subscription.status })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as { customer: string };
      await db
        .update(subscriptions)
        .set({ status: "past_due" })
        .where(eq(subscriptions.stripeCustomerId, invoice.customer as string));
      break;
    }
  }

  persistDb();


  return NextResponse.json({ received: true });
}
