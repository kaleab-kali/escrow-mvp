import Link from "next/link";
import { getDeals } from "@/lib/db";
import { DealCard } from "@/components/DealCard";
import { SECTORS } from "@/lib/sectors";

export default function DealsPage({
  searchParams,
}: {
  searchParams: { sector?: string };
}) {
  let deals = getDeals();
  if (searchParams.sector) {
    deals = deals.filter((d) => d.sector === searchParams.sector);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deals / ስምምነቶች</h1>
          <p className="text-sm text-slate-500">
            All escrow deals across sectors
          </p>
        </div>
        <Link href="/deals/new" className="btn-primary">
          New escrow
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/deals"
          className={`rounded-full px-3 py-1 text-xs font-semibold border ${
            !searchParams.sector
              ? "bg-[#0b3d2e] text-white border-[#0b3d2e]"
              : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          All
        </Link>
        {SECTORS.map((s) => (
          <Link
            key={s.id}
            href={`/deals?sector=${s.id}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold border ${
              searchParams.sector === s.id
                ? "bg-[#0b3d2e] text-white border-[#0b3d2e]"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
        {deals.length === 0 && (
          <p className="text-slate-500 col-span-2">No deals in this filter.</p>
        )}
      </div>
    </div>
  );
}
