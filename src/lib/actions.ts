"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import type {
  CreateDealInput,
  EscrowDeal,
  EscrowStatus,
  FundingMethod,
  RoleId,
} from "./types";
import { getDeal, getDeals, resetDatabase, upsertDeal } from "./db";
import { getSector } from "./sectors";
import { feeFromBps } from "./format";
import { DEMO_ACTORS } from "./roles";

const ROLE_COOKIE = "escrow_demo_role";

export async function getCurrentRole(): Promise<RoleId> {
  const c = cookies().get(ROLE_COOKIE)?.value as RoleId | undefined;
  return c && isRole(c) ? c : "buyer";
}

function isRole(v: string): v is RoleId {
  return [
    "buyer",
    "seller",
    "marketplace",
    "verifier",
    "bank",
    "operator",
    "regulator",
    "mediator",
  ].includes(v);
}

export async function setRole(role: RoleId) {
  cookies().set(ROLE_COOKIE, role, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/");
}

function actorName(role: RoleId): string {
  return DEMO_ACTORS[role];
}

function touch(deal: EscrowDeal): EscrowDeal {
  return { ...deal, updatedAt: new Date().toISOString() };
}

function pushAudit(
  deal: EscrowDeal,
  action: EscrowDeal["audit"][0]["action"],
  role: RoleId | "system",
  detail: string
) {
  deal.audit.unshift({
    id: uuid(),
    at: new Date().toISOString(),
    action,
    actorRole: role,
    actorName: role === "system" ? "System" : actorName(role),
    detail,
  });
}

function pushLedger(
  deal: EscrowDeal,
  type: EscrowDeal["ledger"][0]["type"],
  amountEtb: number,
  note: string,
  bankRef?: string
) {
  deal.ledger.unshift({
    id: uuid(),
    at: new Date().toISOString(),
    type,
    amountEtb,
    balanceAfterEtb: deal.heldEtb,
    note,
    bankRef,
  });
}

function recomputeStatus(deal: EscrowDeal): EscrowStatus {
  if (deal.dispute?.status === "open") return "disputed";
  if (deal.status === "closed") return "closed";
  if (deal.status === "refunded") return "refunded";
  if (deal.heldEtb === 0 && deal.releasedEtb >= deal.amountEtb) return "released";
  if (deal.releasedEtb > 0 && deal.heldEtb > 0) return "partially_released";
  if (deal.heldEtb > 0) {
    const anySubmitted = deal.milestones.some(
      (m) => m.status === "submitted" || m.status === "verified"
    );
    return anySubmitted ? "in_progress" : "funded";
  }
  if (deal.status === "pending_funding" || deal.status === "draft") {
    return deal.status;
  }
  return deal.status;
}

export async function listDealsAction(): Promise<EscrowDeal[]> {
  return getDeals();
}

export async function getDealAction(id: string): Promise<EscrowDeal | null> {
  return getDeal(id) ?? null;
}

export async function createDealAction(
  input: CreateDealInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const sector = getSector(input.sector);
  if (!input.title?.trim() || !input.amountEtb || input.amountEtb <= 0) {
    return { ok: false, error: "Title and a positive amount are required." };
  }
  const feeEtb = feeFromBps(input.amountEtb, sector.feeBps);
  const milestones = sector.defaultMilestones.map((m) => ({
    id: uuid(),
    title: m.title,
    description: m.description,
    percent: m.percent,
    amountEtb: Math.round((input.amountEtb * m.percent) / 100),
    status: "pending" as const,
  }));

  const banks = [
    "Awash Bank — Escrow Custody",
    "Dashen Bank — Segregated Trust",
    "Bank of Abyssinia — Escrow Desk",
    "Cooperative Bank of Oromia — Custody",
  ];
  const ref = `ESC-${input.sector.slice(0, 2).toUpperCase()}-2026-${String(
    Math.floor(Math.random() * 900) + 100
  )}`;

  const deal: EscrowDeal = {
    id: uuid(),
    reference: ref,
    sector: input.sector,
    title: input.title.trim(),
    description: input.description?.trim() || sector.description,
    status: "pending_funding",
    amountEtb: input.amountEtb,
    currency: "ETB",
    feeBps: sector.feeBps,
    feeEtb,
    heldEtb: 0,
    releasedEtb: 0,
    refundedEtb: 0,
    buyer: {
      id: uuid(),
      name: input.buyerName?.trim() || "Demo Buyer",
      role: "buyer",
      city: "Addis Ababa",
    },
    seller: {
      id: uuid(),
      name: input.sellerName?.trim() || "Demo Seller",
      role: "seller",
      city: "Addis Ababa",
    },
    bankName: banks[Math.floor(Math.random() * banks.length)],
    fundingMethod: input.fundingMethod,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    milestones,
    ledger: [],
    audit: [],
    location: input.location?.trim() || "Addis Ababa",
    inspectionDays: input.sector === "ecommerce" ? 3 : undefined,
  };
  pushAudit(deal, "created", "operator", `Escrow created from ${sector.label} template`);
  upsertDeal(deal);
  revalidatePath("/");
  revalidatePath("/deals");
  return { ok: true, id: deal.id };
}

export async function fundDealAction(
  dealId: string,
  method: FundingMethod
): Promise<{ ok: boolean; error?: string }> {
  const deal = getDeal(dealId);
  if (!deal) return { ok: false, error: "Deal not found" };
  if (!["draft", "pending_funding"].includes(deal.status)) {
    return { ok: false, error: "Deal is not awaiting funding" };
  }
  deal.fundingMethod = method;
  deal.fundedAt = new Date().toISOString();
  deal.heldEtb = deal.amountEtb;
  deal.status = "funded";
  const ref = `SIM-${method === "mobile_money" ? "MM" : "BT"}-${Date.now()
    .toString()
    .slice(-6)}`;
  pushLedger(
    deal,
    "deposit",
    deal.amountEtb,
    method === "mobile_money"
      ? "Simulated Telebirr / mobile money deposit"
      : "Simulated bank transfer deposit",
    ref
  );
  pushLedger(deal, "hold", deal.amountEtb, `Segregated hold — ${deal.bankName}`, ref);
  pushAudit(
    deal,
    "funded",
    "buyer",
    `Funded ${deal.amountEtb.toLocaleString()} ETB via ${method} (simulated)`
  );
  upsertDeal(touch(deal));
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function submitEvidenceAction(
  dealId: string,
  milestoneId: string,
  note: string
): Promise<{ ok: boolean; error?: string }> {
  const deal = getDeal(dealId);
  if (!deal) return { ok: false, error: "Deal not found" };
  if (deal.dispute?.status === "open") {
    return { ok: false, error: "Deal is in dispute" };
  }
  const ms = deal.milestones.find((m) => m.id === milestoneId);
  if (!ms) return { ok: false, error: "Milestone not found" };
  if (!["pending", "rejected"].includes(ms.status)) {
    return { ok: false, error: "Milestone cannot accept evidence now" };
  }
  ms.status = "submitted";
  ms.evidenceNote = note.trim() || "Evidence submitted (demo)";
  ms.evidenceAt = new Date().toISOString();
  ms.rejectionReason = undefined;
  pushAudit(
    deal,
    "evidence_submitted",
    "seller",
    `Evidence for “${ms.title}”: ${ms.evidenceNote}`
  );
  deal.status = recomputeStatus(deal);
  upsertDeal(touch(deal));
  revalidatePath(`/deals/${dealId}`);
  return { ok: true };
}

export async function verifyMilestoneAction(
  dealId: string,
  milestoneId: string,
  approve: boolean,
  reason?: string
): Promise<{ ok: boolean; error?: string }> {
  const role = await getCurrentRole();
  const deal = getDeal(dealId);
  if (!deal) return { ok: false, error: "Deal not found" };
  const ms = deal.milestones.find((m) => m.id === milestoneId);
  if (!ms || ms.status !== "submitted") {
    return { ok: false, error: "Milestone is not awaiting verification" };
  }
  const verifierRole: RoleId =
    deal.sector === "real_estate"
      ? role === "verifier" || role === "operator"
        ? role
        : "verifier"
      : role === "buyer" || role === "operator" || role === "marketplace"
        ? role
        : "buyer";

  if (approve) {
    ms.status = "verified";
    ms.verifiedBy = actorName(verifierRole);
    ms.verifiedAt = new Date().toISOString();
    pushAudit(
      deal,
      "milestone_verified",
      verifierRole,
      `Verified “${ms.title}”`
    );
  } else {
    ms.status = "rejected";
    ms.rejectionReason = reason?.trim() || "Evidence insufficient";
    ms.verifiedAt = new Date().toISOString();
    pushAudit(
      deal,
      "milestone_rejected",
      verifierRole,
      `Rejected “${ms.title}”: ${ms.rejectionReason}`
    );
  }
  deal.status = recomputeStatus(deal);
  upsertDeal(touch(deal));
  revalidatePath(`/deals/${dealId}`);
  return { ok: true };
}

export async function releaseMilestoneAction(
  dealId: string,
  milestoneId: string
): Promise<{ ok: boolean; error?: string }> {
  const deal = getDeal(dealId);
  if (!deal) return { ok: false, error: "Deal not found" };
  if (deal.dispute?.status === "open") {
    return { ok: false, error: "Cannot release while disputed" };
  }
  const ms = deal.milestones.find((m) => m.id === milestoneId);
  if (!ms || !["verified", "submitted"].includes(ms.status)) {
    return { ok: false, error: "Milestone not ready for release" };
  }
  // Allow bank/operator to release verified; for ecommerce submitted+buyer can also
  if (ms.amountEtb > deal.heldEtb) {
    return { ok: false, error: "Insufficient held balance" };
  }
  const fee = feeFromBps(ms.amountEtb, deal.feeBps);
  const netToSeller = ms.amountEtb - fee;
  deal.heldEtb -= ms.amountEtb;
  deal.releasedEtb += ms.amountEtb;
  ms.status = "released";
  ms.releasedAt = new Date().toISOString();
  if (!ms.verifiedAt) {
    ms.verifiedAt = ms.releasedAt;
    ms.verifiedBy = actorName("bank");
  }
  const ref = `REL-${Date.now().toString().slice(-6)}`;
  pushLedger(
    deal,
    "release",
    ms.amountEtb,
    `Release “${ms.title}” — net ${netToSeller.toLocaleString()} ETB to seller`,
    ref
  );
  if (fee > 0) {
    pushLedger(
      deal,
      "fee",
      fee,
      `Platform fee ${(deal.feeBps / 100).toFixed(2)}% on milestone`,
      ref
    );
  }
  pushAudit(
    deal,
    "partial_release",
    "bank",
    `Released ${ms.amountEtb.toLocaleString()} ETB for “${ms.title}” (fee ${fee.toLocaleString()} ETB)`
  );

  const allReleased = deal.milestones.every((m) => m.status === "released");
  if (allReleased && deal.heldEtb === 0) {
    deal.status = "released";
    pushAudit(deal, "full_release", "bank", "All milestones released");
  } else {
    deal.status = recomputeStatus(deal);
  }
  upsertDeal(touch(deal));
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/dashboard/bank");
  return { ok: true };
}

export async function refundDealAction(
  dealId: string,
  reason?: string
): Promise<{ ok: boolean; error?: string }> {
  const deal = getDeal(dealId);
  if (!deal) return { ok: false, error: "Deal not found" };
  if (deal.heldEtb <= 0) return { ok: false, error: "Nothing to refund" };
  const amount = deal.heldEtb;
  deal.heldEtb = 0;
  deal.refundedEtb += amount;
  deal.status = "refunded";
  const ref = `RFD-${Date.now().toString().slice(-6)}`;
  pushLedger(deal, "refund", amount, reason || "Refund to buyer", ref);
  pushAudit(
    deal,
    "refund",
    "operator",
    `Refunded ${amount.toLocaleString()} ETB to buyer${reason ? `: ${reason}` : ""}`
  );
  upsertDeal(touch(deal));
  revalidatePath(`/deals/${dealId}`);
  return { ok: true };
}

export async function openDisputeAction(
  dealId: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  const role = await getCurrentRole();
  const deal = getDeal(dealId);
  if (!deal) return { ok: false, error: "Deal not found" };
  if (deal.dispute?.status === "open") {
    return { ok: false, error: "Dispute already open" };
  }
  if (!reason.trim()) return { ok: false, error: "Reason required" };
  deal.dispute = {
    id: uuid(),
    openedAt: new Date().toISOString(),
    openedBy: role,
    reason: reason.trim(),
    status: "open",
  };
  deal.status = "disputed";
  pushAudit(deal, "dispute_opened", role, reason.trim());
  upsertDeal(touch(deal));
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/dashboard/mediator");
  return { ok: true };
}

export async function resolveDisputeAction(
  dealId: string,
  outcome: "release_to_seller" | "refund_to_buyer" | "split",
  resolution: string,
  splitBuyerPercent?: number
): Promise<{ ok: boolean; error?: string }> {
  const deal = getDeal(dealId);
  if (!deal || !deal.dispute || deal.dispute.status !== "open") {
    return { ok: false, error: "No open dispute" };
  }
  const held = deal.heldEtb;
  if (outcome === "refund_to_buyer" && held > 0) {
    deal.heldEtb = 0;
    deal.refundedEtb += held;
    pushLedger(deal, "refund", held, "Dispute resolution — refund to buyer");
    deal.status = "refunded";
  } else if (outcome === "release_to_seller" && held > 0) {
    const fee = feeFromBps(held, deal.feeBps);
    deal.heldEtb = 0;
    deal.releasedEtb += held;
    pushLedger(deal, "release", held, "Dispute resolution — release to seller");
    if (fee > 0) pushLedger(deal, "fee", fee, "Fee on dispute release");
    deal.milestones.forEach((m) => {
      if (m.status !== "released") {
        m.status = "released";
        m.releasedAt = new Date().toISOString();
      }
    });
    deal.status = "released";
  } else if (outcome === "split" && held > 0) {
    const buyerPct = Math.min(100, Math.max(0, splitBuyerPercent ?? 50));
    const toBuyer = Math.round((held * buyerPct) / 100);
    const toSeller = held - toBuyer;
    deal.heldEtb = 0;
    deal.refundedEtb += toBuyer;
    deal.releasedEtb += toSeller;
    if (toBuyer > 0) pushLedger(deal, "refund", toBuyer, `Split: ${buyerPct}% to buyer`);
    if (toSeller > 0)
      pushLedger(deal, "release", toSeller, `Split: ${100 - buyerPct}% to seller`);
    deal.status = toSeller > 0 && toBuyer > 0 ? "closed" : toBuyer > 0 ? "refunded" : "released";
  }
  deal.dispute.status = "resolved";
  deal.dispute.resolution = resolution.trim() || `Resolved: ${outcome}`;
  deal.dispute.resolvedAt = new Date().toISOString();
  deal.dispute.resolvedBy = "mediator";
  deal.dispute.outcome = outcome;
  deal.dispute.splitBuyerPercent = splitBuyerPercent;
  pushAudit(
    deal,
    "dispute_resolved",
    "mediator",
    `${outcome}: ${deal.dispute.resolution}`
  );
  upsertDeal(touch(deal));
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/dashboard/mediator");
  return { ok: true };
}

export async function closeDealAction(
  dealId: string
): Promise<{ ok: boolean; error?: string }> {
  const deal = getDeal(dealId);
  if (!deal) return { ok: false, error: "Deal not found" };
  if (deal.heldEtb > 0) {
    return { ok: false, error: "Cannot close while funds still held" };
  }
  if (deal.dispute?.status === "open") {
    return { ok: false, error: "Resolve dispute before closing" };
  }
  deal.status = "closed";
  deal.closedAt = new Date().toISOString();
  pushAudit(deal, "closed", "operator", "Deal closed — statement available");
  upsertDeal(touch(deal));
  revalidatePath(`/deals/${dealId}`);
  return { ok: true };
}

export async function resetDemoAction(): Promise<void> {
  resetDatabase();
  revalidatePath("/");
  revalidatePath("/deals");
}
