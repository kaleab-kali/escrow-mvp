import { v4 as uuid } from "uuid";
import { feeForAmount } from "./format";
import type {
  ApiKey,
  ApiUsageLog,
  AuditEntry,
  Deal,
  EodPack,
  SettlementRow,
  StoreData,
  User,
  WebhookEndpoint,
} from "./types";

const GLOBAL_KEY = "__escrowet_store_v1__";

type GlobalStore = typeof globalThis & {
  [GLOBAL_KEY]?: StoreData;
};

function daysAgo(n: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
}

function dateOnlyDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function seedUsers(): User[] {
  return [
    {
      id: "user-buyer-1",
      name: "Hanna Bekele",
      email: "hanna.buyer@example.et",
      role: "buyer",
      phone: "+251911000001",
      city: "Addis Ababa",
    },
    {
      id: "user-buyer-2",
      name: "Yonas Tadesse",
      email: "yonas.buyer@example.et",
      role: "buyer",
      phone: "+251911000002",
      city: "Bahir Dar",
    },
    {
      id: "user-seller-1",
      name: "Abel Properties PLC",
      email: "abel.seller@example.et",
      role: "seller",
      phone: "+251911000010",
      city: "Addis Ababa",
    },
    {
      id: "user-seller-2",
      name: "Selam Craft Store",
      email: "selam.seller@example.et",
      role: "seller",
      phone: "+251911000011",
      city: "Hawassa",
    },
    {
      id: "user-seller-3",
      name: "Kidus Freelance Studio",
      email: "kidus.dev@example.et",
      role: "seller",
      phone: "+251911000012",
      city: "Addis Ababa",
    },
    {
      id: "user-verifier-1",
      name: "Meron Assefa (RE Verifier)",
      email: "meron.verifier@example.et",
      role: "verifier",
      phone: "+251911000020",
      city: "Addis Ababa",
    },
    {
      id: "user-mediator-1",
      name: "Dawit Negash (Mediator)",
      email: "dawit.mediator@example.et",
      role: "mediator",
      phone: "+251911000030",
      city: "Addis Ababa",
    },
    {
      id: "user-operator-1",
      name: "EscrowET Ops",
      email: "ops@escrowet.et",
      role: "operator",
      phone: "+251911000040",
      city: "Addis Ababa",
    },
  ];
}

function audit(
  dealId: string,
  actorId: string,
  actorName: string,
  action: string,
  at: string,
  detail?: string
): AuditEntry {
  return {
    id: uuid(),
    dealId,
    at,
    actorId,
    actorName,
    action,
    detail,
  };
}

