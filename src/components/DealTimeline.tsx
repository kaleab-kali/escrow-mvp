import { formatDate } from "@/lib/format";
import type { AuditEvent } from "@/lib/types";
import clsx from "clsx";

export function DealTimeline({ events }: { events: AuditEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
  return (
    <ol className="relative space-y-0 border-l-2 border-slate-200 ml-3">
      {sorted.map((e, i) => (
        <li key={e.id} className="relative pl-6 pb-6 last:pb-0">
          <span
            className={clsx(
              "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white",
              i === 0 ? "bg-[#0b3d2e]" : "bg-slate-300"
            )}
          />
          <div className="text-xs text-slate-400">{formatDate(e.at)}</div>
          <div className="text-sm font-semibold text-slate-800 capitalize">
            {e.action.replace(/_/g, " ")}
          </div>
          <div className="text-xs text-slate-500">
            {e.actorName}{" "}
            <span className="text-slate-400">({e.actorRole})</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{e.detail}</p>
        </li>
      ))}
      {sorted.length === 0 && (
        <li className="pl-6 text-sm text-slate-500">No events yet.</li>
      )}
    </ol>
  );
}
