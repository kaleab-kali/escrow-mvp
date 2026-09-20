import { cookies } from "next/headers";
import { getStore } from "./store";
import type { Role, Sector, User } from "./types";
import { SECTOR_LABELS } from "./types";

export const SESSION_COOKIE = "escrowet_session";

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const userId = jar.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  const store = getStore();
  return store.users.find((u) => u.id === userId) ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export async function requireRole(...roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

/** Legacy single-per-role map (kept for loginAsRole). Prefer demoAccounts(). */
export function demoUsersByRole(): Record<Role, string> {
  return {
    buyer: "user-buyer-1",
    seller: "user-seller-1",
    verifier: "user-verifier-1",
    mediator: "user-mediator-1",
    operator: "user-operator-1",
  };
}

export interface DemoAccountCard {
  userId: string;
  title: string;
  subtitle: string;
  sector?: Sector;
}

/**
 * Industry-labeled demo identities for login / home "Continue as".
 * Order: RE → Ecom → Scholarship → Travel → Freelance → Verifier → Mediator → Operator.
 */
export function demoAccounts(): DemoAccountCard[] {
  const users = getStore().users;
  const byId = (id: string) => users.find((u) => u.id === id);

  const cards: { id: string; title: string }[] = [
    { id: "user-buyer-1", title: "RE Buyer — Hanna" },
    { id: "user-seller-1", title: "RE Seller — Abel Properties" },
    { id: "user-ecom-buyer", title: "Ecom Buyer — Sara" },
    { id: "user-seller-2", title: "Ecom Seller — Selam Craft" },
    { id: "user-schol-buyer", title: "Scholarship Sponsor — Tigist" },
    { id: "user-schol-seller", title: "Scholarship Agency — Horizon" },
    { id: "user-buyer-2", title: "Travel Buyer — Yonas" },
    { id: "user-travel-seller", title: "Travel Agency — Highlands Tours" },
    { id: "user-freelance-buyer", title: "Freelance Client — Bethlehem" },
    { id: "user-seller-3", title: "Freelance Seller — Kidus" },
    { id: "user-verifier-1", title: "RE Verifier — Meron" },
    { id: "user-mediator-1", title: "Mediator — Dawit" },
    { id: "user-operator-1", title: "Operator — EscrowET Ops" },
  ];

  const result: DemoAccountCard[] = [];
  for (const { id, title } of cards) {
    const u = byId(id);
    if (!u) continue;
    const sectorLabel = u.sector ? SECTOR_LABELS[u.sector] : undefined;
    const roleBit =
      u.role === "verifier"
        ? "Verifier"
        : u.role === "mediator"
          ? "Mediator"
          : u.role === "operator"
            ? "Operator"
            : u.role === "buyer"
              ? "Buyer"
              : "Seller";
    const subtitle = sectorLabel
      ? `${sectorLabel} · ${roleBit}`
      : roleBit;
    result.push({
      userId: u.id,
      title,
      subtitle: u.email ? `${subtitle} · ${u.email}` : subtitle,
      sector: u.sector,
    });
  }
  return result;
}
