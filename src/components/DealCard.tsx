import Link from "next/link";
import { StatusChip } from "./StatusChip";
import { formatEtb, formatDateShort } from "@/lib/format";
import { getSector } from "@/lib/sectors";
import type { EscrowDeal } from "@/lib/types";
import { MapPin, ArrowRight } from "lucide-react";

export function DealCard({ deal }: { deal: EscrowDeal }) {
  const sector = getSector(deal.sector);
  return (
    <Link
      href={`/deals/view?id=${deal.id}`}
      className="card block p-5 hover:shadow-md hover:border-[#0b3d2e]/30 transition group"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <StatusChip status={deal.status} />
            <span className="text-xs font-medium text-slate-500">
              {sector.label} · {sector.labelAm}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 group-hover:text-[#0b3d2e] leading-snug">
            {deal.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-mono">{deal.reference}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#0b3d2e] shrink-0 mt-1" />
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-900">
            {formatEtb(deal.amountEtb)}
          </div>
          <div className="text-xs text-slate-500">
            Held {formatEtb(deal.heldEtb)} · Released {formatEtb(deal.releasedEtb)}
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div className="flex items-center gap-1 justify-end">
            <MapPin className="h-3 w-3" />
            {deal.location}
          </div>
          <div className="mt-0.5">{formatDateShort(deal.updatedAt)}</div>
        </div>
      </div>
    </Link>
  );
}
