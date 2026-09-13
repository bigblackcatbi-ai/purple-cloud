"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Building2, Images, Users } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DesignCard } from "@/components/design-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { useData } from "@/lib/store"
import type { DesignStatus } from "@/lib/types"

const STATUS_ORDER: DesignStatus[] = [
  "draft",
  "approved",
  "in-production",
  "archived",
]

export default function DashboardPage() {
  const { designs, companies, customers } = useData()

  const recent = useMemo(
    () =>
      [...designs]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 4),
    [designs],
  )

  const statusCounts = useMemo(() => {
    const map = new Map<DesignStatus, number>()
    for (const d of designs) map.set(d.status, (map.get(d.status) ?? 0) + 1)
    return map
  }, [designs])

  const totalColors = useMemo(
    () => designs.reduce((count, design) => count + design.colors.length, 0),
    [designs],
  )

  return (
    <>
      <PageHeader title="Dashboard" description="Your design workspace at a glance." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Designs" value={designs.length} icon={Images} />
        <StatCard label="Companies" value={companies.length} icon={Building2} />
        <StatCard label="Customers" value={customers.length} icon={Users} />
        <StatCard label="Colors" value={totalColors} icon={Images} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recently updated</h2>
            <Button variant="ghost" size="sm" render={<Link href="/designs">View all</Link>} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recent.map((d) => (
              <DesignCard key={d.id} design={d} />
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>By status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {STATUS_ORDER.map((status) => {
                const count = statusCounts.get(status) ?? 0
                const pct = designs.length ? Math.round((count / designs.length) * 100) : 0
                return (
                  <div key={status} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <StatusBadge status={status} />
                      <span className="tabular-nums text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}