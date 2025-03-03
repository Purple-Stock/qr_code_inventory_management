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
  MoveRight,
  Printer,
  ArrowUpDown,
  Settings,
  Upload,
  Database,
  Menu,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"

export default function MainNav({ onToggle }: { onToggle?: (collapsed: boolean) => void }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [sidebarWidth, setSidebarWidth] = React.useState(240)
  const [openItems, setOpenItems] = React.useState<{ [key: string]: boolean }>({})
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()

  React.useEffect(() => {
    const storedState = localStorage.getItem("sidebar-collapsed")
    if (storedState !== null) {
      setIsCollapsed(storedState === "true")
    }
  }, [])

  React.useEffect(() => {
    setSidebarWidth(isCollapsed ? 60 : 240)
  }, [isCollapsed])

  const navItems = [
    { href: "/", icon: Box, label: "item_list" },
    { href: "/stock-in", icon: Download, label: "stock_in" },
    { href: "/stock-out", icon: Upload, label: "stock_out" },
    { href: "/adjust", icon: ArrowUpDown, label: "adjust_stock" },
    { href: "/move-stock", icon: MoveRight, label: "move_stock" },
    { href: "/transactions", icon: BarChart, label: "transactions" },
    { href: "#", icon: Printer, label: "print_barcode", hasSubmenu: true },
    {
      href: "#",
      icon: BarChart,
      label: "reports",
      hasSubmenu: true,
      submenuItems: [
        { href: "/reports/summary", label: "summary" },
        { href: "/reports/dashboard", label: "dashboard" },
        { href: "/reports/analytics", label: "analytics" },
      ],
    },
    {
      href: "#",
      icon: Database,
      label: "data_center",
      hasSubmenu: true,
      submenuItems: [
        { href: "/locations", label: "locations" },
        { href: "/categories", label: "categories" },
      ],
    },
    { href: "/settings", icon: Settings, label: "settings" },
  ]

  const NavigationContent = () => (
    <SidebarContent className="p-0">
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="gap-0">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {item.submenuItems ? (
                  <SidebarMenuButton
                    className={cn(
                      "w-full justify-start",
                      pathname.startsWith(item.href) &&
                        "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200",
                    )}
                    data-state="closed"
                  >
                    <div
                      className="flex items-center gap-2 py-2"
                      onClick={() => {
                        if (item.submenuItems) {
                          setOpenItems((prev) => ({
                            ...prev,
                            [item.label]: !prev[item.label],
                          }))
                        }
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      {(!isCollapsed || isMobileOpen) && (
                        <>
                          <span>{t(item.label)}</span>
                          <ChevronDown
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform duration-200",
                              openItems[item.label] && "transform rotate-180",
                            )}
                          />
                        </>
                      )}
                    </div>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href && "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200",
                    )}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 py-2"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {(!isCollapsed || isMobileOpen) && (
                        <>
                          <span>{t(item.label)}</span>
                          {item.hasSubmenu && <ChevronDown className="ml-auto h-4 w-4" />}
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                )}
                {item.submenuItems && (!isCollapsed || isMobileOpen) && openItems[item.label] && (
                  <SidebarMenuSub>
                    {item.submenuItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.href}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.href}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <Link href={subItem.href}>{t(subItem.label)}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )

  const UserMenu = () => (
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
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="relative hidden md:block">
        <Sidebar
          className={cn(
            "border-r transition-all duration-300 ease-in-out bg-background mt-16",
            isCollapsed ? "w-[60px]" : "w-[240px]",
          )}
        >
          <NavigationContent />
          {!isCollapsed && <UserMenu />}
        </Sidebar>
        <Button
          variant="outline"
          size="icon"
          className="fixed z-50 h-8 w-8 rounded-full bg-background p-0 transition-all duration-300 ease-in-out dark:bg-gray-800 dark:hover:bg-gray-700"
          style={{ left: `${sidebarWidth - 12}px`, top: "80px" }}
          onClick={() => {
            const newState = !isCollapsed
            setIsCollapsed(newState)
            localStorage.setItem("sidebar-collapsed", String(newState))
            onToggle?.(newState)
          }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed left-4 top-[72px] z-40">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <div className="mt-16">
              <NavigationContent />
              <UserMenu />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

