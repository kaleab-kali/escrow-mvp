"use client";

import Link from "next/link";
import { useEscrow } from "@/lib/store";
import { DashboardShell } from "@/components/DashboardShell";
import { DealCard } from "@/components/DealCard";
import { StatCard } from "@/components/StatCard";
import { formatEtb } from "@/lib/format";

export default function SellerDashboard() {
  const { deals } = useEscrow();
  const needEvidence = deals.filter(
    (d) =>
      d.milestones.some((m) => m.status === "pending" || m.status === "rejected") &&
      ["funded", "in_progress", "partially_released"].includes(d.status)
  );
  const earned = deals.reduce((s, d) => s + d.releasedEtb, 0);

  return (
    <DashboardShell
      role="seller"
      subtitle="Submit milestone evidence and track payouts."
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="Awaiting evidence" value={String(needEvidence.length)} />
        <StatCard label="Released to you" value={formatEtb(earned)} />
        <StatCard
          label="Active deals"
          value={String(deals.filter((d) => d.heldEtb > 0).length)}
        />
      </div>
      {needEvidence.length > 0 && (
        <div className="card p-4 border-amber-200 bg-amber-50/50">
          <h3 className="font-semibold text-amber-900">Submit evidence</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {needEvidence.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/deals/view?id=${d.id}`}
                  className="text-[#0b3d2e] font-medium hover:underline"
                >
                  {d.title}
                </Link>
                <span className="text-slate-500">
                  {" "}
                  —{" "}
                  {
                    d.milestones.find(
                      (m) => m.status === "pending" || m.status === "rejected"
                    )?.title
                  }
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </DashboardShell>
  );
}
