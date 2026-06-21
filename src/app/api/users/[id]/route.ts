import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canManageCompany } from "@/lib/auth/rbac";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session || !canManageCompany(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;
  if (userId === session.id) {
    return NextResponse.json({ error: "自分自身は削除できません" }, { status: 400 });
  }

  await db
    .delete(users)
    .where(and(eq(users.id, userId), eq(users.companyId, session.companyId)));

  persistDb();


  return NextResponse.json({ ok: true });
}
