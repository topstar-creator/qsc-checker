import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canManageCompany } from "@/lib/auth/rbac";
import { questions, checkSheets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session || !canManageCompany(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: sheetId, qid } = await params;

  const [sheet] = await db
    .select()
    .from(checkSheets)
    .where(and(eq(checkSheets.id, sheetId), eq(checkSheets.companyId, session.companyId)))
    .limit(1);

  if (!sheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(questions).where(and(eq(questions.id, qid), eq(questions.checkSheetId, sheetId)));

  persistDb();


  return NextResponse.json({ ok: true });
}
