"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Cloud,
  Images,
  LayoutDashboard,
  Plus,
  Star,
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const nav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Designs", href: "/designs", icon: Images },
  { title: "Favorites", href: "/favorites", icon: Star },
  { title: "Companies", href: "/companies", icon: Building2 },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Sidebar className="z-20 shrink-0">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 rounded-md px-1 py-1.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutDashboard className="size-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold">Purple Cloud</span>
            <span className="text-xs text-muted-foreground">Design Studio</span>
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
                      <Link href={item.href} className="flex min-w-0 items-center gap-2">
                        <item.icon className="shrink-0" />
                        <span className="truncate">{item.title}</span>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isActive("/backup", true)}
              tooltip="Backup & Restore"
              render={
                <Link href="/backup" className="flex min-w-0 items-center gap-2">
                  <Cloud className="shrink-0" />
                  <span className="truncate">Backup & Restore</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
