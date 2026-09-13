import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function DELETE() {
  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 })

  const { error } = await supabase
    .from("google_drive_connections")
    .delete()
    .eq("user_id", userData.user.id)
  if (error) return NextResponse.json({ error: "Unable to disconnect Google Drive" }, { status: 500 })
  return NextResponse.json({ connected: false })
}
