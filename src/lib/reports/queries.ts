import { getDb } from "@/lib/db";
import {
  reports,
  stores,
  inspections,
  inspectionAnswers,
  questions,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { formatMonth } from "@/lib/utils";

export async function getReportDetail(reportId: string, companyId: string) {
  const db = await getDb();
  const [report] = await db
    .select({
      id: reports.id,
      storeName: stores.name,
      totalScore: reports.totalScore,
      inspectedAt: inspections.inspectedAt,
      storeId: reports.storeId,
      aiSummary: reports.aiSummary,
      aiDiscussionPoints: reports.aiDiscussionPoints,
      inspectionId: reports.inspectionId,
    })
    .from(reports)
    .innerJoin(stores, eq(reports.storeId, stores.id))
    .innerJoin(inspections, eq(reports.inspectionId, inspections.id))
    .where(and(eq(reports.id, reportId), eq(reports.companyId, companyId)))
    .limit(1);

  if (!report) return null;

  const storeReports = await db
    .select({
      totalScore: reports.totalScore,
      inspectedAt: inspections.inspectedAt,
    })
    .from(reports)
    .innerJoin(inspections, eq(reports.inspectionId, inspections.id))
    .where(
      and(eq(reports.storeId, report.storeId), eq(reports.companyId, companyId))
    )
    .orderBy(inspections.inspectedAt)
    .limit(12);

  const issues = await db
    .select({
      question: questions.text,
      score: inspectionAnswers.score,
      comment: inspectionAnswers.comment,
    })
    .from(inspectionAnswers)
    .innerJoin(questions, eq(inspectionAnswers.questionId, questions.id))
    .where(eq(inspectionAnswers.inspectionId, report.inspectionId));

  const lowIssues = issues
    .filter((i) => (i.score ?? 100) < 80)
    .map((i) => ({
      question: i.question,
      score: i.score ?? 0,
      comment: i.comment ?? undefined,
    }));

  return {
    id: report.id,
    storeName: report.storeName,
    totalScore: report.totalScore,
    inspectedAt: report.inspectedAt?.toISOString() ?? "",
    trend: storeReports.map((r) => ({
      month: formatMonth(r.inspectedAt ?? new Date()),
      score: r.totalScore,
    })),
    issues: lowIssues,
    aiSummary: report.aiSummary ?? undefined,
    aiDiscussionPoints: report.aiDiscussionPoints
      ? JSON.parse(report.aiDiscussionPoints)
      : undefined,
  };
}
