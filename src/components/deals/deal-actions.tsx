import {
  acceptDeal,
  approveVerification,
  fundDeal,
  markComplete,
  openDispute,
  refundDeal,
  rejectVerification,
  releaseDeal,
  requestVerification,
  resolveDispute,
  startWork,
} from "@/lib/actions/deals";
import type { NextAction } from "@/lib/deal-helpers";
import { buttonClass } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

type BoundAction = (formData: FormData) => Promise<void>;

function bindAction(
  action: NonNullable<NextAction["action"]>,
  dealId: string
): BoundAction {
  switch (action) {
    case "accept":
      return acceptDeal.bind(null, dealId);
    case "fund":
      return fundDeal.bind(null, dealId);
    case "start_work":
      return startWork.bind(null, dealId);
    case "request_verification":
      return requestVerification.bind(null, dealId);
    case "approve_verification":
      return approveVerification.bind(null, dealId);
    case "reject_verification":
      return rejectVerification.bind(null, dealId);
    case "mark_complete":
      return markComplete.bind(null, dealId);
    case "release":
      return releaseDeal.bind(null, dealId);
    case "refund":
      return refundDeal.bind(null, dealId);
    case "open_dispute":
      return openDispute.bind(null, dealId);
    case "resolve_release":
      return resolveDispute.bind(null, dealId, "release");
    case "resolve_refund":
      return resolveDispute.bind(null, dealId, "refund");
    default: {
      const _exhaustive: never = action;
      throw new Error(`Unknown action: ${_exhaustive}`);
    }
  }
}

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
          <form key={a.action} action={bindAction(a.action!, dealId)}>
            <button type="submit" className={buttonClass({ size: "lg", className: "w-full" })}>
              {a.label}
            </button>
            <p className="mt-2 text-center text-xs text-zinc-500">{a.description}</p>
          </form>
        ))}

        {secondary
          .filter((a) => a.action !== "open_dispute")
          .map((a) => (
            <form key={a.action} action={bindAction(a.action!, dealId)}>
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
            <form action={bindAction("open_dispute", dealId)} className="mt-3 space-y-3">
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
