import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore, findUser } from "@/lib/store";
import { formatEtb, formatRelative } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export default async function DisputesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "operator") redirect("/dashboard");

  const disputes = getStore().deals.filter((d) => d.status === "disputed");
  const resolved = getStore().deals.filter(
    (d) => d.disputeReason && d.status !== "disputed"
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Disputes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Open cases and recently resolved (refund / release)
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Open ({disputes.length})</h2>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Mediator</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {disputes.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3">
                    <Link href={`/deals/${d.id}`} className="font-medium text-teal-800 hover:underline">
                      {d.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatEtb(d.amountEtb)}</td>
                  <td className="px-4 py-3">
                    {d.mediatorId ? findUser(d.mediatorId)?.name : "—"}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-zinc-600">
                    {d.disputeReason}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatRelative(d.updatedAt)}</td>
                </tr>
              ))}
              {disputes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    No open disputes
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Resolved with dispute history</h2>
        <div className="space-y-2">
          {resolved.map((d) => (
            <Link
              key={d.id}
              href={`/deals/${d.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm hover:border-teal-300"
            >
              <span className="font-medium">{d.title}</span>
              <StatusBadge status={d.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
