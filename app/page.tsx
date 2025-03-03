"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import MainNav from "@/components/main-nav"
import { Filter, Plus, QrCode, Search, ChevronDown, Edit } from "lucide-react"
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
import {
  duplicateItem,
  exportItemsToCSV,
  getItems,
  deleteItem,
  insertDummyData,
  getCategories,
  getLocations,
} from "./actions"
import { toast } from "@/components/ui/use-toast"
import { CSVImport } from "@/components/csv-import"
import { Download } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { Database } from "@/types/database"
import { DeleteAlert } from "@/components/delete-alert"

type Item = Database["public"]["Tables"]["items"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"]
type Location = Database["public"]["Tables"]["locations"]["Row"]

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
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

  const loadCategories = async () => {
    try {
      const fetchedCategories = await getCategories()
      setCategories(fetchedCategories)
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  const loadLocations = async () => {
    try {
      const fetchedLocations = await getLocations()
      setLocations(fetchedLocations)
    } catch (err) {
      console.error("Failed to fetch locations:", err)
    }
  }

  useEffect(() => {
    refreshItems()
    loadCategories()
    loadLocations()
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

  const getItemQuantityForLocation = (item: any, locationId: string | null) => {
    if (!item.item_locations) return 0

    if (locationId === "all") {
      // Sum quantities from all locations
      return item.item_locations.reduce((total: number, loc: any) => total + (loc.current_quantity || 0), 0)
    }

    // Find quantity for specific location
    const locationStock = item.item_locations.find((loc: any) => loc.location_id === Number.parseInt(locationId))
    return locationStock?.current_quantity || 0
  }

  const filteredItems = items
    .filter((item) => {
      if (selectedCategory === "all") return true
      return item.category_id === Number.parseInt(selectedCategory)
    })
    .map((item) => ({
      ...item,
      displayQuantity: getItemQuantityForLocation(item, selectedLocation),
    }))

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <SidebarInset className="flex-1">
        <div className="h-full flex flex-col">
          <header className="bg-background border-b dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">{t("items_list")}</h1>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
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
                    }}
                  >
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
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("all_categories")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all_categories")}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("all_locations")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all_locations")}</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))}
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
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t("no_items_found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
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
                        <TableCell>{item.categories?.name || "-"}</TableCell>
                        <TableCell className="text-right">
                          {selectedLocation === "all" ? (
                            <div className="space-y-1">
                              <div>{item.displayQuantity}</div>
                              <div className="text-sm text-muted-foreground">{t("total_in_stock")}</div>
                            </div>
                          ) : (
                            item.displayQuantity
                          )}
                        </TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/items/${item.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  {t("edit")}
                                </Link>
                              </DropdownMenuItem>
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
                {t("showing_items").replace("{0}", filteredItems.length.toString())}
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

