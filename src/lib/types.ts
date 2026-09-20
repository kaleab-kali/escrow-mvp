export type RoleId =
  | "buyer"
  | "seller"
  | "marketplace"
  | "verifier"
  | "bank"
  | "operator"
  | "regulator"
  | "mediator";

export type SectorId =
  | "real_estate"
  | "ecommerce"
  | "scholarship"
  | "travel"
  | "freelancer";

export type EscrowStatus =
  | "draft"
  | "pending_funding"
  | "funded"
  | "in_progress"
  | "partially_released"
  | "disputed"
  | "released"
  | "refunded"
  | "closed";

export type MilestoneStatus =
  | "pending"
  | "submitted"
  | "verified"
  | "rejected"
  | "released";

export type FundingMethod = "bank_transfer" | "mobile_money";

export type AuditAction =
  | "created"
  | "funded"
  | "evidence_submitted"
  | "milestone_verified"
  | "milestone_rejected"
  | "partial_release"
  | "full_release"
  | "refund"
  | "dispute_opened"
  | "dispute_resolved"
  | "closed"
  | "note";

export interface Role {
  id: RoleId;
  label: string;
  labelAm: string;
  description: string;
  color: string;
}

export interface Sector {
  id: SectorId;
  label: string;
  labelAm: string;
  description: string;
  icon: string;
  feeBps: number; // platform fee in basis points (e.g. 150 = 1.5%)
  defaultMilestones: { title: string; percent: number; description: string }[];
}

export interface Party {
  id: string;
  name: string;
  role: RoleId;
  phone?: string;
  city?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  percent: number;
  amountEtb: number;
  status: MilestoneStatus;
  evidenceNote?: string;
  evidenceAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  releasedAt?: string;
  rejectionReason?: string;
}

export interface LedgerEntry {
  id: string;
  at: string;
  type: "deposit" | "hold" | "release" | "fee" | "refund";
  amountEtb: number;
  balanceAfterEtb: number;
  note: string;
  bankRef?: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  action: AuditAction;
  actorRole: RoleId | "system";
  actorName: string;
  detail: string;
}

export interface Dispute {
  id: string;
  openedAt: string;
  openedBy: RoleId;
  reason: string;
  status: "open" | "resolved";
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: RoleId;
  outcome?: "release_to_seller" | "refund_to_buyer" | "split";
  splitBuyerPercent?: number;
}

export interface EscrowDeal {
  id: string;
  reference: string;
  sector: SectorId;
  title: string;
  description: string;
  status: EscrowStatus;
  amountEtb: number;
  currency: "ETB";
  feeBps: number;
  feeEtb: number;
  heldEtb: number;
  releasedEtb: number;
  refundedEtb: number;
  buyer: Party;
  seller: Party;
  bankName: string;
  fundingMethod?: FundingMethod;
  fundedAt?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  milestones: Milestone[];
  ledger: LedgerEntry[];
  audit: AuditEvent[];
  dispute?: Dispute;
  location: string;
  inspectionDays?: number;
}

export interface AppState {
  version: number;
  seededAt: string;
  deals: EscrowDeal[];
}

export interface CreateDealInput {
  sector: SectorId;
  title: string;
  description: string;
  amountEtb: number;
  buyerName: string;
  sellerName: string;
  location?: string;
  fundingMethod?: FundingMethod;
}
