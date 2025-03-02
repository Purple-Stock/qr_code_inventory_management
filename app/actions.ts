"use server"

import { revalidatePath } from "next/cache"
import { createItemInDb, createStockTransaction, getItemById, searchItemsByQuery, updateItemInDb } from "@/lib/db/items"
import { supabase } from "@/lib/supabase"
import { parseCsvContent, generateCsv } from "@/lib/csv"
import type { Database } from "@/types/database"
import { dummyItems } from "@/lib/dummyData"

type Item = Database["public"]["Tables"]["items"]["Row"]
type StockTransaction = Database["public"]["Tables"]["stock_transactions"]["Row"]

export async function generateSku() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let sku = "SKU-"
  for (let i = 0; i < 7; i++) {
    sku += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  // Check if SKU already exists
  const { data: existingItem } = await supabase.from("items").select("sku").eq("sku", sku).single()

  // If SKU exists, generate a new one
  if (existingItem) {
    return generateSku()
  }

  return sku
}

export async function generateBarcode() {
  // Generate a 12-digit barcode (EAN-13 format without check digit)
  let barcode = ""
  for (let i = 0; i < 12; i++) {
    barcode += Math.floor(Math.random() * 10).toString()
  }

  // Check if barcode already exists
  const { data: existingItem } = await supabase.from("items").select("barcode").eq("barcode", barcode).single()

  // If barcode exists, generate a new one
  if (existingItem) {
    return generateBarcode()
  }

  return barcode
}

