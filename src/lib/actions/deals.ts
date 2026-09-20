"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v4 as uuid } from "uuid";
import { requireUser } from "@/lib/auth";
import { feeForAmount } from "@/lib/format";
import {
  appendAudit,
  findDeal,
  findUser,
  getStore,
} from "@/lib/store";
import type { Deal, DealStatus, Milestone, Sector } from "@/lib/types";

function touch(deal: Deal) {
  deal.updatedAt = new Date().toISOString();
}

function revalidateDeal(id: string) {
  revalidatePath("/dashboard");
  revalidatePath("/deals");
  revalidatePath(`/deals/${id}`);
  revalidatePath("/operator");
  revalidatePath("/verify");
  revalidatePath("/mediate");
}

export async function createDealAction(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const sector = String(formData.get("sector") || "ecommerce") as Sector;
  const description = String(formData.get("description") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const amountEtb = Number(formData.get("amountEtb") || 0);
  const sellerId = String(formData.get("sellerId") || "");
  const milestoneJson = String(formData.get("milestones") || "[]");

  if (!title || amountEtb <= 0 || !sellerId) {
    throw new Error("Title, amount, and seller are required");
  }

  let milestones: Milestone[] = [];
  try {
    const parsed = JSON.parse(milestoneJson) as Array<{
      title: string;
      amountEtb: number;
      dueDate?: string;
    }>;
    milestones = parsed.map((m) => ({
      id: uuid(),
      title: m.title,
      amountEtb: Number(m.amountEtb),
      status: "pending" as const,
      dueDate: m.dueDate,
    }));
  } catch {
    milestones = [
      {
        id: uuid(),
        title: "Full amount",
        amountEtb,
        status: "pending",
      },
    ];
  }

  if (milestones.length === 0) {
    milestones = [
      { id: uuid(), title: "Full amount", amountEtb, status: "pending" },
    ];
  }

  const deal: Deal = {
    id: `deal-${uuid().slice(0, 8)}`,
    title,
    sector,
    status: "pending_acceptance",
    amountEtb,
    feeEtb: feeForAmount(amountEtb),
    currency: "ETB",
    buyerId: user.role === "buyer" ? user.id : String(formData.get("buyerId") || user.id),
    sellerId,
    verifierId: sector === "real_estate" ? "user-verifier-1" : undefined,
    description,
    location: location || undefined,
    milestones,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (user.role === "seller") {
    deal.sellerId = user.id;
    deal.buyerId = String(formData.get("buyerId") || "user-buyer-1");
  }

  const store = getStore();
  store.deals.unshift(deal);
  appendAudit({
    dealId: deal.id,
    at: deal.createdAt,
    actorId: user.id,
    actorName: user.name,
    action: "deal.created",
    detail: `${title} · ${amountEtb} ETB`,
  });

  revalidateDeal(deal.id);
  redirect(`/deals/${deal.id}`);
}

export async function acceptDeal(dealId: string) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  if (deal.sellerId !== user.id && user.role !== "operator") {
    throw new Error("Only seller can accept");
  }
  if (deal.status !== "pending_acceptance") throw new Error("Invalid state");

  deal.status = "awaiting_funds";
  touch(deal);
  appendAudit({
    dealId,
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    action: "deal.accepted",
  });
  revalidateDeal(dealId);
}

export async function fundDeal(dealId: string) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  if (deal.buyerId !== user.id && user.role !== "operator") {
    throw new Error("Only buyer can fund");
  }
  if (deal.status !== "awaiting_funds") throw new Error("Invalid state");

  deal.status = "funded";
  deal.fundedAt = new Date().toISOString();
  deal.milestones = deal.milestones.map((m) =>
    m.status === "pending" ? { ...m, status: "funded" as const } : m
  );
  touch(deal);
  appendAudit({
    dealId,
    at: deal.fundedAt,
    actorId: user.id,
    actorName: user.name,
    action: "funds.received",
    detail: `${deal.amountEtb} ETB into custody`,
  });
  revalidateDeal(dealId);
}

export async function startWork(dealId: string) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  if (deal.sellerId !== user.id && user.role !== "operator") {
    throw new Error("Only seller can start");
  }
  if (deal.status !== "funded") throw new Error("Invalid state");

  deal.status = "in_progress";
  touch(deal);
  appendAudit({
    dealId,
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    action: "deal.started",
  });
  revalidateDeal(dealId);
}

export async function requestVerification(dealId: string) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  if (!["in_progress", "funded"].includes(deal.status)) {
    throw new Error("Invalid state");
  }

  deal.status = "pending_verification";
  deal.verifierId = deal.verifierId || "user-verifier-1";
  touch(deal);
  appendAudit({
    dealId,
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    action: "verification.requested",
  });
  revalidateDeal(dealId);
}

export async function approveVerification(dealId: string) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  if (user.role !== "verifier" && user.role !== "operator") {
    throw new Error("Only verifier/operator");
  }
  if (deal.status !== "pending_verification") throw new Error("Invalid state");

  deal.status = "pending_release";
  touch(deal);
  appendAudit({
    dealId,
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    action: "verification.approved",
  });
  revalidateDeal(dealId);
}

