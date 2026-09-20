"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/roles";
import type { RoleId } from "@/lib/types";
import { setRole } from "@/lib/actions";
import clsx from "clsx";

export function RoleSwitcher({ current }: { current: RoleId }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label className="hidden sm:block text-xs font-medium text-slate-500">
        Demo role / ሚና
      </label>
      <select
        className={clsx(
          "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm max-w-[220px]",
          pending && "opacity-60"
        )}
        value={current}
        disabled={pending}
        onChange={(e) => {
          const role = e.target.value as RoleId;
          start(async () => {
            await setRole(role);
            router.push(`/dashboard/${role === "regulator" ? "regulator" : role}`);
            router.refresh();
          });
        }}
      >
        {ROLES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label} · {r.labelAm}
          </option>
        ))}
      </select>
    </div>
  );
}