function seedDeals(): { deals: Deal[]; audit: AuditEntry[] } {
  const auditLog: AuditEntry[] = [];
  const deals: Deal[] = [];

  const d1: Deal = {
    id: "deal-re-bole",
    title: "Bole 3BR apartment — title transfer",
    sector: "real_estate",
    status: "pending_verification",
    amountEtb: 4_850_000,
    feeEtb: feeForAmount(4_850_000),
    currency: "ETB",
    buyerId: "user-buyer-1",
    sellerId: "user-seller-1",
    verifierId: "user-verifier-1",
    description:
      "Purchase of 3-bedroom apartment in Bole. Funds held pending title verification and handover checklist.",
    location: "Bole, Addis Ababa",
    milestones: [
      {
        id: "m1-1",
        title: "Deposit secured",
        amountEtb: 1_000_000,
        status: "funded",
        dueDate: dateOnlyDaysAgo(12),
        completedAt: daysAgo(10),
      },
      {
        id: "m1-2",
        title: "Title verification",
        amountEtb: 2_850_000,
        status: "funded",
        dueDate: dateOnlyDaysAgo(2),
      },
      {
        id: "m1-3",
        title: "Handover & keys",
        amountEtb: 1_000_000,
        status: "pending",
        dueDate: dateOnlyDaysAgo(-7),
      },
    ],
    createdAt: daysAgo(14),
    updatedAt: daysAgo(1, 14),
    fundedAt: daysAgo(10),
  };
  deals.push(d1);
  auditLog.push(
    audit(d1.id, "user-buyer-1", "Hanna Bekele", "deal.created", daysAgo(14)),
    audit(
      d1.id,
      "user-seller-1",
      "Abel Properties PLC",
      "deal.accepted",
      daysAgo(13)
    ),
    audit(
      d1.id,
      "user-buyer-1",
      "Hanna Bekele",
      "funds.received",
      daysAgo(10),
      "Full amount funded to custody"
    ),
    audit(
      d1.id,
      "user-buyer-1",
      "Hanna Bekele",
      "verification.requested",
      daysAgo(1, 14)
    )
  );

  const d2: Deal = {
    id: "deal-ecom-bulk",
    title: "Bulk coffee export sample order",
    sector: "ecommerce",
    status: "awaiting_funds",
    amountEtb: 285_000,
    feeEtb: feeForAmount(285_000),
    currency: "ETB",
    buyerId: "user-buyer-2",
    sellerId: "user-seller-2",
    description:
      "500kg specialty coffee samples for EU buyer QC. Escrow until inspection photos approved.",
    location: "Hawassa → Addis dry port",
    milestones: [
      {
        id: "m2-1",
        title: "Goods packed & photos",
        amountEtb: 142_500,
        status: "pending",
        dueDate: dateOnlyDaysAgo(-3),
      },
      {
        id: "m2-2",
        title: "Delivery confirmed",
        amountEtb: 142_500,
        status: "pending",
        dueDate: dateOnlyDaysAgo(-10),
      },
    ],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  };
  deals.push(d2);
  auditLog.push(
    audit(d2.id, "user-buyer-2", "Yonas Tadesse", "deal.created", daysAgo(3)),
    audit(
      d2.id,
      "user-seller-2",
      "Selam Craft Store",
      "deal.accepted",
      daysAgo(2)
    )
  );

  const d3: Deal = {
    id: "deal-freelance-erp",
    title: "ERP module delivery — Phase 2",
    sector: "freelancer",
    status: "in_progress",
    amountEtb: 420_000,
    feeEtb: feeForAmount(420_000),
    currency: "ETB",
    buyerId: "user-buyer-1",
    sellerId: "user-seller-3",
    description:
      "Custom inventory module for SME client. Milestone-based release on UAT sign-off.",
    location: "Remote / Addis Ababa",
    milestones: [
      {
        id: "m3-1",
        title: "Design & API contract",
        amountEtb: 120_000,
        status: "released",
        dueDate: dateOnlyDaysAgo(20),
        completedAt: daysAgo(18),
      },
      {
        id: "m3-2",
        title: "Implementation",
        amountEtb: 200_000,
        status: "funded",
        dueDate: dateOnlyDaysAgo(5),
      },
      {
        id: "m3-3",
        title: "UAT & handover",
        amountEtb: 100_000,
        status: "pending",
        dueDate: dateOnlyDaysAgo(-14),
      },
    ],
    createdAt: daysAgo(30),
    updatedAt: daysAgo(4),
    fundedAt: daysAgo(28),
  };
  deals.push(d3);
  auditLog.push(
    audit(d3.id, "user-buyer-1", "Hanna Bekele", "deal.created", daysAgo(30)),
    audit(
      d3.id,
      "user-seller-3",
      "Kidus Freelance Studio",
      "deal.accepted",
      daysAgo(29)
    ),
    audit(
      d3.id,
      "user-buyer-1",
      "Hanna Bekele",
      "funds.received",
      daysAgo(28)
    ),
    audit(
      d3.id,
      "user-buyer-1",
      "Hanna Bekele",
      "milestone.released",
      daysAgo(18),
      "Design milestone"
    )
  );

  const d4: Deal = {
    id: "deal-travel-lalibela",
    title: "Lalibela group tour package",
    sector: "travel",
    status: "disputed",
    amountEtb: 156_000,
    feeEtb: feeForAmount(156_000),
    currency: "ETB",
    buyerId: "user-buyer-2",
    sellerId: "user-seller-2",
    mediatorId: "user-mediator-1",
    description:
      "8-person cultural tour. Dispute opened after itinerary change without consent.",
    location: "Lalibela",
    milestones: [
      {
        id: "m4-1",
        title: "Booking confirmation",
        amountEtb: 78_000,
        status: "funded",
        dueDate: dateOnlyDaysAgo(8),
      },
      {
        id: "m4-2",
        title: "Trip completion",
        amountEtb: 78_000,
        status: "pending",
        dueDate: dateOnlyDaysAgo(-2),
      },
    ],
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1, 9),
    fundedAt: daysAgo(9),
    disputeReason:
      "Operator swapped hotel and cut one monastery visit without buyer approval.",
  };
  deals.push(d4);
  auditLog.push(
    audit(d4.id, "user-buyer-2", "Yonas Tadesse", "deal.created", daysAgo(12)),
    audit(
      d4.id,
      "user-seller-2",
      "Selam Craft Store",
      "deal.accepted",
      daysAgo(11)
    ),
    audit(
      d4.id,
      "user-buyer-2",
      "Yonas Tadesse",
      "funds.received",
      daysAgo(9)
    ),
    audit(
      d4.id,
      "user-buyer-2",
      "Yonas Tadesse",
      "dispute.opened",
      daysAgo(1, 9),
      d4.disputeReason
    )
  );

  const d5: Deal = {
    id: "deal-scholarship-au",
    title: "AU scholarship tuition remittance",
    sector: "scholarship",
    status: "pending_release",
    amountEtb: 98_500,
    feeEtb: feeForAmount(98_500),
    currency: "ETB",
    buyerId: "user-buyer-1",
    sellerId: "user-seller-1",
    description:
      "Sponsor remits semester tuition via escrow after enrollment verification letter.",
    location: "Addis Ababa University",
    milestones: [
      {
        id: "m5-1",
        title: "Enrollment verified",
        amountEtb: 98_500,
        status: "completed",
        dueDate: dateOnlyDaysAgo(1),
        completedAt: daysAgo(1, 11),
      },
    ],
    createdAt: daysAgo(20),
    updatedAt: daysAgo(1, 11),
    fundedAt: daysAgo(15),
  };
  deals.push(d5);
  auditLog.push(
    audit(d5.id, "user-buyer-1", "Hanna Bekele", "deal.created", daysAgo(20)),
    audit(
      d5.id,
      "user-seller-1",
      "Abel Properties PLC",
      "deal.accepted",
      daysAgo(19)
    ),
    audit(
      d5.id,
      "user-buyer-1",
      "Hanna Bekele",
      "funds.received",
      daysAgo(15)
    ),
    audit(
      d5.id,
      "user-seller-1",
      "Abel Properties PLC",
      "milestone.completed",
      daysAgo(1, 11)
    )
  );

  const d6: Deal = {
    id: "deal-re-cmc",
    title: "CMC land plot reservation",
    sector: "real_estate",
    status: "released",
    amountEtb: 2_100_000,
    feeEtb: feeForAmount(2_100_000),
    currency: "ETB",
    buyerId: "user-buyer-2",
    sellerId: "user-seller-1",
    verifierId: "user-verifier-1",
    description: "Plot reservation completed and released after cadastral check.",
    location: "CMC, Addis Ababa",
    milestones: [
      {
        id: "m6-1",
        title: "Full purchase",
        amountEtb: 2_100_000,
        status: "released",
        dueDate: dateOnlyDaysAgo(25),
        completedAt: daysAgo(22),
      },
    ],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(22),
    fundedAt: daysAgo(35),
    releasedAt: daysAgo(22),
  };
  deals.push(d6);
  auditLog.push(
    audit(d6.id, "user-buyer-2", "Yonas Tadesse", "deal.created", daysAgo(40)),
    audit(
      d6.id,
      "user-verifier-1",
      "Meron Assefa (RE Verifier)",
      "verification.approved",
      daysAgo(23)
    ),
    audit(
      d6.id,
      "user-operator-1",
      "EscrowET Ops",
      "funds.released",
      daysAgo(22)
    )
  );

  const d7: Deal = {
    id: "deal-ecom-phones",
    title: "Wholesale phone accessories lot",
    sector: "ecommerce",
    status: "pending_acceptance",
    amountEtb: 64_000,
    feeEtb: feeForAmount(64_000),
    currency: "ETB",
    buyerId: "user-buyer-1",
    sellerId: "user-seller-2",
    description: "Awaiting seller acceptance of escrow terms.",
    location: "Merkato",
    milestones: [
      {
        id: "m7-1",
        title: "Delivery",
        amountEtb: 64_000,
        status: "pending",
        dueDate: dateOnlyDaysAgo(-5),
      },
    ],
    createdAt: daysAgo(1, 16),
    updatedAt: daysAgo(1, 16),
  };
  deals.push(d7);
  auditLog.push(
    audit(d7.id, "user-buyer-1", "Hanna Bekele", "deal.created", daysAgo(1, 16))
  );

  const d8: Deal = {
    id: "deal-freelance-brand",
    title: "Brand identity package",
    sector: "freelancer",
    status: "refunded",
    amountEtb: 45_000,
    feeEtb: feeForAmount(45_000),
    currency: "ETB",
    buyerId: "user-buyer-2",
    sellerId: "user-seller-3",
    mediatorId: "user-mediator-1",
    description: "Refunded after mutual cancellation following scope dispute.",
    location: "Remote",
    milestones: [
      {
        id: "m8-1",
        title: "Full package",
        amountEtb: 45_000,
        status: "refunded",
        dueDate: dateOnlyDaysAgo(15),
      },
    ],
    createdAt: daysAgo(25),
    updatedAt: daysAgo(8),
    fundedAt: daysAgo(22),
    disputeReason: "Scope creep; parties agreed to unwind.",
  };
  deals.push(d8);
  auditLog.push(
    audit(d8.id, "user-buyer-2", "Yonas Tadesse", "deal.created", daysAgo(25)),
    audit(
      d8.id,
      "user-mediator-1",
      "Dawit Negash (Mediator)",
      "funds.refunded",
      daysAgo(8),
      "Mutual unwind"
    )
  );


  const d9: Deal = {
    id: "deal-ecom-textiles",
    title: "Handloom textiles wholesale lot",
    sector: "ecommerce",
    status: "funded",
    amountEtb: 175_000,
    feeEtb: feeForAmount(175_000),
    currency: "ETB",
    buyerId: "user-buyer-2",
    sellerId: "user-seller-2",
    description:
      "Funded escrow for 200 units of handloom textiles. Seller to start packing and ship with photos.",
    location: "Hawassa → Addis",
    milestones: [
      {
        id: "m9-1",
        title: "Pack & ship",
        amountEtb: 100_000,
        status: "funded",
        dueDate: dateOnlyDaysAgo(-4),
      },
      {
        id: "m9-2",
        title: "Delivery confirmed",
        amountEtb: 75_000,
        status: "pending",
        dueDate: dateOnlyDaysAgo(-12),
      },
    ],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1, 11),
    fundedAt: daysAgo(1, 11),
  };
  deals.push(d9);
  auditLog.push(
    audit(d9.id, "user-buyer-2", "Yonas Tadesse", "deal.created", daysAgo(6)),
    audit(d9.id, "user-seller-2", "Selam Craft Store", "deal.accepted", daysAgo(5)),
    audit(
      d9.id,
      "user-buyer-2",
      "Yonas Tadesse",
      "funds.received",
      daysAgo(1, 11),
      "175,000 ETB into custody"
    )
  );

  return { deals, audit: auditLog };
}

