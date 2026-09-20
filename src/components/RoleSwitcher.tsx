"use client";

import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/roles";
import type { RoleId } from "@/lib/types";
import { useEscrow } from "@/lib/store";
import clsx from "clsx";

export function RoleSwitcher() {
  const { role, setRole } = useEscrow();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label className="hidden sm:block text-xs font-medium text-slate-500">
        Demo role / ሚና
      </label>
      <select
        className={clsx(
          "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm max-w-[220px]"
        )}
        value={role}
        onChange={(e) => {
          const next = e.target.value as RoleId;
          setRole(next);
          router.push(`/dashboard/${next}`);
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
