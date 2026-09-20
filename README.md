# EscrowET — Escrow-as-a-Service Demo MVP (Ethiopia)

**DEMO MVP — funds are simulated; not a licensed product.**

Trust intermediary for informal / low-trust markets in Ethiopia: buyer deposits into escrow, seller delivers, funds release when conditions are met. A **partner bank** holds segregated funds (simulated). The **platform never owns the money**.

Built for demos to sector clients, banks, and the National Bank of Ethiopia (NBE).

## Live demo (GitHub Pages)

**https://kaleab-kali.github.io/escrow-mvp/**

Static hosting: all deal state and the demo role live in **browser `localStorage`** (not a server database). Use the Operator dashboard **Reset demo data** to re-seed.

## Quick start (local)

```bash
cd escrow-mvp
npm install
npm run dev
```

Open **http://localhost:3000**.

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server (port 3000) — no `basePath` |
| `npm run build` | Production build (Node server / `.next`) |
| `GITHUB_PAGES=true npm run build` | Static export to `out/` with `basePath` `/escrow-mvp` |
| `npm run start` | Serve production Node build |
| `npm run seed` | Prints how to reset localStorage demo data |

## GitHub Pages build

```bash
GITHUB_PAGES=true npm run build
# → out/index.html and static assets under /escrow-mvp/
```

CI: `.github/workflows/deploy-pages.yml` builds with `GITHUB_PAGES=true` on push to `main` and deploys `out/` via `actions/upload-pages-artifact` + `actions/deploy-pages`.

Enable **Settings → Pages → Source: GitHub Actions** on the repo.

## 10-minute demo script

### 0. Setup
1. Open the Pages URL (or `npm run dev`).
2. Note the amber demo banner (EN + Amharic).
3. Point out: fictional Ethiopian banks, ETB, Addis Ababa context.

### 1. Informal / e-commerce sale
1. Home → **Pick Buyer**.
2. Open a funded e-commerce deal → Seller submits evidence → Buyer verifies → Bank releases (ledger + fee).

### 2. Real-estate milestones
1. Open the real-estate deal (partially released).
2. Verifier reviews submitted evidence → Bank releases next tranche.

### 3. Bank / NBE / dispute
1. **Bank** dashboard — custody totals and release queue.
2. **Regulator** — read-only exposure by bank.
3. **Mediator** — resolve the disputed scholarship deal.

## Roles (one-click, no real auth)

| Role | Route |
|------|-------|
| Buyer | `/dashboard/buyer` |
| Seller | `/dashboard/seller` |
| Marketplace | `/dashboard/marketplace` |
| Verifier | `/dashboard/verifier` |
| Bank | `/dashboard/bank` |
| Operator | `/dashboard/operator` |
| Regulator (NBE) | `/dashboard/regulator` |
| Mediator | `/dashboard/mediator` |

## Architecture

- **Next.js 14** App Router + TypeScript + Tailwind
- **Client store** (`src/lib/store.tsx`) + **localStorage** — works on static GitHub Pages
- Seeded deals in `src/lib/seed.ts` (loaded when storage is empty)
- Amharic on key nav/labels (demo banner, header, role/sector labels)
- Static deal detail: `/deals/view?id=…` (query param, not a dynamic server route)

## Demo limitations

- No real payments, Telebirr, or bank APIs
- No real KYC / NBE licence
- Data is per-browser localStorage (not multi-user sync)
- Role switch is a demo convenience, not authentication
