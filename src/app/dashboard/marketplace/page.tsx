"use client";

import { useEscrow } from "@/lib/store";
import { DashboardShell } from "@/components/DashboardShell";
import { DealCard } from "@/components/DealCard";
import { StatCard } from "@/components/StatCard";
import { formatEtb } from "@/lib/format";

export default function MarketplaceDashboard() {
  const { deals: all } = useEscrow();
  const deals = all.filter(
    (d) => d.sector === "ecommerce" || d.sector === "freelancer"
  );
  const volume = deals.reduce((s, d) => s + d.amountEtb, 0);

  return (
    <DashboardShell
      role="marketplace"
      subtitle="Light oversight of marketplace-originated escrows."
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="Listed escrows" value={String(deals.length)} />
        <StatCard label="GMV under escrow" value={formatEtb(volume)} />
        <StatCard
          label="Disputed"
          value={String(deals.filter((d) => d.status === "disputed").length)}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
        {deals.length === 0 && (
          <p className="text-slate-500">No marketplace deals yet.</p>
        )}
      </div>
    </DashboardShell>
  );
}
