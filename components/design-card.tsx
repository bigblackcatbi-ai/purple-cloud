"use client"

import Link from "next/link"
import { Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { ColorStrip } from "@/components/color-formula"
import { cn } from "@/lib/utils"
import type { Design } from "@/lib/types"
import { useData } from "@/lib/store"

export function DesignCard({ design }: { design: Design }) {
  const { getCompany, getCustomer, toggleFavorite } = useData()
  const company = getCompany(design.companyId)
  const customer = getCustomer(design.customerId)
  const cover = design.images[0]

  return (
    <Card className="group relative gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          toggleFavorite(design.id)
        }}
        className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        aria-label={design.favorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={design.favorite}
      >
        <Star
          className={cn(
            "size-4",
            design.favorite && "fill-primary text-primary",
          )}
        />
      </button>

      <Link href={`/designs/${design.id}`} className="flex flex-col">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url || "/placeholder.svg"}
              alt={`${design.name} decal artwork`}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : null}
          <ColorStrip
            colors={design.colors}
            className="absolute inset-x-0 bottom-0 h-1.5"
          />
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium leading-tight">
                {design.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {design.code}
              </span>
            </div>
            <StatusBadge status={design.status} />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate">{company?.name}</span>
            <span className="shrink-0">{design.colors.length} colors</span>
          </div>
          {customer ? (
            <span className="truncate text-xs text-muted-foreground">
              {customer.name}
            </span>
          ) : null}
        </div>
      </Link>
    </Card>
  )
}
