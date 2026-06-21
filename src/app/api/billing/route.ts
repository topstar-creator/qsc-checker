import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { getSession } from "@/lib/auth/session";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getBillingStatus,
  isTrialActive,
  STORE_PRICE_PER_MONTH,
} from "@/lib/billing/stripe";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.companyId, session.companyId))
    .limit(1);

  if (!sub) {
    return NextResponse.json({
      billing: {
        status: "trialing",
        statusLabel: "無料トライアル中",
        statusColor: "text-teal-700 bg-teal-100",
        storeCount: 0,
        monthlyAmount: 0,
        isTrial: true,
      },
    });
  }

  const billingStatus = getBillingStatus(sub.status, sub.trialEndsAt);
  const trial = isTrialActive(sub.trialEndsAt);

  return NextResponse.json({
    billing: {
      status: sub.status,
      statusLabel: billingStatus.label,
      statusColor: billingStatus.color,
      storeCount: sub.storeCount,
      monthlyAmount: trial ? 0 : sub.storeCount * STORE_PRICE_PER_MONTH,
      trialEndsAt: sub.trialEndsAt ? formatDate(sub.trialEndsAt) : undefined,
      isTrial: trial,
    },
  });
}
