import fs from "fs";
import path from "path";
import type { AppState, EscrowDeal } from "./types";
import { createSeedState } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "escrow-db.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readState(): AppState {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const seeded = createSeedState();
    writeState(seeded);
    return seeded;
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.deals || parsed.deals.length === 0) {
      const seeded = createSeedState();
      writeState(seeded);
      return seeded;
    }
    return parsed;
  } catch {
    const seeded = createSeedState();
    writeState(seeded);
    return seeded;
  }
}

export function writeState(state: AppState): void {
  ensureDir();
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), "utf-8");
  fs.renameSync(tmp, DB_PATH);
}

export function getDeals(): EscrowDeal[] {
  return readState().deals;
}

export function getDeal(id: string): EscrowDeal | undefined {
  return readState().deals.find((d) => d.id === id);
}

export function upsertDeal(deal: EscrowDeal): EscrowDeal {
  const state = readState();
  const idx = state.deals.findIndex((d) => d.id === deal.id);
  if (idx >= 0) {
    state.deals[idx] = deal;
  } else {
    state.deals.unshift(deal);
  }
  writeState(state);
  return deal;
}

export function resetDatabase(): AppState {
  const seeded = createSeedState();
  writeState(seeded);
  return seeded;
}

export function getDbPath(): string {
  return DB_PATH;
}
