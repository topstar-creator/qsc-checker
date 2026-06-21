import { isTursoConfigured, getTursoConfig } from "@/lib/db/turso-env";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type DbHealthStatus =
  | { status: "ok"; seeded: boolean; url?: string }
  | { status: "missing_turso"; message: string }
  | { status: "error"; message: string };

export async function checkDbHealth(): Promise<DbHealthStatus> {
  if (process.env.VERCEL && !isTursoConfigured()) {
    return {
      status: "missing_turso",
      message:
        "Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel → Settings → Environment Variables (Production), then Redeploy. Or connect Turso from Vercel Marketplace → Storage.",
    };
  }

  try {
    const db = await getDb();
    const admin = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, "admin@example.com"))
      .limit(1);
    const { url } = getTursoConfig();
    return {
      status: "ok",
      seeded: admin.length > 0,
      url: url ? url.replace(/\/\/.*@/, "//***@") : undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database connection failed";
    return { status: "error", message };
  }
}
