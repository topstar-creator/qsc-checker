import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  const db = await ensureDbReady();
  const { email, password } = await request.json();

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return NextResponse.json({ error: "メールまたはパスワードが正しくありません" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "メールまたはパスワードが正しくありません" }, { status: 401 });
  }

  const token = await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "company_admin",
    companyId: user.companyId,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
