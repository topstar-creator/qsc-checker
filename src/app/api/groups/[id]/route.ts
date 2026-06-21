import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canManageCompany } from "@/lib/auth/rbac";
import { groups, groupMemberships } from "@/lib/db/schema";
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

  const { id: groupId } = await params;
  await db.delete(groupMemberships).where(eq(groupMemberships.groupId, groupId));
  await db
    .delete(groups)
    .where(and(eq(groups.id, groupId), eq(groups.companyId, session.companyId)));

  persistDb();


  return NextResponse.json({ ok: true });
}
