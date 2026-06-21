import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { checkSheets, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { id } from "@/lib/utils";
import { canManageCompany } from "@/lib/auth/rbac";

export async function GET() {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sheets = await db
    .select({
      id: checkSheets.id,
      name: checkSheets.name,
    })
    .from(checkSheets)
    .where(eq(checkSheets.companyId, session.companyId));

  const sheetsWithCount = await Promise.all(
    sheets.map(async (s) => {
      const qs = await db
        .select()
        .from(questions)
        .where(eq(questions.checkSheetId, s.id));
      return { ...s, questionCount: qs.length };
    })
  );

  persistDb();


  return NextResponse.json({ sheets: sheetsWithCount });
}

export async function POST(request: Request) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session || !canManageCompany(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description } = await request.json();
  const sheetId = id();

  await db.insert(checkSheets).values({
    id: sheetId,
    companyId: session.companyId,
    name: name ?? "新規チェックシート",
    description,
    isDefault: false,
    createdAt: new Date(),
  });

  persistDb();


  return NextResponse.json({ sheet: { id: sheetId, name } });
}
