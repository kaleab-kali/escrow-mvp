import { CreateDealForm } from "@/components/CreateDealForm";
import { SECTORS } from "@/lib/sectors";
import type { SectorId } from "@/lib/types";

export default function NewDealPage({
  searchParams,
}: {
  searchParams: { sector?: string };
}) {
  const sector =
    (SECTORS.find((s) => s.id === searchParams.sector)?.id as SectorId) ||
    "ecommerce";

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
