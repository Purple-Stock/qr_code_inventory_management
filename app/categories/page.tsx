"use client"

import { useState, useEffect } from "react"
import { Info, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useLanguage } from "@/contexts/language-context"
import { getCategories } from "@/app/actions"
import type { Database } from "@/types/database"

type Category = Database["public"]["Tables"]["categories"]["Row"]

export default function CategoriesPage() {
  const { t } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true)
        const fetchedCategories = await getCategories()
        setCategories(fetchedCategories)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories")
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <h1 className="text-2xl font-bold">Data Center</h1>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <Alert variant="info" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{t("categories_warning")}</AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Categories</h2>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Recently Deleted Categories</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Category
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Add Single Category</DropdownMenuItem>
                        <DropdownMenuItem>Import Categories</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Parent Category</TableHead>
                        <TableHead className="text-right">Items</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading categories...
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-red-500">
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : categories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No categories found. Add your first category to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.description || "-"}</TableCell>
                            <TableCell>
                              {category.parent_id
                                ? categories.find((c) => c.id === category.parent_id)?.name || "-"
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {/* This would need a count query from the database */}0
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

