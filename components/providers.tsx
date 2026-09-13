"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DataProvider } from "@/lib/store"
import { useCompaniesStore } from "@/store/companies"
import { useCustomersStore } from "@/store/customers"
import { useDesignsStore } from "@/store/designs"
import { ThemeProvider } from "@/lib/theme-provider"

export function Providers({ children }: { children: ReactNode }) {
  const hydrateCompanies = useCompaniesStore((state) => state.hydrate)
  const hydrateCustomers = useCustomersStore((state) => state.hydrate)
  const hydrateDesigns = useDesignsStore((state) => state.hydrate)

  useEffect(() => {
    void Promise.all([
      hydrateCompanies(),
      hydrateCustomers(),
      hydrateDesigns(),
    ])
  }, [hydrateCompanies, hydrateCustomers, hydrateDesigns])

  return <ThemeProvider><DataProvider><TooltipProvider>{children}</TooltipProvider><Toaster position="bottom-right" /></DataProvider></ThemeProvider>
}
