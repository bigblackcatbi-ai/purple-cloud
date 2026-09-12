"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Images,
  LayoutDashboard,
  Plus,
  Star,
  SwatchBook,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const nav = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
  { title: "Designs", href: "/designs", icon: Images },
  { title: "Favorites", href: "/favorites", icon: Star },
  { title: "Companies", href: "/companies", icon: Building2 },
  { title: "Color Library", href: "/colors", icon: SwatchBook },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-1 py-1.5"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <SwatchBook className="size-4.5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold">Spectra</span>
            <span className="text-xs text-muted-foreground">Color &amp; Design</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href, item.exact)}
                    tooltip={item.title}
                    render={
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          className="w-full justify-start"
          render={
            <Link href="/designs/new">
              <Plus data-icon="inline-start" />
              New design
            </Link>
          }
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
