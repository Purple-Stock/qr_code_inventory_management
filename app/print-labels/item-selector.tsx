"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"

interface ItemSelectorProps {
  selectedItems: Array<{ id: string; quantity: number }>
  onItemsChange: (items: Array<{ id: string; quantity: number }>) => void
}

export function ItemSelector({ selectedItems, onItemsChange }: ItemSelectorProps) {
  const [items, setItems] = useState<Array<{ id: string; name: string; sku: string }>>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from("items").select("id, name, sku").order("name")

      if (error) throw error

      setItems(data || [])
    } catch (error) {
      toast({
        title: t("error_fetching"),
        description: t("try_again"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">{t("select_items")}</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            {t("bulk_add")}
          </Button>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t("import_excel")}
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("item")}</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="w-[100px]">{t("copies")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {t("no_items")}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={selectedItems.find((i) => i.id === item.id)?.quantity || 0}
                      onChange={(e) => {
                        const quantity = Number.parseInt(e.target.value) || 0
                        const newItems = selectedItems.filter((i) => i.id !== item.id)
                        if (quantity > 0) {
                          newItems.push({ id: item.id, quantity })
                        }
                        onItemsChange(newItems)
                      }}
                      className="w-20"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

