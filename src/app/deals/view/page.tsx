"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEscrow } from "@/lib/store";
import { StatusChip } from "@/components/StatusChip";
import { DealTimeline } from "@/components/DealTimeline";
import { DealActions } from "@/components/DealActions";
import { formatEtb, formatDate } from "@/lib/format";
import { getSector } from "@/lib/sectors";
import { MapPin, Building, Users, Landmark } from "lucide-react";

function DealDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const { getDeal, role } = useEscrow();
  const deal = getDeal(id);

  if (!deal) {
    return (
      <div className="card p-8 text-center space-y-3">
        <h1 className="text-xl font-bold text-slate-900">Deal not found</h1>
        <p className="text-sm text-slate-500">
          No escrow with this id in local demo data. Try resetting from the Operator dashboard.
        </p>
        <Link href="/deals" className="btn-primary inline-flex">
          ← All deals
        </Link>
      </div>
    );
  }

  const sector = getSector(deal.sector);
  const feeOnHeld = Math.round((deal.heldEtb * deal.feeBps) / 10000);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusChip status={deal.status} />
            <span className="text-xs font-medium text-slate-500">
              {sector.label} · {sector.labelAm}
            </span>
            <span className="font-mono text-xs text-slate-400">
              {deal.reference}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{deal.title}</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            {deal.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {deal.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5" />
              {deal.bankName}
            </span>
            <span>Updated {formatDate(deal.updatedAt)}</span>
          </div>
        </div>
        <Link href="/deals" className="btn-secondary">
          ← All deals
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">
            Principal
          </div>
          <div className="mt-1 text-xl font-bold">{formatEtb(deal.amountEtb)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">
            Held
          </div>
          <div className="mt-1 text-xl font-bold text-sky-800">
            {formatEtb(deal.heldEtb)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">
            Released
          </div>
          <div className="mt-1 text-xl font-bold text-emerald-800">
            {formatEtb(deal.releasedEtb)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">
            Platform fee
          </div>
          <div className="mt-1 text-xl font-bold">
            {(deal.feeBps / 100).toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500">
            Est. on held: {formatEtb(feeOnHeld)}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DealActions deal={deal} role={role} />

          <section className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-3">
              Bank ledger / የባንክ መዝገብ
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-400 border-b">
                    <th className="pb-2 pr-3">When</th>
                    <th className="pb-2 pr-3">Type</th>
                    <th className="pb-2 pr-3">Amount</th>
                    <th className="pb-2 pr-3">Balance</th>
                    <th className="pb-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {deal.ledger.map((e) => (
                    <tr key={e.id} className="border-b border-slate-50">
                      <td className="py-2 pr-3 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(e.at)}
                      </td>
                      <td className="py-2 pr-3 capitalize font-medium">
                        {e.type}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {formatEtb(e.amountEtb)}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {formatEtb(e.balanceAfterEtb)}
                      </td>
                      <td className="py-2 text-slate-600">
                        {e.note}
                        {e.bankRef && (
                          <span className="block text-xs text-slate-400 font-mono">
                            {e.bankRef}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {deal.ledger.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-slate-500">
                        No ledger entries — awaiting funding.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" /> Parties
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400">
                  Buyer / ገዢ
                </div>
                <div className="font-medium">{deal.buyer.name}</div>
                {deal.buyer.phone && (
                  <div className="text-slate-500 text-xs">{deal.buyer.phone}</div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400">
                  Seller / ሻጭ
                </div>
                <div className="font-medium">{deal.seller.name}</div>
                {deal.seller.phone && (
                  <div className="text-slate-500 text-xs">{deal.seller.phone}</div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400">
                  Custody bank
                </div>
                <div className="font-medium flex items-start gap-1">
                  <Building className="h-4 w-4 mt-0.5 shrink-0" />
                  {deal.bankName}
                </div>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-4">
              Audit trail / ኦዲት
            </h2>
            <DealTimeline events={deal.audit} />
          </section>

          {(deal.status === "closed" ||
            deal.status === "released" ||
            deal.status === "refunded") && (
            <section className="card p-5 bg-[#0b3d2e] text-white">
              <h2 className="font-semibold mb-2">Closing statement</h2>
              <dl className="space-y-1 text-sm text-white/90">
                <div className="flex justify-between">
                  <dt>Principal</dt>
                  <dd>{formatEtb(deal.amountEtb)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Released to seller</dt>
                  <dd>{formatEtb(deal.releasedEtb)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Refunded to buyer</dt>
                  <dd>{formatEtb(deal.refundedEtb)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Still held</dt>
                  <dd>{formatEtb(deal.heldEtb)}</dd>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-1 mt-1">
                  <dt>Platform fee (schedule)</dt>
                  <dd>
                    {(deal.feeBps / 100).toFixed(2)}% · {formatEtb(deal.feeEtb)}{" "}
                    max
                  </dd>
                </div>
              </dl>
              {deal.closedAt && (
                <p className="mt-3 text-xs text-white/60">
                  Closed {formatDate(deal.closedAt)}
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DealViewPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading deal…</div>}>
      <DealDetailInner />
    </Suspense>
  );
}
