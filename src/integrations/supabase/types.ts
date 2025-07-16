export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_profiles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      accounts_payable: {
        Row: {
          amount: number
          approved_at: string | null
          attachment_filename: string | null
          attachment_url: string | null
          bank_account: string | null
          bank_agency: string | null
          bank_name: string | null
          category_id: string
          congregation_id: string
          created_at: string
          description: string
          due_date: string
          id: string
          invoice_number: string | null
          is_recurring: boolean
          observations: string | null
          paid_at: string | null
          payee_name: string
          payment_method: string
          recurrence_frequency: string | null
          rejected_at: string | null
          rejection_reason: string | null
          requested_at: string
          requested_by: string
          status: Database["public"]["Enums"]["account_payable_status"]
          updated_at: string
          urgency_description: string | null
          urgency_level: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          amount: number
          approved_at?: string | null
          attachment_filename?: string | null
          attachment_url?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          category_id: string
          congregation_id: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          invoice_number?: string | null
          is_recurring?: boolean
          observations?: string | null
          paid_at?: string | null
          payee_name: string
          payment_method: string
          recurrence_frequency?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          requested_by: string
          status?: Database["public"]["Enums"]["account_payable_status"]
          updated_at?: string
          urgency_description?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          amount?: number
          approved_at?: string | null
          attachment_filename?: string | null
          attachment_url?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          category_id?: string
          congregation_id?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          invoice_number?: string | null
          is_recurring?: boolean
          observations?: string | null
          paid_at?: string | null
          payee_name?: string
          payment_method?: string
          recurrence_frequency?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          requested_by?: string
          status?: Database["public"]["Enums"]["account_payable_status"]
          updated_at?: string
          urgency_description?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_payable_approvals: {
        Row: {
          account_payable_id: string
          action: string
          approval_level: string
          approved_by: string
          created_at: string
          id: string
          notes: string | null
        }
        Insert: {
          account_payable_id: string
          action: string
          approval_level: string
          approved_by: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Update: {
          account_payable_id?: string
          action?: string
          approval_level?: string
          approved_by?: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_approvals_account_payable_id_fkey"
            columns: ["account_payable_id"]
            isOneToOne: false
            referencedRelation: "accounts_payable"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_audit_logs: {
        Row: {
          changed_by: string
          congregation_id: string | null
          created_at: string
          id: string
          ministries: string[] | null
          new_role: Database["public"]["Enums"]["user_role"] | null
          new_status: string
          previous_role: Database["public"]["Enums"]["user_role"] | null
          previous_status: string | null
          rejection_reason: string | null
          user_id: string
        }
        Insert: {
          changed_by: string
          congregation_id?: string | null
          created_at?: string
          id?: string
          ministries?: string[] | null
          new_role?: Database["public"]["Enums"]["user_role"] | null
          new_status: string
          previous_role?: Database["public"]["Enums"]["user_role"] | null
          previous_status?: string | null
          rejection_reason?: string | null
          user_id: string
        }
        Update: {
          changed_by?: string
          congregation_id?: string | null
          created_at?: string
          id?: string
          ministries?: string[] | null
          new_role?: Database["public"]["Enums"]["user_role"] | null
          new_status?: string
          previous_role?: Database["public"]["Enums"]["user_role"] | null
          previous_status?: string | null
          rejection_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_audit_logs_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
        ]
      }
      attachment_downloads: {
        Row: {
          account_payable_id: string
          downloaded_at: string
          downloaded_by: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          account_payable_id: string
          downloaded_at?: string
          downloaded_by: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          account_payable_id?: string
          downloaded_at?: string
          downloaded_by?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachment_downloads_account_payable_id_fkey"
            columns: ["account_payable_id"]
            isOneToOne: false
            referencedRelation: "accounts_payable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachment_downloads_downloaded_by_fkey"
            columns: ["downloaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
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
          responsible_pastor_id: string | null
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
          responsible_pastor_id?: string | null
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
          responsible_pastor_id?: string | null
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
          {
            foreignKeyName: "financial_records_responsible_pastor_id_fkey"
            columns: ["responsible_pastor_id"]
            isOneToOne: false
            referencedRelation: "members"
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
      notifications: {
        Row: {
          created_at: string
          created_by: string
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          error_message: string | null
          id: string
          message_content: string
          message_type: Database["public"]["Enums"]["notification_type"]
          n8n_payload: Json | null
          recipient_profiles: Database["public"]["Enums"]["recipient_profile"][]
          scheduled_time: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          updated_at: string
          video_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          error_message?: string | null
          id?: string
          message_content: string
          message_type: Database["public"]["Enums"]["notification_type"]
          n8n_payload?: Json | null
          recipient_profiles: Database["public"]["Enums"]["recipient_profile"][]
          scheduled_time?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
          video_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          error_message?: string | null
          id?: string
          message_content?: string
          message_type?: Database["public"]["Enums"]["notification_type"]
          n8n_payload?: Json | null
          recipient_profiles?: Database["public"]["Enums"]["recipient_profile"][]
          scheduled_time?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_library"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          congregation_id: string | null
          created_at: string
          email: string | null
          id: string
          ministries: string[] | null
          name: string
          photo_url: string | null
          profile_id: string | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          congregation_id?: string | null
          created_at?: string
          email?: string | null
          id: string
          ministries?: string[] | null
          name: string
          photo_url?: string | null
          profile_id?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          congregation_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ministries?: string[] | null
          name?: string
          photo_url?: string | null
          profile_id?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "access_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          reconciliation_date: string
          sent_by: string
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
          reconciliation_date?: string
          sent_by?: string
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
          reconciliation_date?: string
          sent_by?: string
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
      video_library: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          minio_video_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          minio_video_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          minio_video_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user: {
        Args: {
          _user_id: string
          _profile_id: string
          _congregation_id?: string
          _ministries?: string[]
          _approved_by?: string
        }
        Returns: boolean
      }
      get_current_user_permissions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      reject_user: {
        Args:
          | {
              _user_id: string
              _rejection_reason?: string
              _rejected_by?: string
            }
          | {
              _user_id: string
              _rejection_reason?: string
              _rejected_by?: string
              _allow_reapply?: boolean
            }
        Returns: boolean
      }
      user_has_permission: {
        Args: { _module: string; _action?: string }
        Returns: boolean
      }
    }
    Enums: {
      account_payable_status:
        | "pending_management"
        | "pending_director"
        | "pending_president"
        | "approved"
        | "paid"
        | "rejected"
      delivery_type: "unico" | "agendado"
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
      notification_status:
        | "scheduled"
        | "sent"
        | "error"
        | "cancelled"
        | "inactive"
      notification_type: "texto" | "texto_com_video" | "video"
      payment_method: "cash" | "coin" | "pix" | "debit" | "credit"
      recipient_profile: "pastores" | "financeiro" | "membros" | "todos"
      transaction_type: "income" | "expense"
      urgency_level: "normal" | "urgent"
      user_role:
        | "superadmin"
        | "admin"
        | "finance"
        | "pastor"
        | "worker"
        | "assistente"
        | "analista"
        | "coordenador"
        | "gerente"
        | "diretor"
        | "presidente"
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
      account_payable_status: [
        "pending_management",
        "pending_director",
        "pending_president",
        "approved",
        "paid",
        "rejected",
      ],
      delivery_type: ["unico", "agendado"],
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
      notification_status: [
        "scheduled",
        "sent",
        "error",
        "cancelled",
        "inactive",
      ],
      notification_type: ["texto", "texto_com_video", "video"],
      payment_method: ["cash", "coin", "pix", "debit", "credit"],
      recipient_profile: ["pastores", "financeiro", "membros", "todos"],
      transaction_type: ["income", "expense"],
      urgency_level: ["normal", "urgent"],
      user_role: [
        "superadmin",
        "admin",
        "finance",
        "pastor",
        "worker",
        "assistente",
        "analista",
        "coordenador",
        "gerente",
        "diretor",
        "presidente",
      ],
    },
  },
} as const
