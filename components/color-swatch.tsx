import { cn } from "@/lib/utils"
import { textOn } from "@/lib/color-utils"

interface ColorSwatchProps {
  hex: string
  label?: string
  size?: "sm" | "md" | "lg"
  showHex?: boolean
  className?: string
}

const sizeMap = {
  sm: "size-6 text-[9px]",
  md: "size-10 text-[10px]",
  lg: "size-16 text-xs",
}

export function ColorSwatch({
  hex,
  label,
  size = "md",
  showHex = false,
  className,
}: ColorSwatchProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md ring-1 ring-inset ring-foreground/10",
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: hex, color: textOn(hex) }}
      title={label ? `${label} — ${hex}` : hex}
      aria-label={label ? `${label}, ${hex}` : hex}
    >
      {showHex ? <span className="font-mono font-medium">{hex}</span> : null}
    </div>
  )
}
