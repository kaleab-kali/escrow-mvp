"use client";

import { useState } from "react";
import type { EscrowDeal, FundingMethod, RoleId } from "@/lib/types";
import { useEscrow } from "@/lib/store";
import { StatusChip } from "./StatusChip";
import { formatEtb } from "@/lib/format";

export function DealActions({
  deal,
  role,
}: {
  deal: EscrowDeal;
  role: RoleId;
}) {
  const {
    fundDeal,
    submitEvidence,
    verifyMilestone,
    releaseMilestone,
    refundDeal,
    openDispute,
    resolveDispute,
    closeDeal,
  } = useEscrow();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [disputeReason, setDisputeReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [splitPct, setSplitPct] = useState(50);

  function run(fn: () => { ok: boolean; error?: string } | void) {
    setMsg(null);
    setPending(true);
    try {
      const res = fn();
      if (res && "ok" in res && !res.ok) {
        setMsg(res.error || "Action failed");
      } else {
        setMsg("Updated ✓");
      }
    } finally {
      setPending(false);
    }
  }

  const canFund =
    ["buyer", "operator", "bank"].includes(role) &&
    ["draft", "pending_funding"].includes(deal.status);

  const canSubmitEvidence =
    ["seller", "operator"].includes(role) &&
    !["draft", "pending_funding", "closed", "refunded"].includes(deal.status) &&
    deal.dispute?.status !== "open";

  const canVerify =
    (deal.sector === "real_estate"
      ? ["verifier", "operator"].includes(role)
      : ["buyer", "operator", "marketplace"].includes(role)) &&
    deal.dispute?.status !== "open";

  const canRelease =
    ["bank", "operator"].includes(role) && deal.dispute?.status !== "open";

  const canDispute =
    ["buyer", "seller", "operator"].includes(role) &&
    deal.heldEtb > 0 &&
    deal.dispute?.status !== "open" &&
    !["closed", "refunded", "draft", "pending_funding"].includes(deal.status);

  const canResolve =
    ["mediator", "operator"].includes(role) && deal.dispute?.status === "open";

  const canRefund =
    ["operator", "bank", "mediator"].includes(role) &&
    deal.heldEtb > 0 &&
    deal.dispute?.status !== "open";

  const canClose =
    ["operator", "bank"].includes(role) &&
    deal.heldEtb === 0 &&
    deal.status !== "closed" &&
    deal.dispute?.status !== "open";

  function canReleaseMilestone(status: string): boolean {
    if (!canRelease) return false;
    if (status === "verified") return true;
    if (status === "submitted" && deal.sector !== "real_estate" && role === "operator")
      return true;
    return false;
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-800">
          {msg}
        </div>
      )}

      {canFund && (
        <section className="card p-5">
          <h3 className="font-semibold text-slate-900">Fund escrow / ፈንድ አድርግ</h3>
          <p className="mt-1 text-sm text-slate-500">
            Simulated deposit into partner bank segregated account. Platform never
            owns the money.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="btn-primary"
              disabled={pending}
              onClick={() =>
                run(() => fundDeal(deal.id, "bank_transfer" as FundingMethod))
              }
            >
              Bank transfer
            </button>
            <button
              className="btn-secondary"
              disabled={pending}
              onClick={() =>
                run(() => fundDeal(deal.id, "mobile_money" as FundingMethod))
              }
            >
              Mobile money (Telebirr)
            </button>
          </div>
        </section>
      )}

      <section className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-4">
          Milestones / ደረጃዎች
        </h3>
        <div className="space-y-4">
          {deal.milestones.map((m, idx) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{m.title}</span>
                    <StatusChip status={m.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{m.description}</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatEtb(m.amountEtb)} · {m.percent}%
                  </p>
                </div>
              </div>
              {m.evidenceNote && (
                <p className="mt-2 text-xs text-slate-500 bg-white rounded-lg px-3 py-2 border border-slate-100">
                  Evidence: {m.evidenceNote}
                  {m.rejectionReason && (
                    <span className="block text-rose-600 mt-1">
                      Rejection: {m.rejectionReason}
                    </span>
                  )}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 items-end">
                {canSubmitEvidence &&
                  ["pending", "rejected"].includes(m.status) && (
                    <>
                      <input
                        className="input max-w-md"
                        placeholder="Evidence note / proof description"
                        value={evidence[m.id] || ""}
                        onChange={(e) =>
                          setEvidence({ ...evidence, [m.id]: e.target.value })
                        }
                      />
                      <button
                        className="btn-secondary"
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            submitEvidence(
                              deal.id,
                              m.id,
                              evidence[m.id] || "Demo evidence submitted"
                            )
                          )
                        }
                      >
                        Submit evidence
                      </button>
                    </>
                  )}
                {canVerify && m.status === "submitted" && (
                  <>
                    <button
                      className="btn-primary"
                      disabled={pending}
                      onClick={() =>
                        run(() => verifyMilestone(deal.id, m.id, true))
                      }
                    >
                      Verify / approve
                    </button>
                    <button
                      className="btn-danger"
                      disabled={pending}
                      onClick={() =>
                        run(() =>
                          verifyMilestone(
                            deal.id,
                            m.id,
                            false,
                            "Evidence insufficient (demo)"
                          )
                        )
                      }
                    >
                      Reject
                    </button>
                  </>
                )}
                {canReleaseMilestone(m.status) && (
                  <button
                    className="btn-amber"
                    disabled={pending}
                    onClick={() => run(() => releaseMilestone(deal.id, m.id))}
                  >
                    Release + fee split
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {canDispute && (
        <section className="card p-5 border-rose-200">
          <h3 className="font-semibold text-slate-900">Open dispute / ክርክር</h3>
          <textarea
            className="input mt-3 min-h-[80px]"
            placeholder="Describe the issue…"
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
          />
          <button
            className="btn-danger mt-3"
            disabled={pending || !disputeReason.trim()}
            onClick={() => run(() => openDispute(deal.id, disputeReason))}
          >
            Open dispute
          </button>
        </section>
      )}

      {deal.dispute && (
        <section className="card p-5 border-orange-200 bg-orange-50/40">
          <h3 className="font-semibold text-slate-900">
            Dispute · {deal.dispute.status}
          </h3>
          <p className="mt-2 text-sm text-slate-700">{deal.dispute.reason}</p>
          {deal.dispute.resolution && (
            <p className="mt-2 text-sm text-emerald-800">
              Resolution: {deal.dispute.resolution}
            </p>
          )}
          {canResolve && (
            <div className="mt-4 space-y-3">
              <textarea
                className="input min-h-[70px]"
                placeholder="Resolution notes"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs text-slate-600">
                  Split % to buyer:
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="input ml-2 w-20 inline-block"
                    value={splitPct}
                    onChange={(e) => setSplitPct(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-primary"
                  disabled={pending}
                  onClick={() =>
                    run(() =>
                      resolveDispute(
                        deal.id,
                        "release_to_seller",
                        resolution || "Release remaining to seller"
                      )
                    )
                  }
                >
                  Release to seller
                </button>
                <button
                  className="btn-secondary"
                  disabled={pending}
                  onClick={() =>
                    run(() =>
                      resolveDispute(
                        deal.id,
                        "refund_to_buyer",
                        resolution || "Full refund to buyer"
                      )
                    )
                  }
                >
                  Refund buyer
                </button>
                <button
                  className="btn-amber"
                  disabled={pending}
                  onClick={() =>
                    run(() =>
                      resolveDispute(
                        deal.id,
                        "split",
                        resolution || `Split ${splitPct}/${100 - splitPct}`,
                        splitPct
                      )
                    )
                  }
                >
                  Split
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {canRefund && (
          <button
            className="btn-secondary"
            disabled={pending}
            onClick={() =>
              run(() => refundDeal(deal.id, "Operator refund (demo)"))
            }
          >
            Reject / refund held funds
          </button>
        )}
        {canClose && (
          <button
            className="btn-primary"
            disabled={pending}
            onClick={() => run(() => closeDeal(deal.id))}
          >
            Close with statement
          </button>
        )}
      </div>
    </div>
  );
}
