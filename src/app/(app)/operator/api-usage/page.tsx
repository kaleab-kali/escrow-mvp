import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatDateTime, formatEtbCompact } from "@/lib/format";
import { StatCard } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";

export default async function ApiUsagePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "operator") redirect("/dashboard");

  const store = getStore();
  const logs = [...store.apiUsage].sort((a, b) => (a.at < b.at ? 1 : -1));
  const total = store.apiKeys.reduce((s, k) => s + k.requests30d, 0);
  const errors = logs.filter((l) => l.status >= 400).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API usage</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Keys and recent API calls
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Requests (30d)" value={total.toLocaleString()} />
        <StatCard label="Active keys" value={String(store.apiKeys.filter((k) => k.active).length)} />
        <StatCard
          label="Errors in sample"
          value={String(errors)}
          tone={errors ? "warning" : "success"}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold">
          API keys
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">30d req</th>
              <th className="px-4 py-3">Last used</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {store.apiKeys.map((k) => (
              <tr key={k.id}>
                <td className="px-4 py-3 font-medium">{k.partnerName}</td>
                <td className="px-4 py-3">{k.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{k.keyPrefix}_…</td>
                <td className="px-4 py-3 tabular-nums">{k.requests30d.toLocaleString()}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {k.lastUsedAt ? formatDateTime(k.lastUsedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={k.active ? "success" : "neutral"}>
                    {k.active ? "active" : "revoked"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold">
          Recent calls
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Endpoint</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs.slice(0, 30).map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2 text-zinc-500">{formatDateTime(l.at)}</td>
                <td className="px-4 py-2">{l.partnerName}</td>
                <td className="px-4 py-2 font-mono text-xs">{l.method}</td>
                <td className="px-4 py-2 font-mono text-xs">{l.endpoint}</td>
                <td className="px-4 py-2">
                  <Badge tone={l.status >= 400 ? "danger" : "success"}>{l.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
