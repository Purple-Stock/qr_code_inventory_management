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
import { duplicateItem, exportItemsToCSV } from "./actions"
import { toast } from "@/components/ui/use-toast"
import { CSVImport } from "@/components/csv-import"
import { Download, FileSpreadsheet } from "lucide-react"
import { getDb } from "@/lib/db"

export default function ItemList() {
  const [items, setItems] = useState([])
  const db = getDb()

  useEffect(() => {
    async function fetchItems() {
      const fetchedItems = await db.getItems()
      setItems(fetchedItems)
    }
    fetchItems()
  }, [])

  const handleDuplicate = async (id: number) => {
    const result = await duplicateItem(id)
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      })
      setItems(await db.getItems()) // Refresh the item list
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
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

  const refreshItems = async () => {
    const fetchedItems = await db.getItems()
    setItems(fetchedItems)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <SidebarInset className="flex-1">
        <div className="h-full flex flex-col">
          <header className="bg-background border-b dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">Purple Stock Item List</h1>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleExportCsv}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <CSVImport onSuccess={refreshItems} />
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href="/new-item">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search items..." className="pl-10" />
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">In Stock</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No items found. Add your first item to get started.
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
                        <TableCell className="text-right">{item.initial_quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleDuplicate(item.id)}>Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
              <p className="text-sm text-muted-foreground">Showing {items.length} items</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </div>
  )
}

