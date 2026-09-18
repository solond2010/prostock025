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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      bot_commands: {
        Row: {
          command: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          command: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Update: {
          command?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      bot_messages: {
        Row: {
          active: boolean
          created_at: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          text: string
          user_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      bot_searches: {
        Row: {
          active: boolean
          created_at: string
          distance_km: number | null
          id: string
          keywords: string
          lat: number | null
          lng: number | null
          max_price: number | null
          min_price: number | null
          name: string
          order_by: string
          time_filter: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          distance_km?: number | null
          id?: string
          keywords: string
          lat?: number | null
          lng?: number | null
          max_price?: number | null
          min_price?: number | null
          name: string
          order_by?: string
          time_filter?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          distance_km?: number | null
          id?: string
          keywords?: string
          lat?: number | null
          lng?: number | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          order_by?: string
          time_filter?: string
          user_id?: string
        }
        Relationships: []
      }
      bot_status: {
        Row: {
          current_search: string | null
          id: string
          is_running: boolean
          items_seen_today: number
          last_logs: string | null
          last_search_at: string | null
          messages_today: number
          next_search_at: string | null
          pid: number | null
          searches_today: number
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          current_search?: string | null
          id?: string
          is_running?: boolean
          items_seen_today?: number
          last_logs?: string | null
          last_search_at?: string | null
          messages_today?: number
          next_search_at?: string | null
          pid?: number | null
          searches_today?: number
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          current_search?: string | null
          id?: string
          is_running?: boolean
          items_seen_today?: number
          last_logs?: string | null
          last_search_at?: string | null
          messages_today?: number
          next_search_at?: string | null
          pid?: number | null
          searches_today?: number
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_archived: boolean
          item_id: string
          item_url: string
          location: string | null
          message_sent_at: string | null
          message_status: string
          pipeline_status: string | null
          price: number | null
          score: string
          search_keyword: string | null
          seller_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean
          item_id: string
          item_url: string
          location?: string | null
          message_sent_at?: string | null
          message_status?: string
          pipeline_status?: string | null
          price?: number | null
          score?: string
          search_keyword?: string | null
          seller_id?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean
          item_id?: string
          item_url?: string
          location?: string | null
          message_sent_at?: string | null
          message_status?: string
          pipeline_status?: string | null
          price?: number | null
          score?: string
          search_keyword?: string | null
          seller_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          amount: number | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          event_type: string
          google_event_id: string | null
          id: string
          linked_deal_id: string | null
          linked_stock_id: string | null
          location: string | null
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: string
          google_event_id?: string | null
          id?: string
          linked_deal_id?: string | null
          linked_stock_id?: string | null
          location?: string | null
          starts_at: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: string
          google_event_id?: string | null
          id?: string
          linked_deal_id?: string | null
          linked_stock_id?: string | null
          location?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gastos_material: {
        Row: {
          categoria: string
          concepto: string
          coste: number
          created_at: string
          fecha: string
          id: string
          notas: string | null
          updated_at: string
        }
        Insert: {
          categoria: string
          concepto: string
          coste?: number
          created_at?: string
          fecha?: string
          id?: string
          notas?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string
          concepto?: string
          coste?: number
          created_at?: string
          fecha?: string
          id?: string
          notas?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      personal_finance_movements: {
        Row: {
          amount: number
          category: string
          concept: string
          created_at: string
          date: string
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          concept: string
          created_at?: string
          date?: string
          id?: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          concept?: string
          created_at?: string
          date?: string
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string | null
          status: string
          trial_ends_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id: string
          plan?: string | null
          status?: string
          trial_ends_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string
          trial_ends_at?: string
        }
        Relationships: []
      }
      repuestos_inventario: {
        Row: {
          cantidad: number
          created_at: string
          dispositivo: string | null
          id: string
          marca: string
          modelo: string | null
          nombre: string
          notas: string | null
        }
        Insert: {
          cantidad?: number
          created_at?: string
          dispositivo?: string | null
          id?: string
          marca?: string
          modelo?: string | null
          nombre: string
          notas?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string
          dispositivo?: string | null
          id?: string
          marca?: string
          modelo?: string | null
          nombre?: string
          notas?: string | null
        }
        Relationships: []
      }
      stock_items: {
        Row: {
          almacenamiento: string | null
          bateria_porcentaje: number | null
          category: string
          cobro_nota: string | null
          color: string | null
          coste_reparacion: number
          created_at: string
          estado: string
          fecha_venta: string | null
          id: string
          metodo_cobro: string | null
          name: string
          notes: string | null
          precio_envio: number
          precio_venta_real: number
          purchase_date: string
          purchase_price_per_unit: number
          reparaciones: string[] | null
          sale_price_per_unit: number
          talla: string | null
          updated_at: string
        }
        Insert: {
          almacenamiento?: string | null
          bateria_porcentaje?: number | null
          category: string
          cobro_nota?: string | null
          color?: string | null
          coste_reparacion?: number
          created_at?: string
          estado?: string
          fecha_venta?: string | null
          id?: string
          metodo_cobro?: string | null
          name: string
          notes?: string | null
          precio_envio?: number
          precio_venta_real?: number
          purchase_date?: string
          purchase_price_per_unit?: number
          reparaciones?: string[] | null
          sale_price_per_unit?: number
          talla?: string | null
          updated_at?: string
        }
        Update: {
          almacenamiento?: string | null
          bateria_porcentaje?: number | null
          category?: string
          cobro_nota?: string | null
          color?: string | null
          coste_reparacion?: number
          created_at?: string
          estado?: string
          fecha_venta?: string | null
          id?: string
          metodo_cobro?: string | null
          name?: string
          notes?: string | null
          precio_envio?: number
          precio_venta_real?: number
          purchase_date?: string
          purchase_price_per_unit?: number
          reparaciones?: string[] | null
          sale_price_per_unit?: number
          talla?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          is_done: boolean
          linked_deal_id: string | null
          linked_stock_id: string | null
          notes: string | null
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          linked_deal_id?: string | null
          linked_stock_id?: string | null
          notes?: string | null
          priority?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          linked_deal_id?: string | null
          linked_stock_id?: string | null
          notes?: string | null
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
