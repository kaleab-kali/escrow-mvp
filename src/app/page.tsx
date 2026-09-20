"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Building2,
  ShoppingBag,
  GraduationCap,
  Plane,
  Laptop,
  Shield,
  Landmark,
  Scale,
} from "lucide-react";
import { ROLES } from "@/lib/roles";
import { SECTORS } from "@/lib/sectors";
import { useEscrow } from "@/lib/store";
import { DealCard } from "@/components/DealCard";
import { StatCard } from "@/components/StatCard";
import { formatEtb } from "@/lib/format";
import { RolePickButton } from "@/components/RolePickButton";

const ICONS: Record<string, ReactNode> = {
  real_estate: <Building2 className="h-6 w-6" />,
  ecommerce: <ShoppingBag className="h-6 w-6" />,
  scholarship: <GraduationCap className="h-6 w-6" />,
  travel: <Plane className="h-6 w-6" />,
  freelancer: <Laptop className="h-6 w-6" />,
};

export default function HomePage() {
  const { deals } = useEscrow();
  const held = deals.reduce((s, d) => s + d.heldEtb, 0);
  const released = deals.reduce((s, d) => s + d.releasedEtb, 0);
  const openDisputes = deals.filter((d) => d.dispute?.status === "open").length;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b3d2e] via-[#0f4a38] to-[#145c46] text-white p-8 sm:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c9a227]/20 blur-2xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#c9a227] mb-4">
            <Shield className="h-3.5 w-3.5" />
            Ethiopia Escrow-as-a-Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Trust intermediary for informal & low-trust markets
          </h1>
          <p className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed">
            Buyer deposits into escrow → seller delivers → funds release when
            conditions are met. Partner bank holds segregated funds. Platform never
            owns the money. Built for demos to sector clients, banks, and NBE.
          </p>
          <p className="mt-2 text-white/60 text-sm">
            ገዢ ገንዘብ ያስቀምጣል · ሻጭ ያቀርባል · ሁኔታ ሲሟላ ይለቀቃል
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/deals/new" className="btn bg-[#c9a227] text-[#0b3d2e] hover:bg-[#d4b03a]">
              Create escrow
            </Link>
            <Link href="/deals" className="btn bg-white/10 text-white hover:bg-white/20 border border-white/20">
              View seeded deals
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Active deals" value={String(deals.length)} hint="Across 5 sectors" icon={<Scale className="h-5 w-5" />} />
        <StatCard label="Held in custody" value={formatEtb(held)} hint="Segregated (simulated)" icon={<Landmark className="h-5 w-5" />} />
        <StatCard label="Released" value={formatEtb(released)} hint="To sellers / providers" />
        <StatCard label="Open disputes" value={String(openDisputes)} hint="Mediator queue" />
      </section>

      <section>
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pick a demo role</h2>
            <p className="text-sm text-slate-500">One-click login — no real auth · ሚና ይምረጡ</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ROLES.map((r) => (
            <RolePickButton key={r.id} role={r.id} label={r.label} labelAm={r.labelAm} description={r.description} color={r.color} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Create by sector</h2>
          <p className="text-sm text-slate-500">Templates with milestone schedules · ዘርፍ ይምረጡ</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SECTORS.map((s) => (
            <Link
              key={s.id}
              href={`/deals/new?sector=${s.id}`}
              className="card p-5 hover:shadow-md hover:border-[#0b3d2e]/30 transition"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b3d2e]/10 text-[#0b3d2e]">
                {ICONS[s.id]}
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">
                {s.label}{" "}
                <span className="text-slate-400 font-normal">· {s.labelAm}</span>
              </h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{s.description}</p>
              <p className="mt-2 text-xs font-medium text-[#0b3d2e]">
                Fee {(s.feeBps / 100).toFixed(2)}% · {s.defaultMilestones.length} milestones
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Seeded deals</h2>
          <Link href="/deals" className="text-sm font-semibold text-[#0b3d2e]">
            See all →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {deals.slice(0, 4).map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
