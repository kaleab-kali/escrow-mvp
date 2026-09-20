"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, demoUsersByRole } from "@/lib/auth";
import { roleHome } from "@/lib/deal-helpers";
import { findUser } from "@/lib/store";
import type { Role } from "@/lib/types";

export async function loginAsRole(role: Role) {
  const userId = demoUsersByRole()[role];
  const user = findUser(userId);
  if (!user) throw new Error("Demo user missing");

  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect(roleHome(user.role));
}

export async function loginAsUserId(userId: string) {
  const user = findUser(userId);
  if (!user) throw new Error("User not found");

  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect(roleHome(user.role));
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}
