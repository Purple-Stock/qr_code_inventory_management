import { NextResponse } from "next/server"
import { getItemById } from "@/lib/db/items"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const itemId = Number.parseInt(params.id)
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    const item = await getItemById(itemId)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

