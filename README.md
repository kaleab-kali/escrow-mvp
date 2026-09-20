# EscrowET — Escrow-as-a-Service Demo MVP (Ethiopia)

**DEMO MVP — funds are simulated; not a licensed product.**

Trust intermediary for informal / low-trust markets in Ethiopia: buyer deposits into escrow, seller delivers, funds release when conditions are met. A **partner bank** holds segregated funds (simulated). The **platform never owns the money**.

Built for demos to sector clients, banks, and the National Bank of Ethiopia (NBE).

## Quick start

```bash
cd /workspace/escrow-mvp
npm install
npm run dev
```

Open **http://localhost:3000** (Next.js default port **3000**).

Other scripts:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve production build (port 3000) |
| `npm run seed` | Clear DB so next boot re-seeds demo deals |

Persistence: JSON file at `data/escrow-db.json` (auto-created & seeded on first read).

## 10-minute demo script

### 0. Setup (30s)
1. `npm run seed && npm run dev`
2. Open http://localhost:3000 — note the amber demo banner.
3. Point out: English UI + Amharic on key nav/labels; fictional Ethiopian banks; ETB amounts; Addis Ababa context.

### 1. Informal / e-commerce sale (~2 min)
1. Home → **Pick Buyer** (or Role switcher → Buyer).
2. Open **Samsung Galaxy A55** (`ESC-EC-2026-014`) — status **Funded**.
3. Switch role → **Seller**. Submit evidence on “Shipped” (courier note).
4. Switch → **Buyer**. Verify / approve the milestone.
5. Switch → **Bank Partner**. **Release + fee split** — show ledger deposit → hold → release → fee.
6. Optional: fund a **new escrow** from Home → E-commerce template (happy path from scratch).

### 2. Real-estate milestones (~3 min)
1. Open **Bole Apartment Off-plan** (`ESC-RE-2026-001`) — **Partially released**; milestone 1 paid; milestone 2 evidence submitted.
2. Switch → **Real-estate Verifier**. Review roofing evidence → Verify.
3. Switch → **Bank**. Release milestone 2. Emphasize **Proclamation 1357/2024 spirit**: progress-tied releases, independent verification, bank custody.

### 3. Bank partner view (~2 min)
1. Role → **Bank Partner** → Dashboard.
2. Show **Segregated custody** total, pending release instructions, multi-bank ledger.
3. Stress: platform instructs; bank holds/releases; funds never sit on EscrowET’s balance sheet (in this model).

### 4. NBE / regulator view (~2 min)
1. Role → **NBE / Regulator**.
2. Read-only table of all escrows, per-bank exposure, open disputes.
3. Message: supervisory transparency over segregated client money — **demo only, not a licence application**.

### 5. Dispute path (bonus ~2 min)
1. Open **Hungary Tuition Package** (`ESC-SC-2026-007`) — already **Disputed**.
2. Role → **Dispute Mediator** → Mediate → Refund / Release / Split.
3. Show audit trail + closing statement after resolution.

## Roles (one-click, no real auth)

| Role | Route | What they do |
|------|-------|----------------|
| Buyer | `/dashboard/buyer` | Fund, inspect, approve |
| Seller / Provider | `/dashboard/seller` | Submit evidence |
| Marketplace admin | `/dashboard/marketplace` | Light oversight |
| Real-estate verifier | `/dashboard/verifier` | Site / milestone verify |
| Bank partner | `/dashboard/bank` | Custody ledger & releases |
| Escrow operator | `/dashboard/operator` | Ops, fees, reset demo |
| NBE / regulator | `/dashboard/regulator` | Read-only supervision |
| Dispute mediator | `/dashboard/mediator` | Resolve disputes |

Switch roles anytime via the header **Demo role** dropdown.

## Seeded deals (one per sector)

| Ref | Sector | Stage |
|-----|--------|--------|
| `ESC-RE-2026-001` | Real estate | Partially released (M1 paid, M2 submitted) |
| `ESC-EC-2026-014` | E-commerce | Funded, awaiting delivery |
| `ESC-SC-2026-007` | Scholarship | Disputed (visa evidence) |
| `ESC-TR-2026-022` | Travel | Pending funding |
| `ESC-FL-2026-031` | Freelancers | Closed (full release) |

## Key routes

- `/` — Home: role picker + sector templates + seeded deals
- `/deals` — All deals (filter by sector)
- `/deals/new` — Create escrow from template
- `/deals/[id]` — Deal detail: milestones, ledger, audit, actions
- `/dashboard/[role]` — Role dashboards (see table above)

## Architecture

- **Next.js 14** App Router + TypeScript + Tailwind CSS
- **JSON store** in `data/escrow-db.json` (SQLite/`better-sqlite3` skipped — native build tools unavailable on this box)
- Server Actions in `src/lib/actions.ts` for mutations
- Cookie-based demo role (`escrow_demo_role`)
- Organized as `app/`, `components/`, `lib/` (db, seed, types, roles, sectors)

## Demo limitations

- No real payments, Telebirr, or bank APIs
- No real KYC / licensing / NBE authorization
- Single-process JSON file (not multi-user production storage)
- Role switch is a demo convenience, not authentication
- Fictional bank names and parties
- Amharic covers key nav/labels only (not full i18n)

## Product positioning (talking points)

1. **Problem:** Informal trade and high-ticket services suffer from counterparty risk.
2. **Model:** Conditional release; bank custody; platform orchestration + audit.
3. **Sectors:** Real estate, e-commerce, scholarship agencies, travel, freelancers.
4. **Compliance story:** Segregation, transparency for NBE, milestone evidence — *direction of travel*, not a live regulated product.