function seedApiKeys(): ApiKey[] {
  return [
    {
      id: "key-jiji",
      name: "Jiji Ethiopia Production",
      keyPrefix: "et_live_jiji",
      fullKey: "et_live_jiji_8f3a2c91b0e4d7a6",
      partnerName: "Jiji Ethiopia",
      createdAt: daysAgo(60),
      lastUsedAt: daysAgo(0, 8),
      requests30d: 18420,
      active: true,
    },
    {
      id: "key-zemen",
      name: "Zemen Marketplace Staging",
      keyPrefix: "et_test_zemen",
      fullKey: "et_test_zemen_1c9e44aa77bb2201",
      partnerName: "Zemen Market",
      createdAt: daysAgo(20),
      lastUsedAt: daysAgo(1, 12),
      requests30d: 920,
      active: true,
    },
    {
      id: "key-travel",
      name: "EthioTravel Partners",
      keyPrefix: "et_live_travel",
      fullKey: "et_live_travel_55de0988aa11ff02",
      partnerName: "EthioTravel",
      createdAt: daysAgo(45),
      lastUsedAt: daysAgo(2, 18),
      requests30d: 3104,
      active: true,
    },
  ];
}

function seedWebhooks(): WebhookEndpoint[] {
  return [
    {
      id: "wh-1",
      url: "https://api.jiji.et/hooks/escrowet",
      events: ["deal.funded", "deal.released", "deal.disputed"],
      active: true,
      partnerName: "Jiji Ethiopia",
      createdAt: daysAgo(55),
      lastDeliveryAt: daysAgo(0, 7),
      successRate: 99.2,
    },
    {
      id: "wh-2",
      url: "https://hooks.zemen.et/escrow",
      events: ["deal.created", "deal.funded", "deal.released"],
      active: true,
      partnerName: "Zemen Market",
      createdAt: daysAgo(18),
      lastDeliveryAt: daysAgo(1, 11),
      successRate: 97.5,
    },
    {
      id: "wh-3",
      url: "https://partner.ethiotravel.et/webhooks/escrow",
      events: ["deal.funded", "deal.refunded"],
      active: false,
      partnerName: "EthioTravel",
      createdAt: daysAgo(40),
      lastDeliveryAt: daysAgo(12),
      successRate: 94.0,
    },
  ];
}

