"use client"

import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface StockInSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  itemCount: number
  totalQuantity: number
  onPrintLabel?: () => void
  onViewDetails: () => void
  onConfirm: () => void
}

export function StockInSuccessModal({
  isOpen,
  onClose,
  itemCount,
  totalQuantity,
  onPrintLabel,
  onViewDetails,
  onConfirm,
}: StockInSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <Button
            variant="ghost"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <DialogTitle className="text-xl font-semibold">Successfully recorded &apos;Stock In&apos;</DialogTitle>
          <p className="text-center text-muted-foreground">
            Total {totalQuantity} quantity(ies) of {itemCount} item(s) has been recorded for &apos;Stock In&apos;
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={onPrintLabel}>
              Print Label
            </Button>
            <Button variant="outline" onClick={onViewDetails}>
              Details
            </Button>
            <Button onClick={onConfirm}>Confirm</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

