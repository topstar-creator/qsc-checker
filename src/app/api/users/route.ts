import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { persistDb } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { canManageCompany } from "@/lib/auth/rbac";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { id } from "@/lib/utils";

export async function GET() {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.companyId, session.companyId));

  persistDb();


  return NextResponse.json({ users: rows });
}

export async function POST(request: Request) {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session || !canManageCompany(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, email, password, role } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }

  const userId = id();
  await db.insert(users).values({
    id: userId,
    companyId: session.companyId,
    email,
    passwordHash: await hashPassword(password),
    name,
    role: role ?? "store_manager",
    notifyEmail: true,
    createdAt: new Date(),
  });

  persistDb();


  return NextResponse.json({ user: { id: userId, name, email, role } });
}