function seedEod(): EodPack[] {
  const banks = ["Commercial Bank of Ethiopia", "Awash Bank", "Bank of Abyssinia"];
  const packs: EodPack[] = [];
  for (let i = 1; i <= 6; i++) {
    const bank = banks[i % banks.length];
    packs.push({
      id: `eod-${i}`,
      bankName: bank,
      date: dateOnlyDaysAgo(i),
      generatedAt: daysAgo(i, 18),
      generatedBy: "EscrowET Ops",
      custodyBalanceEtb: 12_400_000 - i * 180_000,
      inflowEtb: 850_000 + i * 40_000,
      outflowEtb: 620_000 + i * 25_000,
      dealCount: 14 + i,
      status: i > 2 ? "archived" : "generated",
    });
  }
  return packs;
}

function seedApiUsage(keys: ApiKey[]): ApiUsageLog[] {
  const endpoints = [
    "/v1/deals",
    "/v1/deals/:id",
    "/v1/deals/:id/fund",
    "/v1/webhooks/test",
    "/v1/deals/:id/release",
  ];
  const logs: ApiUsageLog[] = [];
  for (let i = 0; i < 40; i++) {
    const key = keys[i % keys.length];
    logs.push({
      id: `usage-${i}`,
      apiKeyId: key.id,
      partnerName: key.partnerName,
      endpoint: endpoints[i % endpoints.length],
      method: i % 5 === 0 ? "POST" : "GET",
      status: i % 17 === 0 ? 429 : i % 11 === 0 ? 400 : 200,
      at: daysAgo(i % 7, 8 + (i % 10)),
    });
  }
  return logs;
}

