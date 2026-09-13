import { create } from "zustand"
import { nanoid } from "nanoid"

import { deleteRecord, listRecords, putRecord, replaceRecords } from "@/lib/db"
import type { Company } from "@/lib/types"

let hydrationPromise: Promise<void> | undefined

interface CompaniesState {
  companies: Company[]
  hydrated: boolean
  hydrate: () => Promise<void>
  create: (input: Omit<Company, "id" | "createdAt">) => Company
  update: (id: string, patch: Partial<Company>) => void
  delete: (id: string) => void
  replaceAll: (records: Company[]) => void
  clearAll: () => void
  getById: (id: string) => Company | undefined
  list: () => Company[]
  search: (query: string) => Company[]
}

export const useCompaniesStore = create<CompaniesState>((set, get) => ({
  companies: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return
    if (hydrationPromise) return hydrationPromise
    hydrationPromise = (async () => {
      const records = await listRecords<Company>("companies")
      set({ companies: records, hydrated: true })
    })()
    try {
      await hydrationPromise
    } finally {
      hydrationPromise = undefined
    }
  },
  create: (input) => {
    const now = new Date().toISOString()
    const company = { ...input, id: nanoid(), createdAt: now, updatedAt: now }
    set((state) => ({ companies: [company, ...state.companies] }))
    void putRecord("companies", company)
    return company
  },
  update: (id, patch) => {
    const company = get().companies.find((item) => item.id === id)
    if (!company) return
    const updated = { ...company, ...patch, updatedAt: new Date().toISOString() }
    set((state) => ({
      companies: state.companies.map((item) => (item.id === id ? updated : item)),
    }))
    void putRecord("companies", updated)
  },
  delete: (id) => {
    set((state) => ({ companies: state.companies.filter((item) => item.id !== id) }))
    void deleteRecord("companies", id)
  },
  replaceAll: (records) => {
    set({ companies: records, hydrated: true })
    void replaceRecords("companies", records)
  },
  clearAll: () => {
    set({ companies: [], hydrated: true })
    void replaceRecords("companies", [])
  },
  getById: (id) => get().companies.find((item) => item.id === id),
  list: () => get().companies,
  search: (query) => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return get().companies
    return get().companies.filter((company) =>
      [company.companyName, company.name, company.code, company.notes, company.note]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalized)),
    )
  },
}))
