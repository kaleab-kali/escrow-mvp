import { v4 as uuid } from "uuid";
import type {
  AppState,
  AuditEvent,
  EscrowDeal,
  LedgerEntry,
  Milestone,
} from "./types";
import { getSector } from "./sectors";
import { feeFromBps } from "./format";

const BANKS = [
  "Awash Bank — Escrow Custody",
  "Dashen Bank — Segregated Trust",
  "Bank of Abyssinia — Escrow Desk",
  "Cooperative Bank of Oromia — Custody",
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function audit(
  action: AuditEvent["action"],
  actorRole: AuditEvent["actorRole"],
  actorName: string,
  detail: string,
  at: string
): AuditEvent {
  return { id: uuid(), at, action, actorRole, actorName, detail };
}

function ledger(
  type: LedgerEntry["type"],
  amountEtb: number,
  balanceAfterEtb: number,
  note: string,
  at: string,
  bankRef?: string
): LedgerEntry {
  return {
    id: uuid(),
    at,
    type,
    amountEtb,
    balanceAfterEtb,
    note,
    bankRef,
  };
}

function milestonesFromSector(
  sectorId: EscrowDeal["sector"],
  amount: number,
  statuses: Milestone["status"][]
): Milestone[] {
  const sector = getSector(sectorId);
  return sector.defaultMilestones.map((m, i) => ({
    id: uuid(),
    title: m.title,
    description: m.description,
    percent: m.percent,
    amountEtb: Math.round((amount * m.percent) / 100),
    status: statuses[i] ?? "pending",
  }));
}

export function createSeedState(): AppState {
  const now = new Date().toISOString();

  // 1. Real estate — in progress, first milestone released (partially_released)
  const reAmount = 2_400_000;
  const reFee = feeFromBps(reAmount, 100);
  const reMs = milestonesFromSector("real_estate", reAmount, [
    "released",
    "submitted",
    "pending",
    "pending",
  ]);
  reMs[0].evidenceNote =
    "Site photos + engineer certificate for foundation & frame (CMC / Bole).";
  reMs[0].evidenceAt = daysAgo(18);
  reMs[0].verifiedBy = "Eng. Selamawit Tadesse";
  reMs[0].verifiedAt = daysAgo(16);
  reMs[0].releasedAt = daysAgo(16);
  reMs[1].evidenceNote =
    "Roofing complete photos submitted; awaiting verifier site visit.";
  reMs[1].evidenceAt = daysAgo(2);

  const reDeal: EscrowDeal = {
    id: "deal-re-001",
    reference: "ESC-RE-2026-001",
    sector: "real_estate",
    title: "Bole Apartment Off-plan — Unit 4B",
    description:
      "Buyer deposits construction escrow for a 2-bedroom off-plan unit in Bole, Addis Ababa. Releases tied to verified construction milestones (Proclamation 1357/2024 spirit).",
    status: "partially_released",
    amountEtb: reAmount,
    currency: "ETB",
    feeBps: 100,
    feeEtb: reFee,
    heldEtb: reAmount - reMs[0].amountEtb,
    releasedEtb: reMs[0].amountEtb,
    refundedEtb: 0,
    buyer: {
      id: "p-buyer-re",
      name: "Hanna Bekele",
      role: "buyer",
      phone: "+251 911 234 567",
      city: "Addis Ababa",
    },
    seller: {
      id: "p-seller-re",
      name: "Yonas Construction PLC",
      role: "seller",
      phone: "+251 116 612 345",
      city: "Addis Ababa",
    },
    bankName: BANKS[0],
    fundingMethod: "bank_transfer",
    fundedAt: daysAgo(45),
    createdAt: daysAgo(50),
    updatedAt: daysAgo(2),
    milestones: reMs,
    ledger: [
      ledger(
        "deposit",
        reAmount,
        reAmount,
        "Buyer wire from CBE — funded escrow account",
        daysAgo(45),
        "AWA-TRF-88421"
      ),
      ledger(
        "hold",
        reAmount,
        reAmount,
        "Segregated hold — Awash Bank Escrow Custody",
        daysAgo(45),
        "AWA-HLD-88421"
      ),
      ledger(
        "release",
        reMs[0].amountEtb,
        reAmount - reMs[0].amountEtb,
        "Milestone 1 release to Yonas Construction PLC",
        daysAgo(16),
        "AWA-REL-90102"
      ),
      ledger(
        "fee",
        Math.round((reMs[0].amountEtb * 100) / 10000),
        reAmount - reMs[0].amountEtb,
        "Platform fee on milestone 1 (1.00%)",
        daysAgo(16),
        "AWA-FEE-90102"
      ),
    ],
    audit: [
      audit(
        "created",
        "operator",
        "EscrowET Operator",
        "Deal created from Real Estate template",
        daysAgo(50)
      ),
      audit(
        "funded",
        "bank",
        "Awash Trust Desk",
        `Deposit confirmed ${reAmount.toLocaleString()} ETB`,
        daysAgo(45)
      ),
      audit(
        "evidence_submitted",
        "seller",
        "Yonas Construction PLC",
        "Foundation & structure evidence uploaded",
        daysAgo(18)
      ),
      audit(
        "milestone_verified",
        "verifier",
        "Eng. Selamawit Tadesse",
        "Site visit passed — foundation & frame OK",
        daysAgo(16)
      ),
      audit(
        "partial_release",
        "bank",
        "Awash Trust Desk",
        `Released ${reMs[0].amountEtb.toLocaleString()} ETB (30%)`,
        daysAgo(16)
      ),
      audit(
        "evidence_submitted",
        "seller",
        "Yonas Construction PLC",
        "Roofing & envelope evidence submitted",
        daysAgo(2)
      ),
    ],
    location: "Bole, Addis Ababa",
  };

  // 2. E-commerce — funded, awaiting delivery evidence
  const ecAmount = 18_500;
  const ecFee = feeFromBps(ecAmount, 200);
  const ecMs = milestonesFromSector("ecommerce", ecAmount, [
    "pending",
    "pending",
  ]);

  const ecDeal: EscrowDeal = {
    id: "deal-ec-001",
    reference: "ESC-EC-2026-014",
    sector: "ecommerce",
    title: "Samsung Galaxy A55 — AddisMarket",
    description:
      "Buyer purchased a smartphone via AddisMarket. Funds held until courier delivery and 3-day inspection.",
    status: "funded",
    amountEtb: ecAmount,
    currency: "ETB",
    feeBps: 200,
    feeEtb: ecFee,
    heldEtb: ecAmount,
    releasedEtb: 0,
    refundedEtb: 0,
    buyer: {
      id: "p-buyer-ec",
      name: "Dawit Alemu",
      role: "buyer",
      phone: "+251 912 888 111",
      city: "Addis Ababa",
    },
    seller: {
      id: "p-seller-ec",
      name: "TechHub Merkato",
      role: "seller",
      phone: "+251 911 555 220",
      city: "Addis Ababa",
    },
    bankName: BANKS[1],
    fundingMethod: "mobile_money",
    fundedAt: daysAgo(1),
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    milestones: ecMs,
    ledger: [
      ledger(
        "deposit",
        ecAmount,
        ecAmount,
        "Telebirr mobile money top-up to escrow",
        daysAgo(1),
        "DSH-MM-44102"
      ),
      ledger(
        "hold",
        ecAmount,
        ecAmount,
        "Segregated hold — Dashen Bank",
        daysAgo(1),
        "DSH-HLD-44102"
      ),
    ],
    audit: [
      audit(
        "created",
        "marketplace",
        "AddisMarket Ops",
        "Escrow opened from marketplace checkout",
        daysAgo(2)
      ),
      audit(
        "funded",
        "buyer",
        "Dawit Alemu",
        "Funded via Telebirr (simulated)",
        daysAgo(1)
      ),
    ],
    location: "Merkato → Kazanchis, Addis Ababa",
    inspectionDays: 3,
  };

  // 3. Scholarship — disputed
  const scAmount = 450_000;
  const scFee = feeFromBps(scAmount, 150);
  const scMs = milestonesFromSector("scholarship", scAmount, [
    "released",
    "rejected",
    "pending",
  ]);
  scMs[0].evidenceNote = "Offer letter from University of Debrecen verified.";
  scMs[0].evidenceAt = daysAgo(30);
  scMs[0].verifiedBy = "EscrowET Operator";
  scMs[0].verifiedAt = daysAgo(28);
  scMs[0].releasedAt = daysAgo(28);
  scMs[1].evidenceNote = "Agency claimed visa issued; buyer disputes authenticity.";
  scMs[1].evidenceAt = daysAgo(5);
  scMs[1].rejectionReason =
    "Visa document appears inconsistent; buyer opened dispute.";
  scMs[1].verifiedAt = daysAgo(4);

  const scDeal: EscrowDeal = {
    id: "deal-sc-001",
    reference: "ESC-SC-2026-007",
    sector: "scholarship",
    title: "Hungary Tuition Package — Agency Mediation",
    description:
      "Parent funds tuition + agency fee for undergraduate placement. Release gated on offer, visa/enrollment, and remittance.",
    status: "disputed",
    amountEtb: scAmount,
    currency: "ETB",
    feeBps: 150,
    feeEtb: scFee,
    heldEtb: scAmount - scMs[0].amountEtb,
    releasedEtb: scMs[0].amountEtb,
    refundedEtb: 0,
    buyer: {
      id: "p-buyer-sc",
      name: "Mulugeta Haile (Parent)",
      role: "buyer",
      phone: "+251 913 444 900",
      city: "Bahir Dar",
    },
    seller: {
      id: "p-seller-sc",
      name: "Horizon Study Abroad Agency",
      role: "seller",
      phone: "+251 115 123 456",
      city: "Addis Ababa",
    },
    bankName: BANKS[2],
    fundingMethod: "bank_transfer",
    fundedAt: daysAgo(40),
    createdAt: daysAgo(42),
    updatedAt: daysAgo(3),
    milestones: scMs,
    ledger: [
      ledger(
        "deposit",
        scAmount,
        scAmount,
        "Parent wire — BoA escrow account",
        daysAgo(40),
        "BOA-TRF-22011"
      ),
      ledger(
        "hold",
        scAmount,
        scAmount,
        "Segregated hold",
        daysAgo(40),
        "BOA-HLD-22011"
      ),
      ledger(
        "release",
        scMs[0].amountEtb,
        scAmount - scMs[0].amountEtb,
        "Offer-letter milestone release",
        daysAgo(28),
        "BOA-REL-22100"
      ),
    ],
    audit: [
      audit(
        "created",
        "operator",
        "EscrowET Operator",
        "Scholarship escrow opened",
        daysAgo(42)
      ),
      audit(
        "funded",
        "bank",
        "BoA Escrow Desk",
        "Funds received and held",
        daysAgo(40)
      ),
      audit(
        "partial_release",
        "operator",
        "EscrowET Operator",
        "Offer letter milestone released",
        daysAgo(28)
      ),
      audit(
        "milestone_rejected",
        "buyer",
        "Mulugeta Haile (Parent)",
        "Visa evidence rejected — authenticity concerns",
        daysAgo(4)
      ),
      audit(
        "dispute_opened",
        "buyer",
        "Mulugeta Haile (Parent)",
        "Dispute opened: alleged forged visa documentation",
        daysAgo(3)
      ),
    ],
    dispute: {
      id: "dsp-001",
      openedAt: daysAgo(3),
      openedBy: "buyer",
      reason:
        "Agency submitted a visa stamp that does not match embassy formatting. Request refund of remaining hold pending investigation.",
      status: "open",
    },
    location: "Addis Ababa → Debrecen, Hungary",
  };

  // 4. Travel — pending funding
  const trAmount = 95_000;
  const trFee = feeFromBps(trAmount, 175);
  const trMs = milestonesFromSector("travel", trAmount, ["pending", "pending"]);

  const trDeal: EscrowDeal = {
    id: "deal-tr-001",
    reference: "ESC-TR-2026-022",
    sector: "travel",
    title: "Dubai Family Package — 5 nights",
    description:
      "Family of four: flights ADD–DXB + hotel. Escrow until booking vouchers confirmed and departure.",
    status: "pending_funding",
    amountEtb: trAmount,
    currency: "ETB",
    feeBps: 175,
    feeEtb: trFee,
    heldEtb: 0,
    releasedEtb: 0,
    refundedEtb: 0,
    buyer: {
      id: "p-buyer-tr",
      name: "Sara Girma",
      role: "buyer",
      phone: "+251 911 777 333",
      city: "Addis Ababa",
    },
    seller: {
      id: "p-seller-tr",
      name: "Blue Nile Travel Agency",
      role: "seller",
      phone: "+251 115 987 654",
      city: "Addis Ababa",
    },
    bankName: BANKS[3],
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    milestones: trMs,
    ledger: [],
    audit: [
      audit(
        "created",
        "seller",
        "Blue Nile Travel Agency",
        "Travel package escrow created — awaiting buyer funding",
        daysAgo(0)
      ),
    ],
    location: "Addis Ababa → Dubai",
  };

  // 5. Freelancer — closed (fully released)
  const flAmount = 65_000;
  const flFee = feeFromBps(flAmount, 250);
  const flMs = milestonesFromSector("freelancer", flAmount, [
    "released",
    "released",
    "released",
  ]);
  flMs.forEach((m, i) => {
    m.evidenceNote = `Deliverable batch ${i + 1} accepted.`;
    m.evidenceAt = daysAgo(20 - i * 5);
    m.verifiedBy = "Buyer — Lidya Tesfaye";
    m.verifiedAt = daysAgo(19 - i * 5);
    m.releasedAt = daysAgo(19 - i * 5);
  });

  const flDeal: EscrowDeal = {
    id: "deal-fl-001",
    reference: "ESC-FL-2026-031",
    sector: "freelancer",
    title: "Brand Website Redesign — Café Buna",
    description:
      "UI/UX and Next.js build for a local café chain. Three deliverable milestones; deal closed with full statement.",
    status: "closed",
    amountEtb: flAmount,
    currency: "ETB",
    feeBps: 250,
    feeEtb: flFee,
    heldEtb: 0,
    releasedEtb: flAmount,
    refundedEtb: 0,
    buyer: {
      id: "p-buyer-fl",
      name: "Lidya Tesfaye",
      role: "buyer",
      phone: "+251 911 222 100",
      city: "Addis Ababa",
    },
    seller: {
      id: "p-seller-fl",
      name: "Abel Design Studio",
      role: "seller",
      phone: "+251 912 333 200",
      city: "Addis Ababa",
    },
    bankName: BANKS[0],
    fundingMethod: "bank_transfer",
    fundedAt: daysAgo(35),
    createdAt: daysAgo(38),
    updatedAt: daysAgo(5),
    closedAt: daysAgo(5),
    milestones: flMs,
    ledger: [
      ledger(
        "deposit",
        flAmount,
        flAmount,
        "Client wire to escrow",
        daysAgo(35),
        "AWA-TRF-55001"
      ),
      ledger(
        "hold",
        flAmount,
        flAmount,
        "Segregated hold",
        daysAgo(35),
        "AWA-HLD-55001"
      ),
      ledger(
        "release",
        flMs[0].amountEtb,
        flAmount - flMs[0].amountEtb,
        "Kickoff milestone",
        daysAgo(30),
        "AWA-REL-55010"
      ),
      ledger(
        "release",
        flMs[1].amountEtb,
        flAmount - flMs[0].amountEtb - flMs[1].amountEtb,
        "Draft milestone",
        daysAgo(15),
        "AWA-REL-55020"
      ),
      ledger(
        "release",
        flMs[2].amountEtb,
        0,
        "Final delivery milestone",
        daysAgo(5),
        "AWA-REL-55030"
      ),
      ledger(
        "fee",
        flFee,
        0,
        "Total platform fee (2.50%) collected across releases",
        daysAgo(5),
        "AWA-FEE-55030"
      ),
    ],
    audit: [
      audit(
        "created",
        "buyer",
        "Lidya Tesfaye",
        "Freelancer escrow created",
        daysAgo(38)
      ),
      audit(
        "funded",
        "bank",
        "Awash Trust Desk",
        "Funds held",
        daysAgo(35)
      ),
      audit(
        "full_release",
        "bank",
        "Awash Trust Desk",
        "All milestones released; deal ready to close",
        daysAgo(5)
      ),
      audit(
        "closed",
        "operator",
        "EscrowET Operator",
        "Deal closed — statement issued",
        daysAgo(5)
      ),
    ],
    location: "Addis Ababa (remote)",
  };

  return {
    version: 1,
    seededAt: now,
    deals: [reDeal, ecDeal, scDeal, trDeal, flDeal],
  };
}
