import { NextResponse } from "next/server"
import { listDriveBackups } from "@/lib/google-drive"

export async function GET() {
  try {
    return NextResponse.json({ files: await listDriveBackups() })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to list Drive files"
    console.error("[GOOGLE DRIVE] DRIVE_LIST_FAILED:", error instanceof Error ? error.name : "unknown error")
    const status = message === "UNAUTHENTICATED" ? 401 : message === "DRIVE_NOT_CONNECTED" ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
