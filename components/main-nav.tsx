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
  Globe,
  LogOut,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"

export default function MainNav({ onToggle }: { onToggle?: (collapsed: boolean) => void }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [sidebarWidth, setSidebarWidth] = React.useState(240)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()

  React.useEffect(() => {
    setSidebarWidth(isCollapsed ? 60 : 240)
  }, [isCollapsed])

  const navItems = [
    { href: "/", icon: Box, label: "item_list" },
    { href: "/stock-in", icon: Download, label: "stock_in" },
    { href: "/stock-out", icon: Upload, label: "stock_out" },
    { href: "/adjust", icon: SlidersHorizontal, label: "adjust" },
    { href: "/transactions", icon: BarChart, label: "transactions" },
    { href: "#", icon: ShoppingCart, label: "purchase_sales", hasSubmenu: true },
    { href: "#", icon: Printer, label: "print_barcode", hasSubmenu: true },
    { href: "/settings", icon: Settings, label: "settings" },
  ]

  return (
    <>
      <div className="relative">
        <Sidebar
          className={cn(
            "border-r transition-all duration-300 ease-in-out bg-background mt-16",
            isCollapsed ? "w-[60px]" : "w-[240px]",
          )}
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
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
                              <span>{t(item.label)}</span>
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
            <div className="absolute bottom-4 left-0 right-0 px-3">
              <div className="flex items-center gap-2 p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full flex items-center gap-2 justify-start hover:bg-muted/50">
                      <Avatar className="h-8 w-8 bg-purple-600">
                        <AvatarFallback>M</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">Matheus Puppe</p>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span className="text-xs">{language.toUpperCase()}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("pt")}>Português</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </Sidebar>
        <Button
          variant="outline"
          size="icon"
          className="fixed z-50 h-8 w-8 rounded-full bg-background p-0 transition-all duration-300 ease-in-out dark:bg-gray-800 dark:hover:bg-gray-700"
          style={{ left: `${sidebarWidth - 12}px`, top: "80px" }}
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

