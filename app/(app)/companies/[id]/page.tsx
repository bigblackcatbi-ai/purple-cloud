"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Edit2, Plus, Trash2, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DesignCard } from "@/components/design-card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useData } from "@/lib/store"

interface PendingCustomer {
  id: string
  name: string
  contact: string
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { getCompany, designsForCompany, customersForCompany, updateCompany, addCustomer, deleteCustomer, deleteCompany } = useData()
  const company = getCompany(id)
  const designs = designsForCompany(id)
  const customers = customersForCompany(id)
  const [open, setOpen] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [notes, setNotes] = useState("")
  const [pendingCustomers, setPendingCustomers] = useState<PendingCustomer[]>([])
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerContact, setNewCustomerContact] = useState("")

  useEffect(() => {
    if (!company) return
    setCompanyName(company.name)
    setNotes(company.note ?? company.notes ?? "")
  }, [company])

  if (!company) return <div className="py-20 text-center"><p className="text-sm text-muted-foreground">Company not found</p><Button variant="link" onClick={() => router.push("/companies")}>Back to companies</Button></div>

  const openEditor = () => {
    setCompanyName(company.name)
    setNotes(company.note ?? company.notes ?? "")
    setPendingCustomers([])
    setNewCustomerName("")
    setNewCustomerContact("")
    setOpen(true)
  }
  const addPending = () => {
    if (!newCustomerName.trim()) { toast.error("Customer name is required."); return }
    setPendingCustomers((current) => [...current, { id: crypto.randomUUID(), name: newCustomerName.trim(), contact: newCustomerContact.trim() }])
    setNewCustomerName("")
    setNewCustomerContact("")
  }
  const save = () => {
    if (!companyName.trim()) { toast.error("Company name is required."); return }
    updateCompany(company.id, { name: companyName.trim(), companyName: companyName.trim(), note: notes.trim() || undefined, notes: notes.trim() || undefined })
    pendingCustomers.forEach((customer) => addCustomer({ name: customer.name, customerName: customer.name, companyId: company.id, email: customer.contact || undefined, contact: customer.contact || undefined }))
    setOpen(false)
    toast.success(`Company '${companyName.trim()}' updated.`)
  }
  const removeCompany = () => { deleteCompany(company.id); toast.success(`Company '${company.name}' deleted.`); router.push("/companies") }

  return <>
    <div className="flex items-start gap-3"><Button variant="ghost" size="sm" onClick={() => router.push("/companies")}><ArrowLeft data-icon="inline-start" />Back</Button><div className="min-w-0 flex-1"><PageHeader title={company.name} description={`${designs.length} designs · ${customers.length} customers`} actions={<><Button variant="outline" onClick={openEditor}><Edit2 data-icon="inline-start" />Edit</Button><ConfirmDialog trigger={<Button variant="destructive" size="icon" aria-label="Delete company"><Trash2 className="size-4" /></Button>} title="Delete company?" description={`This will permanently delete ${company.name} and all its designs and customers.`} onConfirm={removeCompany} /></>} /></div></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Edit company</DialogTitle></DialogHeader><div className="grid gap-5"><div className="grid gap-3"><h3 className="font-medium">Company information</h3><Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" aria-label="Company name" /><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes" aria-label="Company notes" /></div><div className="grid gap-3"><h3 className="font-medium">Current customers ({customers.length})</h3>{customers.length === 0 ? <p className="text-sm text-muted-foreground">No customers yet.</p> : customers.map((customer) => <div key={customer.id} className="flex items-center gap-2 rounded-md border p-2"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{customer.customerName ?? customer.name}</p><p className="truncate text-xs text-muted-foreground">{customer.contact ?? customer.email ?? customer.phone}</p></div><ConfirmDialog trigger={<Button variant="ghost" size="icon" className="text-destructive" aria-label={`Remove ${customer.customerName ?? customer.name}`}><Trash2 className="size-4" /></Button>} title="Remove this customer?" description="The customer will be removed from this company." onConfirm={() => { deleteCustomer(customer.id); toast.success("Customer removed.") }} /></div>)}</div><div className="grid gap-3"><h3 className="font-medium">Add customers</h3>{pendingCustomers.map((customer) => <div key={customer.id} className="flex items-center gap-2 rounded-md bg-muted/50 p-2 text-sm"><span className="min-w-0 flex-1 truncate">{customer.name}{customer.contact ? ` · ${customer.contact}` : ""}</span><Button variant="ghost" size="icon" onClick={() => setPendingCustomers((current) => current.filter((item) => item.id !== customer.id))} aria-label={`Remove pending ${customer.name}`}><X className="size-4" /></Button></div>)}<div className="grid gap-2 sm:grid-cols-2"><Input value={newCustomerName} onChange={(event) => setNewCustomerName(event.target.value)} placeholder="Customer name" aria-label="New customer name" /><Input value={newCustomerContact} onChange={(event) => setNewCustomerContact(event.target.value)} placeholder="Contact/reference" aria-label="New customer contact" /></div><Button variant="outline" onClick={addPending}><Plus data-icon="inline-start" />Add customer</Button></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save changes</Button></DialogFooter></DialogContent></Dialog>
    <section className="grid gap-4"><h2 className="text-lg font-semibold">Designs</h2>{designs.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{designs.map((design) => <DesignCard key={design.id} design={design} />)}</div> : <p className="py-12 text-center text-sm text-muted-foreground">No designs for this company yet.</p>}</section>
    <section className="grid gap-4 border-t pt-6"><h2 className="text-lg font-semibold">Customers</h2>{customers.length ? <div className="grid gap-3 sm:grid-cols-2">{customers.map((customer) => <div key={customer.id} className="rounded-lg border p-4"><p className="font-medium">{customer.customerName ?? customer.name}</p><p className="text-sm text-muted-foreground">{customer.contact ?? customer.email ?? customer.phone ?? "No contact provided"}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No customers for this company yet.</p>}</section>
  </>
}
