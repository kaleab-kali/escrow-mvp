import { Badge } from "@/components/ui/badge";
import { statusTone } from "@/lib/deal-helpers";
import { STATUS_LABELS, type DealStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: DealStatus }) {
  return <Badge tone={statusTone(status)}>{STATUS_LABELS[status]}</Badge>;
}
