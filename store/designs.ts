import { create } from "zustand"

import { deleteRecord, listRecords, putRecord, replaceRecords } from "@/lib/db"
import type { Design } from "@/lib/types"

let hydrationPromise: Promise<void> | undefined

interface DesignsState {
  designs: Design[]
  hydrated: boolean
  hydrate: () => Promise<void>
  create: (input: Omit<Design, "id" | "code" | "createdAt" | "updatedAt"> & { companyPrefix?: string }) => Design
  update: (id: string, patch: Partial<Design>) => void
  updateColor: (designId: string, colorId: string, updatedColor: Design["colors"][number]) => void
  deleteColor: (designId: string, colorId: string) => void
  replaceAll: (records: Design[]) => void
  clearAll: () => void
  toggleFavorite: (id: string) => void
  delete: (id: string) => void
  duplicate: (id: string, companyPrefix?: string) => Design | undefined
  getById: (id: string) => Design | undefined
  list: () => Design[]
  search: (query: string, companies?: { id: string; name: string }[], customers?: { id: string; name: string }[]) => Design[]
}

function nextCode(designs: Design[], prefix = "DSG") {
  const year = new Date().getFullYear()
  const sequence = designs.reduce((highest, design) => {
    const number = Number.parseInt((design.designId ?? design.code).split("-").at(-1) ?? "0", 10)
    return Number.isNaN(number) ? highest : Math.max(highest, number)
  }, 0) + 1
  return `${prefix}-${year}-${sequence.toString().padStart(4, "0")}`
}

export const useDesignsStore = create<DesignsState>((set, get) => ({
  designs: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return
    if (hydrationPromise) return hydrationPromise
    hydrationPromise = (async () => {
      const records = await listRecords<Design>("designs")
      set({ designs: records, hydrated: true })
    })()
    try {
      await hydrationPromise
    } finally {
      hydrationPromise = undefined
    }
  },
  create: (input) => {
    const { companyPrefix, ...designInput } = input
    const now = new Date().toISOString()
    const dateCreated = designInput.dateCreated ?? now.split("T")[0]
    const code = nextCode(get().designs, companyPrefix)
    const design = { ...designInput, id: crypto.randomUUID(), code, designId: code, dateCreated, createdAt: now, updatedAt: now }
    set((state) => ({ designs: [design, ...state.designs] }))
    void putRecord("designs", design)
    return design
  },
  update: (id, patch) => {
    const design = get().designs.find((item) => item.id === id)
    if (!design) return
    const updated = { ...design, ...patch, updatedAt: new Date().toISOString() }
    set((state) => ({ designs: state.designs.map((item) => item.id === id ? updated : item) }))
    void putRecord("designs", updated)
  },
  updateColor: (designId, colorId, updatedColor) => {
    const design = get().designs.find((item) => item.id === designId)
    if (!design) return
    const nextColors = design.colors.map((item) => (item.id === colorId ? { ...item, ...updatedColor, updatedAt: new Date().toISOString() } : item))
    const updated = { ...design, colors: nextColors, updatedAt: new Date().toISOString() }
    set((state) => ({ designs: state.designs.map((item) => item.id === designId ? updated : item) }))
    void putRecord("designs", updated)
  },
  deleteColor: (designId, colorId) => {
    const design = get().designs.find((item) => item.id === designId)
    if (!design) return
    const nextColors = design.colors.filter((item) => item.id !== colorId)
    const updated = { ...design, colors: nextColors.map((item, index) => ({ ...item, slot: index + 1 })), updatedAt: new Date().toISOString() }
    set((state) => ({ designs: state.designs.map((item) => item.id === designId ? updated : item) }))
    void putRecord("designs", updated)
  },
  delete: (id) => {
    set((state) => ({ designs: state.designs.filter((item) => item.id !== id) }))
    void deleteRecord("designs", id)
  },
  replaceAll: (records) => {
    set({ designs: records, hydrated: true })
    void putRecord("designs", records[0] ?? { id: "__empty__", name: "", code: "", companyId: "", customerId: "", category: "", status: "draft", images: [], colors: [], favorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    if (records.length === 0) {
      void deleteRecord("designs", "__empty__")
    }
  },
  clearAll: () => {
    set({ designs: [], hydrated: true })
    void replaceRecords("designs", [])
  },
  toggleFavorite: (id) => {
    const design = get().designs.find((item) => item.id === id)
    if (!design) return
    const updated = { ...design, favorite: !design.favorite, updatedAt: new Date().toISOString() }
    set((state) => ({ designs: state.designs.map((item) => item.id === id ? updated : item) }))
    void putRecord("designs", updated)
  },
  duplicate: (id, companyPrefix) => {
    const original = get().designs.find((item) => item.id === id)
    if (!original) return undefined
    const now = new Date().toISOString()
    const code = nextCode(get().designs, companyPrefix)
    const copy = {
      ...original,
      id: crypto.randomUUID(),
      code,
      designId: code,
      name: `${original.name} (Copy)`,
      designName: `${original.designName ?? original.name} (Copy)`,
      status: "draft" as const,
      favorite: false,
      dateCreated: new Date().toISOString().split("T")[0],
      createdAt: now,
      updatedAt: now,
      images: original.images.map((image) => ({ ...image, id: crypto.randomUUID() })),
      colors: original.colors.map((color) => ({
        ...color,
        id: crypto.randomUUID(),
        mixedComponents: color.mixedComponents?.map((component) => ({ ...component })),
      })),
    }
    set((state) => ({ designs: [copy, ...state.designs] }))
    void putRecord("designs", copy)
    return copy
  },
  getById: (id) => get().designs.find((item) => item.id === id),
  list: () => get().designs,
  search: (query, companies = [], customers = []) => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return get().designs
    return get().designs.filter((design) => {
      const company = companies.find((item) => item.id === design.companyId)?.name
      const customer = customers.find((item) => item.id === design.customerId)?.name
      return [
        design.designId,
        design.code,
        design.designName,
        design.name,
        design.notes,
        company,
        customer,
        ...design.colors.flatMap((color) => [color.colorCode, color.colorName, color.name, ...Object.keys(color.additionalProperties ?? {}), ...Object.values(color.additionalProperties ?? {})]),
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalized))
    })
  },
}))
