"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface Item {
  id: string
  name: string
  sku: string
  barcode: string
}

export function useRealTimeItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchItems()

    const channel = supabase
      .channel("items_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
        },
        (payload) => {
          console.log("Change received!", payload)
          fetchItems()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("items").select("id, name, sku, barcode").order("name")

      if (error) throw error

      setItems(data)
    } catch (error) {
      setError(error as Error)
      toast({
        title: "Error fetching items",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return { items, loading, error, refetch: fetchItems }
}

