import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  dealAudit,
  findDeal,
  findUser,
} from "@/lib/store";
import { getNextActions, partyLabel } from "@/lib/deal-helpers";
import { formatDate, formatDateTime, formatEtb, formatRelative } from "@/lib/format";
import { SECTOR_LABELS } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { DealActionsPanel } from "@/components/deals/deal-actions";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const deal = findDeal(id);
  if (!deal) notFound();

  const actions = getNextActions(deal, user);
  const audit = dealAudit(deal.id);
  const buyer = findUser(deal.buyerId);
  const seller = findUser(deal.sellerId);
  const verifier = deal.verifierId ? findUser(deal.verifierId) : null;
  const mediator = deal.mediatorId ? findUser(deal.mediatorId) : null;
  const fundedMilestones = deal.milestones.filter((m) =>
    ["funded", "completed", "released"].includes(m.status)
  );
  const progress =
    deal.milestones.length === 0
      ? 0
      : Math.round(
          (deal.milestones.filter((m) =>
            ["completed", "released"].includes(m.status)
          ).length /
            deal.milestones.length) *
            100
        );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/deals" className="text-xs font-medium text-teal-800 hover:underline">
            ← Deals
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{deal.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={deal.status} />
            <Badge tone="brand">{SECTOR_LABELS[deal.sector]}</Badge>
            <span className="font-mono text-xs text-zinc-400">{deal.id}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Custody amount</p>
          <p className="text-2xl font-semibold tabular-nums">{formatEtb(deal.amountEtb)}</p>
          <p className="text-xs text-zinc-500">Fee {formatEtb(deal.feeEtb)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Overview" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Buyer</p>
                <p className="text-sm font-medium">{buyer?.name}</p>
                <p className="text-xs text-zinc-500">{buyer?.email}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Seller</p>
                <p className="text-sm font-medium">{seller?.name}</p>
                <p className="text-xs text-zinc-500">{seller?.email}</p>
              </div>
              {deal.location ? (
                <div>
                  <p className="text-xs text-zinc-500">Location</p>
                  <p className="text-sm font-medium">{deal.location}</p>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-zinc-500">Created</p>
                <p className="text-sm font-medium">{formatDateTime(deal.createdAt)}</p>
              </div>
              {verifier ? (
                <div>
                  <p className="text-xs text-zinc-500">Verifier</p>
                  <p className="text-sm font-medium">{verifier.name}</p>
                </div>
              ) : null}
              {mediator ? (
                <div>
                  <p className="text-xs text-zinc-500">Mediator</p>
                  <p className="text-sm font-medium">{mediator.name}</p>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <p className="text-xs text-zinc-500">Description</p>
                <p className="mt-1 text-sm text-zinc-700">{deal.description}</p>
              </div>
              {deal.disputeReason ? (
                <div className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <p className="text-xs font-semibold text-rose-800">Dispute reason</p>
                  <p className="mt-1 text-sm text-rose-900">{deal.disputeReason}</p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Milestones"
              description={`${progress}% complete · ${fundedMilestones.length}/${deal.milestones.length} funded or beyond`}
            />
            <div className="p-5">
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-teal-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <ul className="divide-y divide-zinc-100">
                {deal.milestones.map((m, i) => (
                  <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        <span className="mr-2 text-zinc-400">{i + 1}.</span>
                        {m.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {m.dueDate ? `Due ${formatDate(m.dueDate + "T12:00:00")}` : "No due date"}
                        {m.completedAt ? ` · done ${formatRelative(m.completedAt)}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatEtb(m.amountEtb)}
                      </p>
                      <Badge
                        tone={
                          m.status === "released"
                            ? "success"
                            : m.status === "refunded"
                              ? "neutral"
                              : m.status === "completed"
                                ? "info"
                                : m.status === "funded"
                                  ? "brand"
                                  : "neutral"
                        }
                      >
                        {m.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <CardHeader title="Audit log" description="Immutable event trail for this deal" />
            <div className="max-h-96 overflow-y-auto p-5">
              <ol className="relative space-y-4 border-l border-zinc-200 pl-4">
                {audit.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-teal-600 ring-4 ring-white" />
                    <p className="text-sm font-medium text-zinc-900">{a.action}</p>
                    <p className="text-xs text-zinc-500">
                      {a.actorName} · {formatDateTime(a.at)}
                    </p>
                    {a.detail ? (
                      <p className="mt-1 text-xs text-zinc-600">{a.detail}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <DealActionsPanel dealId={deal.id} actions={actions} />
          <Card>
            <CardHeader title="Parties" />
            <div className="space-y-3 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Buyer</span>
                <span className="font-medium">{partyLabel(deal, "buyer")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Seller</span>
                <span className="font-medium">{partyLabel(deal, "seller")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">You are</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
