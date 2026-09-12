"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  Company,
  Customer,
  Design,
  DesignColor,
  PantoneColor,
} from "./types"
import { seedData } from "./sample-data"
import { PANTONES } from "./pantone"

type NewDesign = Omit<Design, "id" | "code" | "createdAt" | "updatedAt" | "favorite"> &
  Partial<Pick<Design, "favorite">>

interface DataContextValue {
  companies: Company[]
  customers: Customer[]
  designs: Design[]
  pantones: PantoneColor[]
  customColors: PantoneColor[]
  // companies
  addCompany: (input: Omit<Company, "id" | "createdAt">) => Company
  updateCompany: (id: string, patch: Partial<Company>) => void
  deleteCompany: (id: string) => void
  // customers
  addCustomer: (input: Omit<Customer, "id" | "createdAt">) => Customer
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  // designs
  addDesign: (input: NewDesign) => Design
  updateDesign: (id: string, patch: Partial<Design>) => void
  deleteDesign: (id: string) => void
  duplicateDesign: (id: string) => Design | undefined
  toggleFavorite: (id: string) => void
  // colors
  addCustomColor: (input: Omit<PantoneColor, "custom">) => void
  // helpers
  getCompany: (id: string) => Company | undefined
  getCustomer: (id: string) => Customer | undefined
  getDesign: (id: string) => Design | undefined
  customersForCompany: (companyId: string) => Customer[]
  designsForCompany: (companyId: string) => Design[]
  designsForCustomer: (customerId: string) => Design[]
}

const DataContext = createContext<DataContextValue | null>(null)

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

const today = () => new Date().toISOString().slice(0, 10)

export function DataProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => seedData(), [])
  const [companies, setCompanies] = useState<Company[]>(seed.companies)
  const [customers, setCustomers] = useState<Customer[]>(seed.customers)
  const [designs, setDesigns] = useState<Design[]>(seed.designs)
  const [customColors, setCustomColors] = useState<PantoneColor[]>([])

  const addCompany = useCallback((input: Omit<Company, "id" | "createdAt">) => {
    const company: Company = { ...input, id: uid("co"), createdAt: today() }
    setCompanies((prev) => [company, ...prev])
    return company
  }, [])

  const updateCompany = useCallback((id: string, patch: Partial<Company>) => {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const deleteCompany = useCallback((id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id))
    setCustomers((prev) => prev.filter((c) => c.companyId !== id))
    setDesigns((prev) => prev.filter((d) => d.companyId !== id))
  }, [])

  const addCustomer = useCallback((input: Omit<Customer, "id" | "createdAt">) => {
    const customer: Customer = { ...input, id: uid("cu"), createdAt: today() }
    setCustomers((prev) => [customer, ...prev])
    return customer
  }, [])

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    setDesigns((prev) => prev.filter((d) => d.customerId !== id))
  }, [])

  const nextDesignCode = useCallback(() => {
    const nums = designs
      .map((d) => Number.parseInt(d.code.replace(/\D/g, ""), 10))
      .filter((n) => !Number.isNaN(n))
    const max = nums.length ? Math.max(...nums) : 1040
    return `DSG-${max + 1}`
  }, [designs])

  const addDesign = useCallback(
    (input: NewDesign) => {
      const now = today()
      const design: Design = {
        favorite: false,
        ...input,
        id: uid("ds"),
        code: nextDesignCode(),
        createdAt: now,
        updatedAt: now,
      }
      setDesigns((prev) => [design, ...prev])
      return design
    },
    [nextDesignCode],
  )

  const updateDesign = useCallback((id: string, patch: Partial<Design>) => {
    setDesigns((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: today() } : d)),
    )
  }, [])

  const deleteDesign = useCallback((id: string) => {
    setDesigns((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const duplicateDesign = useCallback(
    (id: string) => {
      const original = designs.find((d) => d.id === id)
      if (!original) return undefined
      const now = today()
      const copy: Design = {
        ...original,
        id: uid("ds"),
        code: nextDesignCode(),
        name: `${original.name} (Copy)`,
        favorite: false,
        status: "draft",
        createdAt: now,
        updatedAt: now,
        images: original.images.map((i) => ({ ...i, id: uid("img") })),
        colors: original.colors.map((c) => ({
          ...c,
          id: uid("col"),
          components: c.components?.map((m) => ({ ...m })),
        })),
      }
      setDesigns((prev) => [copy, ...prev])
      return copy
    },
    [designs, nextDesignCode],
  )

  const toggleFavorite = useCallback((id: string) => {
    setDesigns((prev) =>
      prev.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d)),
    )
  }, [])

  const addCustomColor = useCallback((input: Omit<PantoneColor, "custom">) => {
    setCustomColors((prev) => [{ ...input, custom: true }, ...prev])
  }, [])

  const getCompany = useCallback(
    (id: string) => companies.find((c) => c.id === id),
    [companies],
  )
  const getCustomer = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers],
  )
  const getDesign = useCallback((id: string) => designs.find((d) => d.id === id), [designs])
  const customersForCompany = useCallback(
    (companyId: string) => customers.filter((c) => c.companyId === companyId),
    [customers],
  )
  const designsForCompany = useCallback(
    (companyId: string) => designs.filter((d) => d.companyId === companyId),
    [designs],
  )
  const designsForCustomer = useCallback(
    (customerId: string) => designs.filter((d) => d.customerId === customerId),
    [designs],
  )

  const value = useMemo<DataContextValue>(
    () => ({
      companies,
      customers,
      designs,
      pantones: PANTONES,
      customColors,
      addCompany,
      updateCompany,
      deleteCompany,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addDesign,
      updateDesign,
      deleteDesign,
      duplicateDesign,
      toggleFavorite,
      addCustomColor,
      getCompany,
      getCustomer,
      getDesign,
      customersForCompany,
      designsForCompany,
      designsForCustomer,
    }),
    [
      companies,
      customers,
      designs,
      customColors,
      addCompany,
      updateCompany,
      deleteCompany,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addDesign,
      updateDesign,
      deleteDesign,
      duplicateDesign,
      toggleFavorite,
      addCustomColor,
      getCompany,
      getCustomer,
      getDesign,
      customersForCompany,
      designsForCompany,
      designsForCustomer,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within a DataProvider")
  return ctx
}