export async function createItem(formData: FormData) {
  try {
    // Validate required fields
    const sku = formData.get("sku") as string
    const name = formData.get("name") as string
    const barcode = formData.get("barcode") as string
    const costStr = formData.get("cost") as string
    const priceStr = formData.get("price") as string
    const type = formData.get("type") as string
    const brand = formData.get("brand") as string
    const location = formData.get("location") as string
    const initialQuantityStr = formData.get("initial-quantity") as string

    if (!sku || !name) {
      return { success: false, message: "SKU and Name are required fields" }
    }

    // Parse and validate numeric fields
    const cost = costStr ? Number.parseFloat(costStr) : 0
    const price = priceStr ? Number.parseFloat(priceStr) : 0
    const initial_quantity = initialQuantityStr ? Number.parseInt(initialQuantityStr) : 0

    if (isNaN(cost) || isNaN(price) || isNaN(initial_quantity)) {
      return { success: false, message: "Invalid numeric values provided" }
    }

    const newItem = await createItemInDb({
      sku,
      name,
      barcode: barcode || "",
      cost,
      price,
      type: type || "",
      brand: brand || "",
      location: location || "default",
      initial_quantity,
    })

    revalidatePath("/")
    return { success: true, message: "Item created successfully", item: newItem }
  } catch (error) {
    console.error("Error creating item:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function createStockIn(formData: FormData) {
  try {
    const location = formData.get("location") as string
    const supplier = formData.get("supplier") as string
    const memo = formData.get("memo") as string
    const items = JSON.parse(formData.get("items") as string)

    // Validate required fields
    if (!location || !items?.length) {
      return { success: false, message: "Location and items are required" }
    }

    // Process each item
    for (const item of items) {
      await createStockTransaction({
        item_id: item.itemId,
        type: "stock_in",
        quantity: item.quantity,
        location,
        supplier,
        memo,
      })
    }

    revalidatePath("/")
    return { success: true, message: "Stock in created successfully" }
  } catch (error) {
    console.error("Error creating stock in:", error)
    return { success: false, message: "Error creating stock in" }
  }
}

export async function createStockOut(formData: FormData) {
  try {
    const location = formData.get("location") as string
    const memo = formData.get("memo") as string
    const items = JSON.parse(formData.get("items") as string)

    // Validate required fields
    if (!location || !items?.length) {
      return { success: false, message: "Location and items are required" }
    }

    // Validate stock availability
    for (const item of items) {
      const currentItem = await getItemById(item.itemId)
      if (!currentItem || currentItem.current_quantity < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for item ${currentItem?.name || item.itemId}`,
        }
      }
    }

    // Process each item
    for (const item of items) {
      await createStockTransaction({
        item_id: item.itemId,
        type: "stock_out",
        quantity: item.quantity,
        location,
        memo,
      })
    }

    revalidatePath("/")
    return { success: true, message: "Stock out created successfully" }
  } catch (error) {
    console.error("Error creating stock out:", error)
    return { success: false, message: "Error creating stock out" }
  }
}

export async function searchItems(query: string) {
  try {
    const items = await searchItemsByQuery(query)
    return items
  } catch (error) {
    console.error("Error searching items:", error)
    return []
  }
}

export async function getItems() {
  try {
    const { data: items, error } = await supabase.from("items").select().order("created_at", { ascending: false })

    if (error) throw error

    return items
  } catch (error) {
    console.error("Error getting items:", error)
    return []
  }
}

export async function getItem(id: number) {
  try {
    const { data: item, error } = await supabase
      .from("items")
      .select(`
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
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return item
  } catch (error) {
    console.error("Error getting item:", error)
    return null
  }
}

export async function duplicateItem(id: number) {
  try {
    const { data: originalItem, error: fetchError } = await supabase.from("items").select().eq("id", id).single()

    if (fetchError) throw fetchError

    const { data: newItem, error: insertError } = await supabase
      .from("items")
      .insert({
        ...originalItem,
        id: undefined,
        sku: `${originalItem.sku}-COPY`,
        name: `${originalItem.name} (Copy)`,
        barcode: `${originalItem.barcode}-COPY`,
        initial_quantity: 0,
        current_quantity: 0,
      })
      .select()
      .single()

    if (insertError) throw insertError

    revalidatePath("/")
    return { success: true, message: "Item duplicated successfully", item: newItem }
  } catch (error) {
    console.error("Error duplicating item:", error)
    return { success: false, message: "Error duplicating item" }
  }
}

export async function importItemsFromCSV(csvContent: string) {
  try {
    const items = parseCsvContent(csvContent)
    const { data, error } = await supabase.from("items").insert(
      items.map((item) => ({
        sku: item.sku,
        name: item.name,
        barcode: item.barcode || "",
        cost: item.cost || 0,
        price: item.price || 0,
        type: item.type || "",
        brand: item.brand || "",
        location: item.location || "default",
        initial_quantity: item.current_quantity || 0,
        current_quantity: item.current_quantity || 0,
      })),
    )

    if (error) throw error

    revalidatePath("/")
    return { success: true, message: `Successfully imported ${items.length} items` }
  } catch (error) {
    console.error("Error importing items:", error)
    return { success: false, message: "Error importing items" }
  }
}

export async function exportItemsToCSV() {
  try {
    const { data: items, error } = await supabase.from("items").select().order("created_at", { ascending: false })

    if (error) throw error

    return generateCsv(items)
  } catch (error) {
    console.error("Error exporting items:", error)
    return ""
  }
}

export async function insertDummyData() {
  try {
    const { data, error } = await supabase.from("items").insert(dummyItems).select()

    if (error) throw error

    revalidatePath("/")
    return { success: true, message: "Dummy data inserted successfully" }
  } catch (error) {
    console.error("Error inserting dummy data:", error)
    return { success: false, message: "Failed to insert dummy data" }
  }
}

export async function deleteItem(id: number) {
  try {
    const { error } = await supabase.from("items").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/")
    return { success: true, message: "Item deleted successfully" }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, message: "Error deleting item" }
  }
}

export async function createStockAdjustment(formData: FormData) {
  try {
    const location = formData.get("location") as string
    const memo = formData.get("memo") as string
    const items = JSON.parse(formData.get("items") as string)

    // Validate required fields
    if (!location || !items?.length) {
      return { success: false, message: "Location and items are required" }
    }

    // Process each item
    for (const item of items) {
      await createStockTransaction({
        item_id: item.itemId,
        type: "adjust",
        quantity: item.quantity,
        location,
        memo,
      })
    }

    revalidatePath("/")
    return { success: true, message: "Stock adjustment created successfully" }
  } catch (error) {
    console.error("Error creating stock adjustment:", error)
    return { success: false, message: "Error creating stock adjustment" }
  }
}

export async function updateItem(formData: FormData) {
  try {
    // Validate required fields
    const id = formData.get("id") as string
    const sku = formData.get("sku") as string
    const name = formData.get("name") as string
    const barcode = formData.get("barcode") as string
    const costStr = formData.get("cost") as string
    const priceStr = formData.get("price") as string
    const type = formData.get("type") as string
    const brand = formData.get("brand") as string
    const location = formData.get("location") as string

    if (!id || !sku || !name) {
      return { success: false, message: "ID, SKU and Name are required fields" }
    }

    // Parse and validate numeric fields
    const cost = costStr ? Number.parseFloat(costStr) : 0
    const price = priceStr ? Number.parseFloat(priceStr) : 0

    if (isNaN(cost) || isNaN(price)) {
      return { success: false, message: "Invalid numeric values provided" }
    }

    const updatedItem = await updateItemInDb({
      id: Number(id),
      sku,
      name,
      barcode: barcode || "",
      cost,
      price,
      type: type || "",
      brand: brand || "",
      location: location || "default",
    })

    revalidatePath("/")
    return { success: true, message: "Item updated successfully", item: updatedItem }
  } catch (error) {
    console.error("Error updating item:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function createStockMove(formData: FormData) {
  try {
    const fromLocation = formData.get("from_location") as string
    const toLocation = formData.get("to_location") as string
    const memo = formData.get("memo") as string
    const items = JSON.parse(formData.get("items") as string)

    // Validate required fields
    if (!fromLocation || !toLocation || !items?.length) {
      return { success: false, message: "From location, to location, and items are required" }
    }

    if (fromLocation === toLocation) {
      return { success: false, message: "From and To locations must be different" }
    }

    // Validate stock availability
    for (const item of items) {
      const currentItem = await getItemById(item.itemId)
      if (!currentItem || currentItem.current_quantity < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for item ${currentItem?.name || item.itemId}`,
        }
      }
    }

    // Process each item
    for (const item of items) {
      // Create stock out transaction from source location
      await createStockTransaction({
        item_id: item.itemId,
        type: "stock_out",
        quantity: item.quantity,
        location: fromLocation,
        memo: `Move to ${toLocation}: ${memo}`,
      })

      // Create stock in transaction at destination location
      await createStockTransaction({
        item_id: item.itemId,
        type: "stock_in",
        quantity: item.quantity,
        location: toLocation,
        memo: `Move from ${fromLocation}: ${memo}`,
      })
    }

    revalidatePath("/")
    return { success: true, message: "Stock moved successfully" }
  } catch (error) {
    console.error("Error moving stock:", error)
    return { success: false, message: "Error moving stock" }
  }
}

