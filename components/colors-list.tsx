"use client"

import { useState } from "react"

import { ColorCard } from "@/components/color-card"
import { ColorEditModal } from "@/components/color-edit-modal"
import { useDesignsStore } from "@/store/designs"
import type { DesignColor } from "@/lib/types"

interface ColorsListProps {
  designId: string
  colors: DesignColor[]
}

export function ColorsList({ designId, colors }: ColorsListProps) {
  const updateColor = useDesignsStore((state) => state.updateColor)
  const deleteColor = useDesignsStore((state) => state.deleteColor)
  const [editingColor, setEditingColor] = useState<DesignColor | null>(null)

  if (colors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600 dark:border-slate-600 dark:text-gray-400">
        No colors added yet.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {colors.map((color, index) => (
          <ColorCard
            key={color.id}
            color={color}
            index={index}
            onEdit={(item) => setEditingColor(item)}
            onDelete={(id) => deleteColor(designId, id)}
          />
        ))}
      </div>

      {editingColor ? (
        <ColorEditModal
          color={editingColor}
          onCancel={() => setEditingColor(null)}
          onSave={(updatedColor) => {
            updateColor(designId, editingColor.id, updatedColor)
            setEditingColor(null)
          }}
        />
      ) : null}
    </>
  )
}
