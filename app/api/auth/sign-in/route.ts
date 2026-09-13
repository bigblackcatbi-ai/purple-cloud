import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const requestedNext = request.nextUrl.searchParams.get("next") || "/backup"
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/backup"
  const redirectTo = new URL("/auth/callback", request.url)
  redirectTo.searchParams.set("next", next)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
        scope: "openid email profile",
      },
    },
  })

  if (error || !data.url) {
    return NextResponse.json({ error: "Unable to start Google sign-in" }, { status: 500 })
  }
  return NextResponse.redirect(data.url)
}
