export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_category: Database["public"]["Enums"]["account_category"]
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          parent_account_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_category: Database["public"]["Enums"]["account_category"]
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_category?: Database["public"]["Enums"]["account_category"]
          account_code?: string
          account_name?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_items: {
        Row: {
          bill_id: string
          created_at: string
          id: string
          product_code: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          bill_id: string
          created_at?: string
          id?: string
          product_code: string
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          bill_id?: string
          created_at?: string
          id?: string
          product_code?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          bank_details: string | null
          bill_number: string
          converted_to_bill_id: string | null
          created_at: string
          currency_id: string | null
          customer_address: string | null
          customer_id: string | null
          customer_mobile: string
          customer_name: string
          description: string | null
          discount_amount: number | null
          discount_rate: number | null
          due_date: string | null
          exchange_rate: number | null
          id: string
          paid_amount: number
          payment_method: string
          payment_status: string | null
          pdf_url: string | null
          remarks: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          terms_conditions: string | null
          total_amount: number
          unpaid_amount: number
        }
        Insert: {
          bank_details?: string | null
          bill_number: string
          converted_to_bill_id?: string | null
          created_at?: string
          currency_id?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_mobile: string
          customer_name: string
          description?: string | null
          discount_amount?: number | null
          discount_rate?: number | null
          due_date?: string | null
          exchange_rate?: number | null
          id?: string
          paid_amount?: number
          payment_method: string
          payment_status?: string | null
          pdf_url?: string | null
          remarks?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          total_amount: number
          unpaid_amount?: number
        }
        Update: {
          bank_details?: string | null
          bill_number?: string
          converted_to_bill_id?: string | null
          created_at?: string
          currency_id?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_mobile?: string
          customer_name?: string
          description?: string | null
          discount_amount?: number | null
          discount_rate?: number | null
          due_date?: string | null
          exchange_rate?: number | null
          id?: string
          paid_amount?: number
          payment_method?: string
          payment_status?: string | null
          pdf_url?: string | null
          remarks?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          total_amount?: number
          unpaid_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "bills_converted_to_bill_id_fkey"
            columns: ["converted_to_bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_note_items: {
        Row: {
          created_at: string | null
          credit_note_id: string
          id: string
          product_code: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          credit_note_id: string
          id?: string
          product_code: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          credit_note_id?: string
          id?: string
          product_code?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_note_items_credit_note_id_fkey"
            columns: ["credit_note_id"]
            isOneToOne: false
            referencedRelation: "credit_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          bill_id: string | null
          created_at: string | null
          credit_date: string
          credit_note_number: string
          customer_id: string | null
          customer_mobile: string
          customer_name: string
          id: string
          reason: string | null
          status: string
          total_amount: number
        }
        Insert: {
          bill_id?: string | null
          created_at?: string | null
          credit_date?: string
          credit_note_number: string
          customer_id?: string | null
          customer_mobile: string
          customer_name: string
          id?: string
          reason?: string | null
          status?: string
          total_amount: number
        }
        Update: {
          bill_id?: string | null
          created_at?: string | null
          credit_date?: string
          credit_note_number?: string
          customer_id?: string | null
          customer_mobile?: string
          customer_name?: string
          id?: string
          reason?: string | null
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          exchange_rate: number
          id: string
          is_base: boolean | null
          name: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          exchange_rate?: number
          id?: string
          is_base?: boolean | null
          name: string
          symbol: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          exchange_rate?: number
          id?: string
          is_base?: boolean | null
          name?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          id: string
          mobile: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          mobile: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          mobile?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      debit_note_items: {
        Row: {
          created_at: string | null
          debit_note_id: string
          id: string
          product_code: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          debit_note_id: string
          id?: string
          product_code: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          debit_note_id?: string
          id?: string
          product_code?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "debit_note_items_debit_note_id_fkey"
            columns: ["debit_note_id"]
            isOneToOne: false
            referencedRelation: "debit_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      debit_notes: {
        Row: {
          bill_id: string | null
          created_at: string | null
          customer_id: string | null
          customer_mobile: string
          customer_name: string
          debit_date: string
          debit_note_number: string
          id: string
          reason: string | null
          status: string
          total_amount: number
        }
        Insert: {
          bill_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_mobile: string
          customer_name: string
          debit_date?: string
          debit_note_number: string
          id?: string
          reason?: string | null
          status?: string
          total_amount: number
        }
        Update: {
          bill_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_mobile?: string
          customer_name?: string
          debit_date?: string
          debit_note_number?: string
          id?: string
          reason?: string | null
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "debit_notes_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debit_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          expense_date: string
          expense_number: string
          id: string
          payment_method: string
          payment_status: string | null
          receipt_url: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          vendor_mobile: string | null
          vendor_name: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_number: string
          id?: string
          payment_method: string
          payment_status?: string | null
          receipt_url?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          vendor_mobile?: string | null
          vendor_name: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_number?: string
          id?: string
          payment_method?: string
          payment_status?: string | null
          receipt_url?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          vendor_mobile?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          entry_date: string
          entry_number: string
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          entry_date: string
          entry_number: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string | null
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          bill_id: string
          created_at: string | null
          customer_id: string
          days_overdue: number
          id: string
          reminder_type: string
          sent_at: string | null
          sent_via: string
          status: string
        }
        Insert: {
          bill_id: string
          created_at?: string | null
          customer_id: string
          days_overdue: number
          id?: string
          reminder_type: string
          sent_at?: string | null
          sent_via: string
          status?: string
        }
        Update: {
          bill_id?: string
          created_at?: string | null
          customer_id?: string
          days_overdue?: number
          id?: string
          reminder_type?: string
          sent_at?: string | null
          sent_via?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          low_stock_threshold: number
          name: string
          photo_url: string | null
          price: number
          product_code: string
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          low_stock_threshold?: number
          name: string
          photo_url?: string | null
          price: number
          product_code: string
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          low_stock_threshold?: number
          name?: string
          photo_url?: string | null
          price?: number
          product_code?: string
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          created_at: string | null
          id: string
          product_code: string
          product_id: string | null
          product_name: string
          quantity: number
          quote_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_code: string
          product_id?: string | null
          product_name: string
          quantity: number
          quote_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_code?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          quote_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string | null
          currency_id: string | null
          customer_address: string | null
          customer_id: string | null
          customer_mobile: string
          customer_name: string
          id: string
          notes: string | null
          quote_date: string
          quote_number: string
          status: string
          terms: string | null
          total_amount: number
          updated_at: string | null
          valid_until: string
        }
        Insert: {
          created_at?: string | null
          currency_id?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_mobile: string
          customer_name: string
          id?: string
          notes?: string | null
          quote_date?: string
          quote_number: string
          status?: string
          terms?: string | null
          total_amount: number
          updated_at?: string | null
          valid_until: string
        }
        Update: {
          created_at?: string | null
          currency_id?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_mobile?: string
          customer_name?: string
          id?: string
          notes?: string | null
          quote_date?: string
          quote_number?: string
          status?: string
          terms?: string | null
          total_amount?: number
          updated_at?: string | null
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_schedule_items: {
        Row: {
          created_at: string | null
          id: string
          product_code: string
          product_id: string | null
          product_name: string
          quantity: number
          schedule_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_code: string
          product_id?: string | null
          product_name: string
          quantity: number
          schedule_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_code?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          schedule_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "recurring_schedule_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_schedule_items_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "recurring_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_schedules: {
        Row: {
          amount: number
          created_at: string | null
          currency_id: string | null
          customer_id: string
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          next_bill_date: string
          schedule_name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency_id?: string | null
          customer_id: string
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          next_bill_date: string
          schedule_name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency_id?: string | null
          customer_id?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_bill_date?: string
          schedule_name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_schedules_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_category:
        | "current_asset"
        | "fixed_asset"
        | "other_asset"
        | "current_liability"
        | "long_term_liability"
        | "equity"
        | "operating_revenue"
        | "other_revenue"
        | "cost_of_goods_sold"
        | "operating_expense"
        | "other_expense"
      account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_category: [
        "current_asset",
        "fixed_asset",
        "other_asset",
        "current_liability",
        "long_term_liability",
        "equity",
        "operating_revenue",
        "other_revenue",
        "cost_of_goods_sold",
        "operating_expense",
        "other_expense",
      ],
      account_type: ["asset", "liability", "equity", "revenue", "expense"],
    },
  },
} as const
