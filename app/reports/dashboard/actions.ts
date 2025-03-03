"use server"

import { supabase } from "@/lib/supabase"

interface InventoryTrend {
  month: string
  inStock: number
  lowStock: number
  outOfStock: number
}

interface CategoryDistribution {
  name: string
  value: number
}

interface LocationData {
  location: string
  total: number
}

export async function getInventoryTrends(timeRange: string): Promise<InventoryTrend[]> {
  try {
    let fromDate: Date
    const now = new Date()

    switch (timeRange) {
      case "7d":
        fromDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "30d":
        fromDate = new Date(now.setDate(now.getDate() - 30))
        break
      case "90d":
        fromDate = new Date(now.setDate(now.getDate() - 90))
        break
      case "12m":
        fromDate = new Date(now.setMonth(now.getMonth() - 12))
        break
      default:
        fromDate = new Date(now.setDate(now.getDate() - 30))
    }

    const { data: items } = await supabase
      .from("items")
      .select(`
        id,
        current_quantity,
        minimum_quantity,
        stock_transactions (
          created_at,
          quantity,
          type
        )
      `)
      .gte("created_at", fromDate.toISOString())

    if (!items) return []

    // Group by month and calculate quantities
    const monthlyData = new Map<string, InventoryTrend>()

    items.forEach((item) => {
      item.stock_transactions?.forEach((transaction) => {
        const month = new Date(transaction.created_at).toLocaleString("default", { month: "short" })

        if (!monthlyData.has(month)) {
          monthlyData.set(month, {
            month,
            inStock: 0,
            lowStock: 0,
            outOfStock: 0,
          })
        }

        const data = monthlyData.get(month)!

        if (item.current_quantity === 0) {
          data.outOfStock++
        } else if (item.current_quantity <= item.minimum_quantity) {
          data.lowStock++
        } else {
          data.inStock++
        }
      })
    })

    return Array.from(monthlyData.values())
  } catch (error) {
    console.error("Error fetching inventory trends:", error)
    return []
  }
}

export async function getCategoryDistribution(): Promise<CategoryDistribution[]> {
  try {
    const { data } = await supabase
      .from("items")
      .select(`
        categories (
          name
        ),
        current_quantity
      `)
      .not("categories", "is", null)

    if (!data) return []

    const categoryMap = new Map<string, number>()

    data.forEach((item) => {
      const categoryName = item.categories?.name || "Uncategorized"
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + (item.current_quantity || 0))
    })

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  } catch (error) {
    console.error("Error fetching category distribution:", error)
    return []
  }
}

export async function getLocationData(): Promise<LocationData[]> {
  try {
    const { data } = await supabase
      .from("item_locations")
      .select(`
        locations (
          name
        ),
        current_quantity
      `)
      .not("locations", "is", null)

    if (!data) return []

    const locationMap = new Map<string, number>()

    data.forEach((item) => {
      const locationName = item.locations?.name || "Unknown"
      locationMap.set(locationName, (locationMap.get(locationName) || 0) + (item.current_quantity || 0))
    })

    return Array.from(locationMap.entries()).map(([location, total]) => ({
      location,
      total,
    }))
  } catch (error) {
    console.error("Error fetching location data:", error)
    return []
  }
}

export async function getRecentTransactions() {
  try {
    const { data } = await supabase
      .from("stock_transactions")
      .select(`
        id,
        created_at,
        type,
        quantity,
        items (
          name
        ),
        locations (
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (!data) return []

    return data.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      item: transaction.items?.name || "Unknown Item",
      quantity: transaction.quantity,
      location: transaction.locations?.name || "Unknown Location",
      date: new Date(transaction.created_at).toISOString().split("T")[0],
    }))
  } catch (error) {
    console.error("Error fetching recent transactions:", error)
    return []
  }
}

