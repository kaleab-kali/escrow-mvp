"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { v4 as uuid } from "uuid";
import type {
  AppState,
  CreateDealInput,
  EscrowDeal,
  EscrowStatus,
  FundingMethod,
  RoleId,
} from "./types";
import { createSeedState } from "./seed";
import { getSector } from "./sectors";
import { feeFromBps } from "./format";
import { DEMO_ACTORS } from "./roles";

const STATE_KEY = "escrow-mvp-state-v1";
const ROLE_KEY = "escrow-mvp-role-v1";

const ALL_ROLES: RoleId[] = [
  "buyer",
  "seller",
  "marketplace",
  "verifier",
  "bank",
  "operator",
  "regulator",
  "mediator",
];

function isRole(v: string): v is RoleId {
  return ALL_ROLES.includes(v as RoleId);
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

function loadState(): AppState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed?.deals?.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  const seeded = createSeedState();
  localStorage.setItem(STATE_KEY, JSON.stringify(seeded));
  return seeded;
}

function loadRole(): RoleId {
  if (typeof window === "undefined") return "buyer";
  try {
    const raw = localStorage.getItem(ROLE_KEY);
    if (raw && isRole(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "buyer";
}

function persistState(state: AppState) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function persistRole(role: RoleId) {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    /* ignore */
  }
}

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

interface EscrowContextValue {
  ready: boolean;
  deals: EscrowDeal[];
  role: RoleId;
  setRole: (role: RoleId) => void;
  getDeal: (id: string) => EscrowDeal | undefined;
  createDeal: (input: CreateDealInput) => ActionResult;
  fundDeal: (dealId: string, method: FundingMethod) => ActionResult;
  submitEvidence: (dealId: string, milestoneId: string, note: string) => ActionResult;
  verifyMilestone: (
    dealId: string,
    milestoneId: string,
    approve: boolean,
    reason?: string
  ) => ActionResult;
  releaseMilestone: (dealId: string, milestoneId: string) => ActionResult;
  refundDeal: (dealId: string, reason?: string) => ActionResult;
  openDispute: (dealId: string, reason: string) => ActionResult;
  resolveDispute: (
    dealId: string,
    outcome: "release_to_seller" | "refund_to_buyer" | "split",
    resolution: string,
    splitBuyerPercent?: number
  ) => ActionResult;
  closeDeal: (dealId: string) => ActionResult;
  resetDemo: () => void;
}

const EscrowContext = createContext<EscrowContextValue | null>(null);

export function EscrowProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(() => createSeedState());
  const [role, setRoleState] = useState<RoleId>("buyer");

  useEffect(() => {
    setState(loadState());
    setRoleState(loadRole());
    setReady(true);
  }, []);

  const updateDeals = useCallback((updater: (deals: EscrowDeal[]) => EscrowDeal[]) => {
    setState((prev) => {
      const next: AppState = { ...prev, deals: updater(prev.deals.map((d) => ({ ...d }))) };
      persistState(next);
      return next;
    });
  }, []);

  const upsert = useCallback(
    (deal: EscrowDeal) => {
      updateDeals((deals) => {
        const idx = deals.findIndex((d) => d.id === deal.id);
        if (idx >= 0) {
          const copy = [...deals];
          copy[idx] = deal;
          return copy;
        }
        return [deal, ...deals];
      });
    },
    [updateDeals]
  );

  const getDeal = useCallback(
    (id: string) => state.deals.find((d) => d.id === id),
    [state.deals]
  );

  const setRole = useCallback((r: RoleId) => {
    setRoleState(r);
    persistRole(r);
  }, []);

  const createDeal = useCallback(
    (input: CreateDealInput): ActionResult => {
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
      upsert(deal);
      return { ok: true, id: deal.id };
    },
    [upsert]
  );

  const fundDeal = useCallback(
    (dealId: string, method: FundingMethod): ActionResult => {
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal) return { ok: false, error: "Deal not found" };
      const d = structuredClone(deal);
      if (!["draft", "pending_funding"].includes(d.status)) {
        return { ok: false, error: "Deal is not awaiting funding" };
      }
      d.fundingMethod = method;
      d.fundedAt = new Date().toISOString();
      d.heldEtb = d.amountEtb;
      d.status = "funded";
      const ref = `SIM-${method === "mobile_money" ? "MM" : "BT"}-${Date.now()
        .toString()
        .slice(-6)}`;
      pushLedger(
        d,
        "deposit",
        d.amountEtb,
        method === "mobile_money"
          ? "Simulated Telebirr / mobile money deposit"
          : "Simulated bank transfer deposit",
        ref
      );
      pushLedger(d, "hold", d.amountEtb, `Segregated hold — ${d.bankName}`, ref);
      pushAudit(
        d,
        "funded",
        "buyer",
        `Funded ${d.amountEtb.toLocaleString()} ETB via ${method} (simulated)`
      );
      upsert(touch(d));
      return { ok: true };
    },
    [state.deals, upsert]
  );

  const submitEvidence = useCallback(
    (dealId: string, milestoneId: string, note: string): ActionResult => {
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal) return { ok: false, error: "Deal not found" };
      const d = structuredClone(deal);
      if (d.dispute?.status === "open") {
        return { ok: false, error: "Deal is in dispute" };
      }
      const ms = d.milestones.find((m) => m.id === milestoneId);
      if (!ms) return { ok: false, error: "Milestone not found" };
      if (!["pending", "rejected"].includes(ms.status)) {
        return { ok: false, error: "Milestone cannot accept evidence now" };
      }
      ms.status = "submitted";
      ms.evidenceNote = note.trim() || "Evidence submitted (demo)";
      ms.evidenceAt = new Date().toISOString();
      ms.rejectionReason = undefined;
      pushAudit(
        d,
        "evidence_submitted",
        "seller",
        `Evidence for “${ms.title}”: ${ms.evidenceNote}`
      );
      d.status = recomputeStatus(d);
      upsert(touch(d));
      return { ok: true };
    },
    [state.deals, upsert]
  );

  const verifyMilestone = useCallback(
    (
      dealId: string,
      milestoneId: string,
      approve: boolean,
      reason?: string
    ): ActionResult => {
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal) return { ok: false, error: "Deal not found" };
      const d = structuredClone(deal);
      const ms = d.milestones.find((m) => m.id === milestoneId);
      if (!ms || ms.status !== "submitted") {
        return { ok: false, error: "Milestone is not awaiting verification" };
      }
      const currentRole = role;
      const verifierRole: RoleId =
        d.sector === "real_estate"
          ? currentRole === "verifier" || currentRole === "operator"
            ? currentRole
            : "verifier"
          : currentRole === "buyer" ||
              currentRole === "operator" ||
              currentRole === "marketplace"
            ? currentRole
            : "buyer";

      if (approve) {
        ms.status = "verified";
        ms.verifiedBy = actorName(verifierRole);
        ms.verifiedAt = new Date().toISOString();
        pushAudit(d, "milestone_verified", verifierRole, `Verified “${ms.title}”`);
      } else {
        ms.status = "rejected";
        ms.rejectionReason = reason?.trim() || "Evidence insufficient";
        ms.verifiedAt = new Date().toISOString();
        pushAudit(
          d,
          "milestone_rejected",
          verifierRole,
          `Rejected “${ms.title}”: ${ms.rejectionReason}`
        );
      }
      d.status = recomputeStatus(d);
      upsert(touch(d));
      return { ok: true };
    },
    [state.deals, role, upsert]
  );

  const releaseMilestone = useCallback(
    (dealId: string, milestoneId: string): ActionResult => {
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal) return { ok: false, error: "Deal not found" };
      const d = structuredClone(deal);
      if (d.dispute?.status === "open") {
        return { ok: false, error: "Cannot release while disputed" };
      }
      const ms = d.milestones.find((m) => m.id === milestoneId);
      if (!ms || !["verified", "submitted"].includes(ms.status)) {
        return { ok: false, error: "Milestone not ready for release" };
      }
      if (ms.amountEtb > d.heldEtb) {
        return { ok: false, error: "Insufficient held balance" };
      }
      const fee = feeFromBps(ms.amountEtb, d.feeBps);
      const netToSeller = ms.amountEtb - fee;
      d.heldEtb -= ms.amountEtb;
      d.releasedEtb += ms.amountEtb;
      ms.status = "released";
      ms.releasedAt = new Date().toISOString();
      if (!ms.verifiedAt) {
        ms.verifiedAt = ms.releasedAt;
        ms.verifiedBy = actorName("bank");
      }
      const ref = `REL-${Date.now().toString().slice(-6)}`;
      pushLedger(
        d,
        "release",
        ms.amountEtb,
        `Release “${ms.title}” — net ${netToSeller.toLocaleString()} ETB to seller`,
        ref
      );
      if (fee > 0) {
        pushLedger(
          d,
          "fee",
          fee,
          `Platform fee ${(d.feeBps / 100).toFixed(2)}% on milestone`,
          ref
        );
      }
      pushAudit(
        d,
        "partial_release",
        "bank",
        `Released ${ms.amountEtb.toLocaleString()} ETB for “${ms.title}” (fee ${fee.toLocaleString()} ETB)`
      );

      const allReleased = d.milestones.every((m) => m.status === "released");
      if (allReleased && d.heldEtb === 0) {
        d.status = "released";
        pushAudit(d, "full_release", "bank", "All milestones released");
      } else {
        d.status = recomputeStatus(d);
      }
      upsert(touch(d));
      return { ok: true };
    },
    [state.deals, upsert]
  );

  const refundDeal = useCallback(
    (dealId: string, reason?: string): ActionResult => {
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal) return { ok: false, error: "Deal not found" };
      const d = structuredClone(deal);
      if (d.heldEtb <= 0) return { ok: false, error: "Nothing to refund" };
      const amount = d.heldEtb;
      d.heldEtb = 0;
      d.refundedEtb += amount;
      d.status = "refunded";
      const ref = `RFD-${Date.now().toString().slice(-6)}`;
      pushLedger(d, "refund", amount, reason || "Refund to buyer", ref);
      pushAudit(
        d,
        "refund",
        "operator",
        `Refunded ${amount.toLocaleString()} ETB to buyer${reason ? `: ${reason}` : ""}`
      );
      upsert(touch(d));
      return { ok: true };
    },
    [state.deals, upsert]
  );

  const openDispute = useCallback(
    (dealId: string, reason: string): ActionResult => {
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal) return { ok: false, error: "Deal not found" };
      const d = structuredClone(deal);
      if (d.dispute?.status === "open") {
        return { ok: false, error: "Dispute already open" };
      }
      if (!reason.trim()) return { ok: false, error: "Reason required" };
      d.dispute = {
        id: uuid(),
        openedAt: new Date().toISOString(),
        openedBy: role,
        reason: reason.trim(),
        status: "open",
      };
      d.status = "disputed";
      pushAudit(d, "dispute_opened", role, reason.trim());
      upsert(touch(d));
      return { ok: true };
    },
    [state.deals, role, upsert]
  );

  const resolveDispute = useCallback(
    (
      dealId: string,
      outcome: "release_to_seller" | "refund_to_buyer" | "split",
      resolution: string,
      splitBuyerPercent?: number
    ): ActionResult => {
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal || !deal.dispute || deal.dispute.status !== "open") {
        return { ok: false, error: "No open dispute" };
      }
      const d = structuredClone(deal);
      const held = d.heldEtb;
      if (outcome === "refund_to_buyer" && held > 0) {
        d.heldEtb = 0;
        d.refundedEtb += held;
        pushLedger(d, "refund", held, "Dispute resolution — refund to buyer");
        d.status = "refunded";
      } else if (outcome === "release_to_seller" && held > 0) {
        const fee = feeFromBps(held, d.feeBps);
        d.heldEtb = 0;
        d.releasedEtb += held;
        pushLedger(d, "release", held, "Dispute resolution — release to seller");
        if (fee > 0) pushLedger(d, "fee", fee, "Fee on dispute release");
        d.milestones.forEach((m) => {
          if (m.status !== "released") {
            m.status = "released";
            m.releasedAt = new Date().toISOString();
          }
        });
        d.status = "released";
      } else if (outcome === "split" && held > 0) {
        const buyerPct = Math.min(100, Math.max(0, splitBuyerPercent ?? 50));
        const toBuyer = Math.round((held * buyerPct) / 100);
        const toSeller = held - toBuyer;
        d.heldEtb = 0;
        d.refundedEtb += toBuyer;
        d.releasedEtb += toSeller;
        if (toBuyer > 0)
          pushLedger(d, "refund", toBuyer, `Split: ${buyerPct}% to buyer`);
        if (toSeller > 0)
          pushLedger(d, "release", toSeller, `Split: ${100 - buyerPct}% to seller`);
        d.status =
          toSeller > 0 && toBuyer > 0
            ? "closed"
            : toBuyer > 0
              ? "refunded"
              : "released";
      }
      if (d.dispute) {
        d.dispute.status = "resolved";
        d.dispute.resolution = resolution.trim() || `Resolved: ${outcome}`;
        d.dispute.resolvedAt = new Date().toISOString();
        d.dispute.resolvedBy = "mediator";
        d.dispute.outcome = outcome;
        d.dispute.splitBuyerPercent = splitBuyerPercent;
      }
      pushAudit(
        d,
        "dispute_resolved",
        "mediator",
        `${outcome}: ${d.dispute?.resolution}`
      );
      upsert(touch(d));
      return { ok: true };
    },
    [state.deals, upsert]
  );

  const closeDeal = useCallback(
    (dealId: string): ActionResult => {
      const deal = state.deals.find((d) => d.id === dealId);
      if (!deal) return { ok: false, error: "Deal not found" };
      const d = structuredClone(deal);
      if (d.heldEtb > 0) {
        return { ok: false, error: "Cannot close while funds still held" };
      }
      if (d.dispute?.status === "open") {
        return { ok: false, error: "Resolve dispute before closing" };
      }
      d.status = "closed";
      d.closedAt = new Date().toISOString();
      pushAudit(d, "closed", "operator", "Deal closed — statement available");
      upsert(touch(d));
      return { ok: true };
    },
    [state.deals, upsert]
  );

  const resetDemo = useCallback(() => {
    const seeded = createSeedState();
    persistState(seeded);
    setState(seeded);
  }, []);

  const value = useMemo<EscrowContextValue>(
    () => ({
      ready,
      deals: state.deals,
      role,
      setRole,
      getDeal,
      createDeal,
      fundDeal,
      submitEvidence,
      verifyMilestone,
      releaseMilestone,
      refundDeal,
      openDispute,
      resolveDispute,
      closeDeal,
      resetDemo,
    }),
    [
      ready,
      state.deals,
      role,
      setRole,
      getDeal,
      createDeal,
      fundDeal,
      submitEvidence,
      verifyMilestone,
      releaseMilestone,
      refundDeal,
      openDispute,
      resolveDispute,
      closeDeal,
      resetDemo,
    ]
  );

  return (
    <EscrowContext.Provider value={value}>{children}</EscrowContext.Provider>
  );
}

export function useEscrow(): EscrowContextValue {
  const ctx = useContext(EscrowContext);
  if (!ctx) throw new Error("useEscrow must be used within EscrowProvider");
  return ctx;
}
