"use client";

import Link from "next/link";
import { useEscrow } from "@/lib/store";
import { DashboardShell } from "@/components/DashboardShell";
import { DealCard } from "@/components/DealCard";
import { StatCard } from "@/components/StatCard";
import { formatEtb, formatDate } from "@/lib/format";

export default function BankDashboard() {
  const { deals } = useEscrow();
  const custody = deals.reduce((s, d) => s + d.heldEtb, 0);
  const released = deals.reduce((s, d) => s + d.releasedEtb, 0);
  const pendingRelease = deals.flatMap((d) =>
    d.milestones
      .filter((m) => m.status === "verified")
      .map((m) => ({ deal: d, milestone: m }))
  );
  const allLedger = deals
    .flatMap((d) =>
      d.ledger.map((e) => ({ ...e, dealRef: d.reference, dealId: d.id }))
    )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 12);

  return (
    <DashboardShell
      role="bank"
      subtitle="Custody ledger, holds, and release instructions (simulated)."
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard
          label="Segregated custody"
          value={formatEtb(custody)}
          hint="Client funds — not bank proprietary"
        />
        <StatCard label="Released YTD (demo)" value={formatEtb(released)} />
        <StatCard
          label="Release instructions"
          value={String(pendingRelease.length)}
          hint="Verified milestones awaiting payout"
        />
      </div>

      {pendingRelease.length > 0 && (
        <div className="card p-5 border-indigo-200">
          <h3 className="font-semibold text-indigo-950 mb-3">
            Pending release instructions
          </h3>
          <ul className="space-y-2">
            {pendingRelease.map(({ deal, milestone }) => (
              <li
                key={milestone.id}
                className="flex flex-wrap justify-between gap-2 text-sm"
              >
                <span>
                  <span className="font-mono text-xs text-slate-400">
                    {deal.reference}
                  </span>{" "}
                  {milestone.title} — {formatEtb(milestone.amountEtb)}
                </span>
                <Link
                  href={`/deals/view?id=${deal.id}`}
                  className="font-semibold text-[#0b3d2e]"
                >
                  Execute →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-semibold mb-3">Recent custody ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400 border-b">
                <th className="pb-2 pr-2">When</th>
                <th className="pb-2 pr-2">Deal</th>
                <th className="pb-2 pr-2">Type</th>
                <th className="pb-2 pr-2">Amount</th>
                <th className="pb-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {allLedger.map((e) => (
                <tr key={e.id} className="border-b border-slate-50">
                  <td className="py-2 pr-2 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(e.at)}
                  </td>
                  <td className="py-2 pr-2">
                    <Link
                      href={`/deals/view?id=${e.dealId}`}
                      className="font-mono text-xs text-[#0b3d2e]"
                    >
                      {e.dealRef}
                    </Link>
                  </td>
                  <td className="py-2 pr-2 capitalize">{e.type}</td>
                  <td className="py-2 pr-2 font-mono text-xs">
                    {formatEtb(e.amountEtb)}
                  </td>
                  <td className="py-2 text-slate-600">{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </DashboardShell>
  );
}
