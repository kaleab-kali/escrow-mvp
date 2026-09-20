import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatEtb, formatRelative } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { buttonClass } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat";

export default async function MediatePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "mediator" && user.role !== "operator") redirect("/dashboard");

  const open = getStore().deals.filter((d) => d.status === "disputed");
  const history = getStore().deals.filter(
    (d) => d.disputeReason && d.status !== "disputed"
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dispute mediation</h1>
        <p className="mt-1 text-sm text-zinc-500">Open cases — release to seller or refund buyer</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Open cases" value={String(open.length)} tone={open.length ? "danger" : "success"} />
        <StatCard label="Resolved (seed)" value={String(history.length)} />
      </div>

      <div className="space-y-3">
        {open.map((d) => (
          <div
            key={d.id}
            className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <StatusBadge status={d.status} />
                <h2 className="mt-2 text-lg font-semibold">{d.title}</h2>
                <p className="mt-1 text-sm text-zinc-600">{d.disputeReason}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {formatEtb(d.amountEtb)} · updated {formatRelative(d.updatedAt)}
                </p>
              </div>
              <Link href={`/deals/${d.id}`} className={buttonClass()}>
                Mediate on deal
              </Link>
            </div>
          </div>
        ))}
        {open.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-500">
            No open disputes
          </p>
        ) : null}
      </div>

      {history.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Resolved</h2>
          {history.map((d) => (
            <Link
              key={d.id}
              href={`/deals/${d.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm hover:border-teal-300"
            >
              <span>{d.title}</span>
              <StatusBadge status={d.status} />
            </Link>
          ))}
        </section>
      ) : null}
    </div>
  );
}
