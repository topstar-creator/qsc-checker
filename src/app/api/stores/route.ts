import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canManageCompany } from "@/lib/auth/rbac";
import { stores, subscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { id } from "@/lib/utils";
import { updateSubscriptionQuantity } from "@/lib/billing/stripe";

export async function GET() {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(stores)
    .where(and(eq(stores.companyId, session.companyId), eq(stores.isActive, true)));

  persistDb();


  return NextResponse.json({
    stores: rows.map((s) => ({ id: s.id, name: s.name, code: s.code })),
  });
}

export async function POST(request: Request) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session || !canManageCompany(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, code } = await request.json();
  if (!name) return NextResponse.json({ error: "店舗名は必須です" }, { status: 400 });

  const storeId = id();
  const now = new Date();

  await db.insert(stores).values({
    id: storeId,
    companyId: session.companyId,
    name,
    code: code || null,
    isActive: true,
    createdAt: now,
  });

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


  return NextResponse.json({ store: { id: storeId, name, code } });
}
