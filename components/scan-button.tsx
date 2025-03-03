"use client"

import { useState } from "react"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { QRScanner } from "./qr-scanner"
import { ScannedItemModal } from "./scanned-item-modal"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import type { Location } from "@/types/database"

interface ScanButtonProps {
  mode: "stock_in" | "stock_out" | "move" | "adjust" | "info"
  locations: Location[]
  onSubmit: (data: any) => Promise<void>
}

export function ScanButton({ mode, locations = [], onSubmit }: ScanButtonProps) {
  const [showScanner, setShowScanner] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [scannedItem, setScannedItem] = useState<any>(null)
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleScan = async (result: string) => {
    try {
      // Extract item ID from QR code URL or direct ID
      const itemId = result.includes("/items/") ? result.split("/items/").pop() : result
      if (!itemId) throw new Error("Invalid QR code")

      // Fetch item details
      const response = await fetch(`/api/items/${itemId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch item")
      }

      const item = await response.json()
      if (!item) throw new Error("Item not found")

      setScannedItem(item)
      setShowScanner(false)
      setShowItemModal(true)
    } catch (error) {
      console.error("Scan error:", error)
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("invalid_qr_code"),
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowScanner(true)}>
        <QrCode className="h-4 w-4 mr-2" />
        {t("scan_barcode")}
      </Button>

      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("scan_qr_code")}</DialogTitle>
            <DialogDescription>{t("scan_qr_code_description")}</DialogDescription>
          </DialogHeader>
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        </DialogContent>
      </Dialog>

      {scannedItem && locations && (
        <ScannedItemModal
          isOpen={showItemModal}
          onClose={() => setShowItemModal(false)}
          item={scannedItem}
          locations={locations}
          mode={mode}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}

