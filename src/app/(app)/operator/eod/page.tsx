import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { generateEodPack, archiveEodPack } from "@/lib/actions/operator";
import { OPERATOR_BANKS } from "@/lib/constants";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat";
import { formatDateTime, formatEtb, formatEtbCompact } from "@/lib/format";

export default async function EodPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "operator") redirect("/dashboard");

  const packs = [...getStore().eodPacks].sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
  const banks = OPERATOR_BANKS;
  const today = new Date().toISOString().slice(0, 10);

  // Keep last 7 days visible prominently
  const week = packs.filter((p) => {
    const d = new Date(p.date + "T12:00:00");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return d >= cutoff;
  });

  const weekCustodyAvg = week.length
    ? Math.round(week.reduce((s, p) => s + p.custodyBalanceEtb, 0) / week.length)
    : 0;
  const weekInflow = week.reduce((s, p) => s + p.inflowEtb, 0);
  const weekOutflow = week.reduce((s, p) => s + p.outflowEtb, 0);
  const pendingArchive = packs.filter((p) => p.status === "generated").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">EOD custody packs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          End-of-day custody snapshots for partner banks.
        </p>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Packs (7d)" value={String(week.length)} />
        <StatCard label="Avg custody (7d)" value={formatEtbCompact(weekCustodyAvg)} />
        <StatCard label="Inflow (7d)" value={formatEtbCompact(weekInflow)} tone="success" />
        <StatCard label="Pending archive" value={String(pendingArchive)} tone={pendingArchive ? "warning" : "default"} />
      </div>

      <Card>
        <CardHeader title="Generate pack" description="Creates a custody snapshot for a bank + date" />
        <form action={generateEodPack} className="flex flex-wrap items-end gap-3 p-5">
          <div>
            <label className="text-xs font-medium text-zinc-500">Bank</label>
            <select
              name="bankName"
              className="mt-1 block rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              defaultValue={banks[0]}
            >
              {banks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={today}
              className="mt-1 block rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className={buttonClass()}>
            Generate EOD pack
          </button>
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Last 7 days ({week.length} packs)</h2>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Bank</th>
                <th className="px-4 py-3 font-medium">Custody</th>
                <th className="px-4 py-3 font-medium">Inflow</th>
                <th className="px-4 py-3 font-medium">Outflow</th>
                <th className="px-4 py-3 font-medium">Deals</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Generated</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {week.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-zinc-500">
                    No packs in the last 7 days — generate one above.
                  </td>
                </tr>
              ) : null}
              {week.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3 font-medium tabular-nums">{p.date}</td>
                  <td className="px-4 py-3">{p.bankName}</td>
                  <td className="px-4 py-3 tabular-nums">{formatEtb(p.custodyBalanceEtb)}</td>
                  <td className="px-4 py-3 tabular-nums text-emerald-700">
                    +{formatEtb(p.inflowEtb)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-rose-700">
                    −{formatEtb(p.outflowEtb)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{p.dealCount}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "archived" ? "neutral" : "info"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {formatDateTime(p.generatedAt)}
                    <br />
                    by {p.generatedBy}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "generated" ? (
                      <form action={archiveEodPack.bind(null, p.id)}>
                        <button type="submit" className={buttonClass({ variant: "ghost", size: "sm" })}>
                          Archive
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-zinc-400">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Full archive</h2>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Pack ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Bank</th>
                <th className="px-4 py-3">Custody</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {packs.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-2 tabular-nums">{p.date}</td>
                  <td className="px-4 py-2">{p.bankName}</td>
                  <td className="px-4 py-2 tabular-nums">{formatEtb(p.custodyBalanceEtb)}</td>
                  <td className="px-4 py-2">
                    <Badge tone={p.status === "archived" ? "neutral" : "info"}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
