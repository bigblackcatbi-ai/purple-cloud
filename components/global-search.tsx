"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Images, SwatchBook, User } from "lucide-react"
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
import { ColorSwatch } from "@/components/color-swatch"
import { useData } from "@/lib/store"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { designs, companies, customers, pantones, customColors, getCompany } =
    useData()

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

  const allColors = useMemo(
    () => [...customColors, ...pantones],
    [customColors, pantones],
  )

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
      >
        <SwatchBook className="size-4" />
        <span className="flex-1 text-left">Search designs, colors...</span>
        <Kbd>⌘K</Kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search designs, companies, customers, colors..." />
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
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {d.code}
                  </span>
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
                  <span className="ml-auto text-xs text-muted-foreground">
                    {getCompany(c.companyId)?.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Colors">
              {allColors.map((color) => (
                <CommandItem
                  key={color.code}
                  value={`${color.code} ${color.name} ${color.family}`}
                  onSelect={() => go("/colors")}
                >
                  <ColorSwatch hex={color.hex} size="sm" />
                  <span>{color.name}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {color.code}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
