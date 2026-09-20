import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatEtb, formatEtbCompact } from "@/lib/format";
import { STATUS_LABELS, type DealStatus } from "@/lib/types";
import { StatCard } from "@/components/ui/stat";
import { DealsTable } from "@/components/deals/deals-table";
import { Card, CardHeader } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";

export default async function OperatorPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "operator") redirect("/dashboard");

  const store = getStore();
  const deals = store.deals;
  const active = deals.filter((d) =>
    ["funded", "in_progress", "pending_verification", "pending_release", "disputed"].includes(
      d.status
    )
  );
  const custody = active.reduce((s, d) => s + d.amountEtb, 0);
  const fees = deals
    .filter((d) => d.status === "released")
    .reduce((s, d) => s + d.feeEtb, 0);
  const disputes = deals.filter((d) => d.status === "disputed");
  const pendingVerify = deals.filter((d) => d.status === "pending_verification");
  const pipeline: DealStatus[] = [
    "pending_acceptance",
    "awaiting_funds",
    "funded",
    "in_progress",
    "pending_verification",
    "pending_release",
    "disputed",
    "released",
  ];

  const byStatus = Object.fromEntries(
    pipeline.map((s) => [s, deals.filter((d) => d.status === s).length])
  ) as Record<string, number>;

  const maxPipe = Math.max(1, ...Object.values(byStatus));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Custody, pipeline, and SLA overview
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/operator/eod" className={buttonClass({ variant: "secondary", size: "sm" })}>
            EOD packs
          </Link>
          <Link href="/operator/settlements" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Settlements
          </Link>
          <Link href="/operator/audit" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Audit export
          </Link>
          <Link href="/operator/api-usage" className={buttonClass({ variant: "secondary", size: "sm" })}>
            API usage
          </Link>
          <Link href="/operator/disputes" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Disputes
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Custody balance" value={formatEtbCompact(custody)} hint={`${active.length} active deals`} />
        <StatCard label="Fees collected" value={formatEtbCompact(fees)} tone="success" />
        <StatCard label="Open disputes" value={String(disputes.length)} tone={disputes.length ? "danger" : "success"} />
        <StatCard
          label="Verification queue"
          value={String(pendingVerify.length)}
          tone={pendingVerify.length ? "warning" : "default"}
          hint="RE SLA target &lt; 48h"
        />
        <StatCard label="API req (30d)" value={store.apiKeys.reduce((s, k) => s + k.requests30d, 0).toLocaleString()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Pipeline" description="Deal count by status" />
          <div className="space-y-3 p-5">
            {pipeline.map((s) => (
              <div key={s} className="grid grid-cols-[140px_1fr_40px] items-center gap-3 text-sm">
                <span className="truncate text-zinc-600">{STATUS_LABELS[s]}</span>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-teal-600"
                    style={{ width: `${(byStatus[s] / maxPipe) * 100}%` }}
                  />
                </div>
                <span className="text-right tabular-nums font-medium">{byStatus[s]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Verification SLA" description="Pending RE checks" />
          <div className="p-5">
            {pendingVerify.length === 0 ? (
              <p className="text-sm text-zinc-500">Queue clear.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {pendingVerify.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-3 text-sm">
                    <Link href={`/deals/${d.id}`} className="font-medium text-teal-800 hover:underline">
                      {d.title}
                    </Link>
                    <span className="tabular-nums text-zinc-500">{formatEtb(d.amountEtb)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Active custody deals</h2>
        <DealsTable deals={active} />
      </section>
    </div>
  );
}
