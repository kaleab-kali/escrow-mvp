import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { dealsForUser, getNextActions } from "@/lib/deal-helpers";
import { formatEtb, formatEtbCompact } from "@/lib/format";
import { getStore } from "@/lib/store";
import { DealsTable } from "@/components/deals/deals-table";
import { StatCard } from "@/components/ui/stat";
import { buttonClass } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "operator") redirect("/operator");
  if (user.role === "verifier") redirect("/verify");
  if (user.role === "mediator") redirect("/mediate");

  const store = getStore();
  const deals = dealsForUser(store.deals, user);
  const open = deals.filter(
    (d) => !["released", "refunded", "cancelled"].includes(d.status)
  );
  const custody = open
    .filter((d) =>
      ["funded", "in_progress", "pending_verification", "pending_release", "disputed"].includes(
        d.status
      )
    )
    .reduce((s, d) => s + d.amountEtb, 0);
  const needsYou = open.filter((d) =>
    getNextActions(d, user).some((a) => a.action && a.primary)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Welcome back, {user.name.split(" ")[0]} — your escrow workspace
          </p>
        </div>
        <Link href="/deals/new" className={buttonClass()}>
          New deal
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open deals" value={String(open.length)} />
        <StatCard label="In custody (your deals)" value={formatEtbCompact(custody)} />
        <StatCard
          label="Needs your action"
          value={String(needsYou.length)}
          tone={needsYou.length ? "warning" : "success"}
        />
        <StatCard label="Total deals" value={String(deals.length)} />
      </div>

      {needsYou.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900">Action required</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {needsYou.slice(0, 4).map((d) => {
              const next = getNextActions(d, user).find((a) => a.primary);
              return (
                <Link
                  key={d.id}
                  href={`/deals/${d.id}`}
                  className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 transition hover:border-amber-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900">{d.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatEtb(d.amountEtb)} · {next?.label}
                      </p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent deals</h2>
          <Link href="/deals" className="text-sm font-medium text-teal-800 hover:underline">
            View all
          </Link>
        </div>
        <DealsTable deals={deals.slice(0, 6)} />
      </section>
    </div>
  );
}
