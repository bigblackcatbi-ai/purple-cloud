import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ authenticated: false, connected: false }, { status: 401 })

  const { data, error } = await supabase
    .from("google_drive_connections")
    .select("email, connected_at, updated_at")
    .eq("user_id", userData.user.id)
    .maybeSingle()
  if (error) {
    console.error("[DRIVE STATUS DB ERROR]", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    return NextResponse.json({ error: "DRIVE_STATUS_QUERY_FAILED" }, { status: 500 })
  }

  return NextResponse.json({
    authenticated: true,
    connected: Boolean(data),
    email: data?.email ?? null,
    connectedAt: data?.connected_at ?? null,
  })
}
