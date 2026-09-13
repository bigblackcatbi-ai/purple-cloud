"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  buildBackupPayload,
  getBackupFolderPermission,
  loadSavedBackupFolder,
  recordBackupSuccess,
  saveBackupToFolder,
} from "@/lib/local-backup"
import { useCompaniesStore } from "@/store/companies"
import { useCustomersStore } from "@/store/customers"
import { useDesignsStore } from "@/store/designs"

export function TopBarSave() {
  const companies = useCompaniesStore((state) => state.companies)
  const customers = useCustomersStore((state) => state.customers)
  const designs = useDesignsStore((state) => state.designs)
  const [folder, setFolder] = useState<FileSystemDirectoryHandle | null>(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")

  useEffect(() => {
    let active = true
    void loadSavedBackupFolder().then(async (savedFolder) => {
      if (!active || !savedFolder) return
      const permission = await getBackupFolderPermission(savedFolder)
      if (active && permission !== "unsupported") setFolder(savedFolder)
    }).catch((error) => {
      console.error("[LOCAL BACKUP] top-bar folder load failed", error)
    })
    return () => {
      active = false
    }
  }, [])

  const handleSave = async () => {
    if (saving) return
    if (!folder) {
      toast.error("Choose a backup folder first.", {
        action: { label: "Choose folder", onClick: () => window.location.assign("/backup") },
      })
      return
    }

    const payload = buildBackupPayload(companies, customers, designs)
    setSaving(true)
    setStatus("idle")
    try {
      await saveBackupToFolder(payload, folder)
      recordBackupSuccess()
      setStatus("saved")
      toast.success("Saved")
    } catch (error) {
      console.error("[LOCAL BACKUP] top-bar save failed", error)
      setStatus("error")
      toast.error(error instanceof Error && error.message === "BACKUP_FOLDER_PERMISSION_REQUIRED"
        ? "Backup folder permission required."
        : "Unable to save backup.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Button size="sm" variant="outline" disabled={saving} onClick={handleSave}>
      <Save data-icon="inline-start" />
      {saving ? "Saving..." : status === "saved" ? "Saved" : status === "error" ? "Save failed" : "Save"}
    </Button>
  )
}
