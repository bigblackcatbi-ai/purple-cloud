"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

import type { Company, Customer, Design } from "./types"
import { useCompaniesStore } from "@/store/companies"
import { useCustomersStore } from "@/store/customers"
import { useDesignsStore } from "@/store/designs"

type NewDesign = Omit<Design, "id" | "code" | "createdAt" | "updatedAt" | "favorite"> &
  Partial<Pick<Design, "favorite">>

interface DataContextValue {
  companies: Company[]
  customers: Customer[]
  designs: Design[]
  addCompany: (input: Omit<Company, "id" | "createdAt">) => Company
  updateCompany: (id: string, patch: Partial<Company>) => void
  deleteCompany: (id: string) => void
  addCustomer: (input: Omit<Customer, "id" | "createdAt">) => Customer
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  addDesign: (input: NewDesign) => Design
  updateDesign: (id: string, patch: Partial<Design>) => void
  deleteDesign: (id: string) => void
  duplicateDesign: (id: string) => Design | undefined
  toggleFavorite: (id: string) => void
  getCompany: (id: string) => Company | undefined
  getCustomer: (id: string) => Customer | undefined
  getDesign: (id: string) => Design | undefined
  customersForCompany: (companyId: string) => Customer[]
  designsForCompany: (companyId: string) => Design[]
  designsForCustomer: (customerId: string) => Design[]
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const companies = useCompaniesStore((state) => state.companies)
  const customers = useCustomersStore((state) => state.customers)
  const designs = useDesignsStore((state) => state.designs)
  const createCompany = useCompaniesStore((state) => state.create)
  const updateCompany = useCompaniesStore((state) => state.update)
  const removeCompany = useCompaniesStore((state) => state.delete)
  const createCustomer = useCustomersStore((state) => state.create)
  const updateCustomer = useCustomersStore((state) => state.update)
  const removeCustomer = useCustomersStore((state) => state.delete)
  const createDesign = useDesignsStore((state) => state.create)
  const updateDesign = useDesignsStore((state) => state.update)
  const removeDesign = useDesignsStore((state) => state.delete)
  const duplicate = useDesignsStore((state) => state.duplicate)
  const toggleFavorite = useDesignsStore((state) => state.toggleFavorite)

  const value = useMemo<DataContextValue>(() => ({
    companies,
    customers,
    designs,
    addCompany: (input) => createCompany(input),
    updateCompany,
    deleteCompany: (id) => {
      removeCompany(id)
      customers.filter((customer) => customer.companyId === id).forEach((customer) => removeCustomer(customer.id))
      designs.filter((design) => design.companyId === id).forEach((design) => removeDesign(design.id))
    },
    addCustomer: (input) => createCustomer(input),
    updateCustomer,
    deleteCustomer: (id) => {
      removeCustomer(id)
      designs.filter((design) => design.customerId === id).forEach((design) => removeDesign(design.id))
    },
    addDesign: (input) => createDesign({ ...input, favorite: input.favorite ?? false }),
    updateDesign,
    deleteDesign: removeDesign,
    duplicateDesign: (id) => duplicate(id),
    toggleFavorite,
    getCompany: (id) => companies.find((company) => company.id === id),
    getCustomer: (id) => customers.find((customer) => customer.id === id),
    getDesign: (id) => designs.find((design) => design.id === id),
    customersForCompany: (companyId) => customers.filter((customer) => customer.companyId === companyId),
    designsForCompany: (companyId) => designs.filter((design) => design.companyId === companyId),
    designsForCustomer: (customerId) => designs.filter((design) => design.customerId === customerId),
  }), [companies, customers, designs, createCompany, updateCompany, removeCompany, createCustomer, updateCustomer, removeCustomer, createDesign, updateDesign, removeDesign, duplicate, toggleFavorite])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error("useData must be used within a DataProvider")
  return context
}
