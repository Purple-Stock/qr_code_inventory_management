"use server"

import { getDb } from "../lib/db"
import { generateCsv, parseCsvContent } from "../lib/csv"

export async function createItem(formData: FormData) {
  const db = getDb()

  const sku = formData.get("sku") as string
  const name = formData.get("name") as string
  const barcode = formData.get("barcode") as string
  const cost = Number.parseFloat(formData.get("cost") as string)
  const price = Number.parseFloat(formData.get("price") as string)
  const type = formData.get("type") as string
  const brand = formData.get("brand") as string
  const location = formData.get("location") as string
  const initialQuantity = Number.parseInt(formData.get("initial-quantity") as string)

  try {
    await db.createItem({
      sku,
      name,
      barcode,
      cost,
      price,
      type,
      brand,
      location,
      initial_quantity: initialQuantity,
    })
    return { success: true, message: "Item created successfully" }
  } catch (error) {
    console.error("Error creating item:", error)
    return { success: false, message: "Error creating item" }
  }
}

export async function createStockIn(formData: FormData) {
  const db = getDb()

  const location = formData.get("location") as string
  const supplier = formData.get("supplier") as string
  const date = formData.get("date") as string
  const memo = formData.get("memo") as string
  const items = JSON.parse(formData.get("items") as string)

  try {
    await db.createStockIn({
      date,
      location,
      supplier,
      memo,
      items,
    })
    return { success: true, message: "Stock in created successfully" }
  } catch (error) {
    console.error("Error creating stock in:", error)
    return { success: false, message: "Error creating stock in" }
  }
}

export async function searchItems(query: string) {
  const db = getDb()
  return await db.searchItems(query)
}

export async function getItems() {
  const db = getDb()
  return await db.getItems()
}

export async function getItem(id: number) {
  const db = getDb()
  return await db.getItemById(id)
}

export async function duplicateItem(id: number) {
  const db = getDb()
  try {
    const duplicatedItem = await db.duplicateItem(id)
    if (duplicatedItem) {
      return { success: true, message: "Item duplicated successfully", item: duplicatedItem }
    } else {
      return { success: false, message: "Item not found" }
    }
  } catch (error) {
    console.error("Error duplicating item:", error)
    return { success: false, message: "Error duplicating item" }
  }
}

export async function generateSku() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let sku = "SKU-"
  for (let i = 0; i < 7; i++) {
    sku += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return sku
}

export async function generateBarcode() {
  let barcode = ""
  for (let i = 0; i < 12; i++) {
    barcode += Math.floor(Math.random() * 10).toString()
  }
  return barcode
}

export async function exportItemsToCSV() {
  const db = getDb()
  const items = await db.getItems()
  return generateCsv(items)
}

export async function importItemsFromCSV(csvContent: string) {
  const db = getDb()
  const items = parseCsvContent(csvContent)

  try {
    for (const item of items) {
      await db.createItem({
        sku: item.sku,
        name: item.name,
        barcode: item.barcode || "",
        cost: item.cost || 0,
        price: item.price || 0,
        type: item.type || "",
        brand: item.brand || "",
        location: item.location || "default",
        initial_quantity: item.current_quantity || 0,
      })
    }
    return { success: true, message: `Successfully imported ${items.length} items` }
  } catch (error) {
    console.error("Error importing items:", error)
    return { success: false, message: "Error importing items" }
  }
}

