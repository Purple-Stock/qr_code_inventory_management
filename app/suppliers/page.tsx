"use client"

import { useState, useEffect } from "react"
import { Info, Plus, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useLanguage } from "@/contexts/language-context"
import { getSuppliers } from "@/app/actions"
import { AddEditSupplierDialog } from "@/components/add-edit-supplier-dialog"
import { DeleteSupplierAlert } from "@/components/delete-supplier-alert"
import type { Database } from "@/types/database"

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"]

export default function SuppliersPage() {
  const { t } = useLanguage()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => {
    loadSuppliers()
  }, [])

  async function loadSuppliers() {
    try {
      setIsLoading(true)
      const fetchedSuppliers = await getSuppliers()
      setSuppliers(fetchedSuppliers)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch suppliers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSupplierAdded = () => {
    setShowAddDialog(false)
    loadSuppliers()
  }

  const handleSupplierEdited = () => {
    setEditingSupplier(null)
    loadSuppliers()
  }

  const handleSupplierDeleted = () => {
    setSupplierToDelete(null)
    loadSuppliers()
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <h1 className="text-2xl font-bold">{t("data_center")}</h1>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <Alert variant="info" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{t("suppliers_warning")}</AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{t("suppliers")}</h2>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">{t("recently_deleted_suppliers")}</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          {t("add_supplier")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                          {t("add_single_supplier")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          {t("import_suppliers")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("name")}</TableHead>
                        <TableHead>{t("code")}</TableHead>
                        <TableHead>{t("contact_person")}</TableHead>
                        <TableHead>{t("email")}</TableHead>
                        <TableHead>{t("phone")}</TableHead>
                        <TableHead>{t("address")}</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            {t("loading_suppliers")}...
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-red-500">
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : suppliers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {t("no_suppliers_found")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        suppliers.map((supplier) => (
                          <TableRow key={supplier.id}>
                            <TableCell className="font-medium">{supplier.name}</TableCell>
                            <TableCell>{supplier.code || "-"}</TableCell>
                            <TableCell>{supplier.contact_person || "-"}</TableCell>
                            <TableCell>{supplier.email || "-"}</TableCell>
                            <TableCell>{supplier.phone || "-"}</TableCell>
                            <TableCell>{supplier.address || "-"}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setEditingSupplier(supplier)}>
                                  {t("edit")}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => setSupplierToDelete({ id: supplier.id, name: supplier.name })}
                                >
                                  {t("delete")}
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

      <AddEditSupplierDialog
        supplier={editingSupplier}
        isOpen={showAddDialog || !!editingSupplier}
        onClose={() => {
          setShowAddDialog(false)
          setEditingSupplier(null)
        }}
        onSuccess={editingSupplier ? handleSupplierEdited : handleSupplierAdded}
      />

      <DeleteSupplierAlert
        isOpen={!!supplierToDelete}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={handleSupplierDeleted}
        supplierName={supplierToDelete?.name || ""}
      />
    </SidebarProvider>
  )
}

