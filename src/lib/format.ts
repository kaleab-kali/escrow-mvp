import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatEtb(amount: number): string {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEtbCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `ETB ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `ETB ${(amount / 1_000).toFixed(0)}K`;
  }
  return formatEtb(amount);
}

export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy");
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy · HH:mm");
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function feeForAmount(amountEtb: number): number {
  // 1.5% escrow fee, min 500 ETB, max 75_000 ETB
  return Math.min(75_000, Math.max(500, Math.round(amountEtb * 0.015)));
}

export function clsxJoin(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
