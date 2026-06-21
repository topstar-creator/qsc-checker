import { getDb, persistDb } from "@/lib/db";

export async function ensureDbReady() {
  const db = await getDb();

  const { runSeed } = await import("./seed-runner");
  await runSeed();
  persistDb();

  return db;
}

export async function withPersist<T>(
  fn: (db: Awaited<ReturnType<typeof getDb>>) => Promise<T>
): Promise<T> {
  const db = await ensureDbReady();
  const result = await fn(db);
  persistDb();
  return result;
}
