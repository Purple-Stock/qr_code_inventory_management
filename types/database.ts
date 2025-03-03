export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          sku: string
          name: string
          description: string | null
          barcode: string | null
          cost: number
          price: number
          category_id: number | null
          brand: string | null
          initial_quantity: number
          minimum_quantity: number
          is_active: boolean
          current_quantity: number
          categories?: {
            id: number
            name: string
          } | null
          item_locations?: {
            location_id: number
            current_quantity: number
          }[]
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          sku: string
          name: string
          description?: string | null
          barcode?: string | null
          cost?: number
          price?: number
          category_id?: number | null
          brand?: string | null
          initial_quantity?: number
          minimum_quantity?: number
          is_active?: boolean
          current_quantity?: number
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          sku?: string
          name?: string
          description?: string | null
          barcode?: string | null
          cost?: number
          price?: number
          category_id?: number | null
          brand?: string | null
          initial_quantity?: number
          minimum_quantity?: number
          is_active?: boolean
          current_quantity?: number
        }
      }
      categories: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          name: string
          description: string | null
          parent_id: number | null
          is_active: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          parent_id?: number | null
          is_active?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          parent_id?: number | null
          is_active?: boolean
        }
      }
      locations: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          name: string
          description: string | null
          parent_id: number | null
          is_active: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          parent_id?: number | null
          is_active?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          parent_id?: number | null
          is_active?: boolean
        }
      }
      stock_transactions: {
        Row: {
          id: number
          created_at: string
          item_id: number
          type: "stock_in" | "stock_out" | "adjust" | "move"
          quantity: number
          memo: string | null
          location: string
          supplier: string | null
          from_location_id: number | null
          to_location_id: number | null
          unit_cost: number | null
          total_cost: number | null
          supplier_id: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          item_id: number
          type: "stock_in" | "stock_out" | "adjust" | "move"
          quantity: number
          memo?: string | null
          location: string
          supplier?: string | null
          from_location_id?: number | null
          to_location_id?: number | null
          unit_cost?: number | null
          total_cost?: number | null
          supplier_id?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          item_id?: number
          type?: "stock_in" | "stock_out" | "adjust" | "move"
          quantity?: number
          memo?: string | null
          location?: string
          supplier?: string | null
          from_location_id?: number | null
          to_location_id?: number | null
          unit_cost?: number | null
          total_cost?: number | null
          supplier_id?: number | null
        }
      }
      item_locations: {
        Row: {
          item_id: number
          location_id: number
          current_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          item_id: number
          location_id: number
          current_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          item_id?: number
          location_id?: number
          current_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          name: string
          code: string | null
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          is_active: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          name: string
          code?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          name?: string
          code?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
        }
      }
    }
  }
}
export type Location = Database["public"]["Tables"]["locations"]["Row"]

