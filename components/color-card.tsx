"use client"

import { useState } from "react"
import { ChevronDown, Edit2, Trash2 } from "lucide-react"

import type { DesignColor } from "@/lib/types"

interface ColorCardProps {
  color: DesignColor
  index: number
  onEdit: (color: DesignColor) => void
  onDelete: (id: string) => void
}

export function ColorCard({ color, index, onEdit, onDelete }: ColorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const totalGrams = color.type === "mixed"
    ? (color.mixedComponents ?? []).reduce((sum, component) => sum + (Number(component.grams) || 0), 0)
    : 0
  const properties = color.additionalProperties ?? {}

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div
        onClick={() => setIsExpanded((current) => !current)}
        className="flex cursor-pointer items-center justify-between gap-4 p-4 transition hover:bg-gray-50 dark:hover:bg-slate-800"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900 dark:text-white">
              {color.colorName || color.name || "Untitled"}
            </p>
            <p className="truncate text-sm text-gray-600 dark:text-gray-400">
              {color.colorCode || "No code"}
            </p>
          </div>
        </div>

        <div className="mr-4 text-right">
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-700 dark:bg-slate-800 dark:text-gray-300">
            {color.type}
          </span>
          {color.type === "mixed" ? (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {totalGrams}g mixed
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {isExpanded ? (
        <div className="space-y-4 border-t border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          {color.type === "mixed" && color.mixedComponents && color.mixedComponents.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Components</h4>
              {color.mixedComponents.map((component) => (
                <div key={component.id} className="space-y-2 rounded border border-gray-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{component.colorName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{component.colorCode}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{component.grams}g</span>
                  </div>

                  {component.additionalProperties && Object.keys(component.additionalProperties).length > 0 ? (
                    <div className="space-y-1 border-t border-gray-200 pt-2 text-xs dark:border-slate-600">
                      {Object.entries(component.additionalProperties).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2 text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              <div className="border-t border-gray-200 pt-2 dark:border-slate-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Total: {totalGrams}g
                </p>
              </div>
            </div>
          ) : null}

          {color.type === "direct" ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Properties</h4>
              {Object.keys(properties).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(properties).map(([key, value]) => (
                    <div key={key} className="rounded border border-gray-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{key}</p>
                      <p className="text-sm text-gray-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">No properties added</p>
              )}
            </div>
          ) : null}

          {color.type === "mixed" && Object.keys(properties).length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Final properties</h4>
              <div className="space-y-2">
                {Object.entries(properties).map(([key, value]) => (
                  <div key={key} className="rounded border border-gray-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{key}</p>
                    <p className="text-sm text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-slate-700">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(color)
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                if (window.confirm("Delete this color?")) {
                  onDelete(color.id)
                }
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
