"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LabelDesigner } from "./label-designer"
import { LabelPreview } from "./label-preview"
import { ItemSelector } from "./item-selector"
import { LabelSettings } from "./label-settings"
import MainNav from "@/components/main-nav"
import { useLanguage } from "@/contexts/language-context"

export default function PrintLabelsPage() {
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; quantity: number }>>([])
  const [activeTemplate, setActiveTemplate] = useState<"barcode" | "qr" | "hybrid">("barcode")
  const { t } = useLanguage()

  return (
    <div className="flex">
      <MainNav />
      <div className="flex-1">
        <div className="container mx-auto p-6 space-y-6">
          <h1 className="text-3xl font-bold">{t("label_design")}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-6">
                <Tabs defaultValue="design" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="design">{t("design")}</TabsTrigger>
                    <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="design" className="space-y-4">
                    <LabelDesigner template={activeTemplate} onTemplateChange={setActiveTemplate} />
                  </TabsContent>

                  <TabsContent value="settings">
                    <LabelSettings />
                  </TabsContent>
                </Tabs>
              </Card>

              <ItemSelector selectedItems={selectedItems} onItemsChange={setSelectedItems} />
            </div>

            <div className="lg:col-span-4">
              <LabelPreview items={selectedItems} template={activeTemplate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

