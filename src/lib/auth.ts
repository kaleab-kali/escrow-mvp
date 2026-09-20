import { cookies } from "next/headers";
import { getStore } from "./store";
import type { Role, User } from "./types";

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

export function demoUsersByRole(): Record<Role, string> {
  return {
    buyer: "user-buyer-1",
    seller: "user-seller-1",
    verifier: "user-verifier-1",
    mediator: "user-mediator-1",
    operator: "user-operator-1",
  };
}
