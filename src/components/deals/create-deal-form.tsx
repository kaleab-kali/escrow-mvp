"use client";

import { useMemo, useState } from "react";
import { createDealAction } from "@/lib/actions/deals";
import { feeForAmount, formatEtb } from "@/lib/format";
import { SECTOR_LABELS, type Sector, type User } from "@/lib/types";
import { buttonClass } from "@/components/ui/button";

const sectors = Object.keys(SECTOR_LABELS) as Sector[];

export function CreateDealForm({
  currentUser,
  counterparties,
}: {
  currentUser: User;
  counterparties: User[];
}) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState<Sector>("ecommerce");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [amountEtb, setAmountEtb] = useState(100000);
  const [sellerId, setSellerId] = useState(
    counterparties.find((u) => u.role === "seller")?.id ?? ""
  );
  const [buyerId, setBuyerId] = useState(
    counterparties.find((u) => u.role === "buyer")?.id ?? ""
  );
  const [milestones, setMilestones] = useState([
    { title: "Delivery / completion", amountEtb: 100000, dueDate: "" },
  ]);

  const fee = useMemo(() => feeForAmount(amountEtb || 0), [amountEtb]);
  const milestoneSum = milestones.reduce((s, m) => s + (Number(m.amountEtb) || 0), 0);
  const sellers = counterparties.filter((u) => u.role === "seller");
  const buyers = counterparties.filter((u) => u.role === "buyer");

  function syncMilestoneTotal(nextAmount: number) {
    setAmountEtb(nextAmount);
    if (milestones.length === 1) {
      setMilestones([{ ...milestones[0], amountEtb: nextAmount }]);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step >= n ? "bg-teal-700 text-white" : "bg-zinc-200 text-zinc-500"
              }`}
            >
              {n}
            </div>
            <span className="hidden text-sm text-zinc-600 sm:inline">
              {n === 1 ? "Basics" : n === 2 ? "Parties & amount" : "Milestones"}
            </span>
            {n < 3 ? <div className="mx-1 h-px w-8 bg-zinc-200 sm:w-12" /> : null}
          </div>
        ))}
      </div>

      <form action={createDealAction} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="sector" value={sector} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="location" value={location} />
        <input type="hidden" name="amountEtb" value={amountEtb} />
        <input type="hidden" name="sellerId" value={currentUser.role === "seller" ? currentUser.id : sellerId} />
        <input type="hidden" name="buyerId" value={currentUser.role === "buyer" ? currentUser.id : buyerId} />
        <input type="hidden" name="milestones" value={JSON.stringify(milestones)} />

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Deal title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="e.g. Bole apartment title transfer"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sector</label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {sectors.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSector(s)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm ${
                      sector === s
                        ? "border-teal-600 bg-teal-50 text-teal-900"
                        : "border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {SECTOR_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="What is being escrowed and release conditions…"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location (optional)</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Addis Ababa, Hawassa…"
              />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            {currentUser.role !== "seller" ? (
              <div>
                <label className="text-sm font-medium">Seller</label>
                <select
                  value={sellerId}
                  onChange={(e) => setSellerId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Buyer</label>
                <select
                  value={buyerId}
                  onChange={(e) => setBuyerId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  {buyers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Total amount (ETB)</label>
              <input
                type="number"
                min={1000}
                value={amountEtb}
                onChange={(e) => syncMilestoneTotal(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm tabular-nums outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500">Escrow fee (1.5%)</p>
                <p className="font-semibold tabular-nums">{formatEtb(fee)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Buyer funds</p>
                <p className="font-semibold tabular-nums">{formatEtb(amountEtb + fee)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Milestones</p>
              <button
                type="button"
                className={buttonClass({ variant: "secondary", size: "sm" })}
                onClick={() =>
                  setMilestones([
                    ...milestones,
                    { title: `Milestone ${milestones.length + 1}`, amountEtb: 0, dueDate: "" },
                  ])
                }
              >
                Add milestone
              </button>
            </div>
            {milestones.map((m, idx) => (
              <div key={idx} className="grid gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-3">
                <input
                  value={m.title}
                  onChange={(e) => {
                    const next = [...milestones];
                    next[idx] = { ...m, title: e.target.value };
                    setMilestones(next);
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm sm:col-span-1"
                  placeholder="Title"
                />
                <input
                  type="number"
                  value={m.amountEtb}
                  onChange={(e) => {
                    const next = [...milestones];
                    next[idx] = { ...m, amountEtb: Number(e.target.value) };
                    setMilestones(next);
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm tabular-nums"
                  placeholder="Amount"
                />
                <input
                  type="date"
                  value={m.dueDate}
                  onChange={(e) => {
                    const next = [...milestones];
                    next[idx] = { ...m, dueDate: e.target.value };
                    setMilestones(next);
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
            ))}
            <p
              className={`text-xs ${
                milestoneSum === amountEtb ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              Milestone sum {formatEtb(milestoneSum)} · deal total {formatEtb(amountEtb)}
              {milestoneSum !== amountEtb ? " — adjust to match before submitting." : " ✓"}
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className={buttonClass({ variant: "secondary" })}
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !title.trim()) return;
                setStep((s) => s + 1);
              }}
              className={buttonClass()}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={!title || amountEtb <= 0 || milestoneSum !== amountEtb}
              className={buttonClass()}
            >
              Create escrow deal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
