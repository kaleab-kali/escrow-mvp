import type { ReactNode } from "react";
import Link from "next/link";
import { getRole } from "@/lib/roles";
import type { RoleId } from "@/lib/types";
import clsx from "clsx";

export function DashboardShell({
  role,
  children,
  subtitle,
}: {
  role: RoleId;
  children: ReactNode;
  subtitle?: string;
}) {
  const r = getRole(role);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span
            className={clsx(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-2",
              r.color
            )}
          >
            {r.label} · {r.labelAm}
          </span>
          <h1 className="text-2xl font-bold text-slate-900">{r.label} dashboard</h1>
          <p className="text-sm text-slate-500">{subtitle || r.description}</p>
        </div>
        <Link href="/deals" className="btn-secondary">
          Browse deals
        </Link>
      </div>
      {children}
    </div>
  );
}
