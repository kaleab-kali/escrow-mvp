"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuid } from "uuid";
import { requireUser } from "@/lib/auth";
import { getStore } from "@/lib/store";

export async function createApiKey(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const partnerName = String(formData.get("partnerName") || "").trim();
  if (!name || !partnerName) throw new Error("Name and partner required");

  const suffix = uuid().replace(/-/g, "").slice(0, 16);
  const key = {
    id: `key-${uuid().slice(0, 8)}`,
    name,
    keyPrefix: `et_live_${partnerName.toLowerCase().replace(/\s+/g, "").slice(0, 8)}`,
    fullKey: `et_live_${partnerName.toLowerCase().replace(/\s+/g, "").slice(0, 8)}_${suffix}`,
    partnerName,
    createdAt: new Date().toISOString(),
    requests30d: 0,
    active: true,
  };
  getStore().apiKeys.unshift(key);
  revalidatePath("/partners");
}

export async function revokeApiKey(keyId: string) {
  await requireUser();
  const key = getStore().apiKeys.find((k) => k.id === keyId);
  if (!key) throw new Error("Key not found");
  key.active = false;
  revalidatePath("/partners");
}

export async function createWebhook(formData: FormData) {
  await requireUser();
  const url = String(formData.get("url") || "").trim();
  const partnerName = String(formData.get("partnerName") || "").trim();
  const eventsRaw = String(formData.get("events") || "");
  const events = eventsRaw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!url || !partnerName) throw new Error("URL and partner required");

  getStore().webhooks.unshift({
    id: `wh-${uuid().slice(0, 8)}`,
    url,
    events: events.length
      ? events
      : ["deal.funded", "deal.released", "deal.disputed"],
    active: true,
    partnerName,
    createdAt: new Date().toISOString(),
    successRate: 100,
  });
  revalidatePath("/partners");
}

export async function toggleWebhook(webhookId: string) {
  await requireUser();
  const wh = getStore().webhooks.find((w) => w.id === webhookId);
  if (!wh) throw new Error("Webhook not found");
  wh.active = !wh.active;
  revalidatePath("/partners");
}
