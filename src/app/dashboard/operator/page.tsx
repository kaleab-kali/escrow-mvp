"use client";

import Link from "next/link";
import { useEscrow } from "@/lib/store";
import { DashboardShell } from "@/components/DashboardShell";
import { DealCard } from "@/components/DealCard";
import { StatCard } from "@/components/StatCard";
import { formatEtb } from "@/lib/format";
import { SECTORS } from "@/lib/sectors";
import { ResetDemoButton } from "@/components/ResetDemoButton";

export default function OperatorDashboard() {
  const { deals } = useEscrow();
  const fees = deals.reduce((s, d) => {
    const releasedFee = Math.round((d.releasedEtb * d.feeBps) / 10000);
    return s + releasedFee;
  }, 0);

  return (
    <DashboardShell
      role="operator"
      subtitle="Platform ops — fees, deal oversight, demo reset."
    >
      <div className="grid sm:grid-cols-4 gap-3">
        <StatCard label="All deals" value={String(deals.length)} />
        <StatCard
          label="Held custody"
          value={formatEtb(deals.reduce((s, d) => s + d.heldEtb, 0))}
        />
        <StatCard label="Fees accrued (est.)" value={formatEtb(fees)} />
        <StatCard
          label="Disputes"
          value={String(deals.filter((d) => d.dispute?.status === "open").length)}
        />
      </div>

      <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Demo controls</h3>
          <p className="text-sm text-slate-500">
            Re-seed five sector deals to starting stages (localStorage).
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/deals/new" className="btn-primary">
            Create deal
          </Link>
          <ResetDemoButton />
        </div>
      </div>

      <div className="grid sm:grid-cols-5 gap-2">
        {SECTORS.map((s) => {
          const n = deals.filter((d) => d.sector === s.id).length;
          return (
            <Link
              key={s.id}
              href={`/deals?sector=${s.id}`}
              className="card p-3 text-center hover:border-[#0b3d2e]/40"
            >
              <div className="text-2xl font-bold">{n}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </DashboardShell>
  );
}
