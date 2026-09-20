import { getDeals } from "@/lib/db";
import { DashboardShell } from "@/components/DashboardShell";
import { DealCard } from "@/components/DealCard";
import { StatCard } from "@/components/StatCard";
import Link from "next/link";
import { StatusChip } from "@/components/StatusChip";

export default function VerifierDashboard() {
  const deals = getDeals().filter((d) => d.sector === "real_estate");
  const queue = deals.flatMap((d) =>
    d.milestones
      .filter((m) => m.status === "submitted")
      .map((m) => ({ deal: d, milestone: m }))
  );

  return (
    <DashboardShell
      role="verifier"
      subtitle="Verify construction milestones (Proclamation 1357/2024 spirit)."
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="RE deals" value={String(deals.length)} />
        <StatCard label="Verification queue" value={String(queue.length)} />
        <StatCard
          label="Verified this demo"
          value={String(
            deals.reduce(
              (n, d) =>
                n +
                d.milestones.filter(
                  (m) => m.status === "verified" || m.status === "released"
                ).length,
              0
            )
          )}
        />
      </div>

      {queue.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Awaiting site verification</h3>
          <ul className="space-y-3">
            {queue.map(({ deal, milestone }) => (
              <li
                key={milestone.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <div className="font-medium">{deal.title}</div>
                  <div className="text-sm text-slate-600">
                    {milestone.title} · {deal.location}
                  </div>
                  <StatusChip status={milestone.status} className="mt-1" />
                </div>
                <Link href={`/deals/${deal.id}`} className="btn-primary">
                  Review
                </Link>
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
