"use client"

import { format } from "date-fns"
import { MapPin, ArrowRight, DollarSign, Calendar, User, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

export interface LocationHistoryEntry {
  id: number
  timestamp: string
  fromLocation?: {
    id: number
    name: string
  } | null
  toLocation?: {
    id: number
    name: string
  } | null
  type: "stock_in" | "stock_out" | "move" | "adjust"
  quantity: number
  value: number
  previousValue?: number
  user?: string
  notes?: string
}

interface LocationHistoryTimelineProps {
  entries: LocationHistoryEntry[]
  className?: string
}

export function LocationHistoryTimeline({ entries, className }: LocationHistoryTimelineProps) {
  const { t } = useLanguage()

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getTypeColor = (type: string) => {
    switch (type) {
      case "stock_in":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "stock_out":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "move":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "adjust":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stock_in":
        return t("stock_in")
      case "stock_out":
        return t("stock_out")
      case "move":
        return t("move")
      case "adjust":
        return t("adjust")
      default:
        return type
    }
  }

  const getValueChangeDisplay = (entry: LocationHistoryEntry) => {
    if (entry.previousValue === undefined) return null

    const change = entry.value - entry.previousValue
    const percentage = entry.previousValue !== 0 ? ((change / entry.previousValue) * 100).toFixed(2) : "∞"

    return (
      <div
        className={cn(
          "text-xs font-medium",
          change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-600",
        )}
      >
        {change > 0 ? "+" : ""}
        {change.toFixed(2)} ({change > 0 ? "+" : ""}
        {percentage}%)
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-muted-foreground py-8">{t("no_location_history")}</div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="text-lg font-semibold mb-4">{t("location_history")}</h3>
      <div className="space-y-6">
        {sortedEntries.map((entry, index) => (
          <div key={entry.id} className="relative pl-8 pb-6">
            {/* Timeline connector */}
            {index !== sortedEntries.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-muted-foreground/20"></div>
            )}

            {/* Timeline dot */}
            <div
              className={cn(
                "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center",
                getTypeColor(entry.type),
              )}
            >
              <MapPin className="h-3 w-3" />
            </div>

            <div className="space-y-2">
              {/* Header with type and date */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn(getTypeColor(entry.type), "border-0")}>
                  {getTypeLabel(entry.type)}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(entry.timestamp), "PPP p")}
                </span>
                {entry.user && (
                  <span className="text-sm text-muted-foreground flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {entry.user}
                  </span>
                )}
              </div>

              {/* Location information */}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {entry.type === "move" ? (
                  <>
                    <span className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {entry.fromLocation?.name || t("unknown_location")}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {entry.toLocation?.name || t("unknown_location")}
                    </span>
                  </>
                ) : entry.type === "stock_in" ? (
                  <span className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {t("added_to")} {entry.toLocation?.name || t("unknown_location")}
                  </span>
                ) : entry.type === "stock_out" ? (
                  <span className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {t("removed_from")} {entry.fromLocation?.name || t("unknown_location")}
                  </span>
                ) : (
                  <span className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {t("adjusted_at")} {entry.toLocation?.name || t("unknown_location")}
                  </span>
                )}

                <span className="font-medium flex items-center ml-auto">
                  <span className={cn("mr-2", entry.type === "stock_out" ? "text-red-600" : "text-green-600")}>
                    {entry.type === "stock_out" ? "-" : "+"}
                    {entry.quantity}
                  </span>
                </span>
              </div>

              {/* Value information */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                  {t("value")}: ${entry.value.toFixed(2)}
                </span>
                {getValueChangeDisplay(entry)}
              </div>

              {/* Notes if available */}
              {entry.notes && (
                <div className="text-sm text-muted-foreground mt-2 flex items-start">
                  <FileText className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="italic">{entry.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

