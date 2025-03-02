"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Copy,
  Edit,
  Trash2,
  Download,
  Printer,
  ChevronDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpDown,
  MoveRight,
  MoreVertical,
  Package,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import FileSaver from "file-saver"
import MainNav from "@/components/main-nav"
import { SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getItem } from "@/app/actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useTranslation } from "next-i18next"

function TransactionItem({
  type,
  date,
  quantity,
  currentStock,
  memo,
}: {
  type: string
  date: string
  quantity: number
  currentStock: number
  memo?: string
}) {
  const getIcon = () => {
    switch (type.toLowerCase()) {
      case "stock in":
        return <ArrowDownToLine className="h-4 w-4 text-green-500" />
      case "stock out":
        return <ArrowUpFromLine className="h-4 w-4 text-red-500" />
      case "adjust":
        return <ArrowUpDown className="h-4 w-4 text-blue-500" />
      case "move":
        return <MoveRight className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getQuantityColor = () => {
    if (quantity > 0) return "text-green-500"
    if (quantity < 0) return "text-red-500"
    return "text-gray-500"
  }

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-start gap-2">
        <div className="p-1 bg-muted rounded-full">{getIcon()}</div>
        <div>
          <div className="text-sm font-medium">{type}</div>
          <div className="text-xs text-muted-foreground">{format(new Date(date), "MMM dd, yyyy")}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn("text-sm font-medium", getQuantityColor())}>{quantity > 0 ? `+${quantity}` : quantity}</div>
        <div className="text-xs text-muted-foreground">{currentStock}</div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}

export default function ItemDetails() {
  const params = useParams()
  const [item, setItem] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const qrRef = useRef<SVGSVGElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const { t } = useTranslation("common")

  useEffect(() => {
    async function fetchItem() {
      try {
        if (params.id) {
          const foundItem = await getItem(Number(params.id))
          if (!foundItem) {
            setError("Item not found")
            return
          }
          setItem(foundItem)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    }
    fetchItem()
  }, [params.id])

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarWidth(collapsed ? 60 : 240)
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <MainNav onToggle={handleSidebarToggle} />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <div className="border-b bg-card px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Item List
                </Link>
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="text-center py-8 text-red-500">{error}</div>
            </div>
          </div>
        </SidebarInset>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex min-h-screen bg-background">
        <MainNav onToggle={handleSidebarToggle} />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <div className="border-b bg-card px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Item List
                </Link>
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="text-center py-8">Loading...</div>
            </div>
          </div>
        </SidebarInset>
      </div>
    )
  }

  const qrCodeValue = `https://purplestock.com/items/${item.id}`

  const downloadQRCode = (format: "svg" | "png") => {
    if (qrRef.current) {
      if (format === "svg") {
        const svgData = new XMLSerializer().serializeToString(qrRef.current)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        FileSaver.saveAs(svgBlob, `qr-code-${item.sku}.svg`)
      } else if (format === "png") {
        const canvas = document.createElement("canvas")
        canvas.width = 1024
        canvas.height = 1024
        const ctx = canvas.getContext("2d")
        const img = new Image()
        const svgData = new XMLSerializer().serializeToString(qrRef.current)
        img.onload = () => {
          ctx?.drawImage(img, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              FileSaver.saveAs(blob, `qr-code-${item.sku}.png`)
            }
          })
        }
        img.src = "data:image/svg+xml;base64," + btoa(svgData)
      }
    }
  }

  // Mock transactions data - in real app, this would come from your database
  const transactions = [
    {
      type: "Stock In",
      date: "2025-01-29",
      quantity: 44,
      currentStock: 77,
    },
    {
      type: "Adjust",
      date: "2025-01-29",
      quantity: 33,
      currentStock: 33,
      memo: "Initial quantity",
    },
  ]

  const filteredTransactions = (type: string) => {
    if (type === "all") return transactions
    return transactions.filter((t) => t.type.toLowerCase().includes(type.toLowerCase()))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav onToggle={handleSidebarToggle} />
      <div className="flex-1 transition-all duration-300 ease-in-out" style={{ marginLeft: sidebarWidth }}>
        <div className="h-full flex flex-col">
          <div className="border-b bg-card px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Item List</span>
                </Link>
                <ChevronDown className="h-4 w-4" />
                <span className="font-medium text-foreground truncate">{item.name}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-muted/10">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 hover-shadow-effect">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center text-purple-600">
                    <Package className="h-6 w-6 mr-2" />
                    {t("item_information")}
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("sku")}
                      </label>
                      <p className="text-base font-medium bg-muted/50 p-2 rounded-md">{item.sku}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("name")}
                      </label>
                      <p className="text-base font-medium bg-muted/50 p-2 rounded-md">{item.name}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("barcode")}
                      </label>
                      <p className="text-base font-medium bg-muted/50 p-2 rounded-md">{item.barcode}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("cost")}
                      </label>
                      <p className="text-base font-medium bg-muted/50 p-2 rounded-md text-green-600">
                        ${item.cost.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("price")}
                      </label>
                      <p className="text-base font-medium bg-muted/50 p-2 rounded-md text-purple-600">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("type")}
                      </label>
                      <p className="text-base font-medium bg-muted/50 p-2 rounded-md">{item.type}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("brand")}
                      </label>
                      <p className="text-base font-medium bg-muted/50 p-2 rounded-md">{item.brand}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("location")}
                      </label>
                      <p className="text-base font-medium bg-muted/50 p-2 rounded-md">{item.location || "N/A"}</p>
                    </div>
                  </div>
                </Card>

                <div className="space-y-4 sm:space-y-6">
                  <Card className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">Current Status</h2>
                    <div className="text-center mb-4">
                      <div className="text-4xl sm:text-5xl font-bold text-[#9333E9]">{item.initial_quantity}</div>
                      <div className="text-sm text-muted-foreground mt-2">Available Stock</div>
                    </div>
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="in">In</TabsTrigger>
                        <TabsTrigger value="out">Out</TabsTrigger>
                        <TabsTrigger value="adjust">Adj</TabsTrigger>
                        <TabsTrigger value="move">Move</TabsTrigger>
                      </TabsList>
                      {["all", "in", "out", "adjust", "move"].map((tab) => (
                        <TabsContent key={tab} value={tab} className="mt-4">
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {filteredTransactions(tab).length > 0 ? (
                              filteredTransactions(tab).map((transaction, index) => (
                                <TransactionItem
                                  key={index}
                                  type={transaction.type}
                                  date={transaction.date}
                                  quantity={transaction.quantity}
                                  currentStock={transaction.currentStock}
                                  memo={transaction.memo}
                                />
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground text-center py-4">
                                No transactions to show
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </Card>

                  <Card className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">QR Code</h2>
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-2 sm:p-4 rounded-lg shadow-inner">
                        <QRCodeSVG value={qrCodeValue} size={120} ref={qrRef} />
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 mt-4 w-full">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Download QR</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => downloadQRCode("svg")}>Download as SVG</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => downloadQRCode("png")}>Download as PNG</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                          <Printer className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Print QR</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

