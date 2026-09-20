import { getDeals } from "@/lib/db";
import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { formatEtb, formatDate } from "@/lib/format";
import Link from "next/link";
import { StatusChip } from "@/components/StatusChip";

export default function MediatorDashboard() {
  const deals = getDeals();
  const open = deals.filter((d) => d.dispute?.status === "open");
  const resolved = deals.filter((d) => d.dispute?.status === "resolved");

  return (
    <DashboardShell
      role="mediator"
      subtitle="Resolve disputes — release, refund, or split held funds."
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="Open disputes" value={String(open.length)} />
        <StatCard label="Resolved (demo)" value={String(resolved.length)} />
        <StatCard
          label="Amount in dispute"
          value={formatEtb(open.reduce((s, d) => s + d.heldEtb, 0))}
        />
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Queue</h2>
        {open.length === 0 && (
          <p className="text-slate-500 text-sm card p-5">
            No open disputes. Open one from a funded deal (Buyer/Seller role) to
            demo mediation.
          </p>
        )}
        {open.map((d) => (
          <div key={d.id} className="card p-5 border-orange-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusChip status="disputed" />
                  <span className="font-mono text-xs text-slate-400">
                    {d.reference}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900">{d.title}</h3>
                <p className="mt-2 text-sm text-slate-700">
                  {d.dispute?.reason}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Opened {d.dispute ? formatDate(d.dispute.openedAt) : ""} by{" "}
                  {d.dispute?.openedBy} · Held {formatEtb(d.heldEtb)}
                </p>
              </div>
              <Link href={`/deals/${d.id}`} className="btn-amber">
                Mediate
              </Link>
            </div>
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Recently resolved</h3>
          <ul className="space-y-2 text-sm">
            {resolved.map((d) => (
              <li key={d.id} className="flex justify-between gap-2">
                <Link href={`/deals/${d.id}`} className="text-[#0b3d2e]">
                  {d.title}
                </Link>
                <span className="text-slate-500 capitalize">
                  {d.dispute?.outcome?.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}
