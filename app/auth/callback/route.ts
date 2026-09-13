import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { encryptDriveToken } from "@/lib/drive-tokens"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const requestedNext = request.nextUrl.searchParams.get("next") || "/backup"
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/backup"
  const redirect = new URL(next, request.url)
  const supabase = await createSupabaseServerClient()

  if (!code) {
    redirect.searchParams.set("drive", "error")
    return NextResponse.redirect(redirect)
  }

  const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError || !sessionData.session) {
    redirect.searchParams.set("drive", "error")
    return NextResponse.redirect(redirect)
  }

  const session = sessionData.session as typeof sessionData.session & {
    provider_token?: string | null
    provider_refresh_token?: string | null
  }
  if (session.provider_refresh_token && session.provider_token) {
    const { error } = await supabase.from("google_drive_connections").upsert(
      {
        user_id: session.user.id,
        email: session.user.email ?? null,
        access_token_encrypted: encryptDriveToken(session.provider_token),
        refresh_token_encrypted: encryptDriveToken(session.provider_refresh_token),
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    if (error) {
      redirect.searchParams.set("drive", "error")
      return NextResponse.redirect(redirect)
    }
    redirect.searchParams.set("drive", "connected")
  } else {
    redirect.searchParams.set("drive", "needs-connection")
  }

  return NextResponse.redirect(redirect)
}
