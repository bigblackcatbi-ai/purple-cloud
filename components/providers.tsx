"use client"

import type { ReactNode } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DataProvider } from "@/lib/store"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster position="bottom-right" />
    </DataProvider>
  )
}
