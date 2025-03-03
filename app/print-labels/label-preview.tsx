"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"
import Barcode from "react-barcode"
import { Printer, Download, FileDown, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface LabelPreviewProps {
  items: Array<{ id: string; quantity: number }>
  template: "barcode" | "qr" | "hybrid"
}

interface ItemData {
  id: string
  name: string
  sku: string
  barcode?: string
}

export function LabelPreview({ items, template }: LabelPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [itemsData, setItemsData] = useState<Record<string, ItemData>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchItemsData = async () => {
      if (items.length === 0) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("items")
          .select("id, name, sku")
          .in(
            "id",
            items.map((item) => item.id),
          )

        if (error) throw error

        const itemsMap = data.reduce(
          (acc, item) => {
            acc[item.id] = {
              ...item,
              barcode: item.sku, // Using SKU as barcode, adjust as needed
            }
            return acc
          },
          {} as Record<string, ItemData>,
        )

        setItemsData(itemsMap)
      } catch (error) {
        console.error("Error fetching items:", error)
        toast({
          title: "Error fetching items",
          description: "Could not load item details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchItemsData()
  }, [items, toast])

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const content = previewRef.current?.innerHTML
    if (!content) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            body { margin: 0; padding: 16px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
            .label { break-inside: avoid; page-break-inside: avoid; }
          </style>
        </head>
        <body>
          <div class="grid">
            ${content}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownloadSVG = () => {
    const svg = previewRef.current?.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "labels.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return

    try {
      toast({
        title: "Preparing PDF",
        description: "Please wait while we generate your PDF...",
      })

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save("labels.pdf")

      toast({
        title: "PDF Generated",
        description: "Your PDF has been downloaded successfully.",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderLabel = (itemId: string) => {
    const item = itemsData[itemId]
    if (!item) return null

    switch (template) {
      case "barcode":
        return (
          <div className="flex flex-col items-center p-4 border rounded">
            <Barcode value={item.barcode || item.sku} width={1.5} height={40} fontSize={12} />
            <div className="mt-2 text-sm font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.sku}</div>
          </div>
        )
      case "qr":
        return (
          <div className="flex flex-col items-center p-4 border rounded">
            <QRCodeSVG value={item.barcode || item.sku} size={120} />
            <div className="mt-2 text-sm font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.sku}</div>
          </div>
        )
      case "hybrid":
        return (
          <div className="flex flex-col items-center p-4 border rounded">
            <div className="flex items-center gap-4">
              <QRCodeSVG value={item.barcode || item.sku} size={100} />
              <div className="rotate-90">
                <Barcode value={item.barcode || item.sku} width={1} height={30} fontSize={10} />
              </div>
            </div>
            <div className="mt-2 text-sm font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.sku}</div>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <Card className="p-4 sticky top-4">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Preview</h3>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDownloadSVG}>
                <FileDown className="h-4 w-4 mr-2" />
                Download SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div ref={previewRef} className="grid grid-cols-2 gap-4">
        {items.map((item) =>
          Array.from({ length: item.quantity }).map((_, index) => (
            <div key={`${item.id}-${index}`} className="label">
              {renderLabel(item.id)}
            </div>
          )),
        )}
      </div>
    </Card>
  )
}

