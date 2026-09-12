import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  hint?: string
}) {
  return (
    <Card className="p-0">
      <CardContent className="flex items-center gap-4 p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className="text-2xl font-semibold tabular-nums leading-none">
            {value}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">{label}</span>
          {hint ? (
            <span className="text-xs text-muted-foreground/80">{hint}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
