import type { Role, RoleId } from "./types";

export const ROLES: Role[] = [
  {
    id: "buyer",
    label: "Buyer",
    labelAm: "ገዢ",
    description: "Deposit funds and approve releases after delivery.",
    color: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    id: "seller",
    label: "Seller / Provider",
    labelAm: "ሻጭ",
    description: "Deliver goods or services and submit milestone evidence.",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    id: "marketplace",
    label: "Marketplace Admin",
    labelAm: "ገበያ አስተዳዳሪ",
    description: "Light oversight of platform-listed deals.",
    color: "bg-violet-100 text-violet-800 border-violet-200",
  },
  {
    id: "verifier",
    label: "Real-estate Verifier",
    labelAm: "ሪል እስቴት ማረጋገጫ",
    description: "Verify construction milestones (Proclamation 1357/2024 spirit).",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "bank",
    label: "Bank Partner",
    labelAm: "ባንክ አጋር",
    description: "Custody ledger, holds, and release instructions (simulated).",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    id: "operator",
    label: "Escrow Operator",
    labelAm: "ኤስክሮው ኦፕሬተር",
    description: "Platform admin — fees, ops, deal oversight.",
    color: "bg-rose-100 text-rose-800 border-rose-200",
  },
  {
    id: "regulator",
    label: "NBE / Regulator",
    labelAm: "ብሔራዊ ባንክ",
    description: "Read-only supervisory view of segregated custody.",
    color: "bg-slate-100 text-slate-800 border-slate-200",
  },
  {
    id: "mediator",
    label: "Dispute Mediator",
    labelAm: "አስታራቂ",
    description: "Resolve disputes between buyers and sellers.",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
];

export function getRole(id: RoleId): Role {
  return ROLES.find((r) => r.id === id) ?? ROLES[0];
}

export const DEMO_ACTORS: Record<RoleId, string> = {
  buyer: "Hanna Bekele",
  seller: "Yonas Construction PLC",
  marketplace: "AddisMarket Ops",
  verifier: "Eng. Selamawit Tadesse",
  bank: "Awash Trust Desk",
  operator: "EscrowET Operator",
  regulator: "NBE Supervision Desk",
  mediator: "Mediator Abebe Kebede",
};
