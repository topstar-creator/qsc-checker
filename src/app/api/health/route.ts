import { ensureDbReady } from "@/lib/db/init";
import { checkDbHealth } from "@/lib/db/health";

export const runtime = "nodejs";

export async function GET() {
  const health = await checkDbHealth();

  if (health.status === "missing_turso") {
    return Response.json({ ok: false, db: health }, { status: 503 });
  }

  if (health.status === "error") {
    return Response.json({ ok: false, db: health }, { status: 503 });
  }

  if (!health.seeded) {
    try {
      await ensureDbReady();
      const after = await checkDbHealth();
      const seeded = after.status === "ok" && after.seeded;
      return Response.json({
        ok: seeded,
        db: after,
        message: seeded ? "Demo data seeded" : "Seed completed but admin user missing",
      });
    } catch (err) {
      return Response.json(
        {
          ok: false,
          db: {
            status: "error",
            message: err instanceof Error ? err.message : "Seed failed",
          },
        },
        { status: 503 }
      );
    }
  }

  return Response.json({ ok: true, db: health });
}
