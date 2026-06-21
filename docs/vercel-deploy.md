# Vercel Deployment

QSC Checker cannot use a local SQLite file on Vercel (serverless). Use **Turso** (free cloud SQLite).

## 1. Create Turso database

```bash
# Install Turso CLI: https://docs.turso.tech/cli
turso auth login
turso db create qsc-checker
turso db show qsc-checker --url
turso db tokens create qsc-checker
```

## 2. Set Vercel environment variables

In Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://...` from `turso db show` |
| `TURSO_AUTH_TOKEN` | token from `turso db tokens create` |
| `JWT_SECRET` | random string (32+ chars) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

Optional: `STRIPE_*`, `OPENAI_API_KEY`

## 3. Deploy

Push to Git — Vercel will build automatically.

On first request, demo data is seeded automatically.

**Demo login:** `admin@example.com` / `admin123`

## Local development

Without `TURSO_DATABASE_URL`, the app uses a local `qsc-checker.db` file:

```bash
npm install
npm run db:seed
npm run dev
```
