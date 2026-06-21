import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import {
  companies,
  users,
  stores,
  subscriptions,
  checkSheets,
  questions,
} from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import {
  createStripeCustomer,
  createSubscriptionWithTrial,
} from "@/lib/billing/stripe";
import { id } from "@/lib/utils";

const DEFAULT_QUESTIONS = [
  { text: "店舗入口・外観の清潔感", category: "清潔感" },
  { text: "店内全体の清掃状態", category: "清潔感" },
  { text: "トイレの清潔感", category: "清潔感" },
  { text: "接客態度・笑顔", category: "サービス" },
  { text: "料理・商品の品質", category: "品質" },
];

export async function POST(request: Request) {
  const db = await ensureDbReady();
  const body = await request.json();
  const {
    companyName,
    industry,
    adminName,
    adminEmail,
    adminPassword,
    storeName,
    storeCode,
  } = body;

  if (!companyName || !adminName || !adminEmail || !adminPassword || !storeName) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }

  const now = new Date();
  const companyId = id();
  const userId = id();
  const storeId = id();
  const sheetId = id();

  const customerId = await createStripeCustomer(adminEmail, companyName);
  const sub = await createSubscriptionWithTrial(customerId ?? "", 1);
  const trialEnds = sub?.trialEnd ?? new Date(now.getTime() + 90 * 86400000);

  await db.insert(companies).values({
    id: companyId,
    name: companyName,
    industry,
    createdAt: now,
  });

  await db.insert(subscriptions).values({
    id: id(),
    companyId,
    status: "trialing",
    storeCount: 1,
    trialEndsAt: trialEnds,
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub?.subscriptionId,
    createdAt: now,
  });

  await db.insert(users).values({
    id: userId,
    companyId,
    email: adminEmail,
    passwordHash: await hashPassword(adminPassword),
    name: adminName,
    role: "company_admin",
    notifyEmail: true,
    createdAt: now,
  });

  await db.insert(stores).values({
    id: storeId,
    companyId,
    name: storeName,
    code: storeCode || null,
    isActive: true,
    createdAt: now,
  });

  await db.insert(checkSheets).values({
    id: sheetId,
    companyId,
    name: "標準QSCチェックシート",
    description: "デフォルト30項目",
    isDefault: true,
    createdAt: now,
  });

  for (let i = 0; i < DEFAULT_QUESTIONS.length; i++) {
    await db.insert(questions).values({
      id: id(),
      checkSheetId: sheetId,
      text: DEFAULT_QUESTIONS[i].text,
      category: DEFAULT_QUESTIONS[i].category,
      type: "score",
      weight: 1,
      sortOrder: i + 1,
      required: true,
    });
  }

  const token = await createSession({
    id: userId,
    email: adminEmail,
    name: adminName,
    role: "company_admin",
    companyId,
  });
  await setSessionCookie(token);

  persistDb();


  return NextResponse.json({ ok: true, companyId });
}
