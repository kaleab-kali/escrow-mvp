export type Role = "buyer" | "seller" | "verifier" | "mediator" | "operator";

export type Sector =
  | "real_estate"
  | "ecommerce"
  | "scholarship"
  | "travel"
  | "freelancer";

export type DealStatus =
  | "draft"
  | "pending_acceptance"
  | "awaiting_funds"
  | "funded"
  | "in_progress"
  | "pending_verification"
  | "pending_release"
  | "disputed"
  | "released"
  | "refunded"
  | "cancelled";

export type MilestoneStatus =
  | "pending"
  | "funded"
  | "completed"
  | "released"
  | "refunded";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  city?: string;
  /** Industry this demo identity belongs to (buyers/sellers/verifier). */
  sector?: Sector;
}

export interface Milestone {
  id: string;
  title: string;
  amountEtb: number;
  status: MilestoneStatus;
  dueDate?: string;
  completedAt?: string;
}

export interface AuditEntry {
  id: string;
  dealId: string;
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  detail?: string;
}

export interface Deal {
  id: string;
  title: string;
  sector: Sector;
  status: DealStatus;
  amountEtb: number;
  feeEtb: number;
  currency: "ETB";
  buyerId: string;
  sellerId: string;
  verifierId?: string;
  mediatorId?: string;
  description: string;
  location?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  fundedAt?: string;
  releasedAt?: string;
  disputeReason?: string;
  partnerApiKeyId?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey: string;
  partnerName: string;
  createdAt: string;
  lastUsedAt?: string;
  requests30d: number;
  active: boolean;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  partnerName: string;
  createdAt: string;
  lastDeliveryAt?: string;
  successRate: number;
}

export interface EodPack {
  id: string;
  bankName: string;
  date: string;
  generatedAt: string;
  generatedBy: string;
  custodyBalanceEtb: number;
  inflowEtb: number;
  outflowEtb: number;
  dealCount: number;
  status: "generated" | "archived";
}

export interface ApiUsageLog {
  id: string;
  apiKeyId: string;
  partnerName: string;
  endpoint: string;
  method: string;
  status: number;
  at: string;
}

export interface SettlementRow {
  id: string;
  dealId: string;
  dealTitle: string;
  type: "release" | "refund" | "fee";
  amountEtb: number;
  counterparty: string;
  settledAt: string;
  bankRef: string;
}

export interface StoreData {
  users: User[];
  deals: Deal[];
  audit: AuditEntry[];
  apiKeys: ApiKey[];
  webhooks: WebhookEndpoint[];
  eodPacks: EodPack[];
  apiUsage: ApiUsageLog[];
  settlements: SettlementRow[];
}

export const SECTOR_LABELS: Record<Sector, string> = {
  real_estate: "Real Estate",
  ecommerce: "E-commerce",
  scholarship: "Scholarship",
  travel: "Travel",
  freelancer: "Freelancers",
};

export const STATUS_LABELS: Record<DealStatus, string> = {
  draft: "Draft",
  pending_acceptance: "Pending Acceptance",
  awaiting_funds: "Awaiting Funds",
  funded: "Funded",
  in_progress: "In Progress",
  pending_verification: "Pending Verification",
  pending_release: "Pending Release",
  disputed: "Disputed",
  released: "Released",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export const ROLE_LABELS: Record<Role, string> = {
  buyer: "Buyer",
  seller: "Seller",
  verifier: "Verifier (RE)",
  mediator: "Mediator",
  operator: "Operator",
};

/** Default milestone titles by industry for create-deal form. */
export const SECTOR_MILESTONE_TEMPLATES: Record<
  Sector,
  { title: string; weight: number }[]
> = {
  real_estate: [
    { title: "Deposit secured", weight: 0.2 },
    { title: "Title verification", weight: 0.55 },
    { title: "Handover & keys", weight: 0.25 },
  ],
  ecommerce: [
    { title: "Pack & ship", weight: 0.5 },
    { title: "Delivery / inspection", weight: 0.5 },
  ],
  scholarship: [
    { title: "Enrollment / visa verified", weight: 0.3 },
    { title: "Tuition release", weight: 0.7 },
  ],
  travel: [
    { title: "Booking confirmation", weight: 0.5 },
    { title: "Trip completion", weight: 0.5 },
  ],
  freelancer: [
    { title: "Design & scope", weight: 0.3 },
    { title: "Build / implementation", weight: 0.45 },
    { title: "UAT & handover", weight: 0.25 },
  ],
};
