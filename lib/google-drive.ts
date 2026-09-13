import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { decryptDriveToken, encryptDriveToken } from "@/lib/drive-tokens"

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive"
const DRIVE_API = "https://www.googleapis.com/drive/v3"
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3"

interface DriveConnection {
  user_id: string
  email: string | null
  access_token_encrypted: string | null
  refresh_token_encrypted: string
  token_expires_at: string | null
}

export interface DriveFile {
  id: string
  name: string
  modifiedTime?: string
}

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error("Missing Google OAuth server configuration")
  return { clientId, clientSecret }
}

async function getConnection() {
  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error("UNAUTHENTICATED")

  const { data, error } = await supabase
    .from("google_drive_connections")
    .select("user_id, email, access_token_encrypted, refresh_token_encrypted, token_expires_at")
    .eq("user_id", userData.user.id)
    .maybeSingle()

  if (error) throw new Error("Unable to load Google Drive connection")
  console.warn("[GOOGLE DRIVE] connection row found:", Boolean(data))
  if (!data) throw new Error("DRIVE_NOT_CONNECTED")
  return { supabase, connection: data as DriveConnection }
}

async function getAccessToken() {
  console.warn("[GOOGLE DRIVE] getAccessToken started")
  const { supabase, connection } = await getConnection()
  const config = getGoogleConfig()
  const expiresAt = connection.token_expires_at ? Date.parse(connection.token_expires_at) : 0

  if (connection.access_token_encrypted && expiresAt > Date.now() + 60_000) {
    console.warn("[GOOGLE DRIVE] existing access token will be used")
    try {
      return decryptDriveToken(connection.access_token_encrypted)
    } catch {
      console.error("[GOOGLE DRIVE] TOKEN_DECRYPT_FAILED: access token")
      throw new Error("TOKEN_DECRYPT_FAILED")
    }
  }

  console.warn("[GOOGLE DRIVE] refresh-token decryption started")
  let refreshToken: string
  try {
    refreshToken = decryptDriveToken(connection.refresh_token_encrypted)
    console.warn("[GOOGLE DRIVE] refresh-token decryption succeeded")
  } catch {
    console.error("[GOOGLE DRIVE] TOKEN_DECRYPT_FAILED: refresh token")
    throw new Error("TOKEN_DECRYPT_FAILED")
  }
  console.warn("[GOOGLE DRIVE] token refresh request made")
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    console.error("[GOOGLE DRIVE] TOKEN_REFRESH_FAILED: HTTP", response.status)
    throw new Error("GOOGLE_TOKEN_REFRESH_FAILED")
  }
  const token = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!token.access_token) throw new Error("Google did not return an access token")

  await supabase
    .from("google_drive_connections")
    .update({
      access_token_encrypted: encryptDriveToken(token.access_token),
      token_expires_at: new Date(Date.now() + (token.expires_in ?? 3600) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", connection.user_id)

  return token.access_token
}

async function driveRequest(path: string, operation: string, init: RequestInit = {}) {
  const accessToken = await getAccessToken()
  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${accessToken}`)
  console.warn("[GOOGLE DRIVE] Drive API request made:", operation)
  const response = await fetch(`${DRIVE_API}${path}`, { ...init, headers, cache: "no-store" })
  if (!response.ok) await logDriveApiError(response)
  return response
}

async function driveUploadRequest(path: string, operation: string, init: RequestInit = {}) {
  const accessToken = await getAccessToken()
  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${accessToken}`)
  console.warn("[GOOGLE DRIVE] Drive API request made:", operation)
  const response = await fetch(`${DRIVE_UPLOAD_API}${path}`, { ...init, headers, cache: "no-store" })
  if (!response.ok) await logDriveApiError(response)
  return response
}

async function logDriveApiError(response: Response) {
  const error = {
    status: response.status,
    code: undefined as number | undefined,
    message: undefined as string | undefined,
    reasons: [] as string[],
  }

  try {
    const body = (await response.clone().json()) as {
      error?: {
        code?: unknown
        message?: unknown
        errors?: Array<{ reason?: unknown }>
      }
    }
    if (typeof body.error?.code === "number") error.code = body.error.code
    if (typeof body.error?.message === "string") error.message = body.error.message
    error.reasons = (body.error?.errors ?? [])
      .map((entry) => (typeof entry.reason === "string" ? entry.reason : null))
      .filter((reason): reason is string => reason !== null)
  } catch {
    // Preserve the original response for the caller if the body is not JSON.
  }

  console.error("[GOOGLE DRIVE] Drive API error:", error)
}

export async function listDriveBackups() {
  const response = await driveRequest(
    "/files?" + new URLSearchParams({
      pageSize: "20",
      orderBy: "modifiedTime desc",
      fields: "files(id,name,modifiedTime)",
      q: "name contains 'purple-cloud-backup-' and trashed = false",
    }),
    "DRIVE_LIST_FAILED",
  )
  if (!response.ok) throw new Error("DRIVE_LIST_FAILED")
  const result = (await response.json()) as { files?: DriveFile[] }
  return result.files ?? []
}

export async function uploadDriveBackup(fileName: string, content: string) {
  const existing = (await listDriveBackups()).find((file) => file.name === fileName)
  const metadata = new Blob([JSON.stringify({ name: fileName, mimeType: "application/json" })], {
    type: "application/json",
  })
  const file = new Blob([content], { type: "application/json" })
  const form = new FormData()
  form.append("metadata", metadata)
  form.append("file", file, fileName)

  const endpoint = existing
    ? `/files/${existing.id}?uploadType=multipart`
    : "/files?uploadType=multipart"
  const response = await driveUploadRequest(
    endpoint,
    "DRIVE_UPLOAD_FAILED",
    {
      method: existing ? "PATCH" : "POST",
      body: form,
    },
  )
  if (!response.ok) throw new Error("DRIVE_UPLOAD_FAILED")
  return (await response.json()) as DriveFile
}

export async function downloadDriveBackup(fileId: string) {
  const file = (await listDriveBackups()).find((candidate) => candidate.id === fileId)
  if (!file) throw new Error("DRIVE_FILE_NOT_FOUND")

  const response = await driveRequest(`/files/${encodeURIComponent(fileId)}?alt=media`)
  if (!response.ok) throw new Error("DRIVE_DOWNLOAD_FAILED")
  return { file, content: await response.text() }
}

export { DRIVE_SCOPE }
