"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createStockMove, searchItems } from "../actions"
import { toast } from "@/components/ui/use-toast"
import { FileSpreadsheet, QrCode, Search, Plus } from "lucide-react"
import { CSVImport } from "@/components/csv-import"
import { useLanguage } from "@/contexts/language-context"

interface MoveItem {
  itemId: number
  name: string
  sku: string
  currentStock: number
  quantity: number
}

export default function MoveStock() {
  const router = useRouter()
  const [items, setItems] = useState<MoveItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MoveItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [insertedItemsSearchQuery, setInsertedItemsSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [fromLocation, setFromLocation] = useState("default")
  const [toLocation, setToLocation] = useState("warehouse")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [memo, setMemo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useLanguage()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length > 2) {
      const results = await searchItems(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleAddItem = (item: any) => {
    if (!items.some((i) => i.itemId === item.id)) {
      setItems([
        ...items,
        {
          itemId: item.id,
          name: item.name,
          sku: item.sku,
          currentStock: item.current_quantity,
          quantity: 1,
        },
      ])
    }
    setSearchQuery("")
    setSearchResults([])
  }

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setItems(items.map((item) => (item.itemId === itemId ? { ...item, quantity } : item)))
  }

  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter((item) => item.itemId !== itemId))
  }

  const handleReset = () => {
    setItems([])
    setFromLocation("default")
    setToLocation("warehouse")
    setMemo("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("from_location", fromLocation)
      formData.append("to_location", toLocation)
      formData.append("date", date)
      formData.append("memo", memo)
      formData.append("items", JSON.stringify(items))

      const result = await createStockMove(formData)

      if (result.success) {
        toast({
          title: t("success"),
          description: result.message,
        })
        router.push("/")
      } else {
        toast({
          title: t("error"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("failed_to_move_stock"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t("move_stock_title")}</h1>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  {t("reset")}
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("from_location")}</label>
                      <Select value={fromLocation} onValueChange={setFromLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("default_location")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">{t("default_location")}</SelectItem>
                          <SelectItem value="warehouse">{t("warehouse")}</SelectItem>
                          <SelectItem value="store">{t("store")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("to_location")}</label>
                      <Select value={toLocation} onValueChange={setToLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("warehouse")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">{t("default_location")}</SelectItem>
                          <SelectItem value="warehouse">{t("warehouse")}</SelectItem>
                          <SelectItem value="store">{t("store")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("date")}</label>
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">{t("items")}</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          {t("bulk_add")}
                        </Button>
                        <CSVImport
                          trigger={
                            <Button type="button" variant="outline" size="sm">
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              {t("import_excel")}
                            </Button>
                          }
                        />
                        <Button type="button" variant="outline" size="sm">
                          <QrCode className="h-4 w-4 mr-2" />
                          {t("scan_barcode")}
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={t("search_for_item")}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                      {searchResults.length > 0 && (
                        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto">
                          <ul className="p-2">
                            {searchResults.map((item: any) => (
                              <li
                                key={item.id}
                                className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer"
                                onClick={() => handleAddItem(item)}
                              >
                                {item.name} ({item.sku})
                              </li>
                            ))}
                          </ul>
                        </Card>
                      )}
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={t("search_inserted_items")}
                        value={insertedItemsSearchQuery}
                        onChange={(e) => setInsertedItemsSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("name")}</TableHead>
                            <TableHead>{t("sku")}</TableHead>
                            <TableHead className="text-right">{t("current_stock")}</TableHead>
                            <TableHead className="text-right">{t("quantity")}</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                {t("no_items_added")}
                              </TableCell>
                            </TableRow>
                          ) : (
                            items.map((item) => (
                              <TableRow key={item.itemId}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell className="text-right">{item.currentStock}</TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    min="1"
                                    max={item.currentStock}
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.itemId, Number(e.target.value))}
                                    className="w-20 ml-auto"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.itemId)}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    {t("remove")}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("memo")}</label>
                    <Textarea
                      placeholder={t("enter_memo_with_hash")}
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline">
                    {t("save_draft")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting || items.length === 0}>
                    {isSubmitting ? t("moving") : t("move")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

