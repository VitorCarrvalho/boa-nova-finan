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
          future_scheduled_date: string | null
          id: string
          invoice_number: string | null
          is_future_scheduled: boolean | null
          is_recurring: boolean
          next_occurrence_date: string | null
          observations: string | null
          paid_at: string | null
          payee_name: string
          payment_method: string
          pix_key: string | null
          recurrence_day_of_month: number | null
          recurrence_day_of_week: number | null
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
          future_scheduled_date?: string | null
          id?: string
          invoice_number?: string | null
          is_future_scheduled?: boolean | null
          is_recurring?: boolean
          next_occurrence_date?: string | null
          observations?: string | null
          paid_at?: string | null
          payee_name: string
          payment_method: string
          pix_key?: string | null
          recurrence_day_of_month?: number | null
          recurrence_day_of_week?: number | null
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
          future_scheduled_date?: string | null
          id?: string
          invoice_number?: string | null
          is_future_scheduled?: boolean | null
          is_recurring?: boolean
          next_occurrence_date?: string | null
          observations?: string | null
          paid_at?: string | null
          payee_name?: string
          payment_method?: string
          pix_key?: string | null
          recurrence_day_of_month?: number | null
          recurrence_day_of_week?: number | null
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
            foreignKeyName: "accounts_payable_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations_public"
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
          {
            foreignKeyName: "approval_audit_logs_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations_public"
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
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          account_payable_id: string
          downloaded_at?: string
          downloaded_by: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          account_payable_id?: string
          downloaded_at?: string
          downloaded_by?: string
          id?: string
          ip_address?: unknown
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
          banner_image_url: string | null
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
          banner_image_url?: string | null
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
          banner_image_url?: string | null
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
      cta_clicks: {
        Row: {
          button_location: string
          clicked_at: string
          created_at: string
          id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          button_location: string
          clicked_at?: string
          created_at?: string
          id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          button_location?: string
          clicked_at?: string
          created_at?: string
          id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
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
      documentation_sections: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          module_key: string | null
          parent_section_id: string | null
          section_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          module_key?: string | null
          parent_section_id?: string | null
          section_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          module_key?: string | null
          parent_section_id?: string | null
          section_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentation_sections_parent_section_id_fkey"
            columns: ["parent_section_id"]
            isOneToOne: false
            referencedRelation: "documentation_sections"
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
            foreignKeyName: "financial_records_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations_public"
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
      leads: {
        Row: {
          created_at: string | null
          id: number
          nome: string | null
          possui_thread: boolean | null
          remoteJid: string | null
          response_id: string | null
          thread_id: string | null
          total_tokens: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          nome?: string | null
          possui_thread?: boolean | null
          remoteJid?: string | null
          response_id?: string | null
          thread_id?: string | null
          total_tokens?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          nome?: string | null
          possui_thread?: boolean | null
          remoteJid?: string | null
          response_id?: string | null
          thread_id?: string | null
          total_tokens?: string | null
        }
        Relationships: []
      }
      leads_plamev: {
        Row: {
          castracao: string | null
          como_conheceu: string | null
          created_at: string
          email: string | null
          especie: string | null
          id: number
          idade: string | null
          name: string | null
          objetivo: string | null
          pets_name: string | null
          qtd_pets: string | null
          raca_ou_porte: string | null
          sexo: string | null
          whatsapp: string | null
        }
        Insert: {
          castracao?: string | null
          como_conheceu?: string | null
          created_at?: string
          email?: string | null
          especie?: string | null
          id?: number
          idade?: string | null
          name?: string | null
          objetivo?: string | null
          pets_name?: string | null
          qtd_pets?: string | null
          raca_ou_porte?: string | null
          sexo?: string | null
          whatsapp?: string | null
        }
        Update: {
          castracao?: string | null
          como_conheceu?: string | null
          created_at?: string
          email?: string | null
          especie?: string | null
          id?: number
          idade?: string | null
          name?: string | null
          objetivo?: string | null
          pets_name?: string | null
          qtd_pets?: string | null
          raca_ou_porte?: string | null
          sexo?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      "leads-filipe": {
        Row: {
          cep: string | null
          created_at: string
          id: number
          nome: string | null
          placa_veiculo: string | null
          whatsapp: string | null
        }
        Insert: {
          cep?: string | null
          created_at?: string
          id?: number
          nome?: string | null
          placa_veiculo?: string | null
          whatsapp?: string | null
        }
        Update: {
          cep?: string | null
          created_at?: string
          id?: number
          nome?: string | null
          placa_veiculo?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      "leads-top-1264": {
        Row: {
          created_at: string
          email: string | null
          id: number
          nome: string | null
          nome_completo: string | null
          sobrenome: string | null
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          nome?: string | null
          nome_completo?: string | null
          sobrenome?: string | null
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          nome?: string | null
          nome_completo?: string | null
          sobrenome?: string | null
          telefone?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "members_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations_public"
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
      pedidos_oracao: {
        Row: {
          created_at: string
          id: string
          nome: string | null
          texto: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string | null
          texto: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string | null
          texto?: string
        }
        Relationships: []
      }
      pre_inscricoes: {
        Row: {
          created_at: string
          data_nascimento: string
          id: string
          nome: string
          telefone: string
        }
        Insert: {
          created_at?: string
          data_nascimento: string
          id?: string
          nome: string
          telefone: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string
          id?: string
          nome?: string
          telefone?: string
        }
        Relationships: []
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
            foreignKeyName: "profiles_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations_public"
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
          {
            foreignKeyName: "reconciliations_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_contact_clicks: {
        Row: {
          channel: Database["public"]["Enums"]["contact_click_channel"]
          clicked_at: string
          id: string
          provider_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["contact_click_channel"]
          clicked_at?: string
          id?: string
          provider_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["contact_click_channel"]
          clicked_at?: string
          id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_contact_clicks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          category_id: string
          city: string
          congregation_id: string | null
          congregation_name: string | null
          created_at: string
          description: string
          email: string
          experience_years: number
          id: string
          instagram: string | null
          linkedin: string | null
          name: string
          photo_url: string
          rejection_reason: string | null
          slug: string
          state: string
          status: Database["public"]["Enums"]["service_provider_status"]
          terms_accepted: boolean
          updated_at: string
          website: string | null
          whatsapp: string
        }
        Insert: {
          category_id: string
          city: string
          congregation_id?: string | null
          congregation_name?: string | null
          created_at?: string
          description: string
          email: string
          experience_years: number
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name: string
          photo_url: string
          rejection_reason?: string | null
          slug: string
          state: string
          status?: Database["public"]["Enums"]["service_provider_status"]
          terms_accepted?: boolean
          updated_at?: string
          website?: string | null
          whatsapp: string
        }
        Update: {
          category_id?: string
          city?: string
          congregation_id?: string | null
          congregation_name?: string | null
          created_at?: string
          description?: string
          email?: string
          experience_years?: number
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string
          photo_url?: string
          rejection_reason?: string | null
          slug?: string
          state?: string
          status?: Database["public"]["Enums"]["service_provider_status"]
          terms_accepted?: boolean
          updated_at?: string
          website?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_providers_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_providers_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reports: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          reason: string
          reporter_email: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          reason: string
          reporter_email?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          reason?: string
          reporter_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reports_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
          reviewer_email: string | null
          status: Database["public"]["Enums"]["service_review_status"]
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
          reviewer_email?: string | null
          status?: Database["public"]["Enums"]["service_review_status"]
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
          reviewer_email?: string | null
          status?: Database["public"]["Enums"]["service_review_status"]
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
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
      user_profile_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          is_active: boolean
          profile_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          is_active?: boolean
          profile_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          is_active?: boolean
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profile_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "access_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profile_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_library: {
        Row: {
          categoria: string | null
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          minio_video_id: string
          title: string
          updated_at: string
          url_minio: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          minio_video_id: string
          title: string
          updated_at?: string
          url_minio?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          minio_video_id?: string
          title?: string
          updated_at?: string
          url_minio?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      congregations_public: {
        Row: {
          city: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          state: string | null
        }
        Insert: {
          city?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          state?: string | null
        }
        Update: {
          city?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          state?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_user: {
        Args: {
          _approved_by?: string
          _congregation_id?: string
          _ministries?: string[]
          _profile_id: string
          _user_id: string
        }
        Returns: boolean
      }
      assign_unique_profile: {
        Args: { _assigned_by?: string; _profile_id: string; _user_id: string }
        Returns: boolean
      }
      generate_provider_slug: {
        Args: { provider_name: string }
        Returns: string
      }
      get_authenticated_user_permissions: { Args: never; Returns: Json }
      get_current_user_permissions: { Args: never; Returns: Json }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      module_requires_congregation_access: {
        Args: { _module: string }
        Returns: boolean
      }
      reject_user:
        | {
            Args: {
              _rejected_by?: string
              _rejection_reason?: string
              _user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              _allow_reapply?: boolean
              _rejected_by?: string
              _rejection_reason?: string
              _user_id: string
            }
            Returns: boolean
          }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      user_has_congregation_access: { Args: never; Returns: boolean }
      user_has_nested_permission: {
        Args: { _permission_path: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { _action?: string; _module: string }
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
        | "future_scheduled"
      contact_click_channel:
        | "whatsapp"
        | "email"
        | "instagram"
        | "linkedin"
        | "reveal_contact"
      delivery_type: "unico" | "agendado" | "recorrente"
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
      service_provider_status: "pending" | "approved" | "rejected" | "inactive"
      service_review_status: "pending" | "approved" | "rejected"
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
        "future_scheduled",
      ],
      contact_click_channel: [
        "whatsapp",
        "email",
        "instagram",
        "linkedin",
        "reveal_contact",
      ],
      delivery_type: ["unico", "agendado", "recorrente"],
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
      service_provider_status: ["pending", "approved", "rejected", "inactive"],
      service_review_status: ["pending", "approved", "rejected"],
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
