"use client"

import type { Company, Customer, Design } from "@/lib/types"

export interface BackupPayload {
  version: 1
  exportedAt: string
  companies: Company[]
  customers: Customer[]
  designs: Design[]
}

type BackupPermission = PermissionState | "unsupported"
type PermissionDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>
  requestPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>
}

interface DirectoryPickerWindow extends Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
}

const HANDLE_DB_NAME = "purple-cloud-backup"
const HANDLE_STORE_NAME = "handles"
const HANDLE_KEY = "backup-folder"
const BACKUP_FILE_NAME = "purple-cloud-backup.json"

let saveQueue = Promise.resolve()

export function buildBackupPayload(
  companies: Company[],
  customers: Customer[],
  designs: Design[],
): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    companies: [...companies],
    customers: [...customers],
    designs: [...designs],
  }
}

export function recordBackupSuccess() {
  const backupTime = new Date().toLocaleString()
  window.localStorage.setItem("purple-cloud:last-backup", backupTime)
  return backupTime
}

export function isFileSystemAccessSupported() {
  return typeof window !== "undefined" && typeof (window as DirectoryPickerWindow).showDirectoryPicker === "function"
}

function openHandleDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(HANDLE_DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(HANDLE_STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("Unable to open backup storage"))
  })
}

async function storeBackupFolder(handle: FileSystemDirectoryHandle) {
  const database = await openHandleDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(HANDLE_STORE_NAME, "readwrite")
    transaction.objectStore(HANDLE_STORE_NAME).put(handle, HANDLE_KEY)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error("Unable to save backup folder"))
  })
  database.close()
}

export async function loadSavedBackupFolder() {
  if (typeof indexedDB === "undefined") return null
  const database = await openHandleDatabase()
  const handle = await new Promise<FileSystemDirectoryHandle | null>((resolve, reject) => {
    const request = database.transaction(HANDLE_STORE_NAME, "readonly")
      .objectStore(HANDLE_STORE_NAME)
      .get(HANDLE_KEY)
    request.onsuccess = () => resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null)
    request.onerror = () => reject(request.error ?? new Error("Unable to load backup folder"))
  })
  database.close()
  return handle
}

export async function chooseBackupFolder() {
  if (!isFileSystemAccessSupported()) throw new Error("FOLDER_BACKUP_UNSUPPORTED")
  const picker = (window as DirectoryPickerWindow).showDirectoryPicker
  if (!picker) throw new Error("FOLDER_BACKUP_UNSUPPORTED")
  const handle = await picker()
  await storeBackupFolder(handle)
  return handle
}

export async function getBackupFolderPermission(
  handle: FileSystemDirectoryHandle | null,
): Promise<BackupPermission> {
  const permissionHandle = handle as PermissionDirectoryHandle | null
  if (!permissionHandle || typeof permissionHandle.queryPermission !== "function") return "unsupported"
  return permissionHandle.queryPermission({ mode: "readwrite" })
}

export async function requestBackupFolderPermission(handle: FileSystemDirectoryHandle) {
  const permissionHandle = handle as PermissionDirectoryHandle
  if (typeof permissionHandle.requestPermission !== "function") return "unsupported" as const
  return permissionHandle.requestPermission({ mode: "readwrite" })
}

export async function saveBackupToFolder(
  payload: BackupPayload,
  handle: FileSystemDirectoryHandle,
  options: { requestPermission?: boolean } = {},
) {
  const snapshot = JSON.stringify(payload, null, 2)
  const save = async () => {
    let permission = await getBackupFolderPermission(handle)
    if (permission !== "granted" && options.requestPermission !== false) {
      permission = await requestBackupFolderPermission(handle)
    }
    if (permission !== "granted") throw new Error("BACKUP_FOLDER_PERMISSION_REQUIRED")

    const fileHandle = await handle.getFileHandle(BACKUP_FILE_NAME, { create: true })
    const writable = await fileHandle.createWritable()
    try {
      await writable.write(snapshot)
      await writable.close()
    } catch (error) {
      await writable.abort()
      throw error
    }
  }

  const result = saveQueue.then(save, save)
  saveQueue = result.then(() => undefined, () => undefined)
  return result
}

export function downloadBackupJson(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `purple-cloud-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
