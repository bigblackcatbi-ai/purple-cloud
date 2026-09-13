"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Grid2X2, List, Plus, Search, Star } from "lucide-react"

import { DesignCard } from "@/components/design-card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { useData } from "@/lib/store"
import type { DesignStatus } from "@/lib/types"

const statuses: DesignStatus[] = ["draft", "approved", "in-production", "archived"]

export default function DesignsPage() {
  const { designs, companies, customers } = useData()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<DesignStatus | "all">("all")
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [view, setView] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid"
    return window.localStorage.getItem("purple-cloud:design-view") === "list" ? "list" : "grid"
  })

  useEffect(() => {
    window.localStorage.setItem("purple-cloud:design-view", view)
  }, [view])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return designs.filter((design) => {
      const company = companies.find((item) => item.id === design.companyId)
      const customer = customers.find((item) => item.id === design.customerId)
      const haystack = [design.code, design.name, design.notes, company?.name, customer?.name, ...design.colors.flatMap((color) => [color.name, color.colorName, color.colorCode, ...Object.keys(color.additionalProperties ?? {}), ...Object.values(color.additionalProperties ?? {})])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return (!normalized || haystack.includes(normalized)) && (status === "all" || design.status === status) && (!favoritesOnly || design.favorite)
    })
  }, [companies, customers, designs, favoritesOnly, query, status])

  return (
    <>
      <PageHeader title="Designs" description={`${designs.length} decal designs in your library.`} actions={<Button render={<Link href="/designs/new"><Plus data-icon="inline-start" />Add design</Link>} />} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search designs, companies, colors..." className="pl-9" aria-label="Search designs" />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value as DesignStatus | "all")} className="h-9 rounded-md border border-input bg-background px-3 text-sm" aria-label="Filter by status">
          <option value="all">All statuses</option>
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <Button variant={favoritesOnly ? "default" : "outline"} size="icon" onClick={() => setFavoritesOnly((value) => !value)} aria-label="Show favorites only" aria-pressed={favoritesOnly}><Star className="size-4" /></Button>
        <div className="flex rounded-md border p-0.5">
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 className="size-4" /></Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setView("list")} aria-label="List view"><List className="size-4" /></Button>
        </div>
      </div>
      {filtered.length === 0 ? <div className="flex flex-col items-center gap-3 py-20 text-center"><h2 className="text-lg font-semibold">No designs found</h2><p className="text-sm text-muted-foreground">Try a different search or create your first design.</p><Button render={<Link href="/designs/new"><Plus data-icon="inline-start" />Add your first design</Link>} /></div> : view === "grid" ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((design) => <DesignCard key={design.id} design={design} />)}</div> : <div className="flex flex-col gap-2">{filtered.map((design) => <Link key={design.id} href={`/designs/${design.id}`} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/40"><div className="size-16 overflow-hidden rounded-md bg-muted">{design.images[0] ? <img src={design.images[0].url} alt="" className="size-full object-cover" /> : null}</div><div className="min-w-0 flex-1"><p className="truncate font-medium">{design.name}</p><p className="font-mono text-xs text-muted-foreground">{design.code}</p></div><StatusBadge status={design.status} /><span className="text-sm text-muted-foreground">{design.colors.length} colors</span></Link>)}</div>}
    </>
  )
}
