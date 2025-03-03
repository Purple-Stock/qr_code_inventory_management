"use client"

import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"

interface StockOutSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  itemCount: number
  totalQuantity: number
  onPrintLabel?: () => void
  onViewDetails: () => void
  onConfirm: () => void
}

export function StockOutSuccessModal({
  isOpen,
  onClose,
  itemCount,
  totalQuantity,
  onPrintLabel,
  onViewDetails,
  onConfirm,
}: StockOutSuccessModalProps) {
  const { t } = useLanguage()

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
            <span className="sr-only">{t("close")}</span>
          </Button>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <DialogTitle className="text-xl font-semibold">{t("stock_out_success")}</DialogTitle>
          <p className="text-center text-muted-foreground">
            {t("stock_out_success_message")
              .replace("{totalQuantity}", String(totalQuantity))
              .replace("{itemCount}", String(itemCount))}
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={onPrintLabel}>
              {t("print_label")}
            </Button>
            <Button variant="outline" onClick={onViewDetails}>
              {t("details")}
            </Button>
            <Button onClick={onConfirm}>{t("confirm")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

