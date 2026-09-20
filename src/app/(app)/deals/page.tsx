import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dealsForUser } from "@/lib/deal-helpers";
import { getStore } from "@/lib/store";
import { DealsTable } from "@/components/deals/deals-table";
import { buttonClass } from "@/components/ui/button";
import { STATUS_LABELS, SECTOR_LABELS, type DealStatus, type Sector } from "@/lib/types";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sector?: string; q?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const sp = await searchParams;

  let deals = dealsForUser(getStore().deals, user);
  if (sp.status) deals = deals.filter((d) => d.status === sp.status);
  if (sp.sector) deals = deals.filter((d) => d.sector === sp.sector);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    deals = deals.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.location?.toLowerCase().includes(q)
    );
  }

  const statuses = Object.keys(STATUS_LABELS) as DealStatus[];
  const sectors = Object.keys(SECTOR_LABELS) as Sector[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
          <p className="mt-1 text-sm text-zinc-500">{deals.length} shown</p>
        </div>
        <Link href="/deals/new" className={buttonClass()}>
          New deal
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search title, id, location…"
          className="min-w-[200px] flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          name="sector"
          defaultValue={sp.sector ?? ""}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {SECTOR_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClass({ variant: "secondary" })}>
          Filter
        </button>
      </form>

      <DealsTable deals={deals} />
    </div>
  );
}
