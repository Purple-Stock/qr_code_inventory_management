"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileSpreadsheet, Upload } from "lucide-react"
import { importItemsFromCSV } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"

interface CSVImportProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function CSVImport({ onSuccess, trigger }: CSVImportProps) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const result = await importItemsFromCSV(content)

      if (result.success) {
        toast({
          title: t("success"),
          description: result.message,
        })
        setOpen(false)
        onSuccess?.()
      } else {
        toast({
          title: t("error"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_to_process_csv"),
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t("import_csv")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>{t("import_items_from_csv")}</DialogTitle>
          <DialogDescription>{t("upload_csv_description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 transition-colors hover:border-muted-foreground/50">
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
            <label
              htmlFor="csv-upload"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-[#9333E9] text-primary-foreground hover:bg-[#9333E9]/90 h-10 py-2 px-4 cursor-pointer"
            >
              {t("select_csv_file")}
            </label>
            <p className="text-sm text-muted-foreground mt-2">{t("or_drag_and_drop")}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2 text-foreground">{t("example_csv_format")}</h3>
            <pre className="p-3 bg-muted/50 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap break-all">
              <code className="text-muted-foreground">
                SKU,Name,Barcode,Cost,Price,Type,Brand,Location,Current Quantity{"\n"}
                {'SKU-001,"Product 1",123456,10.99,19.99,"Type A","Brand X","Default",100'}
              </code>
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

