import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatEtb } from "@/lib/format";
import { partyLabel } from "@/lib/deal-helpers";
import { SECTOR_LABELS, type Deal } from "@/lib/types";

export function DealsTable({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-zinc-800">No deals found</p>
        <p className="mt-1 text-xs text-zinc-500">Try clearing filters or create a new deal.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Deal</th>
              <th className="px-4 py-3 font-medium">Sector</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {deals.map((d) => (
              <tr key={d.id} className="hover:bg-teal-50/40">
                <td className="px-4 py-3">
                  <Link href={`/deals/${d.id}`} className="font-medium text-teal-800 hover:underline">
                    {d.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{d.id}</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">{SECTOR_LABELS[d.sector]}</td>
                <td className="px-4 py-3 font-medium tabular-nums">{formatEtb(d.amountEtb)}</td>
                <td className="px-4 py-3 text-zinc-600">{partyLabel(d, "buyer")}</td>
                <td className="px-4 py-3 text-zinc-600">{partyLabel(d, "seller")}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3 text-zinc-500">{formatDate(d.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
