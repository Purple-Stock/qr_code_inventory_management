import type { Database } from "@/types/database"

type Item = Database["public"]["Tables"]["items"]["Row"]

export function generateCsv(items: Item[]): string {
  // Define headers based on the first item's keys
  const headers = ["SKU", "Name", "Barcode", "Cost", "Price", "Type", "Brand", "Location", "Current Quantity"]

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...items.map((item) =>
      [
        `"${item.sku}"`,
        `"${item.name}"`,
        `"${item.barcode}"`,
        item.cost,
        item.price,
        `"${item.type}"`,
        `"${item.brand}"`,
        `"${item.location}"`,
        item.current_quantity,
      ].join(","),
    ),
  ].join("\n")

  return csvContent
}

export function parseCsvContent(content: string) {
  const lines = content.split("\n")
  const headers = lines[0].split(",").map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => {
      // Remove quotes and trim
      const cleaned = value.trim().replace(/^"(.*)"$/, "$1")
      // Convert to number if possible
      return isNaN(Number(cleaned)) ? cleaned : Number(cleaned)
    })

    return headers.reduce((obj, header, index) => {
      obj[header.toLowerCase().replace(/\s+/g, "_")] = values[index]
      return obj
    }, {} as any)
  })
}

