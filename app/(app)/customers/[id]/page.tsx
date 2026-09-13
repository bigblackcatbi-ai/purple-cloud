"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { DesignCard } from "@/components/design-card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useData } from "@/lib/store"

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { getCustomer, getCompany, designsForCustomer } = useData()
  const customer = getCustomer(id)
  if (!customer) return <div className="py-20 text-center"><h1 className="font-semibold">Customer not found</h1><Button variant="link" onClick={() => router.push("/companies")}>Back to companies</Button></div>
  const designs = designsForCustomer(id)
  return <><Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft data-icon="inline-start" />Back</Button><PageHeader title={customer.name} description={getCompany(customer.companyId)?.name} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{designs.map((design) => <DesignCard key={design.id} design={design} />)}</div></>
}
