import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatEtb, formatRelative } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { buttonClass } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat";

export default async function VerifyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "verifier" && user.role !== "operator") redirect("/dashboard");

  const deals = getStore().deals.filter(
    (d) =>
      d.sector === "real_estate" &&
      (d.status === "pending_verification" ||
        d.verifierId === user.id ||
        user.role === "operator")
  );
  const queue = deals.filter((d) => d.status === "pending_verification");
  const done = deals.filter((d) =>
    ["pending_release", "released"].includes(d.status)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verification queue</h1>
        <p className="mt-1 text-sm text-zinc-500">Real-estate title checks awaiting review</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="In queue" value={String(queue.length)} tone={queue.length ? "warning" : "success"} />
        <StatCard label="Cleared (sample)" value={String(done.length)} />
        <StatCard label="RE deals visible" value={String(deals.length)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Deal</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {deals
              .sort((a, b) => (a.status === "pending_verification" ? -1 : 1))
              .map((d) => (
                <tr key={d.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3 font-medium">{d.title}</td>
                  <td className="px-4 py-3 text-zinc-600">{d.location ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{formatEtb(d.amountEtb)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatRelative(d.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/deals/${d.id}`} className={buttonClass({ size: "sm", variant: d.status === "pending_verification" ? "primary" : "secondary" })}>
                      {d.status === "pending_verification" ? "Review" : "Open"}
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
