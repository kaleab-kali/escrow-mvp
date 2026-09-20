import {
  acceptDeal,
  approveVerification,
  fundDeal,
  markComplete,
  openDispute,
  rejectVerification,
  releaseDeal,
  requestVerification,
  resolveDispute,
  startWork,
} from "@/lib/actions/deals";
import type { NextAction } from "@/lib/deal-helpers";
import { buttonClass } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

const binders: Record<
  NonNullable<NextAction["action"]>,
  (dealId: string) => (formData?: FormData) => Promise<void>
> = {
  accept: (id) => async () => acceptDeal(id),
  fund: (id) => async () => fundDeal(id),
  start_work: (id) => async () => startWork(id),
  request_verification: (id) => async () => requestVerification(id),
  approve_verification: (id) => async () => approveVerification(id),
  reject_verification: (id) => async () => rejectVerification(id),
  mark_complete: (id) => async () => markComplete(id),
  release: (id) => async () => releaseDeal(id),
  refund: (id) => async () => {
    const { refundDeal } = await import("@/lib/actions/deals");
    await refundDeal(id);
  },
  open_dispute: (id) => async (fd) => openDispute(id, fd!),
  resolve_release: (id) => async () => resolveDispute(id, "release"),
  resolve_refund: (id) => async () => resolveDispute(id, "refund"),
};

export function DealActionsPanel({
  dealId,
  actions,
}: {
  dealId: string;
  actions: NextAction[];
}) {
  const primary = actions.filter((a) => a.action && a.primary);
  const secondary = actions.filter((a) => a.action && !a.primary);
  const waiting = actions.filter((a) => !a.action);

  return (
    <Card className="sticky top-20 border-teal-200/80 shadow-md ring-1 ring-teal-100">
      <CardHeader title="Next action" description="Required to move this deal forward" />
      <div className="space-y-4 p-5">
        {waiting.map((a) => (
          <div
            key={a.label}
            className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3"
          >
            <p className="text-sm font-medium text-zinc-800">{a.label}</p>
            <p className="mt-1 text-xs text-zinc-500">{a.description}</p>
          </div>
        ))}

        {primary.map((a) => (
          <form key={a.action} action={binders[a.action!](dealId)}>
            <button type="submit" className={buttonClass({ size: "lg", className: "w-full" })}>
              {a.label}
            </button>
            <p className="mt-2 text-center text-xs text-zinc-500">{a.description}</p>
          </form>
        ))}

        {secondary
          .filter((a) => a.action !== "open_dispute")
          .map((a) => (
            <form key={a.action} action={binders[a.action!](dealId)}>
              <button
                type="submit"
                className={buttonClass({
                  variant:
                    a.action?.includes("refund") || a.action === "reject_verification"
                      ? "danger"
                      : "secondary",
                  className: "w-full",
                })}
              >
                {a.label}
              </button>
            </form>
          ))}

        {secondary.some((a) => a.action === "open_dispute") ? (
          <details className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
            <summary className="cursor-pointer text-sm font-medium text-rose-800">
              Open dispute
            </summary>
            <form action={binders.open_dispute(dealId)} className="mt-3 space-y-3">
              <textarea
                name="reason"
                required
                rows={3}
                placeholder="Describe the issue…"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="submit"
                className={buttonClass({ variant: "danger", className: "w-full" })}
              >
                Escalate to mediator
              </button>
            </form>
          </details>
        ) : null}

        {actions.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 px-4 py-6 text-center">
            <p className="text-sm font-medium text-zinc-800">Deal complete</p>
            <p className="mt-1 text-xs text-zinc-500">No further actions on this deal.</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
