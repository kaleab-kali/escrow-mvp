# EscrowET

Trusted ETB escrow between buyers and sellers in Ethiopia — real estate, e-commerce, scholarships, travel, and freelancers. Marketplaces integrate via API only (no marketplace storefront). Operators generate EOD custody packs for banks (no bank interactive dashboard, no NBE console).

## Stack

- Next.js 16 (App Router) · React 19 · Tailwind CSS v4
- In-memory `globalThis` store + Server Actions (Vercel serverless friendly)
- Demo auth via HTTP-only session cookie (one-click role login)

## Local run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and pick a demo role (Buyer, Seller, Verifier, Mediator, Operator).

```bash
npm run build
npm start
```

## Demo roles & flows

| Role | Entry | What to try |
|------|-------|-------------|
| Buyer | `/login` → Buyer | Fund awaiting deals, release pending releases, open disputes |
| Seller | Seller | Accept pending deals, start work, mark milestones complete |
| Verifier | Verifier | Approve/reject RE title checks in `/verify` |
| Mediator | Mediator | Resolve disputes on `/mediate` (release or refund) |
| Operator | Operator | KPIs, EOD bank packs, settlements, audit CSV, API usage |

**Happy path:** create deal → seller accepts → buyer funds → seller works / milestones → (RE: verify) → release.

## Key routes

- `/` — landing + role entry
- `/login` — demo sign-in
- `/dashboard` — role home (buyers/sellers)
- `/deals`, `/deals/new`, `/deals/[id]` — deal list, multi-step create, workspace + audit
- `/verify` — RE verification queue
- `/mediate` — dispute mediation
- `/operator` — ops KPIs & pipeline
- `/operator/eod` — EOD bank custody packs (7-day + archive)
- `/operator/settlements` — settlement register
- `/operator/audit` — audit log + CSV export
- `/operator/api-usage` — partner API traffic
- `/operator/disputes` — dispute overview
- `/partners` — API keys, webhooks, usage (Developer / Partners)

## Vercel deploy

1. Import the repo in Vercel
2. Framework preset: **Next.js**
3. Root directory: `/` (project root — do not set a subfolder)
4. Build command: `npm run build` (default)
5. Output: leave default (no static export, no `basePath`)

No environment variables required for the demo. Note: the in-memory store resets per serverless isolate — seed data reloads on cold start.

## Product boundaries

- Direct buyer↔seller escrow (ETB)
- Partners = API keys / webhooks / usage only
- Banks = EOD custody report packs only (operator-generated)
- No NBE dashboard, no bank interactive UI, no marketplace admin
