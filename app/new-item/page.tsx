"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"

export default function NewItem() {
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleGenerateSku = async () => {
    try {
      const newSku = await generateSku()
      setSku(newSku)
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_to_generate_sku"),
        variant: "destructive",
      })
    }
  }

  const handleGenerateBarcode = async () => {
    try {
      const newBarcode = await generateBarcode()
      setBarcode(newBarcode)
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_to_generate_barcode"),
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await createItem(formData)

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
        description: error instanceof Error ? error.message : t("failed_to_create_item"),
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
            <div className="border-b bg-card dark:bg-gray-800 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/" className="hover:text-foreground">
                    {t("item_list")}
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">{t("new_item")}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/")} disabled={isSubmitting}>
                  {t("cancel")}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="max-w-3xl w-full mx-auto p-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <Card className="p-6 bg-card dark:bg-gray-800">
                    <h2 className="text-lg font-semibold mb-4">{t("item_information")}</h2>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sku">
                          {t("sku")}
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
                            {t("generate")}
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">{t("name")}</Label>
                        <Input id="name" name="name" placeholder={t("name")} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="barcode">{t("barcode")}</Label>
                        <div className="flex gap-2">
                          <Input
                            id="barcode"
                            name="barcode"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            placeholder={t("click_generate_barcode")}
                            className="flex-1"
                          />
                          <Button variant="outline">
                            <Camera className="h-4 w-4" />
                          </Button>
                          <Button type="button" onClick={handleGenerateBarcode} variant="secondary">
                            {t("generate")}
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="cost">{t("cost")}</Label>
                        <Input id="cost" name="cost" type="number" step="0.01" placeholder={t("cost")} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="price">{t("price")}</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder={t("price")} />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-card dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">{t("item_attribute")}</h2>
                      <Button variant="link" className="text-[#9333E9]">
                        {t("edit_attribute")}
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">{t("type")}</Label>
                        <Input id="type" name="type" placeholder={t("input_text")} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="brand">{t("brand")}</Label>
                        <Input id="brand" name="brand" placeholder={t("input_text")} />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-card dark:bg-gray-800">
                    <h2 className="text-lg font-semibold mb-4">{t("initial_quantity")}</h2>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="location">{t("location")}</Label>
                        <Select name="location" defaultValue="default">
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

                      <div className="grid gap-2">
                        <Label htmlFor="initial-quantity">{t("initial_quantity")}</Label>
                        <Input
                          id="initial-quantity"
                          name="initial-quantity"
                          type="number"
                          placeholder={t("input_initial_quantity")}
                        />
                      </div>
                    </div>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                      {isSubmitting ? t("submitting") : t("submit")}
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

