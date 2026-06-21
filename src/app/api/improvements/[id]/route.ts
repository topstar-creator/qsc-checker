import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canApproveCases } from "@/lib/auth/rbac";
import {
  improvementCases,
  stores,
  users,
  caseStatusHistory,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { id } from "@/lib/utils";
import { getCachedAi } from "@/lib/ai/assist";
import type { CaseStatus } from "@/lib/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: caseId } = await params;

  const [c] = await db
    .select({
      id: improvementCases.id,
      title: improvementCases.title,
      storeName: stores.name,
      status: improvementCases.status,
      issueItem: improvementCases.issueItem,
      issueComment: improvementCases.issueComment,
      assigneeName: users.name,
      dueDate: improvementCases.dueDate,
      rootCause: improvementCases.rootCause,
      actionPlan: improvementCases.actionPlan,
      implementation: improvementCases.implementation,
      verificationResult: improvementCases.verificationResult,
    })
    .from(improvementCases)
    .innerJoin(stores, eq(improvementCases.storeId, stores.id))
    .leftJoin(users, eq(improvementCases.assigneeId, users.id))
    .where(
      and(eq(improvementCases.id, caseId), eq(improvementCases.companyId, session.companyId))
    )
    .limit(1);

  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const timeline = await db
    .select({
      status: caseStatusHistory.status,
      comment: caseStatusHistory.comment,
      userName: users.name,
      createdAt: caseStatusHistory.createdAt,
    })
    .from(caseStatusHistory)
    .innerJoin(users, eq(caseStatusHistory.userId, users.id))
    .where(eq(caseStatusHistory.caseId, caseId))
    .orderBy(caseStatusHistory.createdAt);

  const ai = await getCachedAi("case", caseId);

  persistDb();


  return NextResponse.json({
    case: {
      ...c,
      dueDate: c.dueDate?.toISOString(),
      timeline: timeline.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
      })),
      aiSummary: ai?.summary,
      aiDiscussionPoints: ai?.discussionPoints,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: caseId } = await params;
  const body = await request.json();
  const { status, rootCause, actionPlan, implementation, verificationResult } = body;

  const [existing] = await db
    .select()
    .from(improvementCases)
    .where(
      and(eq(improvementCases.id, caseId), eq(improvementCases.companyId, session.companyId))
    )
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = status as CaseStatus | undefined;

  if (newStatus === "done" || newStatus === "rejected") {
    if (!canApproveCases(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const now = new Date();
  await db
    .update(improvementCases)
    .set({
      status: newStatus ?? existing.status,
      rootCause: rootCause ?? existing.rootCause,
      actionPlan: actionPlan ?? existing.actionPlan,
      implementation: implementation ?? existing.implementation,
      verificationResult: verificationResult ?? existing.verificationResult,
      updatedAt: now,
    })
    .where(eq(improvementCases.id, caseId));

  if (newStatus && newStatus !== existing.status) {
    await db.insert(caseStatusHistory).values({
      id: id(),
      caseId,
      status: newStatus,
      comment: verificationResult ?? undefined,
      userId: session.id,
      createdAt: now,
    });
  }

  persistDb();


  return NextResponse.json({ ok: true });
}
