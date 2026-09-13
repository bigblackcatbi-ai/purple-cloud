"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, X } from "lucide-react"

import type { DesignColor, MixedColorComponent } from "@/lib/types"

interface ColorEditModalProps {
  color: DesignColor
  onSave: (color: DesignColor) => void
  onCancel: () => void
}

function normalizeProperties(value?: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([key, item]) => key.trim() && String(item).trim()),
  )
}

function propertyRows(properties?: Record<string, string>) {
  const entries = Object.entries(properties ?? {})
  const rows = entries.length > 0 ? entries : [["", ""]]
  return [...rows, ...Array.from({ length: Math.max(0, 5 - rows.length) }, () => ["", ""])]
}

export function ColorEditModal({ color, onSave, onCancel }: ColorEditModalProps) {
  const [formData, setFormData] = useState<DesignColor>(color)
  const [properties, setProperties] = useState<Record<string, string>>(normalizeProperties(color.additionalProperties))

  const rows = useMemo(() => propertyRows(properties), [properties])

  const updatePropertyRow = (index: number, field: "key" | "value", text: string) => {
    const entries = Object.entries(properties)
    const current = entries[index] ?? ["", ""]
    const next = { ...properties }

    if (current[0]) delete next[current[0]]

    if (field === "key") {
      if (text.trim()) next[text.trim()] = current[1] ?? ""
    } else if (current[0]) {
      next[current[0]] = text
    }

    setProperties(Object.fromEntries(Object.entries(next).filter(([key, value]) => key.trim() && String(value).trim())))
  }

  if (formData.type === "direct") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Color</h2>
            <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-6">
            <div className="space-y-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-slate-600 dark:bg-slate-800">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">Color Code</label>
                <input
                  value={formData.colorCode ?? ""}
                  onChange={(event) => setFormData({ ...formData, colorCode: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">Color Name</label>
                <input
                  value={formData.colorName ?? ""}
                  onChange={(event) => setFormData({ ...formData, colorName: event.target.value, name: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Properties</h3>
              <div className="space-y-2">
                {rows.map(([key, value], index) => (
                  <div key={`${index}-${key}`} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Property name"
                      value={key}
                      onChange={(event) => updatePropertyRow(index, "key", event.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={value}
                      onChange={(event) => updatePropertyRow(index, "value", event.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const payload: DesignColor = {
                  ...formData,
                  colorName: formData.colorName?.trim() || formData.name || "",
                  name: formData.colorName?.trim() || formData.name || "",
                  additionalProperties: Object.keys(properties).length > 0 ? properties : undefined,
                  updatedAt: new Date().toISOString(),
                }
                onSave(payload)
              }}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const [components, setComponents] = useState<MixedColorComponent[]>(
    formData.mixedComponents && formData.mixedComponents.length > 0
      ? formData.mixedComponents
      : [
          {
            id: crypto.randomUUID(),
            colorCode: "",
            colorName: "",
            grams: 0,
            additionalProperties: {},
          },
        ],
  )
  const [finalProperties, setFinalProperties] = useState<Record<string, string>>(normalizeProperties(formData.additionalProperties))

  const updateComponent = (id: string, patch: Partial<MixedColorComponent>) => {
    setComponents((current) => current.map((component) => (component.id === id ? { ...component, ...patch } : component)))
  }

  const removeComponent = (id: string) => {
    setComponents((current) => {
      if (current.length === 1) return current
      return current.filter((component) => component.id !== id)
    })
  }

  const addComponent = () => {
    setComponents((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        colorCode: "",
        colorName: "",
        grams: 0,
        additionalProperties: {},
      },
    ])
  }

  const finalRows = useMemo(() => propertyRows(finalProperties), [finalProperties])

  const updateFinalProperty = (index: number, field: "key" | "value", text: string) => {
    const entries = Object.entries(finalProperties)
    const current = entries[index] ?? ["", ""]
    const next = { ...finalProperties }

    if (current[0]) delete next[current[0]]

    if (field === "key") {
      if (text.trim()) next[text.trim()] = current[1] ?? ""
    } else if (current[0]) {
      next[current[0]] = text
    }

    setFinalProperties(Object.fromEntries(Object.entries(next).filter(([key, value]) => key.trim() && String(value).trim())))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white dark:bg-slate-900">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Mixed Color</h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Components</h3>
            <div className="space-y-3">
              {components.map((component, index) => (
                <div key={component.id} className="space-y-3 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-slate-600 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Component {index + 1}</h4>
                    {components.length > 1 ? (
                      <button type="button" onClick={() => removeComponent(component.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={component.colorCode}
                      onChange={(event) => updateComponent(component.id, { colorCode: event.target.value })}
                      placeholder="Color code"
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                    <input
                      type="text"
                      value={component.colorName}
                      onChange={(event) => updateComponent(component.id, { colorName: event.target.value })}
                      placeholder="Color name"
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <input
                    type="number"
                    min={0}
                    value={component.grams}
                    onChange={(event) => updateComponent(component.id, { grams: Number(event.target.value) || 0 })}
                    placeholder="Grams"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addComponent}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add component
            </button>
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-6 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Final properties</h3>
            <div className="space-y-2">
              {finalRows.map(([key, value], index) => (
                <div key={`${index}-${key}`} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Property name"
                    value={key}
                    onChange={(event) => updateFinalProperty(index, "key", event.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={value}
                    onChange={(event) => updateFinalProperty(index, "value", event.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const payload: DesignColor = {
                ...formData,
                colorName: formData.colorName?.trim() || "Mixed color",
                name: formData.name || "Mixed color",
                mixedComponents: components.filter((component) => component.colorCode.trim() || component.colorName.trim() || component.grams > 0),
                additionalProperties: Object.keys(finalProperties).length > 0 ? finalProperties : undefined,
                updatedAt: new Date().toISOString(),
              }
              onSave(payload)
            }}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
