"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "next-themes"

interface LocationDistribution {
  locationId: number
  locationName: string
  quantity: number
  value: number
}

interface LocationDistributionChartProps {
  distributions: LocationDistribution[]
  className?: string
}

export function LocationDistributionChart({ distributions, className }: LocationDistributionChartProps) {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || distributions.length === 0) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Set up dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const radius = Math.min(width, height) / 2 - 20
    const centerX = width / 2
    const centerY = height / 2

    // Calculate total value for percentages
    const totalValue = distributions.reduce((sum, dist) => sum + dist.value, 0)

    // Colors for the pie slices
    const colors = [
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#f43f5e", // Rose
      "#f59e0b", // Amber
      "#10b981", // Emerald
      "#3b82f6", // Blue
      "#6366f1", // Indigo
      "#14b8a6", // Teal
      "#f97316", // Orange
      "#84cc16", // Lime
    ]

    // Draw pie chart
    let startAngle = 0
    distributions.forEach((dist, index) => {
      const sliceAngle = (dist.value / totalValue) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = colors[index % colors.length]
      ctx.fill()

      // Draw label
      const labelAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Only draw label if slice is big enough
      if (sliceAngle > 0.2) {
        ctx.fillText(`${Math.round((dist.value / totalValue) * 100)}%`, labelX, labelY)
      }

      startAngle += sliceAngle
    })

    // Draw legend
    const legendX = 10
    let legendY = height - 10 - distributions.length * 20

    distributions.forEach((dist, index) => {
      // Draw color box
      ctx.fillStyle = colors[index % colors.length]
      ctx.fillRect(legendX, legendY - 8, 12, 12)

      // Draw text
      ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(`${dist.locationName} - $${dist.value.toFixed(2)} (${dist.quantity})`, legendX + 20, legendY)

      legendY += 20
    })
  }, [distributions, theme])

  if (distributions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle>{t("location_distribution")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">{t("no_location_data")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{t("location_distribution")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <canvas ref={canvasRef} width={400} height={300} className="max-w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

