"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreateDealForm } from "@/components/CreateDealForm";
import { SECTORS } from "@/lib/sectors";
import type { SectorId } from "@/lib/types";

function NewDealInner() {
  const searchParams = useSearchParams();
  const sectorParam = searchParams.get("sector");
  const sector =
    (SECTORS.find((s) => s.id === sectorParam)?.id as SectorId) || "ecommerce";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create escrow / አዲስ ኤስክሮው
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pick a sector template. Milestones and fee schedule load automatically.
        </p>
      </div>
      <CreateDealForm defaultSector={sector} />
    </div>
  );
}

export default function NewDealPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading form…</div>}>
      <NewDealInner />
    </Suspense>
  );
}
