import { supabase } from "@/lib/supabase"
import type { LocationHistoryEntry } from "@/components/location-history-timeline"

export interface ItemLocationSummary {
  currentLocation: {
    id: number
    name: string
  } | null
  currentValue: number
  initialValue: number
  lastUpdated: string
  locationDistribution: Array<{
    locationId: number
    locationName: string
    quantity: number
    value: number
  }>
}

export async function getItemLocationHistory(itemId: number): Promise<LocationHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from("stock_transactions")
      .select(`
        id,
        created_at,
        type,
        quantity,
        unit_cost,
        from_location_id,
        to_location_id,
        memo,
        from_locations:locations!stock_transactions_from_location_id_fkey(id, name),
        to_locations:locations!stock_transactions_to_location_id_fkey(id, name)
      `)
      .eq("item_id", itemId)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Get the item's current cost to calculate historical values
    const { data: item, error: itemError } = await supabase.from("items").select("cost").eq("id", itemId).single()

    if (itemError) throw itemError

    // Transform the data to match the LocationHistoryEntry interface
    const entries: LocationHistoryEntry[] = data.map((transaction, index, allTransactions) => {
      // Calculate the value at this point in time
      const value = transaction.unit_cost
        ? transaction.quantity * transaction.unit_cost
        : transaction.quantity * item.cost

      // Find the previous transaction to calculate value change
      const previousTransaction = allTransactions[index + 1]
      const previousValue = previousTransaction
        ? previousTransaction.unit_cost
          ? previousTransaction.quantity * previousTransaction.unit_cost
          : previousTransaction.quantity * item.cost
        : undefined

      return {
        id: transaction.id,
        timestamp: transaction.created_at,
        fromLocation: transaction.from_locations,
        toLocation: transaction.to_locations,
        type: transaction.type,
        quantity: transaction.quantity,
        value,
        previousValue,
        notes: transaction.memo,
      }
    })

    return entries
  } catch (error) {
    console.error("Error fetching item location history:", error)
    return []
  }
}

export async function getItemLocationSummary(itemId: number): Promise<ItemLocationSummary> {
  try {
    // Get all item locations with quantities
    const { data: itemLocations, error: locationsError } = await supabase
      .from("item_locations")
      .select(`
        location_id,
        current_quantity,
        updated_at,
        locations(id, name)
      `)
      .eq("item_id", itemId)

    if (locationsError) throw locationsError

    // Get the item's current cost
    const { data: item, error: itemError } = await supabase.from("items").select("cost").eq("id", itemId).single()

    if (itemError) throw itemError

    // Calculate the distribution across locations
    const locationDistribution = itemLocations.map((loc) => ({
      locationId: loc.location_id,
      locationName: loc.locations.name,
      quantity: loc.current_quantity,
      value: loc.current_quantity * item.cost,
    }))

    // Find the location with the most recent update
    let currentLocation = null
    let lastUpdated = ""

    if (itemLocations.length > 0) {
      const sortedLocations = [...itemLocations].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )

      const mostRecentLocation = sortedLocations[0]
      currentLocation = {
        id: mostRecentLocation.location_id,
        name: mostRecentLocation.locations.name,
      }
      lastUpdated = mostRecentLocation.updated_at
    }

    // Calculate total current value
    const currentValue = locationDistribution.reduce((sum, loc) => sum + loc.value, 0)

    // Get the initial transaction to determine initial value
    const { data: initialTransaction, error: transactionError } = await supabase
      .from("stock_transactions")
      .select("quantity, unit_cost")
      .eq("item_id", itemId)
      .order("created_at", { ascending: true })
      .limit(1)
      .single()

    let initialValue = 0
    if (!transactionError && initialTransaction) {
      initialValue = initialTransaction.unit_cost
        ? initialTransaction.quantity * initialTransaction.unit_cost
        : initialTransaction.quantity * item.cost
    }

    return {
      currentLocation,
      currentValue,
      initialValue,
      lastUpdated,
      locationDistribution,
    }
  } catch (error) {
    console.error("Error fetching item location summary:", error)
    return {
      currentLocation: null,
      currentValue: 0,
      initialValue: 0,
      lastUpdated: new Date().toISOString(),
      locationDistribution: [],
    }
  }
}

export async function recordItemMovement(
  itemId: number,
  fromLocationId: number | null,
  toLocationId: number | null,
  quantity: number,
  unitCost: number | null = null,
  memo: string | null = null,
  type: "stock_in" | "stock_out" | "move" | "adjust" = "move",
): Promise<boolean> {
  try {
    // Create the transaction record
    const { error: transactionError } = await supabase.from("stock_transactions").insert({
      item_id: itemId,
      type,
      quantity,
      from_location_id: fromLocationId,
      to_location_id: toLocationId,
      unit_cost: unitCost,
      memo,
    })

    if (transactionError) throw transactionError

    // The triggers in the database will handle updating the item_locations table

    return true
  } catch (error) {
    console.error("Error recording item movement:", error)
    return false
  }
}

