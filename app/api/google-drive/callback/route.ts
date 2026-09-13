import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { encryptDriveToken } from "@/lib/drive-tokens"

interface GoogleTokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
}

export async function GET(request: NextRequest) {
  const redirect = new URL("/backup", request.url)
  const state = request.nextUrl.searchParams.get("state")
  const code = request.nextUrl.searchParams.get("code")
  const storedState = request.cookies.get("google_drive_oauth_state")?.value
  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user || !state || !storedState || state !== storedState || !code) {
    redirect.searchParams.set("drive", "error")
    return NextResponse.redirect(redirect)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || new URL("/api/google-drive/callback", request.url).toString()
  if (!clientId || !clientSecret) {
    redirect.searchParams.set("drive", "error")
    return NextResponse.redirect(redirect)
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  })
  const tokens = (await tokenResponse.json()) as GoogleTokenResponse
  if (!tokenResponse.ok || !tokens.access_token) {
    redirect.searchParams.set("drive", "error")
    return NextResponse.redirect(redirect)
  }

  const { data: existing } = await supabase
    .from("google_drive_connections")
    .select("refresh_token_encrypted")
    .eq("user_id", userData.user.id)
    .maybeSingle()
  const refreshTokenEncrypted = tokens.refresh_token
    ? encryptDriveToken(tokens.refresh_token)
    : existing?.refresh_token_encrypted

  if (!refreshTokenEncrypted) {
    redirect.searchParams.set("drive", "error")
    return NextResponse.redirect(redirect)
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: "no-store",
  })
  const profile = profileResponse.ok ? (await profileResponse.json()) as { email?: string } : {}

  const { error } = await supabase.from("google_drive_connections").upsert(
    {
      user_id: userData.user.id,
      email: profile.email ?? userData.user.email ?? null,
      access_token_encrypted: encryptDriveToken(tokens.access_token),
      refresh_token_encrypted: refreshTokenEncrypted,
      token_expires_at: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  redirect.searchParams.set("drive", error ? "error" : "connected")
  const response = NextResponse.redirect(redirect)
  response.cookies.delete("google_drive_oauth_state")
  return response
}
