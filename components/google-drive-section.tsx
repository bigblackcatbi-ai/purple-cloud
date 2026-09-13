"use client"

import { useEffect, useState } from "react"
import { Cloud, Download, LogOut, Upload } from "lucide-react"
import { toast } from "sonner"

import { useCompaniesStore } from "@/store/companies"
import { useCustomersStore } from "@/store/customers"
import { useDesignsStore } from "@/store/designs"

interface DriveFile {
  id: string
  name: string
  modifiedTime?: string
}

interface DriveStatus {
  authenticated: boolean
  connected: boolean
  email?: string | null
}

async function getDriveStatus() {
  const response = await fetch("/api/google-drive/status", { cache: "no-store" })
  if (response.status === 401) return { authenticated: false, connected: false }
  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as { error?: string } | null
    const errorCode = result?.error || `HTTP_${response.status}`
    throw new Error(
      `Google Drive status unavailable (${errorCode}). Check the server logs for the database error.`,
    )
  }
  return (await response.json()) as DriveStatus
}

export function GoogleDriveSection() {
  const [status, setStatus] = useState<DriveStatus | null>(null)
  const [files, setFiles] = useState<DriveFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)

  const designs = useDesignsStore((state) => state.designs)
  const companies = useCompaniesStore((state) => state.companies)
  const customers = useCustomersStore((state) => state.customers)

  const loadFiles = async () => {
    const response = await fetch("/api/google-drive/files", { cache: "no-store" })
    if (!response.ok) throw new Error("Unable to load Google Drive backups")
    const result = (await response.json()) as { files?: DriveFile[] }
    setFiles(result.files ?? [])
  }

  const loadStatus = async () => {
    const nextStatus = await getDriveStatus()
    setStatus(nextStatus)
    if (nextStatus.connected) await loadFiles()
  }

  useEffect(() => {
    void loadStatus()
      .catch((error) => {
        console.error(error)
        toast.error(error instanceof Error ? error.message : "Google Drive status unavailable")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleConnect = () => {
    window.location.assign(
      status?.authenticated ? "/api/google-drive/connect" : "/api/auth/sign-in?next=/backup",
    )
  }

  const handleDisconnect = async () => {
    try {
      setIsWorking(true)
      const response = await fetch("/api/google-drive/disconnect", { method: "DELETE" })
      if (!response.ok) throw new Error("Disconnect failed")
      setStatus({ authenticated: true, connected: false })
      setFiles([])
      toast.success("Google Drive disconnected")
    } catch (error) {
      console.error(error)
      toast.error("Failed to disconnect Google Drive")
    } finally {
      setIsWorking(false)
    }
  }

  const handleUpload = async () => {
    try {
      setIsWorking(true)
      const response = await fetch("/api/google-drive/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: 1,
          exportedAt: new Date().toISOString(),
          designs,
          companies,
          customers,
        }),
      })
      if (!response.ok) throw new Error("Upload failed")
      await loadFiles()
      toast.success("Backup uploaded to Google Drive")
    } catch (error) {
      console.error(error)
      toast.error("Failed to upload backup to Google Drive")
    } finally {
      setIsWorking(false)
    }
  }

  const handleDownload = async (file: DriveFile) => {
    try {
      setIsWorking(true)
      const response = await fetch(`/api/google-drive/download/${encodeURIComponent(file.id)}`)
      if (!response.ok) throw new Error("Download failed")
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = file.name
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      toast.success("Downloaded Google Drive backup")
    } catch (error) {
      console.error(error)
      toast.error("Failed to download Google Drive backup")
    } finally {
      setIsWorking(false)
    }
  }

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">Loading Google Drive...</div>
  }

  if (!status?.connected) {
    return (
      <button
        type="button"
        onClick={handleConnect}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-slate-700"
      >
        <Cloud className="h-4 w-4" />
        Connect Google Drive
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-slate-800">
        <p className="text-sm text-gray-900 dark:text-white">
          <strong>Google Drive Connected</strong>
          {status.email ? <span className="block text-xs text-gray-600 dark:text-gray-400">{status.email}</span> : null}
        </p>
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={isWorking}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </button>
      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={isWorking}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700"
      >
        <Upload className="h-4 w-4" />
        Upload Backup
      </button>

      {files.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Backups on Google Drive</p>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-slate-800">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : "Unknown date"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(file)}
                  disabled={isWorking}
                  className="ml-2 rounded p-2 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-slate-700"
                  aria-label={`Download ${file.name}`}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">No backups found on Google Drive yet.</p>
      )}
    </div>
  )
}
