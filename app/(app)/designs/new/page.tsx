"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { ColorBuilder } from "@/components/color-builder"
import { ImageSlot } from "@/components/image-slot"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useData } from "@/lib/store"
import type { DesignColor, DesignImage, DesignStatus } from "@/lib/types"

export default function NewDesignPage() {
  const router = useRouter()
  const { companies, customers, addDesign } = useData()
  const [name, setName] = useState("")
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "")
  const [customerId, setCustomerId] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState<DesignStatus>("draft")
  const [dateCreated, setDateCreated] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [colors, setColors] = useState<DesignColor[]>([])
  const [images, setImages] = useState<DesignImage[]>([])

  useEffect(() => {
    if (!companyId && companies[0]) setCompanyId(companies[0].id)
  }, [companies, companyId])

  const companyCustomers = customers.filter((customer) => customer.companyId === companyId)
  const readImage = (file: File, index?: number) => {
    const reader = new FileReader()
    reader.onload = () => setImages((current) => { const image = { id: current[index ?? current.length]?.id ?? crypto.randomUUID(), url: String(reader.result) }; if (index === undefined) return current.length < 3 ? [...current, image] : current; return current.map((item, itemIndex) => itemIndex === index ? image : item) })
    reader.readAsDataURL(file)
  }
  const removeImage = (index: number) => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))

  const submit = () => {
    if (!name.trim() || !companyId) { toast.error("Design name and company are required."); return }
    const design = addDesign({ name: name.trim(), companyId, customerId, category, status, notes, images, colors, dateCreated })
    toast.success("Design created")
    router.push(`/designs/${design.id}`)
  }

  return <>
    <div className="flex items-start gap-3"><Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft data-icon="inline-start" />Back</Button><div className="min-w-0 flex-1"><PageHeader title="New design" description="Create a design record and its color formula." /></div></div>
    <div className="grid max-w-3xl gap-6">
      <section className="grid gap-4 rounded-lg border p-5">
        <h2 className="font-semibold">Design information</h2>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Design name" aria-label="Design name" />
        <div className="grid gap-4 sm:grid-cols-2"><select value={companyId} onChange={(event) => { setCompanyId(event.target.value); setCustomerId("") }} className="h-9 rounded-md border border-input bg-background px-3 text-sm" aria-label="Company"><option value="">Select company</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select><select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm" aria-label="Customer"><option value="">Select customer</option>{companyCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></div>
        <div className="grid gap-4 sm:grid-cols-2"><Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" aria-label="Category" /><select value={status} onChange={(event) => setStatus(event.target.value as DesignStatus)} className="h-9 rounded-md border border-input bg-background px-3 text-sm" aria-label="Status">{["draft", "approved", "in-production", "archived"].map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-muted-foreground">Date created<input type="date" value={dateCreated} max={new Date().toISOString().split("T")[0]} onChange={(event) => setDateCreated(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm" aria-label="Date created" /></label></div>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes" aria-label="Notes" />
      </section>
      <ColorBuilder colors={colors} onChange={setColors} />
      <section className="grid gap-4 rounded-lg border p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Artwork (Max 3 images)</h2><span className="text-sm text-muted-foreground">{images.length} / 3</span></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[0, 1, 2].map((index) => <ImageSlot key={index} index={index} image={images[index]} onUpload={readImage} onReplace={(file) => readImage(file, index)} onRemove={() => removeImage(index)} />)}</div></section>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => router.back()}>Cancel</Button><Button onClick={submit}>Create design</Button></div>
    </div>
  </>
}
