"use client"

import { Button } from "@/components/ui/button"
import { Barcode, QrCode, LayoutGrid } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface LabelDesignerProps {
  template: "barcode" | "qr" | "hybrid"
  onTemplateChange: (template: "barcode" | "qr" | "hybrid") => void
}

export function LabelDesigner({ template, onTemplateChange }: LabelDesignerProps) {
  const { t } = useLanguage()

  const templates = [
    {
      id: "barcode" as const,
      name: t("barcode"),
      icon: Barcode,
      preview: (
        <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
          <div className="w-32 h-12 bg-gray-200 rounded" />
          <div className="w-24 h-2 bg-gray-300 rounded" />
        </div>
      ),
    },
    {
      id: "qr" as const,
      name: t("qr_code"),
      icon: QrCode,
      preview: (
        <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
          <div className="w-24 h-24 bg-gray-200 rounded" />
          <div className="w-24 h-2 bg-gray-300 rounded" />
        </div>
      ),
    },
    {
      id: "hybrid" as const,
      name: t("hybrid"),
      icon: LayoutGrid,
      preview: (
        <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
          <div className="flex space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded" />
            <div className="w-32 h-12 bg-gray-200 rounded" />
          </div>
          <div className="w-24 h-2 bg-gray-300 rounded" />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {templates.map((t) => (
          <Button
            key={t.id}
            variant={template === t.id ? "default" : "outline"}
            className="flex flex-col h-auto p-4 space-y-2"
            onClick={() => onTemplateChange(t.id)}
          >
            <t.icon className="h-6 w-6" />
            <span>{t.name}</span>
            {t.preview}
          </Button>
        ))}
      </div>
    </div>
  )
}

