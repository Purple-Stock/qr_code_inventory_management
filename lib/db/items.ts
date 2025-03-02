import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database"

type Item = Database["public"]["Tables"]["items"]["Row"]
type StockTransaction = Database["public"]["Tables"]["stock_transactions"]["Row"]

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
  type: string
  brand: string
  location: string
}) {
  const { data: updatedItem, error } = await supabase
    .from("items")
    .update({
      sku: data.sku,
      name: data.name,
      barcode: data.barcode,
      cost: data.cost,
      price: data.price,
      type: data.type,
      brand: data.brand,
      location: data.location,
    })
    .eq("id", data.id)
    .select()
    .single()

  if (error) throw error

  return updatedItem
}

export async function createStockTransaction(data: {
  item_id: number
  type: "stock_in" | "stock_out"
  quantity: number
  location: string
  supplier?: string
  memo?: string
}) {
  // Start a Supabase transaction
  const { error: transactionError } = await supabase.from("stock_transactions").insert({
    ...data,
  })

  if (transactionError) throw transactionError

  // Update item quantity
  const quantityChange = data.type === "stock_in" ? data.quantity : -data.quantity
  const { error: updateError } = await supabase.rpc("update_item_quantity", {
    p_item_id: data.item_id,
    p_quantity: quantityChange,
  })

  if (updateError) throw updateError
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
    .select()
    .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`)
    .limit(10)

  if (error) throw error
  return data
}

