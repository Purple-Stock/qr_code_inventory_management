"use client"

import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"

interface StockOutDetailsProps {
  isOpen: boolean
  onClose: () => void
  stockOut: {
    date: string
    location: string
    memo: string
    items: Array<{
      name: string
      sku: string
      quantity: number
      currentStock: number
    }>
  }
}

export function StockOutDetails({ isOpen, onClose, stockOut }: StockOutDetailsProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("stock_out_details")}</DialogTitle>
          <Button
            variant="ghost"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("close")}</span>
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t("date")}</div>
                <div>{format(new Date(stockOut.date), "MMM dd, yyyy")}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t("location")}</div>
                <div>{stockOut.location}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t("total_items")}</div>
                <div>{stockOut.items.length}</div>
              </div>
            </div>
          </Card>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("item")}</TableHead>
                  <TableHead>{t("sku")}</TableHead>
                  <TableHead className="text-right">{t("previous_stock")}</TableHead>
                  <TableHead className="text-right">{t("quantity_out")}</TableHead>
                  <TableHead className="text-right">{t("current_stock")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockOut.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-right">{item.currentStock + item.quantity}</TableCell>
                    <TableCell className="text-right text-red-600">-{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">{item.currentStock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {stockOut.memo && (
            <Card className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">{t("memo")}</div>
              <div className="whitespace-pre-wrap">{stockOut.memo}</div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

