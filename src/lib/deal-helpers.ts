import type { Deal, DealStatus, Role, User } from "./types";
import { findUser } from "./store";

export interface NextAction {
  label: string;
  description: string;
  action?:
    | "accept"
    | "fund"
    | "start_work"
    | "request_verification"
    | "approve_verification"
    | "reject_verification"
    | "mark_complete"
    | "release"
    | "refund"
    | "open_dispute"
    | "resolve_release"
    | "resolve_refund";
  primary?: boolean;
}

export function getNextActions(deal: Deal, user: User): NextAction[] {
  const actions: NextAction[] = [];
  const isBuyer = user.id === deal.buyerId;
  const isSeller = user.id === deal.sellerId;
  const isVerifier = user.role === "verifier";
  const isMediator = user.role === "mediator";
  const isOperator = user.role === "operator";

  switch (deal.status) {
    case "pending_acceptance":
      if (isSeller) {
        actions.push({
          label: "Accept deal",
          description: "Agree to escrow terms and await buyer funding.",
          action: "accept",
          primary: true,
        });
      } else if (isBuyer) {
        actions.push({
          label: "Waiting on seller",
          description: "Seller must accept before you can fund.",
        });
      }
      break;
    case "awaiting_funds":
      if (isBuyer) {
        actions.push({
          label: "Fund escrow",
          description: "Transfer ETB into EscrowET custody to start the deal.",
          action: "fund",
          primary: true,
        });
      } else {
        actions.push({
          label: "Waiting for funds",
          description: "Buyer has not funded custody yet.",
        });
      }
      break;
    case "funded":
      if (isSeller) {
        actions.push({
          label: "Start work / delivery",
          description: "Mark the deal in progress once you begin delivery.",
          action: "start_work",
          primary: true,
        });
      } else if (isBuyer) {
        actions.push({
          label: "Funds secured",
          description: "Waiting for seller to begin delivery.",
        });
      }
      break;
    case "in_progress":
      if (deal.sector === "real_estate" && (isBuyer || isSeller)) {
        actions.push({
          label: "Request verification",
          description: "Send to RE verifier for title / cadastral check.",
          action: "request_verification",
          primary: true,
        });
      }
      if (isSeller) {
        actions.push({
          label: "Mark milestone complete",
          description: "Signal that current work is ready for release review.",
          action: "mark_complete",
          primary: deal.sector !== "real_estate",
        });
      }
      if (isBuyer) {
        actions.push({
          label: "Release funds",
          description: "Release custody to seller when satisfied.",
          action: "release",
        });
      }
      break;
    case "pending_verification":
      if (isVerifier || isOperator) {
        actions.push({
          label: "Approve verification",
          description: "Title and checks look good — advance to release.",
          action: "approve_verification",
          primary: true,
        });
        actions.push({
          label: "Reject verification",
          description: "Send back with findings.",
          action: "reject_verification",
        });
      } else {
        actions.push({
          label: "Verification in progress",
          description: "RE verifier is reviewing documents.",
        });
      }
      break;
    case "pending_release":
      if (isBuyer || isOperator) {
        actions.push({
          label: "Release to seller",
          description: "Authorize payout from custody.",
          action: "release",
          primary: true,
        });
      }
      break;
    case "disputed":
      if (isMediator || isOperator) {
        actions.push({
          label: "Resolve → release",
          description: "Mediation finds for seller.",
          action: "resolve_release",
          primary: true,
        });
        actions.push({
          label: "Resolve → refund",
          description: "Mediation finds for buyer.",
          action: "resolve_refund",
        });
      } else {
        actions.push({
          label: "Under mediation",
          description: "Mediator is reviewing the dispute.",
        });
      }
      break;
    default:
      break;
  }

  if (
    !["released", "refunded", "cancelled", "disputed", "draft"].includes(
      deal.status
    ) &&
    (isBuyer || isSeller || isOperator)
  ) {
    actions.push({
      label: "Open dispute",
      description: "Escalate to a mediator.",
      action: "open_dispute",
    });
  }

  return actions;
}

export function statusTone(
  status: DealStatus
): "neutral" | "info" | "success" | "warning" | "danger" {
  switch (status) {
    case "released":
      return "success";
    case "refunded":
    case "cancelled":
      return "neutral";
    case "disputed":
      return "danger";
    case "pending_verification":
    case "pending_release":
    case "awaiting_funds":
    case "pending_acceptance":
      return "warning";
    case "funded":
    case "in_progress":
      return "info";
    default:
      return "neutral";
  }
}

export function dealsForUser(deals: Deal[], user: User): Deal[] {
  if (user.role === "operator") return deals;
  if (user.role === "verifier") {
    return deals.filter(
      (d) =>
        d.verifierId === user.id ||
        d.status === "pending_verification" ||
        d.sector === "real_estate"
    );
  }
  if (user.role === "mediator") {
    return deals.filter(
      (d) => d.mediatorId === user.id || d.status === "disputed"
    );
  }
  return deals.filter((d) => d.buyerId === user.id || d.sellerId === user.id);
}

export function partyLabel(deal: Deal, role: "buyer" | "seller"): string {
  const id = role === "buyer" ? deal.buyerId : deal.sellerId;
  return findUser(id)?.name ?? id;
}

export function roleHome(role: Role): string {
  switch (role) {
    case "operator":
      return "/operator";
    case "verifier":
      return "/verify";
    case "mediator":
      return "/mediate";
    default:
      return "/dashboard";
  }
}
