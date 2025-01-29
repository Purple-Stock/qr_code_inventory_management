"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MainNav from "@/components/main-nav"
import { Camera, ChevronRight } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createItem, generateSku, generateBarcode } from "../actions"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function NewItem() {
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const router = useRouter()

  const handleGenerateSku = async () => {
    const newSku = await generateSku()
    setSku(newSku)
  }

  const handleGenerateBarcode = async () => {
    const newBarcode = await generateBarcode()
    setBarcode(newBarcode)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const result = await createItem(formData)
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      })
      router.push("/")
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <div className="border-b bg-card dark:bg-gray-800 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/" className="hover:text-foreground">
                    Item List
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">New Item</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                  Cancel
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="max-w-3xl w-full mx-auto p-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <Card className="p-6 bg-card dark:bg-gray-800">
                    <h2 className="text-lg font-semibold mb-4">Item Information</h2>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sku">
                          SKU
                          <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0 text-blue-500">
                            ?
                          </Button>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="sku"
                            name="sku"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className="flex-1"
                          />
                          <Button type="button" onClick={handleGenerateSku} variant="secondary">
                            Generate
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="Name" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="barcode">Barcode</Label>
                        <div className="flex gap-2">
                          <Input
                            id="barcode"
                            name="barcode"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            placeholder="Click the 'Generate' button to create a barcode"
                            className="flex-1"
                          />
                          <Button variant="outline">
                            <Camera className="h-4 w-4" />
                          </Button>
                          <Button type="button" onClick={handleGenerateBarcode} variant="secondary">
                            Generate
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="cost">Cost</Label>
                        <Input id="cost" name="cost" type="number" step="0.01" placeholder="Cost" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder="Price" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-card dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Item Attribute</h2>
                      <Button variant="link" className="text-[#9333E9]">
                        Edit attribute
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Input id="type" name="type" placeholder="Input text" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input id="brand" name="brand" placeholder="Input text" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-card dark:bg-gray-800">
                    <h2 className="text-lg font-semibold mb-4">Initial Quantity</h2>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Select name="location" defaultValue="default">
                          <SelectTrigger>
                            <SelectValue placeholder="Default Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default Location</SelectItem>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                            <SelectItem value="store">Store</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="initial-quantity">Initial Quantity</Label>
                        <Input
                          id="initial-quantity"
                          name="initial-quantity"
                          type="number"
                          placeholder="Input initial quantity."
                        />
                      </div>
                    </div>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button type="submit" variant="default">
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

