"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getItem, updateItem, getCategories, getLocations } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import type { Database } from "@/types/database"

type Category = Database["public"]["Tables"]["categories"]["Row"]
type Location = Database["public"]["Tables"]["locations"]["Row"]

export default function EditItem() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [item, setItem] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedItem, fetchedCategories, fetchedLocations] = await Promise.all([
          getItem(Number(params.id)),
          getCategories(),
          getLocations(),
        ])

        if (!fetchedItem) {
          toast({
            title: t("error"),
            description: t("item_not_found"),
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setItem(fetchedItem)
        setCategories(fetchedCategories)
        setLocations(fetchedLocations)
      } catch (error) {
        toast({
          title: t("error"),
          description: error instanceof Error ? error.message : t("failed_to_fetch_item"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id, router, t])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      // Add the item ID to the form data
      formData.append("id", params.id as string)

      const result = await updateItem(formData)

      if (result.success) {
        toast({
          title: t("success"),
          description: t("item_updated_successfully"),
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
        description: error instanceof Error ? error.message : t("failed_to_update_item"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !item) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <MainNav />
          <SidebarInset className="flex-1">
            <div className="h-full flex flex-col">
              <div className="border-b bg-card px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/" className="hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="text-center py-8">{t("loading")}...</div>
              </div>
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
            <div className="border-b bg-card dark:bg-gray-800 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/" className="hover:text-foreground">
                    {t("item_list")}
                  </Link>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-foreground">{t("edit_item")}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/")} disabled={isSubmitting}>
                  {t("cancel")}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="max-w-3xl w-full mx-auto p-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">{t("item_information")}</h2>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sku">{t("sku")}</Label>
                        <Input id="sku" name="sku" defaultValue={item.sku} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">{t("name")}</Label>
                        <Input id="name" name="name" defaultValue={item.name} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="barcode">{t("barcode")}</Label>
                        <Input id="barcode" name="barcode" defaultValue={item.barcode} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="cost">{t("cost")}</Label>
                        <Input id="cost" name="cost" type="number" step="0.01" defaultValue={item.cost} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="price">{t("price")}</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={item.price} />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">{t("item_attribute")}</h2>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">{t("category")}</Label>
                        <Select name="category_id" defaultValue={item.category_id?.toString()}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("select_category")} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="brand">{t("brand")}</Label>
                        <Input id="brand" name="brand" defaultValue={item.brand} />
                      </div>
                    </div>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? t("updating") : t("update")}
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

