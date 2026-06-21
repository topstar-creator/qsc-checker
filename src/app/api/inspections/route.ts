import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canInspect } from "@/lib/auth/rbac";
import {
  inspections,
  inspectionAnswers,
  reports,
  questions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { id } from "@/lib/utils";
import { generateReportAi } from "@/lib/ai/assist";

export async function POST(request: Request) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session || !canInspect(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { storeId, checkSheetId, comment, answers } = await request.json();

  if (!storeId || !checkSheetId || !answers?.length) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const now = new Date();
  const inspectionId = id();

  const scores = answers.map((a: { score: number }) => a.score ?? 0);
  const totalScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

  await db.insert(inspections).values({
    id: inspectionId,
    companyId: session.companyId,
    storeId,
    checkSheetId,
    inspectorId: session.id,
    totalScore,
    comment: comment ?? null,
    inspectedAt: now,
    createdAt: now,
  });

  for (const ans of answers) {
    await db.insert(inspectionAnswers).values({
      id: id(),
      inspectionId,
      questionId: ans.questionId,
      score: ans.score,
      comment: ans.comment ?? null,
    });
  }

  const reportId = id();
  await db.insert(reports).values({
    id: reportId,
    companyId: session.companyId,
    storeId,
    inspectionId,
    totalScore,
    createdAt: now,
  });

  const issueRows = await db
    .select({ question: questions.text, score: inspectionAnswers.score, comment: inspectionAnswers.comment })
    .from(inspectionAnswers)
    .innerJoin(questions, eq(inspectionAnswers.questionId, questions.id))
    .where(eq(inspectionAnswers.inspectionId, inspectionId));

  const issues = issueRows
    .filter((i) => (i.score ?? 100) < 80)
    .map((i) => ({ question: i.question, score: i.score ?? 0, comment: i.comment ?? undefined }));

  if (issues.length > 0) {
    const ai = await generateReportAi(reportId, issues);
    await db
      .update(reports)
      .set({
        aiSummary: ai.summary,
        aiDiscussionPoints: JSON.stringify(ai.discussionPoints),
      })
      .where(eq(reports.id, reportId));
  }

  persistDb();


  return NextResponse.json({ inspectionId, reportId, totalScore });
}

export async function GET() {
  await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ ok: true });
}
