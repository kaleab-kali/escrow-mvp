import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import {
  createApiKey,
  createWebhook,
  revokeApiKey,
  toggleWebhook,
} from "@/lib/actions/partners";
import { formatDateTime } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat";

const API_REF: Array<[string, string, string]> = [
  ["POST", "/v1/deals", "Create escrow deal from marketplace checkout"],
  ["GET", "/v1/deals/:id", "Fetch deal status + milestones"],
  ["POST", "/v1/deals/:id/fund", "Confirm buyer funding notification"],
  ["POST", "/v1/deals/:id/release", "Release custody to seller"],
  ["POST", "/v1/webhooks/test", "Send a test delivery"],
];

export default async function PartnersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const store = getStore();
  const keys = store.apiKeys;
  const hooks = store.webhooks;
  const usage = [...store.apiUsage].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 12);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Developer</h1>
        <p className="mt-1 text-sm text-zinc-500">
          API keys, webhooks, and usage for partner integrations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active API keys" value={String(keys.filter((k) => k.active).length)} />
        <StatCard label="Webhooks" value={String(hooks.length)} />
        <StatCard
          label="30d requests"
          value={keys.reduce((s, k) => s + k.requests30d, 0).toLocaleString()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Create API key" description="Shown once in the table after creation" />
          <form action={createApiKey} className="space-y-3 p-5">
            <div>
              <label className="text-xs font-medium text-zinc-500">Key name</label>
              <input
                name="name"
                required
                placeholder="Production"
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">Organization</label>
              <input
                name="partnerName"
                required
                placeholder="Acme Commerce"
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className={buttonClass()}>
              Generate key
            </button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Register webhook" />
          <form action={createWebhook} className="space-y-3 p-5">
            <div>
              <label className="text-xs font-medium text-zinc-500">URL</label>
              <input
                name="url"
                required
                placeholder="https://api.partner.et/hooks/escrow"
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">Partner</label>
              <input
                name="partnerName"
                required
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">
                Events (comma-separated)
              </label>
              <input
                name="events"
                defaultValue="deal.funded,deal.released,deal.disputed"
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className={buttonClass()}>
              Add webhook
            </button>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader title="API keys" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">30d</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {keys.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3 font-medium">{k.partnerName}</td>
                  <td className="px-4 py-3">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {k.keyPrefix}_••••{k.fullKey.slice(-4)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{k.requests30d.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge tone={k.active ? "success" : "neutral"}>
                      {k.active ? "active" : "revoked"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {k.active ? (
                      <form action={revokeApiKey.bind(null, k.id)}>
                        <button
                          type="submit"
                          className={buttonClass({ variant: "ghost", size: "sm" })}
                        >
                          Revoke
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Webhooks" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Events</th>
                <th className="px-4 py-3">Success</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {hooks.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-3 font-medium">{h.partnerName}</td>
                  <td className="px-4 py-3 max-w-xs truncate font-mono text-xs">{h.url}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{h.events.join(", ")}</td>
                  <td className="px-4 py-3 tabular-nums">{h.successRate}%</td>
                  <td className="px-4 py-3">
                    <Badge tone={h.active ? "success" : "neutral"}>
                      {h.active ? "active" : "paused"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleWebhook.bind(null, h.id)}>
                      <button
                        type="submit"
                        className={buttonClass({ variant: "secondary", size: "sm" })}
                      >
                        {h.active ? "Pause" : "Enable"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="API reference" description="REST endpoints" />
        <div className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {API_REF.map(([m, e, p]) => (
                <tr key={e}>
                  <td className="px-4 py-2 font-mono text-xs font-semibold text-teal-800">{m}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e}</td>
                  <td className="px-4 py-2 text-zinc-600">{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Recent requests" />
        <div className="overflow-x-auto">
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
              {usage.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-2 whitespace-nowrap text-zinc-500">{formatDateTime(u.at)}</td>
                  <td className="px-4 py-2">{u.partnerName}</td>
                  <td className="px-4 py-2 font-mono text-xs">{u.method}</td>
                  <td className="px-4 py-2 font-mono text-xs">{u.endpoint}</td>
                  <td className="px-4 py-2">
                    <Badge tone={u.status >= 400 ? "danger" : "success"}>{u.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
