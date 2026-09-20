import clsx from "clsx";
import { statusLabel } from "@/lib/format";

const STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_funding: "bg-yellow-100 text-yellow-800",
  funded: "bg-sky-100 text-sky-800",
  in_progress: "bg-blue-100 text-blue-800",
  partially_released: "bg-indigo-100 text-indigo-800",
  disputed: "bg-rose-100 text-rose-800",
  released: "bg-emerald-100 text-emerald-800",
  refunded: "bg-orange-100 text-orange-800",
  closed: "bg-slate-200 text-slate-700",
  pending: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-100 text-amber-800",
  verified: "bg-teal-100 text-teal-800",
  rejected: "bg-rose-100 text-rose-700",
};

export function StatusChip({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STYLES[status] ?? "bg-slate-100 text-slate-700",
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
