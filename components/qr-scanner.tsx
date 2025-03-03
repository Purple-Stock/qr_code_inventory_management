"use client"

import { useState, useEffect } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { Camera, X } from "lucide-react"

interface QRScannerProps {
  onScan: (decodedText: string) => void
  onClose?: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
          },
        },
        false,
      )

      scanner.render(
        (decodedText) => {
          scanner.clear()
          setIsScanning(false)
          onScan(decodedText)
        },
        (error) => {
          console.error("QR scan error:", error)
        },
      )

      return () => {
        scanner.clear()
      }
    }
  }, [isScanning, onScan])

  return (
    <Card className="p-4 relative">
      {onClose && (
        <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      )}
      {!isScanning ? (
        <div className="flex flex-col items-center gap-4 p-8">
          <Camera className="h-12 w-12 text-muted-foreground" />
          <Button onClick={() => setIsScanning(true)}>{t("start_scanning")}</Button>
        </div>
      ) : (
        <div id="qr-reader" className="w-full max-w-sm mx-auto" />
      )}
    </Card>
  )
}

