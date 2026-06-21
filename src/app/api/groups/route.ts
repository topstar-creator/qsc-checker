import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canManageCompany } from "@/lib/auth/rbac";
import { groups, groupMemberships } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { id } from "@/lib/utils";

export async function GET() {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: groups.id,
      name: groups.name,
      type: groups.type,
      storeCount: sql<number>`count(${groupMemberships.id})`.mapWith(Number),
    })
    .from(groups)
    .leftJoin(groupMemberships, eq(groups.id, groupMemberships.groupId))
    .where(eq(groups.companyId, session.companyId))
    .groupBy(groups.id);

  persistDb();


  return NextResponse.json({ groups: rows });
}

export async function POST(request: Request) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session || !canManageCompany(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, type } = await request.json();
  if (!name) return NextResponse.json({ error: "グループ名は必須です" }, { status: 400 });

  const groupId = id();
  await db.insert(groups).values({
    id: groupId,
    companyId: session.companyId,
    name,
    type: type ?? "custom",
    createdAt: new Date(),
  });

  persistDb();


  return NextResponse.json({ group: { id: groupId, name, type } });
}
