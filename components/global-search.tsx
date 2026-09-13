"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Images, Search, User } from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { useData } from "@/lib/store"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { designs, companies, customers, getCompany } = useData()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-2xl items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search designs, companies, customers...</span>
        <Kbd>⌘K</Kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search designs, companies, customers..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Designs">
              {designs.map((d) => (
                <CommandItem
                  key={d.id}
                  value={`${d.code} ${d.name} ${d.category}`}
                  onSelect={() => go(`/designs/${d.id}`)}
                >
                  <Images />
                  <span>{d.name}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{d.code}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Companies">
              {companies.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.code}`}
                  onSelect={() => go(`/companies/${c.id}`)}
                >
                  <Building2 />
                  <span>{c.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Customers">
              {customers.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${getCompany(c.companyId)?.name ?? ""}`}
                  onSelect={() => go(`/customers/${c.id}`)}
                >
                  <User />
                  <span>{c.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{getCompany(c.companyId)?.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
