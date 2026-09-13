"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Copy, Download, Printer, Trash2 } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { PageHeader } from "@/components/page-header"
import { ColorsList } from "@/components/colors-list"
import { ColorBuilder } from "@/components/color-builder"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ImageSlot } from "@/components/image-slot"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useData } from "@/lib/store"
import type { DesignImage, DesignStatus } from "@/lib/types"

export default function DesignDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { getDesign, getCompany, getCustomer, updateDesign, deleteDesign, duplicateDesign } = useData()
  const design = getDesign(params.id)
  const [name, setName] = useState(design?.name ?? "")
  const [notes, setNotes] = useState(design?.notes ?? "")
  const [status, setStatus] = useState<DesignStatus>(design?.status ?? "draft")
  const [dateCreated, setDateCreated] = useState(design?.dateCreated ?? new Date().toISOString().split("T")[0])
  const [colors, setColors] = useState(design?.colors ?? [])
  const [images, setImages] = useState<DesignImage[]>(design?.images ?? [])

  useEffect(() => {
    if (!design) return
    setName(design.name)
    setNotes(design.notes ?? "")
    setStatus(design.status)
    setDateCreated(design.dateCreated ?? new Date(design.createdAt).toISOString().split("T")[0])
    setColors(design.colors)
    setImages(design.images)
  }, [design])

  if (!design) return <div className="py-20 text-center"><h1 className="text-lg font-semibold">Design not found</h1><Button variant="link" onClick={() => router.push("/designs")}>Back to designs</Button></div>
  const company = getCompany(design.companyId)
  const customer = getCustomer(design.customerId)
  const save = () => { updateDesign(design.id, { name, notes, status, colors, images, dateCreated }); toast.success("Design updated") }
  const duplicate = () => { const copy = duplicateDesign(design.id); if (copy) { toast.success("Design duplicated"); router.push(`/designs/${copy.id}`) } }
  const remove = () => { deleteDesign(design.id); toast.success("Design deleted"); router.push("/designs") }
  const readImage = (file: File, index?: number) => { const reader = new FileReader(); reader.onload = () => setImages((current) => { const image = { id: current[index ?? current.length]?.id ?? crypto.randomUUID(), url: String(reader.result) }; if (index === undefined) return current.length < 3 ? [...current, image] : current; return current.map((item, itemIndex) => itemIndex === index ? image : item) }); reader.readAsDataURL(file) }
  const removeImage = (index: number) => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))
  const exportDesign = () => { const rows = design.colors.map((color) => ({ "Design ID": design.code, Company: company?.name, Customer: customer?.name, "Design Name": design.name, "Color Number": color.slot, "Color Name": color.colorName ?? color.name ?? "", "Color Type": color.type, "Color Code": color.colorCode ?? "", "Properties": JSON.stringify(color.additionalProperties ?? {}), Notes: design.notes ?? "" })); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Design"); XLSX.writeFile(workbook, `${design.code}.xlsx`) }

  return <>
    <div className="flex items-start gap-3"><Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft data-icon="inline-start" />Back</Button><div className="min-w-0 flex-1"><PageHeader title={design.name} description={`${design.code} · ${company?.name ?? "No company"}`} actions={<><Button variant="outline" size="icon" onClick={() => window.print()} aria-label="Print design"><Printer className="size-4" /></Button><Button variant="outline" size="icon" onClick={exportDesign} aria-label="Export design"><Download className="size-4" /></Button><Button variant="outline" onClick={duplicate}><Copy data-icon="inline-start" />Duplicate</Button><ConfirmDialog trigger={<Button variant="destructive" size="icon" aria-label="Delete design"><Trash2 className="size-4" /></Button>} title="Delete this design?" description="This will permanently remove the design and its color formulations." onConfirm={remove} /></>} /></div></div>
    <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
      <section className="grid gap-4 rounded-lg border p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Design record</h2><StatusBadge status={design.status} /></div><Input value={name} onChange={(event) => setName(event.target.value)} aria-label="Design name" /><div className="grid gap-4 sm:grid-cols-2"><select value={status} onChange={(event) => setStatus(event.target.value as DesignStatus)} className="h-9 rounded-md border border-input bg-background px-3 text-sm" aria-label="Status">{["draft", "approved", "in-production", "archived"].map((item) => <option key={item} value={item}>{item}</option>)}</select><Input type="date" value={dateCreated} max={new Date().toISOString().split("T")[0]} onChange={(event) => setDateCreated(event.target.value)} aria-label="Date created" /></div><div className="space-y-1"><p className="text-xs text-muted-foreground">Date created</p><p className="text-sm font-medium">{new Date(dateCreated || design.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p></div><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes" aria-label="Notes" /><Button onClick={save}>Save changes</Button></section>
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-lg border p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Colors ({colors.length} / 20)</h2>
          </div>
          <ColorsList designId={design.id} colors={colors} />
        </div>
        <ColorBuilder colors={colors} onChange={setColors} />
        {customer ? <p className="pt-2 text-sm text-muted-foreground">Customer: {customer.name}</p> : null}
      </div>
      <section className="grid gap-4 rounded-lg border p-5 lg:col-span-2"><div className="flex items-center justify-between"><h2 className="font-semibold">Artwork (Max 3 images)</h2><span className="text-sm text-muted-foreground">{images.length} / 3</span></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[0, 1, 2].map((index) => <ImageSlot key={index} index={index} image={images[index]} onUpload={readImage} onReplace={(file) => readImage(file, index)} onRemove={() => removeImage(index)} />)}</div></section>
    </div>
  </>
}
