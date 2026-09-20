import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatDateTime, formatEtb, formatEtbCompact } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat";

export default async function SettlementsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "operator") redirect("/dashboard");

  const rows = [...getStore().settlements].sort((a, b) =>
    a.settledAt < b.settledAt ? 1 : -1
  );
  const released = rows.filter((r) => r.type === "release").reduce((s, r) => s + r.amountEtb, 0);
  const refunded = rows.filter((r) => r.type === "refund").reduce((s, r) => s + r.amountEtb, 0);
  const fees = rows.filter((r) => r.type === "fee").reduce((s, r) => s + r.amountEtb, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settlements</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Releases, refunds, and fee lines with bank references
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lines" value={String(rows.length)} />
        <StatCard label="Released" value={formatEtbCompact(released)} tone="success" />
        <StatCard label="Refunded" value={formatEtbCompact(refunded)} tone="warning" />
        <StatCard label="Fees" value={formatEtbCompact(fees)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Settled</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Deal</th>
              <th className="px-4 py-3">Counterparty</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Bank ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                  No settlements yet
                </td>
              </tr>
            ) : null}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50/80">
                <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                  {formatDateTime(r.settledAt)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      r.type === "release"
                        ? "success"
                        : r.type === "refund"
                          ? "warning"
                          : "brand"
                    }
                  >
                    {r.type}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/deals/${r.dealId}`}
                    className="font-medium text-teal-800 hover:underline"
                  >
                    {r.dealTitle}
                  </Link>
                  <p className="font-mono text-[11px] text-zinc-400">{r.dealId}</p>
                </td>
                <td className="px-4 py-3">{r.counterparty}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">
                  {formatEtb(r.amountEtb)}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.bankRef}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
