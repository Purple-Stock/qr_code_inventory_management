"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Package,
  Printer,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Upload,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function MainNav({ onToggle }: { onToggle?: (collapsed: boolean) => void }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [sidebarWidth, setSidebarWidth] = React.useState(240)
  const pathname = usePathname()

  React.useEffect(() => {
    setSidebarWidth(isCollapsed ? 60 : 240)
  }, [isCollapsed])

  return (
    <>
      <div className="relative">
        <Sidebar
          className={cn(
            "border-r transition-all duration-300 ease-in-out bg-background",
            isCollapsed ? "w-[60px]" : "w-[240px]",
          )}
        >
          <SidebarHeader className="border-b dark:border-gray-700 px-3 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6 text-purple-600" />
              {!isCollapsed && <span className="text-lg font-bold text-purple-600">PURPLE STOCK</span>}
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    { href: "/", icon: Box, label: "Item List" },
                    { href: "/stock-in", icon: Download, label: "Stock In" },
                    { href: "/stock-out", icon: Upload, label: "Stock Out" },
                    { href: "/adjust", icon: SlidersHorizontal, label: "Adjust" },
                    { href: "/transactions", icon: BarChart, label: "Transactions" },
                    { href: "#", icon: ShoppingCart, label: "Purchase & Sales", hasSubmenu: true },
                    { href: "#", icon: Printer, label: "Print Barcode", hasSubmenu: true },
                    { href: "/settings", icon: Settings, label: "Settings" },
                  ].map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        className={cn(
                          "w-full justify-start",
                          pathname === item.href &&
                            "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200",
                        )}
                      >
                        <Link href={item.href} className="flex items-center gap-2 py-2">
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <>
                              <span>{item.label}</span>
                              {item.hasSubmenu && <ChevronDown className="ml-auto h-4 w-4" />}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          {!isCollapsed && (
            <div className="absolute bottom-4 left-4">
              <ThemeToggle />
            </div>
          )}
        </Sidebar>
        <Button
          variant="outline"
          size="icon"
          className="fixed left-[228px] top-4 z-50 h-8 w-8 rounded-full bg-background p-0 transition-all duration-300 ease-in-out dark:bg-gray-800 dark:hover:bg-gray-700"
          style={{ left: `${sidebarWidth - 12}px` }}
          onClick={() => {
            setIsCollapsed(!isCollapsed)
            onToggle?.(!isCollapsed)
          }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <div style={{ width: sidebarWidth }} />
    </>
  )
}

