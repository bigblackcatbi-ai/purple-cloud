"use client"

import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} aria-pressed={theme === "dark"}>{theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}</Button>
}
