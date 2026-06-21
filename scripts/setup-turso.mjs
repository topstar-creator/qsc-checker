#!/usr/bin/env node
/**
 * Prints Turso setup steps and validates local env vars.
 * Usage: node scripts/setup-turso.mjs
 */
import { execSync } from "child_process";

const url = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL;
const token = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;

console.log("\n=== QSC Checker — Turso setup for Vercel ===\n");

if (url && token) {
  console.log("✓ Local env looks configured:");
  console.log(`  TURSO_DATABASE_URL=${url.slice(0, 30)}...`);
  console.log(`  TURSO_AUTH_TOKEN=*** (${token.length} chars)\n`);
  console.log("Add the SAME variables in Vercel → Settings → Environment Variables → Production");
  console.log("Then: Deployments → Redeploy\n");
  process.exit(0);
}

console.log("1. Install Turso CLI: https://docs.turso.tech/cli");
console.log("2. Run:\n");
console.log("   turso auth login");
console.log("   turso db create qsc-checker");
console.log("   turso db show qsc-checker --url");
console.log("   turso db tokens create qsc-checker\n");
console.log("3. Add to Vercel (Production + Preview):\n");
console.log("   TURSO_DATABASE_URL=libsql://...");
console.log("   TURSO_AUTH_TOKEN=...");
console.log("   JWT_SECRET=(random 32+ chars)");
console.log("   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app\n");
console.log("4. Redeploy, then open: https://your-app.vercel.app/api/health\n");
console.log("Or use Vercel Marketplace → Storage → Turso (auto-sets env vars)\n");

try {
  execSync("turso --version", { stdio: "ignore" });
  console.log("Turso CLI is installed. Run the commands above.\n");
} catch {
  console.log("(Turso CLI not found in PATH — install from link above)\n");
}
