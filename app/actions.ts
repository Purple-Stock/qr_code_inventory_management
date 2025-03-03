"use server"

import { revalidatePath } from "next/cache"
import { createStockTransaction, searchItemsByQuery, updateItemInDb } from "@/lib/db/items"
import { supabase } from "@/lib/supabase"
import { parseCsvContent, generateCsv } from "@/lib/csv"
import type { Database } from "@/types/database"
import { dummyItems, dummySupplier } from "@/lib/dummyData"

type Item = Database["public"]["Tables"]["items"]["Row"]

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
    const locationId = formData.get("location_id") as string
    const initialQuantityStr = formData.get("initial-quantity") as string
    const categoryId = formData.get("category_id") as string

    if (!sku || !name) {
      return { success: false, message: "SKU and Name are required fields" }
    }

    // Parse and validate numeric fields
    const cost = costStr ? Number.parseFloat(costStr) : 0
    const price = priceStr ? Number.parseFloat(priceStr) : 0
    const initial_quantity = initialQuantityStr ? Number.parseInt(initialQuantityStr) : 0
    const category_id = categoryId ? Number.parseInt(categoryId) : null
    const location_id = locationId ? Number.parseInt(locationId) : null

    if (isNaN(cost) || isNaN(price) || isNaN(initial_quantity)) {
      return { success: false, message: "Invalid numeric values provided" }
    }

    // Start a Supabase transaction
    const { data: item, error: itemError } = await supabase
      .from("items")
      .insert({
        sku,
        name,
        barcode: barcode || "",
        cost,
        price,
        type: type || "",
        brand: brand || "",
        category_id,
        initial_quantity,
        current_quantity: initial_quantity,
      })
      .select()
      .single()

    if (itemError) throw itemError

    // Create item_locations entry if location is provided
    if (location_id) {
      const { error: locationError } = await supabase.from("item_locations").insert({
        item_id: item.id,
        location_id,
        current_quantity: initial_quantity,
      })

      if (locationError) throw locationError

      // Create initial stock transaction
      if (initial_quantity > 0) {
        const { error: transactionError } = await supabase.from("stock_transactions").insert({
          item_id: item.id,
          type: "stock_in",
          quantity: initial_quantity,
          to_location_id: location_id,
          memo: "Initial quantity",
        })

        if (transactionError) throw transactionError
      }
    }

    revalidatePath("/")
    return { success: true, message: "Item created successfully", item }
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
    const location_id = formData.get("location_id") as string
    const supplier_id = formData.get("supplier_id") as string
    const memo = formData.get("memo") as string
    const items = JSON.parse(formData.get("items") as string)

    // Validate required fields
    if (!location_id || !items?.length) {
      return { success: false, message: "Location and items are required" }
    }

    // Process each item
    for (const item of items) {
      await createStockTransaction({
        item_id: item.itemId,
        type: "stock_in",
        quantity: item.quantity,
        to_location_id: Number(location_id),
        supplier_id: supplier_id ? Number(supplier_id) : null,
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
    const location_id = formData.get("location_id") as string
    const memo = formData.get("memo") as string
    const items = JSON.parse(formData.get("items") as string)

    // Validate required fields
    if (!location_id || !items?.length) {
      return { success: false, message: "Location and items are required" }
    }

    // Process each item
    for (const item of items) {
      // Validate stock availability
      const { data: locationStock } = await supabase
        .from("item_locations")
        .select("current_quantity")
        .eq("item_id", item.itemId)
        .eq("location_id", location_id)
        .single()

      if (!locationStock || locationStock.current_quantity < item.quantity) {
        const { data: itemData } = await supabase.from("items").select("name").eq("id", item.itemId).single()

        return {
          success: false,
          message: `Insufficient stock for item ${itemData?.name || item.itemId}`,
        }
      }

      // Create stock transaction
      await createStockTransaction({
        item_id: item.itemId,
        type: "stock_out",
        quantity: item.quantity,
        from_location_id: Number(location_id),
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
    const { data: items, error } = await supabase
      .from("items")
      .select(`
        *,
        categories:category_id (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })

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
          from_location_id,
          to_location_id,
          memo,
          supplier
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
    // Delete all existing data in reverse order of dependencies
    await supabase.from("stock_transactions").delete().neq("id", 0)
    await supabase.from("item_locations").delete().neq("id", 0)
    await supabase.from("items").delete().neq("id", 0)
    await supabase.from("suppliers").delete().neq("id", 0)

    // Get or create default location
    const { data: defaultLocation, error: locationError } = await supabase
      .from("locations")
      .select("id")
      .eq("name", "Default")
      .single()

    if (locationError) throw locationError
    if (!defaultLocation) {
      throw new Error("Default location not found")
    }

    // Insert default supplier
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .insert(dummySupplier)
      .select()
      .single()

    if (supplierError) throw supplierError

    // Insert dummy items
    const { data: items, error: itemsError } = await supabase.from("items").insert(dummyItems).select()

    if (itemsError) throw itemsError

    // Create item_locations entries for each item
    const itemLocations = items.map((item) => ({
      item_id: item.id,
      location_id: defaultLocation.id,
      current_quantity: 0, // Initial quantity will be updated by the stock transaction
    }))

    const { error: itemLocationsError } = await supabase.from("item_locations").insert(itemLocations)

    if (itemLocationsError) throw itemLocationsError

    // Create initial stock transactions for each item
    const initialQuantities = [10, 15, 20, 8, 30] // Matching the original quantities
    const stockTransactions = items.map((item, index) => ({
      item_id: item.id,
      type: "stock_in",
      quantity: initialQuantities[index],
      to_location_id: defaultLocation.id,
      supplier_id: supplier.id,
      memo: "Initial quantity",
    }))

    const { error: transactionError } = await supabase.from("stock_transactions").insert(stockTransactions)

    if (transactionError) throw transactionError

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
    const location_id = formData.get("location_id") as string
    const memo = formData.get("memo") as string
    const items = JSON.parse(formData.get("items") as string)

    // Validate required fields
    if (!location_id || !items?.length) {
      return { success: false, message: "Location and items are required" }
    }

    // Process each item
    for (const item of items) {
      await createStockTransaction({
        item_id: item.itemId,
        type: "adjust",
        quantity: item.quantity,
        to_location_id: Number(location_id), // Use to_location_id instead of location
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
    const from_location_id = formData.get("from_location_id") as string
    const to_location_id = formData.get("to_location_id") as string
    const memo = formData.get("memo") as string
    const items = JSON.parse(formData.get("items") as string)

    // Validate required fields
    if (!from_location_id || !to_location_id || !items?.length) {
      return { success: false, message: "From location, to location, and items are required" }
    }

    if (from_location_id === to_location_id) {
      return { success: false, message: "From and To locations must be different" }
    }

    // Process each item
    for (const item of items) {
      // Validate stock availability
      const { data: locationStock } = await supabase
        .from("item_locations")
        .select("current_quantity")
        .eq("item_id", item.itemId)
        .eq("location_id", from_location_id)
        .single()

      if (!locationStock || locationStock.current_quantity < item.quantity) {
        const { data: itemData } = await supabase.from("items").select("name").eq("id", item.itemId).single()

        return {
          success: false,
          message: `Insufficient stock for item ${itemData?.name || item.itemId}`,
        }
      }

      // Create stock transaction
      await createStockTransaction({
        item_id: item.itemId,
        type: "move",
        quantity: item.quantity,
        from_location_id: Number(from_location_id),
        to_location_id: Number(to_location_id),
        memo,
      })
    }

    revalidatePath("/")
    return { success: true, message: "Stock moved successfully" }
  } catch (error) {
    console.error("Error moving stock:", error)
    return { success: false, message: "Error moving stock" }
  }
}

export async function getCategories() {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select()
      .eq("is_active", true)
      .order("name", { ascending: true })

    if (error) throw error

    return categories
  } catch (error) {
    console.error("Error getting categories:", error)
    return []
  }
}

export async function getLocations() {
  try {
    const { data: locations, error } = await supabase
      .from("locations")
      .select()
      .eq("is_active", true)
      .order("name", { ascending: true })

    if (error) throw error

    return locations
  } catch (error) {
    console.error("Error getting locations:", error)
    return []
  }
}

export async function getSuppliers() {
  try {
    const { data: suppliers, error } = await supabase
      .from("suppliers")
      .select()
      .eq("is_active", true)
      .order("name", { ascending: true })

    if (error) throw error

    return suppliers
  } catch (error) {
    console.error("Error getting suppliers:", error)
    return []
  }
}

export async function createSupplier(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const contact_person = formData.get("contact_person") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string

    if (!name) {
      return { success: false, message: "Name is required" }
    }

    const { data: supplier, error } = await supabase
      .from("suppliers")
      .insert({
        name,
        code: code || null,
        contact_person: contact_person || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/suppliers")
    return { success: true, message: "Supplier created successfully", supplier }
  } catch (error) {
    console.error("Error creating supplier:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function updateSupplier(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const contact_person = formData.get("contact_person") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string

    if (!id || !name) {
      return { success: false, message: "ID and Name are required" }
    }

    const { data: supplier, error } = await supabase
      .from("suppliers")
      .update({
        name,
        code: code || null,
        contact_person: contact_person || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/suppliers")
    return { success: true, message: "Supplier updated successfully", supplier }
  } catch (error) {
    console.error("Error updating supplier:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function deleteSupplier(id: number) {
  try {
    const { error } = await supabase.from("suppliers").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/suppliers")
    return { success: true, message: "Supplier deleted successfully" }
  } catch (error) {
    console.error("Error deleting supplier:", error)
    return { success: false, message: "Error deleting supplier" }
  }
}

export async function createLocation(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const parent_id = formData.get("parent_id") as string

    if (!name) {
      return { success: false, message: "Name is required" }
    }

    const { data: location, error } = await supabase
      .from("locations")
      .insert({
        name,
        description: description || null,
        parent_id: parent_id === "null" ? null : Number(parent_id),
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/locations")
    return { success: true, message: "Location created successfully", location }
  } catch (error) {
    console.error("Error creating location:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function updateLocation(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const parent_id = formData.get("parent_id") as string

    if (!id || !name) {
      return { success: false, message: "ID and Name are required" }
    }

    const { data: location, error } = await supabase
      .from("locations")
      .update({
        name,
        description: description || null,
        parent_id: parent_id === "null" ? null : Number(parent_id),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/locations")
    return { success: true, message: "Location updated successfully", location }
  } catch (error) {
    console.error("Error updating location:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function deleteLocation(id: number) {
  try {
    const { error } = await supabase.from("locations").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/locations")
    return { success: true, message: "Location deleted successfully" }
  } catch (error) {
    console.error("Error deleting location:", error)
    return { success: false, message: "Error deleting location" }
  }
}

export async function getTransactions(fromDate?: string, toDate?: string) {
  const query = supabase
    .from("stock_transactions")
    .select(`
      *,
      items (
        id,
        name,
        sku
      ),
      from_locations: locations!stock_transactions_from_location_id_fkey (
        id,
        name
      ),
      to_locations: locations!stock_transactions_to_location_id_fkey (
        id,
        name
      ),
      suppliers (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false })

  if (fromDate && toDate) {
    query.gte("created_at", fromDate).lte("created_at", toDate)
  }

  const { data: transactions, error } = await query

  if (error) throw error
  return transactions
}

export async function getTransactionDetails(id: number) {
  const { data: transaction, error } = await supabase
    .from("stock_transactions")
    .select(`
      *,
      items (
        id,
        name,
        sku,
        item_locations (
          location_id,
          current_quantity
        )
      ),
      from_locations: locations!stock_transactions_from_location_id_fkey (
        id,
        name
      ),
      to_locations: locations!stock_transactions_to_location_id_fkey (
        id,
        name
      ),
      suppliers (
        id,
        name
      )
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return transaction
}

