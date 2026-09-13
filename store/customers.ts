import { create } from "zustand"
import { nanoid } from "nanoid"

import { deleteRecord, listRecords, putRecord, replaceRecords } from "@/lib/db"
import type { Customer } from "@/lib/types"

let hydrationPromise: Promise<void> | undefined

interface CustomersState {
  customers: Customer[]
  hydrated: boolean
  hydrate: () => Promise<void>
  create: (input: Omit<Customer, "id" | "createdAt">) => Customer
  update: (id: string, patch: Partial<Customer>) => void
  delete: (id: string) => void
  replaceAll: (records: Customer[]) => void
  clearAll: () => void
  getById: (id: string) => Customer | undefined
  list: (companyId?: string) => Customer[]
  search: (query: string) => Customer[]
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return
    if (hydrationPromise) return hydrationPromise
    hydrationPromise = (async () => {
      const records = await listRecords<Customer>("customers")
      set({ customers: records, hydrated: true })
    })()
    try {
      await hydrationPromise
    } finally {
      hydrationPromise = undefined
    }
  },
  create: (input) => {
    const customer = { ...input, id: nanoid(), createdAt: new Date().toISOString() }
    set((state) => ({ customers: [customer, ...state.customers] }))
    void putRecord("customers", customer)
    return customer
  },
  update: (id, patch) => {
    const customer = get().customers.find((item) => item.id === id)
    if (!customer) return
    const updated = { ...customer, ...patch }
    set((state) => ({
      customers: state.customers.map((item) => (item.id === id ? updated : item)),
    }))
    void putRecord("customers", updated)
  },
  delete: (id) => {
    set((state) => ({ customers: state.customers.filter((item) => item.id !== id) }))
    void deleteRecord("customers", id)
  },
  replaceAll: (records) => {
    set({ customers: records, hydrated: true })
    void replaceRecords("customers", records)
  },
  clearAll: () => {
    set({ customers: [], hydrated: true })
    void replaceRecords("customers", [])
  },
  getById: (id) => get().customers.find((item) => item.id === id),
  list: (companyId) =>
    companyId ? get().customers.filter((item) => item.companyId === companyId) : get().customers,
  search: (query) => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return get().customers
    return get().customers.filter((customer) =>
      [
        customer.customerName,
        customer.name,
        customer.contact,
        customer.email,
        customer.phone,
        customer.notes,
        customer.note,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalized)),
    )
  },
}))
