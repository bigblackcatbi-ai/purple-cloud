"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Download, FolderOpen, HardDrive, Save, Upload } from "lucide-react"
import { toast } from "sonner"

import {
  buildBackupPayload,
  chooseBackupFolder,
  downloadBackupJson,
  getBackupFolderPermission,
  isFileSystemAccessSupported,
  loadSavedBackupFolder,
  requestBackupFolderPermission,
  recordBackupSuccess,
  saveBackupToFolder,
  type BackupPayload,
} from "@/lib/local-backup"
import { useCompaniesStore } from "@/store/companies"
import { useCustomersStore } from "@/store/customers"
import { useDesignsStore } from "@/store/designs"

export function BackupRestorePanel() {
  const designs = useDesignsStore((state) => state.designs)
  const companies = useCompaniesStore((state) => state.companies)
  const customers = useCustomersStore((state) => state.customers)
  const replaceDesigns = useDesignsStore((state) => state.replaceAll)
  const replaceCompanies = useCompaniesStore((state) => state.replaceAll)
  const replaceCustomers = useCustomersStore((state) => state.replaceAll)

  const [isLoading, setIsLoading] = useState(false)
  const [folder, setFolder] = useState<FileSystemDirectoryHandle | null>(null)
  const [folderPermission, setFolderPermission] = useState<PermissionState | "unsupported" | null>(null)
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null)
  const [backupMessage, setBackupMessage] = useState("No backup folder selected.")
  const [supportsFolderBackup, setSupportsFolderBackup] = useState(false)

  const folderRef = useRef<FileSystemDirectoryHandle | null>(null)
  const dataRef = useRef({ companies, customers, designs })
  folderRef.current = folder
  dataRef.current = { companies, customers, designs }

  const totalRecords = useMemo(
    () => designs.length + companies.length + customers.length,
    [companies.length, customers.length, designs.length],
  )

  const createPayload = () => buildBackupPayload(companies, customers, designs)

  useEffect(() => {
    const loadFolder = async () => {
      setLastBackupTime(window.localStorage.getItem("purple-cloud:last-backup"))
      const supported = isFileSystemAccessSupported()
      setSupportsFolderBackup(supported)
      if (!supported) {
        setFolderPermission("unsupported")
        return
      }
      const savedFolder = await loadSavedBackupFolder()
      if (!savedFolder) return
      setFolder(savedFolder)
      setFolderPermission(await getBackupFolderPermission(savedFolder))
    }

    void loadFolder().catch((error) => {
      console.error("[LOCAL BACKUP] folder load failed", error)
      setBackupMessage("Backup folder permission required")
    })
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const savedFolder = folderRef.current
      if (!savedFolder) return

      const { companies: currentCompanies, customers: currentCustomers, designs: currentDesigns } = dataRef.current
      const payload = buildBackupPayload(currentCompanies, currentCustomers, currentDesigns)
      void saveBackupToFolder(payload, savedFolder, { requestPermission: false })
        .then(() => setLastBackupTime(recordBackupSuccess()))
        .catch((error) => {
          console.error("[LOCAL BACKUP] automatic save failed", error)
        })
    }, 30 * 60 * 1000)

    return () => window.clearInterval(interval)
  }, [])

  const handleChooseFolder = async () => {
    try {
      setIsLoading(true)
      const selectedFolder = await chooseBackupFolder()
      setFolder(selectedFolder)
      setFolderPermission(await getBackupFolderPermission(selectedFolder))
      setBackupMessage("Backup folder selected")
      toast.success("Backup folder selected")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      console.error("[LOCAL BACKUP] folder selection failed", error)
      toast.error("Unable to select backup folder")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGrantPermission = async () => {
    if (!folder) return
    try {
      setIsLoading(true)
      const permission = await requestBackupFolderPermission(folder)
      setFolderPermission(permission)
      setBackupMessage(
        permission === "granted"
          ? "Backup folder selected"
          : "Backup folder permission required",
      )
    } catch (error) {
      console.error("[LOCAL BACKUP] permission request failed", error)
      setBackupMessage("Backup folder permission required")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBackup = async () => {
    if (!folder) return
    const payload = createPayload()
    try {
      setIsLoading(true)
      await saveBackupToFolder(payload, folder)
      setLastBackupTime(recordBackupSuccess())
      setBackupMessage("Backup saved successfully")
      toast.success("Backup saved successfully")
    } catch (error) {
      console.error("[LOCAL BACKUP] save failed", error)
      setBackupMessage(
        error instanceof Error && error.message === "BACKUP_FOLDER_PERMISSION_REQUIRED"
          ? "Backup folder permission required"
          : "Unable to save backup",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadBackup = () => {
    try {
      downloadBackupJson(createPayload())
      toast.success("Backup downloaded successfully")
    } catch (error) {
      console.error("[LOCAL BACKUP] download failed", error)
      toast.error("Failed to download backup")
    }
  }

  const handleRestoreBackup = async (file: File) => {
    try {
      setIsLoading(true)
      const text = await file.text()
      const payload = JSON.parse(text) as Partial<BackupPayload>

      if (
        !payload ||
        payload.version !== 1 ||
        !Array.isArray(payload.companies) ||
        !Array.isArray(payload.customers) ||
        !Array.isArray(payload.designs)
      ) {
        toast.error("Invalid backup file format")
        return
      }

      const confirmed = window.confirm(
        `This will restore ${payload.designs.length} designs, ${payload.companies.length} companies, and ${payload.customers.length} customers. Continue?`,
      )
      if (!confirmed) return

      replaceDesigns(payload.designs)
      replaceCompanies(payload.companies)
      replaceCustomers(payload.customers)

      toast.success("Data restored successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to restore backup")
    } finally {
      setIsLoading(false)
    }
  }

  const permissionRequired = folder !== null && folderPermission !== "granted" && folderPermission !== "unsupported"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Backup & Restore</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Keep your data safe by backing up to a folder on your computer.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Local Backup</h3>
        </div>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Choose a folder for automatic backups, or export a JSON file manually.
        </p>
        <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">Auto-save: Every 30 minutes</p>

        <div className="space-y-3">
          {supportsFolderBackup && !folder ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">No backup folder selected.</p>
              <button
                type="button"
                onClick={handleChooseFolder}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700"
              >
                <FolderOpen className="h-4 w-4" />
                Choose Backup Folder
              </button>
            </>
          ) : permissionRequired ? (
            <>
              <p className="text-sm text-amber-700 dark:text-amber-300">Backup folder permission required</p>
              <button
                type="button"
                onClick={handleGrantPermission}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700"
              >
                <FolderOpen className="h-4 w-4" />
                Grant Permission
              </button>
              <button
                type="button"
                onClick={handleChooseFolder}
                disabled={isLoading}
                className="w-full rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-center font-medium text-gray-700 transition hover:border-gray-400 dark:border-slate-600 dark:text-gray-300 dark:hover:border-slate-500"
              >
                Change Folder
              </button>
            </>
          ) : folder && folderPermission === "granted" ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">Backup folder selected</p>
              <button
                type="button"
                onClick={handleSaveBackup}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Saving backup..." : "Save Backup"}
              </button>
              <button
                type="button"
                onClick={handleChooseFolder}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-center font-medium text-gray-700 transition hover:border-gray-400 dark:border-slate-600 dark:text-gray-300 dark:hover:border-slate-500"
              >
                <FolderOpen className="h-4 w-4" />
                Change Folder
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Folder backup is not supported in this browser. Use Export JSON instead.
            </p>
          )}

          {backupMessage !== "No backup folder selected." ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{backupMessage}</p>
          ) : null}

          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:bg-gray-300 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800 dark:disabled:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>

          <div className="relative">
            <input
              id="purple-cloud-restore"
              type="file"
              accept="application/json"
              className="hidden"
              disabled={isLoading}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleRestoreBackup(file)
                event.target.value = ""
              }}
            />
            <label
              htmlFor="purple-cloud-restore"
              className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-center font-medium text-gray-700 transition hover:border-gray-400 dark:border-slate-600 dark:text-gray-300 dark:hover:border-slate-500"
            >
              <Upload className="mr-2 inline-block h-4 w-4" />
              Restore from File
            </label>
          </div>

          {lastBackupTime ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">Last backup: {lastBackupTime}</p>
          ) : (
            <p className="text-xs text-gray-600 dark:text-gray-400">No backup created yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>Tip:</strong> Save a backup regularly to your selected folder and keep an exported JSON copy when needed.
        </p>
        <p className="mt-2 text-xs text-blue-700 dark:text-blue-200">
          {totalRecords} records currently stored locally.
        </p>
      </div>
    </div>
  )
}
