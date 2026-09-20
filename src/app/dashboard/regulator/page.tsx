import { getDeals } from "@/lib/db";
import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { formatEtb, formatDate } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import Link from "next/link";
import { getSector } from "@/lib/sectors";

export default function RegulatorDashboard() {
  const deals = getDeals();
  const custody = deals.reduce((s, d) => s + d.heldEtb, 0);
  const banks = Array.from(new Set(deals.map((d) => d.bankName)));

  return (
    <DashboardShell
      role="regulator"
      subtitle="Read-only NBE supervisory view — segregated custody overview."
    >
      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
        <strong>Supervisory notice:</strong> This view is read-only. EscrowET
        (demo) does not hold client funds; partner banks maintain segregated
        accounts. No payments or KYC are live in this MVP.
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <StatCard label="Total segregated" value={formatEtb(custody)} />
        <StatCard label="Escrow accounts" value={String(deals.length)} />
        <StatCard label="Partner banks" value={String(banks.length)} />
        <StatCard
          label="Open disputes"
          value={String(deals.filter((d) => d.dispute?.status === "open").length)}
        />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-3">Partner bank exposure</h3>
        <ul className="space-y-2">
          {banks.map((b) => {
            const held = deals
              .filter((d) => d.bankName === b)
              .reduce((s, d) => s + d.heldEtb, 0);
            const count = deals.filter((d) => d.bankName === b).length;
            return (
              <li
                key={b}
                className="flex justify-between gap-3 text-sm border-b border-slate-50 py-2"
              >
                <span className="font-medium">{b}</span>
                <span className="text-slate-600">
                  {count} deals · {formatEtb(held)} held
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b font-semibold">All escrows (read-only)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400 border-b bg-slate-50">
                <th className="px-4 py-2">Reference</th>
                <th className="px-4 py-2">Sector</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Held</th>
                <th className="px-4 py-2">Bank</th>
                <th className="px-4 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id} className="border-b border-slate-50">
                  <td className="px-4 py-2">
                    <Link
                      href={`/deals/${d.id}`}
                      className="font-mono text-xs text-[#0b3d2e]"
                    >
                      {d.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{getSector(d.sector).label}</td>
                  <td className="px-4 py-2">
                    <StatusChip status={d.status} />
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {formatEtb(d.heldEtb)}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-600 max-w-[160px] truncate">
                    {d.bankName}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(d.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
