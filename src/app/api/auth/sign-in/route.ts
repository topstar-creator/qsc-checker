import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const db = await ensureDbReady();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "メールとパスワードを入力してください" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return NextResponse.json(
        {
          error: "メールまたはパスワードが正しくありません",
          hint:
            process.env.VERCEL && email === "admin@example.com"
              ? "初回は /api/health でDBシードを確認してください"
              : undefined,
        },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "メールまたはパスワードが正しくありません" },
        { status: 401 }
      );
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
  } catch (err) {
    console.error("[sign-in]", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("TURSO_DATABASE_URL") || message.includes("Turso")) {
      return NextResponse.json(
        {
          error: "データベースが未設定です",
          hint: "Vercel に TURSO_DATABASE_URL と TURSO_AUTH_TOKEN を設定して再デプロイしてください",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "ログインに失敗しました",
        hint: process.env.VERCEL ? "Vercel の Functions ログを確認してください" : message,
      },
      { status: 500 }
    );
  }
}
