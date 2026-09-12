import { Badge } from "@/components/ui/badge"
import { ColorSwatch } from "@/components/color-swatch"
import { cn } from "@/lib/utils"
import type { DesignColor } from "@/lib/types"
import { pantoneByCode, hexForCode } from "@/lib/pantone"

const kindLabel: Record<DesignColor["kind"], string> = {
  pantone: "Pantone",
  custom: "Custom",
  mixed: "Mixed",
}

function ratioString(components: NonNullable<DesignColor["components"]>): string {
  return components.map((c) => c.parts).join(" : ")
}

export function ColorFormula({ color }: { color: DesignColor }) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-col items-center gap-1">
        <ColorSwatch hex={color.hex} label={color.name} size="lg" />
        <span className="font-mono text-[10px] text-muted-foreground">
          C{color.slot}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">{color.name}</span>
          <Badge
            variant={color.kind === "mixed" ? "default" : "secondary"}
            className="shrink-0"
          >
            {kindLabel[color.kind]}
          </Badge>
        </div>

        {color.kind === "pantone" && color.pantoneCode ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-foreground">{color.pantoneCode}</span>
            <span aria-hidden>·</span>
            <span>{pantoneByCode(color.pantoneCode)?.family ?? "Pantone"}</span>
            <span className="ml-auto font-mono">{color.hex}</span>
          </div>
        ) : null}

        {color.kind === "custom" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Custom ink</span>
            <span className="ml-auto font-mono">{color.hex}</span>
          </div>
        ) : null}

        {color.kind === "mixed" && color.components ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Mix ratio</span>
              <span className="font-mono text-foreground">
                {ratioString(color.components)}
              </span>
            </div>
            <ul className="flex flex-col gap-1">
              {color.components.map((comp, i) => {
                const p = pantoneByCode(comp.pantoneCode)
                return (
                  <li
                    key={`${comp.pantoneCode}-${i}`}
                    className="flex items-center gap-2 text-xs"
                  >
                    <ColorSwatch hex={hexForCode(comp.pantoneCode)} size="sm" />
                    <span className="truncate">{p?.name ?? comp.pantoneCode}</span>
                    <span className="font-mono text-muted-foreground">
                      {comp.pantoneCode}
                    </span>
                    <span className="ml-auto font-mono font-medium">
                      {comp.parts} {comp.parts === 1 ? "part" : "parts"}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {color.note ? (
          <p className="text-xs text-muted-foreground italic">{color.note}</p>
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
    <div className={cn("flex overflow-hidden rounded-md", className)}>
      {colors.map((c) => (
        <div
          key={c.id}
          className="h-full flex-1"
          style={{ backgroundColor: c.hex }}
          title={`${c.name} — ${c.hex}`}
        />
      ))}
    </div>
  )
}
