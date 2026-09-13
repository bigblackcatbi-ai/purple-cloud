import { NextRequest, NextResponse } from "next/server"
import { uploadDriveBackup } from "@/lib/google-drive"

interface BackupPayload {
  version: number
  exportedAt: string
  designs: unknown[]
  companies: unknown[]
  customers: unknown[]
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<BackupPayload>
    if (
      payload.version !== 1 ||
      typeof payload.exportedAt !== "string" ||
      !Array.isArray(payload.designs) ||
      !Array.isArray(payload.companies) ||
      !Array.isArray(payload.customers)
    ) {
      return NextResponse.json({ error: "Invalid backup payload" }, { status: 400 })
    }

    const fileName = `purple-cloud-backup-${new Date().toISOString().slice(0, 10)}.json`
    const file = await uploadDriveBackup(fileName, JSON.stringify(payload, null, 2))
    return NextResponse.json({ file })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload Drive backup"
    console.error("[GOOGLE DRIVE] DRIVE_UPLOAD_FAILED:", error instanceof Error ? error.name : "unknown error")
    const status = message === "UNAUTHENTICATED" ? 401 : message === "DRIVE_NOT_CONNECTED" ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
