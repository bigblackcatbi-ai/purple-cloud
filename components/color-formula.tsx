import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DesignColor } from "@/lib/types"

function propertyText(properties: Record<string, string>) {
  return Object.entries(properties).map(([label, value]) => `${label}: ${value}`).join(" | ")
}

export function ColorFormula({ color }: { color: DesignColor }) {
  const title = color.colorName || color.name || color.colorCode || "Untitled color"

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">{title}</span>
        <Badge variant={color.type === "mixed" ? "default" : "secondary"} className="shrink-0 capitalize">
          {color.type}
        </Badge>
      </div>

      <div className="mt-2 space-y-2 text-sm text-muted-foreground">
        {color.colorCode ? <div className="font-mono text-foreground">{color.colorCode}</div> : null}

        {color.type === "mixed" && color.mixedComponents?.length ? (
          <div className="space-y-1.5">
            {color.mixedComponents.map((component) => (
              <div key={component.id} className="rounded border px-2 py-1 text-xs">
                <div className="font-medium text-foreground">{component.colorName} ({component.colorCode}) — {component.grams}g</div>
                {Object.keys(component.additionalProperties).length > 0 ? (
                  <div>{propertyText(component.additionalProperties)}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {Object.keys(color.additionalProperties ?? {}).length > 0 ? (
          <div className="text-xs">{propertyText(color.additionalProperties ?? {})}</div>
        ) : null}
      </div>
    </div>
  )
}

export function ColorStrip({
  colors,
  className,
}: {
  colors: DesignColor[]
  className?: string
}) {
  return (
    <div className={cn("flex overflow-hidden rounded-md bg-muted/60", className)}>
      {colors.map((c) => (
        <div key={c.id} className="h-full flex-1 border-r border-background last:border-0 bg-muted/40" title={c.colorName || c.name || c.colorCode || "Color"} />
      ))}
    </div>
  )
}
