export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number
          created_at: string
          name: string
          slug: string
          logo_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          slug: string
          logo_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          slug?: string
          logo_url?: string | null
          is_active?: boolean
        }
      }
      company_users: {
        Row: {
          id: number
          created_at: string
          company_id: number
          user_id: string
          role: "admin" | "member" | "viewer"
        }
        Insert: {
          id?: number
          created_at?: string
          company_id: number
          user_id: string
          role?: "admin" | "member" | "viewer"
        }
        Update: {
          id?: number
          created_at?: string
          company_id?: number
          user_id?: string
          role?: "admin" | "member" | "viewer"
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          email: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          email: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string
        }
      }
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
          company_id: number
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
          company_id: number
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
          company_id?: number
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
export type Company = Database["public"]["Tables"]["companies"]["Row"]
export type CompanyUser = Database["public"]["Tables"]["company_users"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

