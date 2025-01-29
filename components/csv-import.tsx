"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileSpreadsheet } from "lucide-react"
import { importItemsFromCSV } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

interface CSVImportProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function CSVImport({ onSuccess, trigger }: CSVImportProps) {
  const [open, setOpen] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const result = await importItemsFromCSV(content)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setOpen(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process CSV file",
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
            Import CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Items from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing your items. The file should have the following headers: SKU, Name, Barcode,
            Cost, Price, Type, Brand, Location, Current Quantity
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8">
            <FileSpreadsheet className="h-8 w-8 mb-4 text-muted-foreground" />
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
            <label
              htmlFor="csv-upload"
              className="button bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md cursor-pointer"
            >
              Select CSV File
            </label>
            <p className="text-sm text-muted-foreground mt-2">or drag and drop your file here</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Example CSV format:</p>
            <pre className="mt-2 p-2 bg-muted rounded-md overflow-x-auto">
              SKU,Name,Barcode,Cost,Price,Type,Brand,Location,Current Quantity{"\n"}
              {'SKU-001,"Product 1",123456,10.99,19.99,"Type A","Brand X","Default",100'}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

