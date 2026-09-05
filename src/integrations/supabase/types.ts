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
      access_logs: {
        Row: {
          created_at: string
          id: string
          share_id: string | null
          visitor_name: string
          volunteer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          share_id?: string | null
          visitor_name: string
          volunteer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          share_id?: string | null
          visitor_name?: string
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      letter_opens: {
        Row: {
          access_log_id: string
          created_at: string
          id: string
          letter_id: string
        }
        Insert: {
          access_log_id: string
          created_at?: string
          id?: string
          letter_id: string
        }
        Update: {
          access_log_id?: string
          created_at?: string
          id?: string
          letter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "letter_opens_access_log_id_fkey"
            columns: ["access_log_id"]
            isOneToOne: false
            referencedRelation: "access_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letter_opens_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
        ]
      }
      letter_ratings: {
        Row: {
          access_log_id: string | null
          comment: string | null
          created_at: string
          id: string
          letter_id: string
          stars: number
        }
        Insert: {
          access_log_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          letter_id: string
          stars: number
        }
        Update: {
          access_log_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          letter_id?: string
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "letter_ratings_access_log_id_fkey"
            columns: ["access_log_id"]
            isOneToOne: false
            referencedRelation: "access_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letter_ratings_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
        ]
      }
      letters: {
        Row: {
          active: boolean
          body_html: string
          created_at: string
          id: string
          number: number
          title: string
        }
        Insert: {
          active?: boolean
          body_html?: string
          created_at?: string
          id?: string
          number: number
          title: string
        }
        Update: {
          active?: boolean
          body_html?: string
          created_at?: string
          id?: string
          number?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          matricula: string
          name: string
        }
        Insert: {
          created_at?: string
          id: string
          matricula: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          matricula?: string
          name?: string
        }
        Relationships: []
      }
      shares: {
        Row: {
          access_log_id: string | null
          anonymous: boolean
          created_at: string
          id: string
          letter_id: string | null
          sender_name: string | null
          token: string
          volunteer_id: string | null
        }
        Insert: {
          access_log_id?: string | null
          anonymous?: boolean
          created_at?: string
          id?: string
          letter_id?: string | null
          sender_name?: string | null
          token: string
          volunteer_id?: string | null
        }
        Update: {
          access_log_id?: string | null
          anonymous?: boolean
          created_at?: string
          id?: string
          letter_id?: string | null
          sender_name?: string | null
          token?: string
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shares_access_log_id_fkey"
            columns: ["access_log_id"]
            isOneToOne: false
            referencedRelation: "access_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shares_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shares_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: boolean
          institutional_text: string
          ombudsman_url: string
          updated_at: string
        }
        Insert: {
          id?: boolean
          institutional_text?: string
          ombudsman_url?: string
          updated_at?: string
        }
        Update: {
          id?: boolean
          institutional_text?: string
          ombudsman_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          icon: string
          id: string
          label: string
          sort_order: number
          url: string
        }
        Insert: {
          icon?: string
          id?: string
          label: string
          sort_order?: number
          url: string
        }
        Update: {
          icon?: string
          id?: string
          label?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_ratings: {
        Row: {
          access_log_id: string | null
          comment: string | null
          created_at: string
          id: string
          stars: number
          volunteer_id: string
        }
        Insert: {
          access_log_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          stars: number
          volunteer_id: string
        }
        Update: {
          access_log_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          stars?: number
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_ratings_access_log_id_fkey"
            columns: ["access_log_id"]
            isOneToOne: false
            referencedRelation: "access_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_ratings_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      app_role: "admin" | "volunteer"
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
    Enums: {
      app_role: ["admin", "volunteer"],
    },
  },
} as const
