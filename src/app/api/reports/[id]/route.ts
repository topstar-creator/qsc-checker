import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { getSession } from "@/lib/auth/session";
import { getReportDetail } from "@/lib/reports/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const report = await getReportDetail(id, session.companyId);

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ report });
}
