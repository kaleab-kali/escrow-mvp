"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SECTORS, getSector } from "@/lib/sectors";
import type { FundingMethod, SectorId } from "@/lib/types";
import { useEscrow } from "@/lib/store";

export function CreateDealForm({ defaultSector }: { defaultSector: SectorId }) {
  const [sector, setSector] = useState<SectorId>(defaultSector);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { createDeal } = useEscrow();
  const s = getSector(sector);

  return (
    <form
      className="card p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        setPending(true);
        const res = createDeal({
          sector,
          title: String(fd.get("title") || ""),
          description: String(fd.get("description") || ""),
          amountEtb: Number(fd.get("amountEtb") || 0),
          buyerName: String(fd.get("buyerName") || ""),
          sellerName: String(fd.get("sellerName") || ""),
          location: String(fd.get("location") || "Addis Ababa"),
          fundingMethod: (fd.get("fundingMethod") as FundingMethod) || undefined,
        });
        setPending(false);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.push(`/deals/view?id=${res.id}`);
      }}
    >
      <div>
        <label className="label">Sector / ዘርፍ</label>
        <select
          className="input"
          value={sector}
          onChange={(e) => setSector(e.target.value as SectorId)}
        >
          {SECTORS.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.label} · {sec.labelAm}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          {s.description} · Fee {(s.feeBps / 100).toFixed(2)}% ·{" "}
          {s.defaultMilestones.length} milestones
        </p>
      </div>

      <div>
        <label className="label">Title</label>
        <input
          name="title"
          className="input"
          required
          placeholder="e.g. Offline sale of used Toyota Corolla"
          defaultValue=""
        />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          className="input min-h-[80px]"
          placeholder="What is being escrowed?"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Amount (ETB)</label>
          <input
            name="amountEtb"
            type="number"
            min={1}
            className="input"
            required
            defaultValue={50000}
          />
        </div>
        <div>
          <label className="label">Location</label>
          <input name="location" className="input" defaultValue="Addis Ababa" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Buyer name</label>
          <input name="buyerName" className="input" defaultValue="Demo Buyer" />
        </div>
        <div>
          <label className="label">Seller / provider</label>
          <input name="sellerName" className="input" defaultValue="Demo Seller" />
        </div>
      </div>

      <div>
        <label className="label">Preferred funding (optional)</label>
        <select name="fundingMethod" className="input" defaultValue="">
          <option value="">Decide at funding</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="mobile_money">Mobile money</option>
        </select>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
        <div className="text-xs font-semibold text-slate-500 mb-2">
          Milestone schedule
        </div>
        <ul className="space-y-1 text-sm text-slate-700">
          {s.defaultMilestones.map((m) => (
            <li key={m.title}>
              <span className="font-medium">{m.percent}%</span> — {m.title}
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Creating…" : "Create escrow"}
      </button>
    </form>
  );
}
