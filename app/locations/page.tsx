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
import { getLocations } from "@/app/actions"
import { AddEditLocationDialog } from "@/components/add-edit-location-dialog"
import { DeleteLocationAlert } from "@/components/delete-location-alert"
// import { useRouter } from "next/navigation"
import type { Database } from "@/types/database"

type Location = Database["public"]["Tables"]["locations"]["Row"]

export default function LocationsPage() {
  const { t } = useLanguage()
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [locationToDelete, setLocationToDelete] = useState<{ id: number; name: string } | null>(null)
  // const router = useRouter()

  useEffect(() => {
    loadLocations()
  }, [])

  async function loadLocations() {
    try {
      setIsLoading(true)
      const fetchedLocations = await getLocations()
      setLocations(fetchedLocations)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch locations")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationAdded = () => {
    setShowAddDialog(false)
    loadLocations()
  }

  const handleLocationEdited = () => {
    setEditingLocation(null)
    loadLocations()
  }

  const handleLocationDeleted = () => {
    setLocationToDelete(null)
    loadLocations()
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
                  <AlertDescription>{t("locations_warning")}</AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{t("locations")}</h2>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">{t("recently_deleted_locations")}</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          {t("add_location")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                          {t("add_single_location")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          {t("import_locations")}
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
                        <TableHead>{t("description")}</TableHead>
                        <TableHead>{t("parent_location")}</TableHead>
                        <TableHead className="text-right">{t("items")}</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            {t("loading_locations")}...
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-red-500">
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : locations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {t("no_locations_found")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        locations.map((location) => (
                          <TableRow key={location.id}>
                            <TableCell className="font-medium">{location.name}</TableCell>
                            <TableCell>{location.description || "-"}</TableCell>
                            <TableCell>
                              {location.parent_id
                                ? locations.find((l) => l.id === location.parent_id)?.name || "-"
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {/* This would need a count query from the database */}0
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setEditingLocation(location)}>
                                  {t("edit")}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => setLocationToDelete({ id: location.id, name: location.name })}
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

      <AddEditLocationDialog
        location={editingLocation}
        locations={locations}
        isOpen={showAddDialog || !!editingLocation}
        onClose={() => {
          setShowAddDialog(false)
          setEditingLocation(null)
        }}
        onSuccess={editingLocation ? handleLocationEdited : handleLocationAdded}
      />

      <DeleteLocationAlert
        isOpen={!!locationToDelete}
        onClose={() => setLocationToDelete(null)}
        onConfirm={handleLocationDeleted}
        locationName={locationToDelete?.name ?? ""}
        locationId={locationToDelete?.id ?? 0}
      />
    </SidebarProvider>
  )
}

