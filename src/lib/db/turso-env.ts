/**
 * Turso / libSQL connection settings.
 * Supports Vercel Marketplace (TURSO_*) and manual / CLI names (LIBSQL_*).
 */
export function getTursoConfig() {
  const url = (
    process.env.TURSO_DATABASE_URL ??
    process.env.LIBSQL_URL ??
    ""
  ).trim();

  const authToken = (
    process.env.TURSO_AUTH_TOKEN ??
    process.env.LIBSQL_AUTH_TOKEN ??
    ""
  ).trim();

  return { url, authToken };
}

export function isTursoConfigured(): boolean {
  return getTursoConfig().url.length > 0;
}

export function assertTursoConfigured(): { url: string; authToken: string } {
  const { url, authToken } = getTursoConfig();

  if (!url) {
    throw new Error(
      "Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel → Settings → Environment Variables, then Redeploy."
    );
  }

  if (url.startsWith("libsql://") && !authToken) {
    throw new Error(
      "TURSO_AUTH_TOKEN is required for remote Turso databases. Create one with: turso db tokens create qsc-checker"
    );
  }

  return { url, authToken };
}
