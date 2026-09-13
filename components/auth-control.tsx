"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, LogOut } from "lucide-react"
import { toast } from "sonner"

import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import { Button } from "@/components/ui/button"

export function AuthControl() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    let active = true

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setIsAuthenticated(Boolean(data.user))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsAuthenticated(Boolean(session?.user))
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (isAuthenticated === null) return null

  if (!isAuthenticated) {
    return (
      <Button size="sm" variant="outline" render={<Link href="/login"><LogIn data-icon="inline-start" />Login</Link>} />
    )
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Unable to log out")
      setIsSigningOut(false)
      return
    }
    router.replace("/login")
    router.refresh()
  }

  return (
    <Button size="sm" variant="outline" disabled={isSigningOut} onClick={handleSignOut}>
      <LogOut data-icon="inline-start" />
      {isSigningOut ? "Logging out..." : "Logout"}
    </Button>
  )
}
