import { getDeals } from "@/lib/db";
import { DashboardShell } from "@/components/DashboardShell";
import { DealCard } from "@/components/DealCard";
import { StatCard } from "@/components/StatCard";
import { formatEtb } from "@/lib/format";
import Link from "next/link";

export default function BuyerDashboard() {
  const deals = getDeals();
  const mine = deals.filter((d) =>
    ["pending_funding", "funded", "in_progress", "partially_released", "disputed"].includes(
      d.status
    )
  );
  const held = deals.reduce((s, d) => s + d.heldEtb, 0);

  return (
    <DashboardShell role="buyer" subtitle="Track deposits, inspections, and releases.">
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="Your open deals" value={String(mine.length)} />
        <StatCard label="Funds in escrow" value={formatEtb(held)} hint="Protected until conditions met" />
        <StatCard
          label="Action needed"
          value={String(
            deals.filter(
              (d) =>
                d.status === "pending_funding" ||
                d.milestones.some((m) => m.status === "submitted" && d.sector !== "real_estate")
            ).length
          )}
        />
      </div>
      <div className="flex gap-2">
        <Link href="/deals/new" className="btn-primary">
          Start new escrow
        </Link>
        <Link href="/deals?sector=ecommerce" className="btn-secondary">
          E-commerce deals
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </DashboardShell>
  );
}
