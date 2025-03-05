"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"

export function LabelSettings() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t("label_size")}</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">{t("width")} (mm)</Label>
            <Input id="width" type="number" defaultValue={50} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">{t("height")} (mm)</Label>
            <Input id="height" type="number" defaultValue={30} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("code_size")}</Label>
        <Slider defaultValue={[75]} max={100} step={1} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-text">{t("show_text")}</Label>
          <Switch id="show-text" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="high-quality">{t("high_quality")}</Label>
          <Switch id="high-quality" defaultChecked />
        </div>
      </div>
    </div>
  )
}

