"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuid } from "uuid";
import { requireRole } from "@/lib/auth";
import { appendAudit, getStore } from "@/lib/store";
import { OPERATOR_BANKS } from "@/lib/constants";

export async function generateEodPack(formData: FormData) {
  const user = await requireRole("operator");
  const bankName = String(formData.get("bankName") || OPERATOR_BANKS[0]);
  const date =
    String(formData.get("date") || "") ||
    new Date().toISOString().slice(0, 10);

  const store = getStore();
  const activeCustody = store.deals
    .filter((d) =>
      ["funded", "in_progress", "pending_verification", "pending_release", "disputed"].includes(
        d.status
      )
    )
    .reduce((s, d) => s + d.amountEtb, 0);

  const todaySettlements = store.settlements.filter((s) =>
    s.settledAt.startsWith(date)
  );
  const inflow = store.deals
    .filter((d) => d.fundedAt?.startsWith(date))
    .reduce((s, d) => s + d.amountEtb, 0);
  const outflow = todaySettlements
    .filter((s) => s.type !== "fee")
    .reduce((s, d) => s + d.amountEtb, 0);

  const pack = {
    id: `eod-${uuid().slice(0, 8)}`,
    bankName,
    date,
    generatedAt: new Date().toISOString(),
    generatedBy: user.name,
    custodyBalanceEtb: activeCustody || 8_500_000,
    inflowEtb: inflow || Math.round(activeCustody * 0.08),
    outflowEtb: outflow || Math.round(activeCustody * 0.05),
    dealCount: store.deals.filter((d) =>
      ["funded", "in_progress", "pending_verification", "pending_release", "disputed"].includes(
        d.status
      )
    ).length,
    status: "generated" as const,
  };

  store.eodPacks.unshift(pack);
  appendAudit({
    dealId: "system",
    at: pack.generatedAt,
    actorId: user.id,
    actorName: user.name,
    action: "eod.generated",
    detail: `${bankName} · ${date}`,
  });

  revalidatePath("/operator/eod");
  revalidatePath("/operator");
}

export async function archiveEodPack(packId: string) {
  await requireRole("operator");
  const pack = getStore().eodPacks.find((p) => p.id === packId);
  if (!pack) throw new Error("Pack not found");
  pack.status = "archived";
  revalidatePath("/operator/eod");
}


export async function getAuditCsv(): Promise<string> {
  await requireRole("operator");
  const rows = getStore().audit;
  const header = "id,dealId,at,actorId,actorName,action,detail";
  const lines = rows.map((r) =>
    [
      r.id,
      r.dealId,
      r.at,
      r.actorId,
      csvEscape(r.actorName),
      r.action,
      csvEscape(r.detail ?? ""),
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

function csvEscape(v: string) {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
