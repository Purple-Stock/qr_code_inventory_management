"use server"

import { supabase } from "@/lib/supabase"

export async function getSummaryMetrics() {
  try {
    // Get total items count
    const { count: totalItems } = await supabase.from("items").select("*", { count: "exact", head: true })

    // Get total value
    const { data: valueData } = await supabase.from("items").select("cost, current_quantity")
    const totalValue = valueData?.reduce((sum, item) => sum + item.cost * item.current_quantity, 0) || 0

    // Get low stock items count
    const { data: lowStockItems } = await supabase
      .from("items")
      .select("id, minimum_quantity, current_quantity")
      .lt("current_quantity", "minimum_quantity")

    // Get out of stock items count
    const { data: outOfStockItems } = await supabase.from("items").select("id").eq("current_quantity", 0)

    // Get monthly change
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const { data: monthlyTransactions } = await supabase
      .from("stock_transactions")
      .select("type, quantity")
      .gte("created_at", lastMonth.toISOString())

    const monthlyChange =
      monthlyTransactions?.reduce((sum, transaction) => {
        if (transaction.type === "stock_in") return sum + transaction.quantity
        if (transaction.type === "stock_out") return sum - transaction.quantity
        return sum
      }, 0) || 0

    return {
      totalItems: totalItems || 0,
      totalValue,
      lowStock: lowStockItems?.length || 0,
      outOfStock: outOfStockItems?.length || 0,
      monthlyChange: monthlyChange,
    }
  } catch (error) {
    console.error("Error fetching summary metrics:", error)
    return null
  }
}

export async function getRecentActivity() {
  try {
    const { data: transactions } = await supabase
      .from("stock_transactions")
      .select(`
        id,
        created_at,
        type,
        quantity,
        memo,
        items (
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    return (
      transactions?.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        item: transaction.items?.name || "",
        quantity: transaction.quantity,
        date: new Date(transaction.created_at).toISOString().split("T")[0],
      })) || []
    )
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return []
  }
}

export async function getStockWarnings() {
  try {
    const { data: warnings } = await supabase
      .from("items")
      .select(`
        id,
        name,
        sku,
        current_quantity,
        minimum_quantity
      `)
      .or(`current_quantity.eq.0,and(current_quantity.lt.minimum_quantity,current_quantity.gt.0)`)
      .order("current_quantity")
      .limit(5)

    return (
      warnings?.map((item) => ({
        id: item.id,
        item: item.name,
        sku: item.sku,
        currentStock: item.current_quantity,
        minStock: item.minimum_quantity,
      })) || []
    )
  } catch (error) {
    console.error("Error fetching stock warnings:", error)
    return []
  }
}

export async function getTopItems() {
  try {
    const { data: transactions } = await supabase
      .from("stock_transactions")
      .select(`
        item_id,
        type,
        quantity,
        items (
          name,
          sku
        )
      `)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Calculate movement totals per item
    const itemMovements = new Map<
      number,
      {
        name: string
        sku: string
        movements: number
        trend: "up" | "down"
      }
    >()

    transactions?.forEach((transaction) => {
      if (!transaction.item_id || !transaction.items) return

      const current = itemMovements.get(transaction.item_id) || {
        name: transaction.items.name,
        sku: transaction.items.sku,
        movements: 0,
        trend: "up",
      }

      const movement = transaction.type === "stock_in" ? transaction.quantity : -transaction.quantity
      current.movements += Math.abs(transaction.quantity)
      current.trend = movement > 0 ? "up" : "down"

      itemMovements.set(transaction.item_id, current)
    })

    return Array.from(itemMovements.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        sku: data.sku,
        movements: data.movements,
        trend: data.trend,
      }))
      .sort((a, b) => b.movements - a.movements)
      .slice(0, 5)
  } catch (error) {
    console.error("Error fetching top items:", error)
    return []
  }
}

