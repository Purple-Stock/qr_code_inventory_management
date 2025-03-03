"use server"

import { supabase } from "@/lib/supabase"

export type TimeRange = "7d" | "30d" | "90d" | "12m"

function getDateRange(range: TimeRange) {
  const now = new Date()
  switch (range) {
    case "7d":
      return new Date(now.setDate(now.getDate() - 7))
    case "30d":
      return new Date(now.setDate(now.getDate() - 30))
    case "90d":
      return new Date(now.setDate(now.getDate() - 90))
    case "12m":
      return new Date(now.setFullYear(now.getFullYear() - 1))
  }
}

export async function getPerformanceMetrics(timeRange: TimeRange) {
  try {
    const startDate = getDateRange(timeRange)

    // Get inventory accuracy
    const { data: items } = await supabase
      .from("items")
      .select("current_quantity, last_counted_quantity")
      .not("last_counted_quantity", "is", null)

    const accuracyStats = items?.reduce(
      (acc, item) => {
        const isAccurate = item.current_quantity === item.last_counted_quantity
        return {
          total: acc.total + 1,
          accurate: acc.accurate + (isAccurate ? 1 : 0),
        }
      },
      { total: 0, accurate: 0 },
    )

    const inventoryAccuracy = accuracyStats ? (accuracyStats.accurate / accuracyStats.total) * 100 : 100

    // Get order fulfillment rate
    const { data: transactions } = await supabase
      .from("stock_transactions")
      .select("type, status")
      .eq("type", "stock_out")
      .gte("created_at", startDate.toISOString())

    const fulfillmentStats = transactions?.reduce(
      (acc, tx) => ({
        total: acc.total + 1,
        fulfilled: acc.fulfilled + (tx.status === "completed" ? 1 : 0),
      }),
      { total: 0, fulfilled: 0 },
    )

    const orderFulfillment = fulfillmentStats ? (fulfillmentStats.fulfilled / fulfillmentStats.total) * 100 : 100

    // Get stock turnover rate
    const { data: stockData } = await supabase
      .from("stock_transactions")
      .select(`
        type,
        quantity,
        items (
          current_quantity
        )
      `)
      .gte("created_at", startDate.toISOString())

    let totalSold = 0
    let averageInventory = 0

    stockData?.forEach((tx) => {
      if (tx.type === "stock_out") {
        totalSold += tx.quantity
      }
      if (tx.items?.current_quantity) {
        averageInventory += tx.items.current_quantity
      }
    })

    averageInventory = averageInventory / (stockData?.length || 1)
    const stockTurnover = averageInventory > 0 ? totalSold / averageInventory : 0

    // Get dead stock percentage
    const { data: deadStock } = await supabase.from("items").select("id").eq("current_quantity", 0)

    const { count: totalItems } = await supabase.from("items").select("id", { count: "exact", head: true })

    const deadStockPercentage = totalItems ? ((deadStock?.length || 0) / totalItems) * 100 : 0

    return {
      inventoryAccuracy,
      orderFulfillment,
      stockTurnover,
      deadStockPercentage,
    }
  } catch (error) {
    console.error("Error fetching performance metrics:", error)
    return null
  }
}

export async function getSalesTrend(timeRange: TimeRange) {
  try {
    const startDate = getDateRange(timeRange)
    const { data: transactions } = await supabase
      .from("stock_transactions")
      .select("created_at, type, quantity")
      .eq("type", "stock_out")
      .gte("created_at", startDate.toISOString())
      .order("created_at")

    // Group by month
    const monthlyData = transactions?.reduce(
      (acc, tx) => {
        const month = new Date(tx.created_at).toLocaleString("default", { month: "short" })
        acc[month] = (acc[month] || 0) + tx.quantity
        return acc
      },
      {} as Record<string, number>,
    )

    // Convert to array format and add forecasting
    return Object.entries(monthlyData || {}).map(([month, actual]) => {
      // Simple forecasting: 5% increase from actual
      const forecast = actual * 1.05
      return { month, actual, forecast }
    })
  } catch (error) {
    console.error("Error fetching sales trend:", error)
    return []
  }
}

export async function getStockTurnover() {
  try {
    const { data: categories } = await supabase.from("items").select(`
        category,
        current_quantity,
        stock_transactions (
          type,
          quantity
        )
      `)

    // Calculate turnover by category
    const turnoverByCategory = categories?.reduce(
      (acc, item) => {
        if (!item.category) return acc

        const sales =
          item.stock_transactions?.filter((tx) => tx.type === "stock_out").reduce((sum, tx) => sum + tx.quantity, 0) ||
          0

        const currentCategory = acc[item.category] || {
          sales: 0,
          inventory: 0,
        }

        return {
          ...acc,
          [item.category]: {
            sales: currentCategory.sales + sales,
            inventory: currentCategory.inventory + item.current_quantity,
          },
        }
      },
      {} as Record<string, { sales: number; inventory: number }>,
    )

    // Convert to required format with industry averages
    return Object.entries(turnoverByCategory || {}).map(([category, data]) => ({
      category,
      turnover: data.inventory > 0 ? data.sales / data.inventory : 0,
      industry_avg: 8.5, // This would ideally come from industry data
    }))
  } catch (error) {
    console.error("Error fetching stock turnover:", error)
    return []
  }
}

export async function getStockoutAnalysis(timeRange: TimeRange) {
  try {
    const startDate = getDateRange(timeRange)
    const { data: stockouts } = await supabase
      .from("stock_transactions")
      .select("created_at")
      .eq("type", "stock_out")
      .eq("status", "failed")
      .gte("created_at", startDate.toISOString())
      .order("created_at")

    // Group by month
    const monthlyStockouts = stockouts?.reduce(
      (acc, stockout) => {
        const date = new Date(stockout.created_at).toISOString().slice(0, 7) // YYYY-MM format

        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(monthlyStockouts || {}).map(([date, count]) => ({
      date,
      count,
    }))
  } catch (error) {
    console.error("Error fetching stockout analysis:", error)
    return []
  }
}

export async function getTopPerformers() {
  try {
    const { data: items } = await supabase
      .from("items")
      .select(`
        name,
        cost,
        current_quantity,
        stock_transactions (
          type,
          quantity
        )
      `)
      .order("current_quantity", { ascending: false })
      .limit(4)

    return (
      items?.map((item) => {
        const sales =
          item.stock_transactions?.filter((tx) => tx.type === "stock_out").reduce((sum, tx) => sum + tx.quantity, 0) ||
          0

        const turnover = item.current_quantity > 0 ? sales / item.current_quantity : 0

        const profitMargin = 30 // This would come from actual profit calculations

        return {
          name: item.name,
          turnover,
          profit_margin: profitMargin,
        }
      }) || []
    )
  } catch (error) {
    console.error("Error fetching top performers:", error)
    return []
  }
}

export async function getLowPerformers() {
  try {
    const { data: items } = await supabase
      .from("items")
      .select(`
        name,
        cost,
        current_quantity,
        stock_transactions (
          type,
          quantity
        )
      `)
      .order("current_quantity", { ascending: true })
      .limit(4)

    return (
      items?.map((item) => {
        const sales =
          item.stock_transactions?.filter((tx) => tx.type === "stock_out").reduce((sum, tx) => sum + tx.quantity, 0) ||
          0

        const turnover = item.current_quantity > 0 ? sales / item.current_quantity : 0

        const profitMargin = 15 // This would come from actual profit calculations

        return {
          name: item.name,
          turnover,
          profit_margin: profitMargin,
        }
      }) || []
    )
  } catch (error) {
    console.error("Error fetching low performers:", error)
    return []
  }
}

