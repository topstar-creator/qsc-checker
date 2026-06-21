import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type DbHealthStatus =
  | { status: "ok"; seeded: boolean }
  | { status: "missing_turso"; message: string }
  | { status: "error"; message: string };

export async function checkDbHealth(): Promise<DbHealthStatus> {
  if (process.env.VERCEL && !process.env.TURSO_DATABASE_URL) {
    return {
      status: "missing_turso",
      message:
        "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in Vercel environment variables.",
    };
  }

  try {
    const db = await getDb();
    const admin = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, "admin@example.com"))
      .limit(1);
    return { status: "ok", seeded: admin.length > 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database connection failed";
    return { status: "error", message };
  }
}