export async function rejectVerification(dealId: string) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  if (user.role !== "verifier" && user.role !== "operator") {
    throw new Error("Only verifier/operator");
  }
  if (deal.status !== "pending_verification") throw new Error("Invalid state");

  deal.status = "in_progress";
  touch(deal);
  appendAudit({
    dealId,
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    action: "verification.rejected",
    detail: "Returned to parties with findings",
  });
  revalidateDeal(dealId);
}

export async function markComplete(dealId: string) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  if (deal.sellerId !== user.id && user.role !== "operator") {
    throw new Error("Only seller");
  }

  const active = deal.milestones.find(
    (m) => m.status === "funded" || m.status === "pending"
  );
  if (active) {
    active.status = "completed";
    active.completedAt = new Date().toISOString();
  }
  deal.status = "pending_release";
  touch(deal);
  appendAudit({
    dealId,
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    action: "milestone.completed",
    detail: active?.title,
  });
  revalidateDeal(dealId);
}

export async function releaseDeal(dealId: string) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  const allowed =
    user.id === deal.buyerId ||
    user.role === "operator" ||
    user.role === "mediator";
  if (!allowed) throw new Error("Not allowed to release");

  const now = new Date().toISOString();
  deal.status = "released";
  deal.releasedAt = now;
  deal.milestones = deal.milestones.map((m) =>
    m.status === "refunded" ? m : { ...m, status: "released" as const }
  );
  touch(deal);

  const store = getStore();
  store.settlements.unshift({
    id: uuid(),
    dealId: deal.id,
    dealTitle: deal.title,
    type: "release",
    amountEtb: deal.amountEtb,
    counterparty: findUser(deal.sellerId)?.name ?? deal.sellerId,
    settledAt: now,
    bankRef: `REL-${Date.now().toString().slice(-6)}`,
  });
  store.settlements.unshift({
    id: uuid(),
    dealId: deal.id,
    dealTitle: deal.title,
    type: "fee",
    amountEtb: deal.feeEtb,
    counterparty: "EscrowET",
    settledAt: now,
    bankRef: `FEE-${Date.now().toString().slice(-6)}`,
  });

  appendAudit({
    dealId,
    at: now,
    actorId: user.id,
    actorName: user.name,
    action: "funds.released",
    detail: `Released ${deal.amountEtb} ETB to seller`,
  });
  revalidateDeal(dealId);
}

export async function refundDeal(dealId: string) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  const allowed =
    user.role === "operator" ||
    user.role === "mediator" ||
    user.id === deal.buyerId;
  if (!allowed) throw new Error("Not allowed to refund");

  const now = new Date().toISOString();
  deal.status = "refunded";
  deal.milestones = deal.milestones.map((m) => ({
    ...m,
    status: "refunded" as const,
  }));
  touch(deal);

  getStore().settlements.unshift({
    id: uuid(),
    dealId: deal.id,
    dealTitle: deal.title,
    type: "refund",
    amountEtb: deal.amountEtb,
    counterparty: findUser(deal.buyerId)?.name ?? deal.buyerId,
    settledAt: now,
    bankRef: `REF-${Date.now().toString().slice(-6)}`,
  });

  appendAudit({
    dealId,
    at: now,
    actorId: user.id,
    actorName: user.name,
    action: "funds.refunded",
  });
  revalidateDeal(dealId);
}

export async function openDispute(dealId: string, formData: FormData) {
  const user = await requireUser();
  const deal = findDeal(dealId);
  if (!deal) throw new Error("Deal not found");
  const reason = String(formData.get("reason") || "").trim();
  if (!reason) throw new Error("Reason required");

  deal.status = "disputed";
  deal.disputeReason = reason;
  deal.mediatorId = deal.mediatorId || "user-mediator-1";
  touch(deal);
  appendAudit({
    dealId,
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    action: "dispute.opened",
    detail: reason,
  });
  revalidateDeal(dealId);
}

export async function resolveDispute(
  dealId: string,
  outcome: "release" | "refund"
) {
  const user = await requireUser();
  if (user.role !== "mediator" && user.role !== "operator") {
    throw new Error("Only mediator/operator");
  }
  if (outcome === "release") {
    await releaseDeal(dealId);
  } else {
    await refundDeal(dealId);
  }
  appendAudit({
    dealId,
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    action: "dispute.resolved",
    detail: outcome,
  });
  revalidateDeal(dealId);
}

export async function transitionDeal(
  dealId: string,
  action: string,
  formData?: FormData
) {
  switch (action) {
    case "accept":
      return acceptDeal(dealId);
    case "fund":
      return fundDeal(dealId);
    case "start_work":
      return startWork(dealId);
    case "request_verification":
      return requestVerification(dealId);
    case "approve_verification":
      return approveVerification(dealId);
    case "reject_verification":
      return rejectVerification(dealId);
    case "mark_complete":
      return markComplete(dealId);
    case "release":
      return releaseDeal(dealId);
    case "refund":
      return refundDeal(dealId);
    case "open_dispute":
      if (!formData) throw new Error("Reason required");
      return openDispute(dealId, formData);
    case "resolve_release":
      return resolveDispute(dealId, "release");
    case "resolve_refund":
      return resolveDispute(dealId, "refund");
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export type { DealStatus };
