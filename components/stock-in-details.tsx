"use client"

import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StockInDetailsProps {
  isOpen: boolean
  onClose: () => void
  stockIn: {
    date: string
    location: string
    supplier: string
    memo: string
    items: Array<{
      name: string
      sku: string
      quantity: number
      currentStock: number
    }>
  }
}

export function StockInDetails({ isOpen, onClose, stockIn }: StockInDetailsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Stock In Details</DialogTitle>
          <Button
            variant="ghost"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date</div>
                <div>{format(new Date(stockIn.date), "MMM dd, yyyy")}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div>{stockIn.location}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Supplier</div>
                <div>{stockIn.supplier || "-"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Items</div>
                <div>{stockIn.items.length}</div>
              </div>
            </div>
          </Card>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Previous Stock</TableHead>
                  <TableHead className="text-right">Quantity In</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockIn.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-right">{item.currentStock - item.quantity}</TableCell>
                    <TableCell className="text-right text-green-600">+{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">{item.currentStock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {stockIn.memo && (
            <Card className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Memo</div>
              <div className="whitespace-pre-wrap">{stockIn.memo}</div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

