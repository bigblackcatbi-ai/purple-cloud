"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { GlobalSearch } from "@/components/global-search"
import { ThemeToggle } from "@/components/theme-toggle"
import { TopBarSave } from "@/components/top-bar-save"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="min-h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1 border-b border-border bg-background/80 px-2 backdrop-blur sm:gap-2 sm:px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <div className="mx-1 min-w-0 flex-1 sm:mx-6">
            <GlobalSearch />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <TopBarSave />
            <Button
              size="sm"
              className="px-2 sm:px-2.5"
              aria-label="New design"
              render={
                <Link href="/designs/new">
                  <Plus data-icon="inline-start" />
                  <span className="hidden sm:inline">New design</span>
                </Link>
              }
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
