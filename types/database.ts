export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: number
          created_at: string
          sku: string
          name: string
          barcode: string
          cost: number
          price: number
          type: string
          brand: string
          location: string
          initial_quantity: number
          current_quantity: number
        }
        Insert: {
          id?: number
          created_at?: string
          sku: string
          name: string
          barcode: string
          cost: number
          price: number
          type: string
          brand: string
          location: string
          initial_quantity: number
          current_quantity: number
        }
        Update: {
          id?: number
          created_at?: string
          sku?: string
          name?: string
          barcode?: string
          cost?: number
          price?: number
          type?: string
          brand?: string
          location?: string
          initial_quantity?: number
          current_quantity?: number
        }
      }
      stock_transactions: {
        Row: {
          id: number
          created_at: string
          item_id: number
          type: "stock_in" | "stock_out" | "adjust"
          quantity: number
          memo: string | null
          location: string
          supplier: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          item_id: number
          type: "stock_in" | "stock_out" | "adjust"
          quantity: number
          memo?: string | null
          location: string
          supplier?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          item_id?: number
          type?: "stock_in" | "stock_out" | "adjust"
          quantity?: number
          memo?: string | null
          location?: string
          supplier?: string | null
        }
      }
    }
  }
}

