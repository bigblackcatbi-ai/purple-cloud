"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useData } from "@/lib/store"

interface PendingCustomer {
  id: string
  name: string
  contact: string
}

export default function CompaniesPage() {
  const { companies, designs, customers, addCompany, addCustomer, deleteCompany } = useData()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerContact, setCustomerContact] = useState("")
  const [pendingCustomers, setPendingCustomers] = useState<PendingCustomer[]>([])

  const resetForm = () => {
    setName("")
    setNotes("")
    setCustomerName("")
    setCustomerContact("")
    setPendingCustomers([])
  }
  const close = () => { setOpen(false); resetForm() }
  const addPendingCustomer = () => {
    if (!customerName.trim()) { toast.error("Customer name is required."); return }
    setPendingCustomers((current) => [...current, { id: crypto.randomUUID(), name: customerName.trim(), contact: customerContact.trim() }])
    setCustomerName("")
    setCustomerContact("")
  }
  const submit = () => {
    if (!name.trim()) { toast.error("Company name is required."); return }
    if (!pendingCustomers.length) { toast.error("Add at least one customer before creating the company."); return }
    const company = addCompany({ name: name.trim(), companyName: name.trim(), code: name.trim().slice(0, 3).toUpperCase(), note: notes.trim() || undefined, notes: notes.trim() || undefined })
    pendingCustomers.forEach((customer) => addCustomer({ name: customer.name, customerName: customer.name, companyId: company.id, email: customer.contact || undefined, contact: customer.contact || undefined }))
    toast.success(`Company '${company.name}' created with ${pendingCustomers.length} customer${pendingCustomers.length === 1 ? "" : "s"}.`)
    close()
  }
  const remove = (id: string, companyName: string) => { deleteCompany(id); toast.success(`Company '${companyName}' deleted.`) }

  return <><PageHeader title="Companies" description={`${companies.length} companies in your workspace.`} actions={<Button onClick={() => setOpen(true)}><Plus data-icon="inline-start" />Add company</Button>} /><Dialog open={open} onOpenChange={(value) => value ? setOpen(true) : close()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Add company</DialogTitle></DialogHeader><div className="grid gap-6"><section className="grid gap-3"><h3 className="text-sm font-semibold">Company information</h3><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Company name *" aria-label="Company name" /><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes (optional)" aria-label="Company notes" /></section><section className="grid gap-3 border-t pt-5"><h3 className="text-sm font-semibold">Add at least one customer</h3><div className="grid gap-3 rounded-lg bg-muted/50 p-4"><Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Customer name *" aria-label="Customer name" /><Input value={customerContact} onChange={(event) => setCustomerContact(event.target.value)} placeholder="Contact or reference (optional)" aria-label="Customer contact" /><Button variant="outline" onClick={addPendingCustomer}><Plus data-icon="inline-start" />Add customer</Button></div>{pendingCustomers.length ? <div className="grid min-w-0 gap-2"><p className="text-xs text-muted-foreground">{pendingCustomers.length} customer{pendingCustomers.length === 1 ? "" : "s"} added</p>{pendingCustomers.map((customer) => <div key={customer.id} className="flex min-w-0 items-center gap-2 rounded-md border bg-card p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{customer.name}</p>{customer.contact ? <p className="truncate text-xs text-muted-foreground">{customer.contact}</p> : null}</div><Button variant="ghost" size="icon" onClick={() => setPendingCustomers((current) => current.filter((item) => item.id !== customer.id))} aria-label={`Remove ${customer.name}`}><X className="size-4" /></Button></div>)}</div> : null}</section></div><DialogFooter><Button variant="outline" onClick={close}>Cancel</Button><Button onClick={submit} disabled={!name.trim() || !pendingCustomers.length}>Create company</Button></DialogFooter></DialogContent></Dialog><div className="grid gap-3 sm:grid-cols-2">{companies.map((company) => <Card key={company.id} className="h-full transition-colors hover:bg-muted/40"><CardContent className="flex min-w-0 items-start gap-3 p-4"><Building2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" /><Link href={`/companies/${company.id}`} className="min-w-0 flex-1"><p className="truncate font-medium">{company.name}</p><p className="truncate text-sm text-muted-foreground">{designs.filter((design) => design.companyId === company.id).length} designs · {customers.filter((customer) => customer.companyId === company.id).length} customers</p></Link><ConfirmDialog trigger={<Button variant="ghost" size="icon" className="shrink-0 text-destructive" aria-label={`Delete ${company.name}`}><Trash2 className="size-4" /></Button>} title="Delete company and all its designs?" description="This also deletes all customers and color usages associated with the company." onConfirm={() => remove(company.id, company.name)} /></CardContent></Card>)}</div></>
}
