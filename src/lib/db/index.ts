import * as schema from "./schema";
import fs from "fs";
import path from "path";
import type { Database as SqlJsDatabase } from "sql.js";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    status TEXT NOT NULL DEFAULT 'trialing',
    store_count INTEGER NOT NULL DEFAULT 0,
    trial_ends_at INTEGER,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    notify_email INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    code TEXT,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_store_assignments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    store_id TEXT NOT NULL REFERENCES stores(id)
  );
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS group_memberships (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES groups(id),
    store_id TEXT NOT NULL REFERENCES stores(id)
  );
  CREATE TABLE IF NOT EXISTS check_sheets (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    description TEXT,
    is_default INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    check_sheet_id TEXT NOT NULL REFERENCES check_sheets(id),
    text TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'score',
    weight REAL DEFAULT 1,
    sort_order INTEGER NOT NULL,
    required INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    store_id TEXT NOT NULL REFERENCES stores(id),
    check_sheet_id TEXT NOT NULL REFERENCES check_sheets(id),
    inspector_id TEXT NOT NULL REFERENCES users(id),
    total_score REAL,
    comment TEXT,
    inspected_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS inspection_answers (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id),
    question_id TEXT NOT NULL REFERENCES questions(id),
    score REAL,
    text_answer TEXT,
    comment TEXT
  );
  CREATE TABLE IF NOT EXISTS inspection_media (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id),
    question_id TEXT REFERENCES questions(id),
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    store_id TEXT NOT NULL REFERENCES stores(id),
    inspection_id TEXT NOT NULL REFERENCES inspections(id),
    total_score REAL NOT NULL,
    ai_summary TEXT,
    ai_discussion_points TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS improvement_cases (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    store_id TEXT NOT NULL REFERENCES stores(id),
    report_id TEXT REFERENCES reports(id),
    inspection_id TEXT REFERENCES inspections(id),
    title TEXT NOT NULL,
    issue_item TEXT,
    issue_comment TEXT,
    assignee_id TEXT REFERENCES users(id),
    due_date INTEGER,
    root_cause TEXT,
    action_plan TEXT,
    implementation TEXT,
    verification_result TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_by_id TEXT NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS case_media (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES improvement_cases(id),
    type TEXT NOT NULL,
    purpose TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS case_status_history (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES improvement_cases(id),
    status TEXT NOT NULL,
    comment TEXT,
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    read INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS ai_cache (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`;

export { SCHEMA_SQL };

export type Db = LibSQLDatabase<typeof schema>;

const localDbPath =
  process.env.DATABASE_URL ?? path.join(process.cwd(), "qsc-checker.db");

let client: SqlJsDatabase | null = null;
let orm: Db | null = null;
let initPromise: Promise<Db> | null = null;
let useTurso = false;

function getWasmPath(): string {
  const candidates = [
    path.join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm"),
    path.join(process.cwd(), "public", "sql-wasm.wasm"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error("sql-wasm.wasm not found. Run: npm run postinstall");
}

async function initTurso() {
  const { createClient } = await import("@libsql/client");
  const { drizzle } = await import("drizzle-orm/libsql");

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is required on Vercel");
  }

  const libsql = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const statements = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const sql of statements) {
    await libsql.execute(sql);
  }

  useTurso = true;
  orm = drizzle(libsql, { schema }) as Db;
  return orm;
}

async function initSqlJs() {
  const initSqlJs = (await import("sql.js")).default;
  const { drizzle } = await import("drizzle-orm/sql-js");

  const SQL = await initSqlJs({
    wasmBinary: fs.readFileSync(getWasmPath()).buffer as ArrayBuffer,
  });

  if (fs.existsSync(localDbPath)) {
    client = new SQL.Database(fs.readFileSync(localDbPath));
  } else {
    client = new SQL.Database();
  }

  client.exec("PRAGMA foreign_keys = ON");
  client.exec(SCHEMA_SQL);
  useTurso = false;
  orm = drizzle(client, { schema }) as unknown as Db;
  return orm;
}

export async function getDb() {
  if (orm) return orm;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (process.env.TURSO_DATABASE_URL) {
      return initTurso();
    }
    if (process.env.VERCEL) {
      throw new Error(
        "Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel environment variables. Local SQLite files cannot run on Vercel."
      );
    }
    return initSqlJs();
  })();

  return initPromise;
}

export function initDb() {
  if (client) client.exec(SCHEMA_SQL);
}

export function persistDb() {
  if (useTurso || !client) return;
  const data = client.export();
  fs.writeFileSync(localDbPath, Buffer.from(data));
}
