"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createStockAdjustment, searchItems, getLocations } from "../actions"
import { toast } from "@/components/ui/use-toast"
import { Plus, FileSpreadsheet, QrCode, Search } from "lucide-react"
import { CSVImport } from "@/components/csv-import"
import { AdjustSuccessModal } from "@/components/adjust-success-modal"
import { AdjustDetails } from "@/components/adjust-details"
import { ScanButton } from "@/components/scan-button"
import { useLanguage } from "@/contexts/language-context"
import type { Database } from "@/types/database"

type Location = Database["public"]["Tables"]["locations"]["Row"]

interface AdjustItem {
  itemId: number
  name: string
  sku: string
  currentStock: number
  quantity: number
  location_id?: number
}

export default function Adjust() {
  const router = useRouter()
  const [items, setItems] = useState<AdjustItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [memo, setMemo] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [currentAdjust, setCurrentAdjust] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedLocations = await getLocations()
        setLocations(fetchedLocations)
        // Set default location if available
        if (fetchedLocations.length > 0) {
          setSelectedLocation(fetchedLocations[0].id.toString())
        }
      } catch (error) {
        console.error("Failed to load data:", error)
        toast({
          title: t("error"),
          description: t("failed_to_load_data"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [t])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length > 2) {
      const results = await searchItems(query)
      const resultsWithLocations = results.map((item) => ({
        ...item,
        currentStock:
          item.item_locations?.find((loc) => loc.location_id === Number(selectedLocation))?.current_quantity || 0,
      }))
      setSearchResults(resultsWithLocations)
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
          currentStock: item.current_quantity || 0,
          quantity: item.current_quantity || 0,
          location_id: Number(selectedLocation),
        },
      ])
    }
    setSearchQuery("")
    setSearchResults([])
  }

  const handleScannedItem = async (data: any) => {
    if (!selectedLocation) {
      toast({
        title: t("error"),
        description: t("location_required"),
        variant: "destructive",
      })
      return
    }

    try {
      // Create FormData with the same structure as the main form
      const formData = new FormData()
      formData.append("location_id", selectedLocation)
      formData.append("date", date)
      formData.append("memo", "Scanned adjustment")

      const adjustItems = [
        {
          itemId: data.itemId,
          quantity: data.quantity,
          location_id: Number(selectedLocation),
        },
      ]

      formData.append("items", JSON.stringify(adjustItems))

      // Use the same action as the main form
      const result = await createStockAdjustment(formData)

      if (result.success) {
        toast({
          title: t("success"),
          description: t("item_adjusted"),
        })

        // Refresh the page to show updated quantities
        router.refresh()
      } else {
        toast({
          title: t("error"),
          description: result.message || t("failed_to_adjust_item"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adjusting item:", error)
      toast({
        title: t("error"),
        description: t("failed_to_adjust_item"),
        variant: "destructive",
      })
    }
  }

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setItems(
      items.map((item) => (item.itemId === itemId ? { ...item, quantity: isNaN(quantity) ? 0 : quantity } : item)),
    )
  }

  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter((item) => item.itemId !== itemId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedLocation) {
      toast({
        title: t("error"),
        description: t("location_required"),
        variant: "destructive",
      })
      return
    }

    const adjustItems = items.map((item) => ({
      itemId: item.itemId,
      quantity: item.quantity,
      location_id: Number(selectedLocation),
    }))

    const formData = new FormData()
    formData.append("location_id", selectedLocation)
    formData.append("date", date)
    formData.append("memo", memo)
    formData.append("items", JSON.stringify(adjustItems))

    const result = await createStockAdjustment(formData)

    if (result.success) {
      setCurrentAdjust({
        date,
        location: locations.find((l) => l.id.toString() === selectedLocation)?.name,
        memo,
        items: items.map((item) => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          previousStock: item.currentStock,
        })),
      })
      setShowSuccessModal(true)
    } else {
      toast({
        title: t("error"),
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handleConfirm = () => {
    setShowSuccessModal(false)
    // Reset form
    setItems([])
    setMemo("")
    // Navigate to item list
    router.push("/")
  }

  const handleViewDetails = () => {
    setShowSuccessModal(false)
    setShowDetailsModal(true)
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <MainNav />
          <SidebarInset className="flex-1">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">{t("loading")}...</div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <h1 className="text-2xl font-bold">{t("adjust_title")}</h1>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">{t("location")}</Label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_location")} />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">{t("date")}</Label>
                      <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
                        <ScanButton
                          mode="adjust"
                          locations={locations}
                          onSubmit={handleScannedItem}
                          trigger={
                            <Button type="button" variant="outline" size="sm">
                              <QrCode className="h-4 w-4 mr-2" />
                              {t("scan_barcode")}
                            </Button>
                          }
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("item")}</TableHead>
                            <TableHead className="text-right">{t("current_stock")}</TableHead>
                            <TableHead className="text-right w-[150px]">{t("adjusted_quantity")}</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
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
                            </TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          {items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                {t("no_items_added")}
                              </TableCell>
                            </TableRow>
                          ) : (
                            items.map((item) => (
                              <TableRow key={item.itemId}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.currentStock}</TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={item.quantity || 0}
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
                    <Label htmlFor="memo">{t("memo")}</Label>
                    <Textarea
                      id="memo"
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
                  <Button type="submit" disabled={items.length === 0 || !selectedLocation}>
                    {t("adjust_button")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </SidebarInset>
      </div>

      <AdjustSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        itemCount={items.length}
        onViewDetails={handleViewDetails}
        onConfirm={handleConfirm}
      />

      {currentAdjust && (
        <AdjustDetails isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} adjust={currentAdjust} />
      )}
    </SidebarProvider>
  )
}

