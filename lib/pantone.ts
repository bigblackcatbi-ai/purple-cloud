import type { PantoneColor } from "./types"

export const PANTONES: PantoneColor[] = [
  // Blue
  { code: "Reflex Blue C", name: "Reflex Blue", hex: "#001489", family: "Blue" },
  { code: "293 C", name: "Bright Blue", hex: "#003DA5", family: "Blue" },
  { code: "300 C", name: "Process Blue", hex: "#005EB8", family: "Blue" },
  { code: "285 C", name: "Sky Command", hex: "#0072CE", family: "Blue" },
  { code: "3005 C", name: "Clear Blue", hex: "#0077C8", family: "Blue" },
  { code: "2925 C", name: "Cyan Blue", hex: "#009CDE", family: "Blue" },
  // Red
  { code: "185 C", name: "Signal Red", hex: "#E4002B", family: "Red" },
  { code: "186 C", name: "Classic Red", hex: "#C8102E", family: "Red" },
  { code: "032 C", name: "Bright Red", hex: "#EF3340", family: "Red" },
  { code: "199 C", name: "Crimson", hex: "#D50032", family: "Red" },
  // Orange
  { code: "021 C", name: "Pure Orange", hex: "#FE5000", family: "Orange" },
  { code: "165 C", name: "Vivid Orange", hex: "#FF6720", family: "Orange" },
  { code: "1495 C", name: "Amber Orange", hex: "#FF8200", family: "Orange" },
  // Yellow
  { code: "Yellow C", name: "Process Yellow", hex: "#FEDD00", family: "Yellow" },
  { code: "108 C", name: "Sun Yellow", hex: "#FFD100", family: "Yellow" },
  { code: "123 C", name: "Golden Yellow", hex: "#FFC72C", family: "Yellow" },
  // Green
  { code: "354 C", name: "Bright Green", hex: "#00B140", family: "Green" },
  { code: "347 C", name: "Emerald", hex: "#009A44", family: "Green" },
  { code: "376 C", name: "Lime Green", hex: "#84BD00", family: "Green" },
  { code: "3272 C", name: "Teal", hex: "#00A99D", family: "Green" },
  // Purple
  { code: "267 C", name: "Royal Violet", hex: "#5F259F", family: "Purple" },
  { code: "2685 C", name: "Deep Purple", hex: "#330072", family: "Purple" },
  { code: "226 C", name: "Magenta", hex: "#D9017A", family: "Purple" },
  // Neutral
  { code: "Black C", name: "Process Black", hex: "#2D2926", family: "Neutral" },
  { code: "Cool Gray 9 C", name: "Cool Gray 9", hex: "#75787B", family: "Neutral" },
  { code: "877 C", name: "Metallic Silver", hex: "#8A8D8F", family: "Neutral" },
  { code: "White", name: "Opaque White", hex: "#FFFFFF", family: "Neutral", custom: true },
]

export const PANTONE_FAMILIES = [
  "Blue",
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Purple",
  "Neutral",
] as const

export function pantoneByCode(code: string): PantoneColor | undefined {
  return PANTONES.find((p) => p.code === code)
}

export function hexForCode(code: string): string {
  return pantoneByCode(code)?.hex ?? "#CCCCCC"
}
