"use client"

import { DesignCard } from "@/components/design-card"
import { PageHeader } from "@/components/page-header"
import { useData } from "@/lib/store"

export default function FavoritesPage() {
  const { designs } = useData()
  const favorites = designs.filter((design) => design.favorite)
  return <><PageHeader title="Favorites" description={`${favorites.length} saved designs.`} />{favorites.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{favorites.map((design) => <DesignCard key={design.id} design={design} />)}</div> : <p className="py-20 text-center text-sm text-muted-foreground">No favorite designs yet.</p>}</>
}
