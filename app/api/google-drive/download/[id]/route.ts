import { NextResponse } from "next/server"
import { downloadDriveBackup } from "@/lib/google-drive"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const result = await downloadDriveBackup(id)
    return new NextResponse(result.content, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${result.file.name}"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to download Drive backup"
    const status = message === "UNAUTHENTICATED" ? 401 : message === "DRIVE_NOT_CONNECTED" ? 409 : message === "DRIVE_FILE_NOT_FOUND" ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