function seedSettlements(): SettlementRow[] {
  return [
    {
      id: "set-1",
      dealId: "deal-re-cmc",
      dealTitle: "CMC land plot reservation",
      type: "release",
      amountEtb: 2_100_000,
      counterparty: "Abel Properties PLC",
      settledAt: daysAgo(22),
      bankRef: "CBE-REL-992184",
    },
    {
      id: "set-2",
      dealId: "deal-re-cmc",
      dealTitle: "CMC land plot reservation",
      type: "fee",
      amountEtb: feeForAmount(2_100_000),
      counterparty: "EscrowET",
      settledAt: daysAgo(22),
      bankRef: "CBE-FEE-992185",
    },
    {
      id: "set-3",
      dealId: "deal-freelance-erp",
      dealTitle: "ERP module delivery — Phase 2",
      type: "release",
      amountEtb: 120_000,
      counterparty: "Kidus Freelance Studio",
      settledAt: daysAgo(18),
      bankRef: "AWA-REL-441002",
    },
    {
      id: "set-4",
      dealId: "deal-freelance-brand",
      dealTitle: "Brand identity package",
      type: "refund",
      amountEtb: 45_000,
      counterparty: "Yonas Tadesse",
      settledAt: daysAgo(8),
      bankRef: "BOA-REF-778301",
    },
  ];
}

function createSeed(): StoreData {
  const users = seedUsers();
  const { deals, audit } = seedDeals();
  const apiKeys = seedApiKeys();
  return {
    users,
    deals,
    audit,
    apiKeys,
    webhooks: seedWebhooks(),
    eodPacks: seedEod(),
    apiUsage: seedApiUsage(apiKeys),
    settlements: seedSettlements(),
  };
}

export function getStore(): StoreData {
  const g = globalThis as GlobalStore;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = createSeed();
  }
  return g[GLOBAL_KEY]!;
}

export function resetStore(): StoreData {
  const g = globalThis as GlobalStore;
  g[GLOBAL_KEY] = createSeed();
  return g[GLOBAL_KEY]!;
}

export function findUser(id: string): User | undefined {
  return getStore().users.find((u) => u.id === id);
}

export function findDeal(id: string): Deal | undefined {
  return getStore().deals.find((d) => d.id === id);
}

export function dealAudit(dealId: string): AuditEntry[] {
  return getStore()
    .audit.filter((a) => a.dealId === dealId)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function appendAudit(
  entry: Omit<AuditEntry, "id"> & { id?: string }
): AuditEntry {
  const full: AuditEntry = { ...entry, id: entry.id ?? uuid() };
  getStore().audit.unshift(full);
  return full;
}
