export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          id: string
          new_value: Json | null
          previous_value: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      church_events: {
        Row: {
          created_at: string
          current_attendees: number | null
          date: string
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          max_attendees: number | null
          notes: string | null
          organizer_id: string | null
          time: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_attendees?: number | null
          date: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_attendees?: number | null
          notes?: string | null
          organizer_id?: string | null
          time?: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_attendees?: number | null
          date?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_attendees?: number | null
          notes?: string | null
          organizer_id?: string | null
          time?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      congregations: {
        Row: {
          avg_members: number | null
          cep: string | null
          city: string | null
          cnpj: string | null
          complement: string | null
          country: string | null
          created_at: string
          has_own_property: boolean | null
          id: string
          is_active: boolean
          name: string
          number: string | null
          rent_value: number | null
          responsible_pastor_ids: string[] | null
          state: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          avg_members?: number | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string
          has_own_property?: boolean | null
          id?: string
          is_active?: boolean
          name: string
          number?: string | null
          rent_value?: number | null
          responsible_pastor_ids?: string[] | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          avg_members?: number | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string
          has_own_property?: boolean | null
          id?: string
          is_active?: boolean
          name?: string
          number?: string | null
          rent_value?: number | null
          responsible_pastor_ids?: string[] | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          id: string
          leader_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          leader_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          leader_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          member_id: string
          notes: string | null
          registered_at: string
          status: string
        }
        Insert: {
          event_id: string
          id?: string
          member_id: string
          notes?: string | null
          registered_at?: string
          status?: string
        }
        Update: {
          event_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          registered_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "church_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          attendees: number | null
          category: Database["public"]["Enums"]["financial_category"]
          congregation_id: string | null
          created_at: string
          created_by: string
          description: string | null
          event_date: string | null
          event_type: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          attendees?: number | null
          category: Database["public"]["Enums"]["financial_category"]
          congregation_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          attendees?: number | null
          category?: Database["public"]["Enums"]["financial_category"]
          congregation_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          congregation_id: string | null
          cpf: string | null
          created_at: string
          date_of_baptism: string | null
          date_of_joining: string | null
          education: string | null
          email: string | null
          id: string
          instagram: string | null
          is_active: boolean
          ministries: string[] | null
          name: string
          phone: string | null
          photo_url: string | null
          rg: string | null
          role: Database["public"]["Enums"]["member_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          congregation_id?: string | null
          cpf?: string | null
          created_at?: string
          date_of_baptism?: string | null
          date_of_joining?: string | null
          education?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean
          ministries?: string[] | null
          name: string
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          congregation_id?: string | null
          cpf?: string | null
          created_at?: string
          date_of_baptism?: string | null
          date_of_joining?: string | null
          education?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean
          ministries?: string[] | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
        ]
      }
      ministries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          leader_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministries_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name: string
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reconciliations: {
        Row: {
          amount_to_send: number
          approved_at: string | null
          approved_by: string | null
          cash: number | null
          congregation_id: string
          created_at: string
          credit: number | null
          debit: number | null
          id: string
          month: string
          online_pix: number | null
          pix: number | null
          sent_by: string | null
          sent_date: string | null
          status: string
          total_income: number
          updated_at: string
        }
        Insert: {
          amount_to_send?: number
          approved_at?: string | null
          approved_by?: string | null
          cash?: number | null
          congregation_id: string
          created_at?: string
          credit?: number | null
          debit?: number | null
          id?: string
          month: string
          online_pix?: number | null
          pix?: number | null
          sent_by?: string | null
          sent_date?: string | null
          status?: string
          total_income?: number
          updated_at?: string
        }
        Update: {
          amount_to_send?: number
          approved_at?: string | null
          approved_by?: string | null
          cash?: number | null
          congregation_id?: string
          created_at?: string
          credit?: number | null
          debit?: number | null
          id?: string
          month?: string
          online_pix?: number | null
          pix?: number | null
          sent_by?: string | null
          sent_date?: string | null
          status?: string
          total_income?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconciliations_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          services: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          services?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          services?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      event_type: "culto" | "conferencia" | "reuniao" | "evento_especial"
      financial_category:
        | "tithe"
        | "offering"
        | "online_offering"
        | "vow_offering"
        | "event"
        | "debt_paid"
        | "salary"
        | "maintenance"
        | "supplier"
        | "project"
        | "utility"
      member_role: "member" | "worker" | "pastor"
      payment_method: "cash" | "coin" | "pix" | "debit" | "credit"
      transaction_type: "income" | "expense"
      user_role: "superadmin" | "admin" | "finance" | "pastor" | "worker"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_type: ["culto", "conferencia", "reuniao", "evento_especial"],
      financial_category: [
        "tithe",
        "offering",
        "online_offering",
        "vow_offering",
        "event",
        "debt_paid",
        "salary",
        "maintenance",
        "supplier",
        "project",
        "utility",
      ],
      member_role: ["member", "worker", "pastor"],
      payment_method: ["cash", "coin", "pix", "debit", "credit"],
      transaction_type: ["income", "expense"],
      user_role: ["superadmin", "admin", "finance", "pastor", "worker"],
    },
  },
} as const
