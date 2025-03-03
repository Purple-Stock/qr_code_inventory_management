"use client"

import { MapPin, DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface LocationValueSummaryProps {
  currentLocation: {
    id: number
    name: string
  }
  currentValue: number
  initialValue: number
  lastUpdated: string
  className?: string
}

export function LocationValueSummary({
  currentLocation,
  currentValue,
  initialValue,
  lastUpdated,
  className,
}: LocationValueSummaryProps) {
  const { t } = useLanguage()

  const valueChange = currentValue - initialValue
  const valueChangePercentage = initialValue !== 0 ? ((valueChange / initialValue) * 100).toFixed(2) : "∞"

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{t("current_location_value")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-purple-600" />
            <span className="text-lg font-medium">{currentLocation.name}</span>
          </div>

          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-lg font-medium">${currentValue.toFixed(2)}</span>

            <div
              className={cn(
                "ml-2 flex items-center text-sm",
                valueChange > 0 ? "text-green-600" : valueChange < 0 ? "text-red-600" : "text-gray-600",
              )}
            >
              {valueChange > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : valueChange < 0 ? (
                <TrendingDown className="h-4 w-4 mr-1" />
              ) : null}
              {valueChange > 0 ? "+" : ""}
              {valueChange.toFixed(2)} ({valueChange > 0 ? "+" : ""}
              {valueChangePercentage}%)
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {t("last_updated")}: {format(new Date(lastUpdated), "PPP p")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

