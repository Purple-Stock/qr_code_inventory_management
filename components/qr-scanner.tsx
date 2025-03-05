"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { Camera } from "lucide-react"

interface QRScannerProps {
  onScan: (decodedText: string) => void
  onClose?: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    try {
      // Request camera permission first
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      stream.getTracks().forEach((track) => track.stop()) // Stop the stream immediately
      setHasPermission(true)

      // Create new scanner instance if it doesn't exist
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader")
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          // Stop scanning before calling onScan
          await stopScanning()
          onScan(decodedText)
        },
        (errorMessage) => {
          console.log(errorMessage)
        },
      )

      setIsScanning(true)
    } catch (err) {
      console.error("Error starting scanner:", err)
      setHasPermission(false)
      // Clean up scanner instance on error
      if (scannerRef.current) {
        scannerRef.current = null
      }
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop()
        scannerRef.current = null
        setIsScanning(false)
      }
    } catch (err) {
      console.error("Error stopping scanner:", err)
    }
  }

  return (
    <Card className="p-4 relative">
      <div className="flex flex-col items-center gap-4">
        <div id="reader" className="w-full max-w-[300px] h-[300px] bg-muted rounded-lg overflow-hidden" />

        {!isScanning ? (
          <div className="flex flex-col items-center gap-4 p-8">
            <Camera className="h-12 w-12 text-muted-foreground" />
            <Button onClick={startScanning} className="w-full max-w-[300px]">
              {hasPermission ? t("start_scanning") : t("enable_camera")}
            </Button>
          </div>
        ) : (
          <Button onClick={stopScanning} variant="secondary" className="w-full max-w-[300px]">
            {t("stop_scanning")}
          </Button>
        )}
      </div>
    </Card>
  )
}

