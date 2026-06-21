import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getReportDetail } from "@/lib/reports/queries";
import { generateReportAi } from "@/lib/ai/assist";
import { reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: reportId } = await params;
  const { regenerate } = await request.json().catch(() => ({ regenerate: false }));

  const report = await getReportDetail(reportId, session.companyId);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ai = await generateReportAi(reportId, report.issues, regenerate);

  await db
    .update(reports)
    .set({
      aiSummary: ai.summary,
      aiDiscussionPoints: JSON.stringify(ai.discussionPoints),
    })
    .where(eq(reports.id, reportId));

  persistDb();


  return NextResponse.json(ai);
}
