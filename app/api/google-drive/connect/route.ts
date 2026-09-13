import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "node:crypto"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DRIVE_SCOPE } from "@/lib/google-drive"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return NextResponse.redirect(new URL("/api/auth/sign-in?next=/backup", request.url))

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || new URL("/api/google-drive/callback", request.url).toString()
  if (!clientId) return NextResponse.json({ error: "Google OAuth is not configured" }, { status: 500 })

  const state = randomBytes(32).toString("hex")
  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: `openid email ${DRIVE_SCOPE}`,
      state,
    })}`,
  )
  response.cookies.set("google_drive_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })
  return response
}
