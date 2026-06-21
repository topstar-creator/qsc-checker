import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import {
  improvementCases,
  stores,
  caseStatusHistory,
  reports,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { id } from "@/lib/utils";
import { generateCaseAi } from "@/lib/ai/assist";

export async function GET() {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: improvementCases.id,
      title: improvementCases.title,
      storeName: stores.name,
      status: improvementCases.status,
      dueDate: improvementCases.dueDate,
      issueItem: improvementCases.issueItem,
    })
    .from(improvementCases)
    .innerJoin(stores, eq(improvementCases.storeId, stores.id))
    .where(eq(improvementCases.companyId, session.companyId))
    .orderBy(desc(improvementCases.updatedAt));

  persistDb();


  return NextResponse.json({
    cases: rows.map((c) => ({
      ...c,
      dueDate: c.dueDate?.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reportId, title, issueItem, issueComment, storeId: bodyStoreId } = await request.json();
  const now = new Date();
  const caseId = id();

  let resolvedStoreId = bodyStoreId;
  if (!resolvedStoreId && reportId) {
    const [report] = await db
      .select({ storeId: reports.storeId })
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);
    resolvedStoreId = report?.storeId;
  }

  if (!resolvedStoreId) {
    return NextResponse.json({ error: "店舗IDが必要です" }, { status: 400 });
  }

  await db.insert(improvementCases).values({
    id: caseId,
    companyId: session.companyId,
    storeId: resolvedStoreId,
    reportId: reportId ?? null,
    title: title ?? "改善案件",
    issueItem,
    issueComment,
    status: "pending",
    createdById: session.id,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(caseStatusHistory).values({
    id: id(),
    caseId,
    status: "pending",
    comment: "改善案件を作成",
    userId: session.id,
    createdAt: now,
  });

  if (issueItem) {
    await generateCaseAi(caseId, title ?? "改善案件", issueItem);
  }

  persistDb();


  return NextResponse.json({ case: { id: caseId } });
}
