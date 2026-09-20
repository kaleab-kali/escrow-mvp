import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { getAuditCsv } from "@/lib/actions/operator";
import { formatDateTime } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";

export default async function AuditPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "operator") redirect("/dashboard");

  const rows = getStore().audit.slice(0, 100);
  const csv = await getAuditCsv();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Platform-wide events · CSV export for compliance
          </p>
        </div>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
          download={`escrowet-audit-${new Date().toISOString().slice(0, 10)}.csv`}
          className={buttonClass()}
        >
          Download CSV
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Deal</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50/80">
                <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                  {formatDateTime(r.at)}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-medium">{r.action}</td>
                <td className="px-4 py-3">{r.actorName}</td>
                <td className="px-4 py-3">
                  {r.dealId === "system" ? (
                    <span className="text-zinc-400">system</span>
                  ) : (
                    <Link
                      href={`/deals/${r.dealId}`}
                      className="font-mono text-xs text-teal-800 hover:underline"
                    >
                      {r.dealId}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600">{r.detail ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
