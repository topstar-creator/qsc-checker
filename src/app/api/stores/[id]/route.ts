import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canManageCompany } from "@/lib/auth/rbac";
import { stores, subscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { updateSubscriptionQuantity } from "@/lib/billing/stripe";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session || !canManageCompany(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: storeId } = await params;

  await db
    .update(stores)
    .set({ isActive: false })
    .where(and(eq(stores.id, storeId), eq(stores.companyId, session.companyId)));

  const allStores = await db
    .select()
    .from(stores)
    .where(and(eq(stores.companyId, session.companyId), eq(stores.isActive, true)));

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.companyId, session.companyId))
    .limit(1);

  if (sub) {
    await db
      .update(subscriptions)
      .set({ storeCount: allStores.length })
      .where(eq(subscriptions.id, sub.id));
    if (sub.stripeSubscriptionId) {
      await updateSubscriptionQuantity(sub.stripeSubscriptionId, allStores.length);
    }
  }

  persistDb();


  return NextResponse.json({ ok: true });
}
