import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database"

type Item = Database["public"]["Tables"]["items"]["Row"]
type StockTransaction = Database["public"]["Tables"]["stock_transactions"]["Row"]

export type StockTransactionInput = {
  item_id: number
  type: "stock_in" | "stock_out" | "adjust"
  quantity: number
  to_location_id?: number
  from_location_id?: number
  supplier_id?: number | null
  memo?: string
}

export async function createItemInDb(data: {
  sku: string
  name: string
  barcode: string
  cost: number
  price: number
  type: string
  brand: string
  location: string
  initial_quantity: number
  category_id?: number
}) {
  const { data: newItem, error } = await supabase
    .from("items")
    .insert({
      ...data,
      current_quantity: data.initial_quantity,
    })
    .select()
    .single()

  if (error) throw error

  if (data.initial_quantity > 0) {
    const { error: transactionError } = await supabase.from("stock_transactions").insert({
      item_id: newItem.id,
      type: "stock_in",
      quantity: data.initial_quantity,
      location: data.location,
      memo: "Initial quantity",
    })

    if (transactionError) throw transactionError
  }

  return newItem
}

export async function updateItemInDb(data: {
  id: number
  sku: string
  name: string
  barcode: string
  cost: number
  price: number
  brand: string
  category_id?: number
}) {
  const { data: updatedItem, error } = await supabase
    .from("items")
    .update({
      sku: data.sku,
      name: data.name,
      barcode: data.barcode,
      cost: data.cost,
      price: data.price,
      brand: data.brand,
      category_id: data.category_id,
    })
    .eq("id", data.id)
    .select()
    .single()

  if (error) throw error

  return updatedItem
}

export async function createStockTransaction(data: StockTransactionInput) {
  // Insert the stock transaction
  const { error: transactionError } = await supabase.from("stock_transactions").insert(data)

  if (transactionError) throw transactionError

  // Update item_locations table
  if (data.type === "stock_in" && data.to_location_id) {
    // For stock in, first try to update existing record
    const { data: existingLocation, error: selectError } = await supabase
      .from("item_locations")
      .select("current_quantity")
      .eq("item_id", data.item_id)
      .eq("location_id", data.to_location_id)
      .single()

    if (selectError && selectError.code !== "PGRST116") throw selectError // PGRST116 is "not found" error

    if (existingLocation) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("item_locations")
        .update({
          current_quantity: existingLocation.current_quantity + data.quantity,
        })
        .eq("item_id", data.item_id)
        .eq("location_id", data.to_location_id)

      if (updateError) throw updateError
    } else {
      // Insert new record
      const { error: insertError } = await supabase.from("item_locations").insert({
        item_id: data.item_id,
        location_id: data.to_location_id,
        current_quantity: data.quantity,
      })

      if (insertError) throw insertError
    }
  } else if (data.type === "stock_out" && data.from_location_id) {
    // For stock out, first check if we have enough stock
    const { data: locationStock, error: selectError } = await supabase
      .from("item_locations")
      .select("current_quantity")
      .eq("item_id", data.item_id)
      .eq("location_id", data.from_location_id)
      .single()

    if (selectError) throw selectError

    if (!locationStock || locationStock.current_quantity < data.quantity) {
      throw new Error("Insufficient stock")
    }

    // Update the stock
    const { error: updateError } = await supabase
      .from("item_locations")
      .update({
        current_quantity: locationStock.current_quantity - data.quantity,
      })
      .eq("item_id", data.item_id)
      .eq("location_id", data.from_location_id)

    if (updateError) throw updateError
  } else if (data.type === "adjust" && data.to_location_id) {
    // For adjust, directly set the new quantity
    const { error: updateError } = await supabase.from("item_locations").upsert({
      item_id: data.item_id,
      location_id: data.to_location_id,
      current_quantity: data.quantity,
    })

    if (updateError) throw updateError
  }
}

export async function getItemById(id: number) {
  const { data, error } = await supabase
    .from("items")
    .select(
      `
      *,
      stock_transactions (
        id,
        created_at,
        type,
        quantity,
        location,
        supplier,
        memo
      )
    `,
    )
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function searchItemsByQuery(query: string) {
  const { data, error } = await supabase
    .from("items")
    .select(`
      *,
      item_locations (
        location_id,
        current_quantity
      )
    `)
    .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`)
    .limit(10)

  if (error) throw error
  return data
}

// Add this function to fetch item transactions
export async function getItemTransactions(itemId: number) {
  const { data: transactions, error } = await supabase
    .from("stock_transactions")
    .select(`
      id,
      created_at,
      type,
      quantity,
      from_location_id,
      to_location_id,
      memo,
      from_locations:locations!stock_transactions_from_location_id_fkey(name),
      to_locations:locations!stock_transactions_to_location_id_fkey(name),
      suppliers(name)
    `)
    .eq("item_id", itemId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return transactions
}

