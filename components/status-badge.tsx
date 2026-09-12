import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DesignStatus } from "@/lib/types"
import { STATUS_LABELS } from "@/lib/format"

const dotColor: Record<DesignStatus, string> = {
  draft: "bg-muted-foreground",
  approved: "bg-chart-2",
  "in-production": "bg-primary",
  archived: "bg-border",
}

export function StatusBadge({ status }: { status: DesignStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5 pl-1.5">
      <span className={cn("size-1.5 rounded-full", dotColor[status])} aria-hidden />
      {STATUS_LABELS[status]}
    </Badge>
  )
}
