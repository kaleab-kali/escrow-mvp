import { format, parseISO } from "date-fns";

export function formatEtb(amount: number): string {
  return (
    new Intl.NumberFormat("en-ET", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount) + " ETB"
  );
}

export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy, HH:mm");
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy");
  } catch {
    return iso;
  }
}

export function feeFromBps(amount: number, bps: number): number {
  return Math.round((amount * bps) / 10000);
}

export function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
