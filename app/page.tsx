"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import MainNav from "@/components/main-nav"
import { Filter, Plus, QrCode, Search, ChevronDown } from "lucide-react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { duplicateItem, exportItemsToCSV, insertDummyData, getItems, deleteItem } from "./actions"
import { toast } from "@/components/ui/use-toast"
import { CSVImport } from "@/components/csv-import"
import { Download } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { Database } from "@/types/database"
import { DeleteAlert } from "@/components/delete-alert"

type Item = Database["public"]["Tables"]["items"]["Row"]

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null)
  const [isDuplicating, setIsDuplicating] = useState<number | null>(null)
  const { t } = useLanguage()

  const refreshItems = async () => {
    try {
      setIsLoading(true)
      const fetchedItems = await getItems()
      setItems(fetchedItems)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items")
      toast({
        title: t("error"),
        description: t("failed_to_fetch_items"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshItems()
  }, [])

  const handleDuplicate = async (id: number) => {
    try {
      setIsDuplicating(id)
      const result = await duplicateItem(id)
      if (result.success) {
        toast({
          title: t("success"),
          description: t("item_duplicated_successfully"),
        })
        refreshItems()
      } else {
        toast({
          title: t("error"),
          description: t("failed_to_duplicate_item"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_to_duplicate_item"),
        variant: "destructive",
      })
    } finally {
      setIsDuplicating(null)
    }
  }

  const handleExportCsv = async () => {
    const csvContent = await exportItemsToCSV()
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `items-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleInsertDummyData = async () => {
    const result = await insertDummyData()
    if (result.success) {
      toast({
        title: t("success"),
        description: t("dummy_data_success"),
      })
      refreshItems()
    } else {
      toast({
        title: t("error"),
        description: t("dummy_data_error"),
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    const result = await deleteItem(itemToDelete.id)
    if (result.success) {
      toast({
        title: t("success"),
        description: t("item_deleted_successfully"),
      })
      refreshItems()
    } else {
      toast({
        title: t("error"),
        description: t("failed_to_delete_item"),
        variant: "destructive",
      })
    }
    setItemToDelete(null)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <SidebarInset className="flex-1">
        <div className="h-full flex flex-col">
          <header className="bg-background border-b dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">{t("purple_stock_item_list")}</h1>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleExportCsv}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("export_csv")}
                  </Button>
                  <CSVImport onSuccess={refreshItems} />
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    {t("scan")}
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href="/new-item">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("add_item")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleInsertDummyData}>
                    {t("insert_dummy_data")}
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder={t("search_items")} className="pl-10" />
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("all_categories")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all_categories")}</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-x-auto p-6">
            <Card className="h-full bg-background dark:bg-gray-800">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50 dark:hover:bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("sku")}</TableHead>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead className="text-right">{t("in_stock")}</TableHead>
                    <TableHead className="text-right">{t("unit_price")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t("loading")}...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t("no_items_found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50 dark:hover:bg-muted/50">
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/items/${item.id}`} className="hover:text-purple-600">
                            {item.name}
                          </Link>
                        </TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell className="text-right">{item.current_quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>{t("edit")}</DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => handleDuplicate(item.id)}
                                disabled={isDuplicating === item.id}
                              >
                                {isDuplicating === item.id ? t("duplicating") : t("duplicate")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onSelect={() => setItemToDelete({ id: item.id, name: item.name })}
                              >
                                {t("delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </main>

          <footer className="bg-background border-t dark:border-gray-700 py-4 px-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {t("showing_items").replace("{0}", items.length.toString())}
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  {t("previous")}
                </Button>
                <Button variant="outline" size="sm">
                  {t("next")}
                </Button>
              </div>
            </div>
          </footer>
        </div>
      </SidebarInset>
      <DeleteAlert
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        itemName={itemToDelete?.name || ""}
      />
    </div>
  )
}

