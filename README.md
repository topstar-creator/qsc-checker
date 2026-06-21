# QSC Checker

飲食店・小売店向け QSC（品質・サービス・清潔感）チェック・ランキング・改善管理 PWA SaaS

## Features

- **5-tab mobile PWA**: Home (rankings), Reports, Investigation, Improvements, My Page
- **Multi-tenant SaaS**: Company signup → store → users
- **Rankings**: Store / group / improvement rate with configurable periods
- **Investigation flow**: Configurable check sheets (1–100 questions)
- **Improvement cases**: Full workflow (pending → in_progress → reported → approved/rejected → done)
- **Billing**: 3-month free trial, per-store monthly pricing (Stripe-ready)
- **AI assist**: Discussion points for reports and cases (assistive only)

## Quick Start

```bash
npm install
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Company Admin |
| sv@example.com | sv123456 | SV |
| manager@example.com | manager1 | Store Manager |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed demo data |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright) |

## Environment

Copy `.env.example` to `.env.local`:

```
DATABASE_URL=./qsc-checker.db
JWT_SECRET=your-secret-min-32-chars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
```

## Tech Stack

- Next.js 15 + TypeScript + Tailwind CSS
- SQLite (better-sqlite3) + Drizzle ORM
- JWT session auth + RBAC
- Recharts, Stripe, OpenAI (optional)

## Project Structure

```
src/
  app/           # Routes (5 tabs + auth + API)
  components/    # UI components
  lib/           # DB, auth, rankings, AI, billing
  data/          # Mock data fallbacks
docs/            # Design system, wireframes, user journeys
```
