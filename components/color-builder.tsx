"use client"

import { useState } from "react"
import { Copy, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { DesignColor, MixedColorComponent } from "@/lib/types"

interface ColorBuilderProps {
  colors: DesignColor[]
  onChange: (colors: DesignColor[]) => void
}

type SlotRow = { label: string; value: string }

type DirectFormState = {
  colorCode: string
  colorName: string
  additionalSlots: SlotRow[]
}

type MixedComponentForm = {
  id: string
  colorCode: string
  colorName: string
  grams: number
  additionalSlots: SlotRow[]
}

type MixedFormState = {
  components: MixedComponentForm[]
  finalSlots: SlotRow[]
}

const createSlots = (): SlotRow[] => Array.from({ length: 5 }, () => ({ label: "", value: "" }))

const toProperties = (slots: SlotRow[]) =>
  Object.fromEntries(
    slots.filter((slot) => slot.label.trim() && slot.value.trim()).map((slot) => [slot.label.trim(), slot.value.trim()]),
  )

function DirectColorForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: DesignColor
  onSubmit: (color: DesignColor) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<DirectFormState>({
    colorCode: initial?.colorCode ?? "",
    colorName: initial?.colorName ?? initial?.name ?? "",
    additionalSlots: initial?.additionalProperties
      ? Object.entries(initial.additionalProperties).map(([label, value]) => ({ label, value })).concat(createSlots()).slice(0, 5)
      : createSlots(),
  })

  const handleSlotChange = (index: number, field: "label" | "value", text: string) => {
    const updated = [...formData.additionalSlots]
    updated[index][field] = text
    setFormData({ ...formData, additionalSlots: updated })
  }

  const handleSubmit = () => {
    const colorCode = formData.colorCode.trim()
    const colorName = formData.colorName.trim()
    if (!colorCode) {
      alert("Please enter a color code")
      return
    }
    if (!colorName) {
      alert("Please enter a color name")
      return
    }

    onSubmit({
      id: initial?.id ?? crypto.randomUUID(),
      slot: initial?.slot ?? 0,
      type: "direct",
      colorCode,
      colorName,
      name: colorName,
      additionalProperties: toProperties(formData.additionalSlots),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="space-y-6 p-2">
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Color Code *</label>
            <Input value={formData.colorCode} onChange={(event) => setFormData({ ...formData, colorCode: event.target.value })} placeholder="e.g., RED-001, BLUE-002" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Color Name *</label>
            <Input value={formData.colorName} onChange={(event) => setFormData({ ...formData, colorName: event.target.value })} placeholder="e.g., Ferrari Red" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Additional Properties (optional, up to 5)</h3>
        <div className="space-y-2">
          {formData.additionalSlots.map((slot, index) => (
            <div key={index} className="flex gap-2">
              <Input value={slot.label} onChange={(event) => handleSlotChange(index, "label", event.target.value)} placeholder="Property name" className="flex-1" />
              <Input value={slot.value} onChange={(event) => handleSlotChange(index, "value", event.target.value)} placeholder="Value" className="flex-1" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Add Color</Button>
      </div>
    </div>
  )
}

function MixedColorForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: DesignColor
  onSubmit: (color: DesignColor) => void
  onCancel: () => void
}) {
  const initialComponents = initial?.mixedComponents?.length
    ? initial.mixedComponents.map((component) => ({
        id: component.id,
        colorCode: component.colorCode,
        colorName: component.colorName,
        grams: component.grams,
        additionalSlots: Object.entries(component.additionalProperties ?? {}).map(([label, value]) => ({ label, value })).concat(createSlots()).slice(0, 5),
      }))
    : [{ id: crypto.randomUUID(), colorCode: "", colorName: "", grams: 0, additionalSlots: createSlots() }]

  const [formData, setFormData] = useState<MixedFormState>({
    components: initialComponents,
    finalSlots: initial?.additionalProperties
      ? Object.entries(initial.additionalProperties).map(([label, value]) => ({ label, value })).concat(createSlots()).slice(0, 5)
      : createSlots(),
  })

  const totalGrams = formData.components.reduce((sum, component) => sum + (Number(component.grams) || 0), 0)

  const updateComponent = (id: string, patch: Partial<MixedComponentForm>) => {
    setFormData((current) => ({
      ...current,
      components: current.components.map((component) => (component.id === id ? { ...component, ...patch } : component)),
    }))
  }

  const updateComponentSlot = (id: string, slotIndex: number, field: "label" | "value", text: string) => {
    setFormData((current) => ({
      ...current,
      components: current.components.map((component) => {
        if (component.id !== id) return component
        const updated = [...component.additionalSlots]
        updated[slotIndex][field] = text
        return { ...component, additionalSlots: updated }
      }),
    }))
  }

  const updateFinalSlot = (index: number, field: "label" | "value", text: string) => {
    const updated = [...formData.finalSlots]
    updated[index][field] = text
    setFormData({ ...formData, finalSlots: updated })
  }

  const addComponent = () => {
    setFormData((current) => ({
      ...current,
      components: [...current.components, { id: crypto.randomUUID(), colorCode: "", colorName: "", grams: 0, additionalSlots: createSlots() }],
    }))
  }

  const removeComponent = (id: string) => {
    if (formData.components.length === 1) {
      alert("You need at least one component")
      return
    }
    setFormData((current) => ({
      ...current,
      components: current.components.filter((component) => component.id !== id),
    }))
  }

  const handleSubmit = () => {
    for (const component of formData.components) {
      if (!component.colorCode.trim()) {
        alert("Please enter a color code for all components")
        return
      }
      if (!component.colorName.trim()) {
        alert("Please enter a color name for all components")
        return
      }
      if (!component.grams || component.grams <= 0) {
        alert("Please enter grams for all components")
        return
      }
    }

    const mixedComponents: MixedColorComponent[] = formData.components.map((component) => ({
      id: component.id,
      colorCode: component.colorCode.trim(),
      colorName: component.colorName.trim(),
      grams: Number(component.grams),
      additionalProperties: toProperties(component.additionalSlots),
    }))

    onSubmit({
      id: initial?.id ?? crypto.randomUUID(),
      slot: initial?.slot ?? 0,
      type: "mixed",
      colorNumber: initial?.colorNumber ?? 0,
      colorCode: "MIX",
      colorName: "Mixed color",
      name: "Mixed color",
      mixedComponents,
      additionalProperties: toProperties(formData.finalSlots),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Color Components</h3>
        <span className="text-xs text-muted-foreground">Total: {totalGrams}g</span>
      </div>

      <div className="space-y-4">
        {formData.components.map((component, index) => (
          <div key={component.id} className="rounded-lg border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium">Component {index + 1}</h4>
              {formData.components.length > 1 ? (
                <button type="button" aria-label="Remove component" onClick={() => removeComponent(component.id)} className="text-destructive">
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium">Color Code *</label>
                <Input value={component.colorCode} onChange={(event) => updateComponent(component.id, { colorCode: event.target.value })} placeholder="e.g., RED-001" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium">Color Name *</label>
                <Input value={component.colorName} onChange={(event) => updateComponent(component.id, { colorName: event.target.value })} placeholder="e.g., Ferrari Red" />
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-2 block text-xs font-medium">Grams *</label>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} value={component.grams} onChange={(event) => updateComponent(component.id, { grams: Number(event.target.value) || 0 })} />
                <span className="text-sm text-muted-foreground">g</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {component.additionalSlots.map((slot, slotIndex) => (
                <div key={slotIndex} className="flex gap-2">
                  <Input value={slot.label} onChange={(event) => updateComponentSlot(component.id, slotIndex, "label", event.target.value)} placeholder="Property" className="flex-1" />
                  <Input value={slot.value} onChange={(event) => updateComponentSlot(component.id, slotIndex, "value", event.target.value)} placeholder="Value" className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={addComponent}>
        <Plus className="mr-2 size-4" />
        Add Component
      </Button>

      <div className="space-y-3 border-t pt-4">
        <h3 className="text-sm font-semibold">Final Color Properties (optional, up to 5)</h3>
        <div className="space-y-2">
          {formData.finalSlots.map((slot, index) => (
            <div key={index} className="flex gap-2">
              <Input value={slot.label} onChange={(event) => updateFinalSlot(index, "label", event.target.value)} placeholder="Property name" className="flex-1" />
              <Input value={slot.value} onChange={(event) => updateFinalSlot(index, "value", event.target.value)} placeholder="Value" className="flex-1" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Add Color</Button>
      </div>
    </div>
  )
}

function ColorEditor({ initial, onCancel, onSave }: { initial?: DesignColor; onCancel: () => void; onSave: (color: DesignColor) => void }) {
  const [type, setType] = useState<"direct" | "mixed">(initial?.type ?? "direct")

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">Color type</span>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={type === "direct"} onChange={() => setType("direct")} />
            Direct color
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={type === "mixed"} onChange={() => setType("mixed")} />
            Mixed color
          </label>
        </div>
      </div>

      {type === "direct" ? (
        <DirectColorForm initial={initial} onSubmit={onSave} onCancel={onCancel} />
      ) : (
        <MixedColorForm initial={initial} onSubmit={onSave} onCancel={onCancel} />
      )}
    </div>
  )
}

export function ColorBuilder({ colors, onChange }: ColorBuilderProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DesignColor | undefined>()

  const close = () => {
    setOpen(false)
    setEditing(undefined)
  }

  const save = (color: DesignColor) => {
    const next = editing
      ? colors.map((item) => (item.id === color.id ? { ...color, slot: item.slot } : item))
      : [...colors, { ...color, slot: colors.length + 1 }]
    onChange(next.slice(0, 20))
    close()
  }

  return (
    <section className="grid gap-4 rounded-lg border p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Colors ({colors.length} / 20)</h2>
        <Button variant="outline" onClick={() => setOpen(true)} disabled={colors.length >= 20}>
          <Plus className="mr-2 size-4" />
          Add color
        </Button>
      </div>

      {colors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No colors added yet.</p>
      ) : (
        <div className="grid gap-2">
          {colors.map((color, index) => (
            <div key={color.id} className="flex items-center gap-3 rounded-md border p-3">
              <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{color.colorName || color.name || color.colorCode || "Untitled"}</p>
                <p className="text-xs text-muted-foreground">{color.type === "mixed" ? `${color.mixedComponents?.reduce((sum, item) => sum + item.grams, 0) ?? 0}g mixed` : color.colorCode || "Direct color"}</p>
              </div>
              <span className="rounded bg-muted px-2 py-1 text-xs capitalize">{color.type}</span>
              <Button variant="ghost" size="icon" onClick={() => { setEditing(color); setOpen(true) }} aria-label="Edit color">
                <Copy className="size-4" />
              </Button>
              <ConfirmDialog
                trigger={<Button variant="ghost" size="icon" className="text-destructive" aria-label="Delete color"><Trash2 className="size-4" /></Button>}
                title="Delete this color?"
                description="This will permanently remove the color from the design."
                onConfirm={() => onChange(colors.filter((item) => item.id !== color.id).map((item, itemIndex) => ({ ...item, slot: itemIndex + 1 })))}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(value) => !value && close()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit color" : "Add color"}</DialogTitle>
          </DialogHeader>
          <ColorEditor initial={editing} onCancel={close} onSave={save} />
        </DialogContent>
      </Dialog>
    </section>
  )
}
