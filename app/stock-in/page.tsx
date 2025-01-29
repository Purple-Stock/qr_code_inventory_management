"use client"

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
import { createStockIn, searchItems } from "../actions"
import { toast } from "@/components/ui/use-toast"
import { FileSpreadsheet, QrCode, Search } from "lucide-react"
import { CSVImport } from "@/components/csv-import"
import { StockInSuccessModal } from "@/components/stock-in-success-modal"
import { StockInDetails } from "@/components/stock-in-details"

interface StockInItem {
  itemId: number
  name: string
  sku: string
  currentStock: number
  quantity: number
}

export default function StockIn() {
  const router = useRouter()
  const [items, setItems] = useState<StockInItem[]>([])
  const [filteredItems, setFilteredItems] = useState<StockInItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [insertedItemsSearchQuery, setInsertedItemsSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [location, setLocation] = useState("default")
  const [supplier, setSupplier] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [memo, setMemo] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [currentStockIn, setCurrentStockIn] = useState<any>(null)

  useEffect(() => {
    const lowercaseQuery = insertedItemsSearchQuery.toLowerCase()
    const filtered = items.filter(
      (item) => item.name.toLowerCase().includes(lowercaseQuery) || item.sku.toLowerCase().includes(lowercaseQuery),
    )
    setFilteredItems(filtered)
  }, [items, insertedItemsSearchQuery])

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

  const getTotalQuantity = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const stockInItems = items.map((item) => ({
      itemId: item.itemId,
      quantity: item.quantity,
    }))

    const formData = new FormData()
    formData.append("location", location)
    formData.append("supplier", supplier)
    formData.append("date", date)
    formData.append("memo", memo)
    formData.append("items", JSON.stringify(stockInItems))

    const result = await createStockIn(formData)

    if (result.success) {
      setCurrentStockIn({
        date,
        location,
        supplier,
        memo,
        items: items.map((item) => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          currentStock: item.currentStock + item.quantity,
        })),
      })
      setShowSuccessModal(true)
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handlePrintLabel = () => {
    // Implement print label functionality
    console.log("Print label")
  }

  const handleConfirm = () => {
    setShowSuccessModal(false)
    // Reset form
    setItems([])
    setSupplier("")
    setMemo("")
    // Navigate to item list
    router.push("/")
  }

  const handleViewDetails = () => {
    setShowSuccessModal(false)
    setShowDetailsModal(true)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <h1 className="text-2xl font-bold">Stock In</h1>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Location</SelectItem>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="store">Store</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        placeholder="Enter supplier name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">Items</h2>
                      <div className="flex gap-2">
                        <CSVImport
                          trigger={
                            <Button type="button" variant="outline" size="sm">
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Import Excel
                            </Button>
                          }
                        />
                        <Button type="button" variant="outline" size="sm">
                          <QrCode className="h-4 w-4 mr-2" />
                          Scan Barcode
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search for an item to add..."
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
                        placeholder="Search inserted items..."
                        value={insertedItemsSearchQuery}
                        onChange={(e) => setInsertedItemsSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-right">Current Stock</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                No items added yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredItems.map((item) => (
                              <TableRow key={item.itemId}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell className="text-right">{item.currentStock}</TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.itemId, Number.parseInt(e.target.value))}
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
                                    Remove
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
                    <Label htmlFor="memo">Memo</Label>
                    <Textarea
                      id="memo"
                      placeholder="Enter memo or notes..."
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>
                  <Button type="submit">Stock In</Button>
                </div>
              </form>
            </div>
          </div>
        </SidebarInset>
      </div>

      <StockInSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        itemCount={items.length}
        totalQuantity={getTotalQuantity()}
        onPrintLabel={handlePrintLabel}
        onViewDetails={handleViewDetails}
        onConfirm={handleConfirm}
      />

      {currentStockIn && (
        <StockInDetails isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} stockIn={currentStockIn} />
      )}
    </SidebarProvider>
  )
}

