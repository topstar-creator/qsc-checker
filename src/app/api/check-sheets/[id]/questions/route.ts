import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canManageCompany } from "@/lib/auth/rbac";
import { checkSheets, questions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { id } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: sheetId } = await params;

  const [sheet] = await db
    .select()
    .from(checkSheets)
    .where(and(eq(checkSheets.id, sheetId), eq(checkSheets.companyId, session.companyId)))
    .limit(1);

  if (!sheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.checkSheetId, sheetId))
    .orderBy(questions.sortOrder);

  persistDb();


  return NextResponse.json({
    questions: qs.map((q) => ({
      id: q.id,
      text: q.text,
      category: q.category,
      sortOrder: q.sortOrder,
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session || !canManageCompany(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: sheetId } = await params;
  const { text, category } = await request.json();

  const existing = await db
    .select()
    .from(questions)
    .where(eq(questions.checkSheetId, sheetId));

  if (existing.length >= 100) {
    return NextResponse.json({ error: "設問数は100までです" }, { status: 400 });
  }

  const qId = id();
  await db.insert(questions).values({
    id: qId,
    checkSheetId: sheetId,
    text,
    category: category ?? "品質",
    type: "score",
    weight: 1,
    sortOrder: existing.length + 1,
    required: true,
  });

  persistDb();


  return NextResponse.json({ question: { id: qId, text, category } });
}
