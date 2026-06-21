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

## 2. Create / fix Vercel project

In [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project** → import `topstar-creator/qsc-checker`.

Verify these settings (**Settings → General → Build & Development Settings**):

| Setting | Value |
|---------|-------|
| Framework Preset | **Next.js** |
| Root Directory | *(leave empty)* |
| Build Command | `npm run build` |
| Output Directory | *(leave empty — do NOT set `.next` or `out`)* |
| Install Command | `npm install` |

> **Important:** If Output Directory is set to anything, the site will show Vercel's `404: NOT_FOUND` on every page.

## 3. Set environment variables

In Vercel → Project → **Settings → Environment Variables** (Production + Preview):

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://...` from `turso db show` |
| `TURSO_AUTH_TOKEN` | token from `turso db tokens create` |
| `JWT_SECRET` | random string (32+ chars) |
| `NEXT_PUBLIC_APP_URL` | your production URL, e.g. `https://qsc-checker-xxxx.vercel.app` |

Optional: `STRIPE_*`, `OPENAI_API_KEY`

After adding variables, click **Redeploy** (Deployments → ⋯ → Redeploy).

## 4. Deploy

Push to Git — Vercel builds automatically.

Check **Deployments** tab:
- ✅ **Ready** = live
- ❌ **Error** = open build logs and fix (common: missing env vars, wrong Output Directory)

On first API request, demo data is seeded automatically.

**Demo login:** `admin@example.com` / `admin123`

## Troubleshooting `404: NOT_FOUND`

This is Vercel's platform error (not the app). It means **no deployment is serving that URL**.

1. Open Vercel → **Deployments** — is the latest deployment **Ready**?
2. Copy the URL from the green **Visit** button (not an old preview link).
3. Confirm **Output Directory** is empty in project settings.
4. Confirm Framework is **Next.js** (not "Other" / static).
5. Redeploy after fixing env vars or settings.

Test after deploy:

```
https://YOUR-URL.vercel.app/api/health   → {"ok":true}
https://YOUR-URL.vercel.app/auth/sign-in → login page
```

## Local development

Without `TURSO_DATABASE_URL`, the app uses a local `qsc-checker.db` file:

```bash
npm install
npm run db:seed
npm run dev
```
