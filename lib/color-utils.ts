export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "").trim()
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6)
  const num = Number.parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0")
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase()
}

/**
 * Weighted average of hex colors by their ratio parts. This is a visual
 * approximation of an ink mix — good enough for a swatch preview, not a
 * spectrophotometric prediction.
 */
export function mixHex(items: { hex: string; parts: number }[]): string {
  const valid = items.filter((i) => i.parts > 0)
  if (valid.length === 0) return "#CCCCCC"
  const total = valid.reduce((sum, i) => sum + i.parts, 0)
  let r = 0
  let g = 0
  let b = 0
  for (const item of valid) {
    const rgb = hexToRgb(item.hex)
    const w = item.parts / total
    r += rgb.r * w
    g += rgb.g * w
    b += rgb.b * w
  }
  return rgbToHex(r, g, b)
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const srgb = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

/** Returns the token to use for legible text placed on top of the given color. */
export function textOn(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? "#1a1a1a" : "#ffffff"
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim())
}

export function normalizeHex(hex: string): string {
  let clean = hex.trim()
  if (!clean.startsWith("#")) clean = `#${clean}`
  return clean.toUpperCase()
}
