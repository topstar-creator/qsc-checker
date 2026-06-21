import { ensureDbReady } from "@/lib/db/init";

let initialized = false;

export async function GET() {
  if (!initialized) {
    await ensureDbReady();
    initialized = true;
  }
  return Response.json({ ok: true });
}
