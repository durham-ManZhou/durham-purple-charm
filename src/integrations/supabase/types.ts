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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          party_size: number
          phone: string
          status: string
          time_slot: string
          updated_at: string
          visit_code: string
          visit_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          party_size: number
          phone: string
          status?: string
          time_slot: string
          updated_at?: string
          visit_code: string
          visit_date: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          party_size?: number
          phone?: string
          status?: string
          time_slot?: string
          updated_at?: string
          visit_code?: string
          visit_date?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: string | null
          created_at: string
          education: string
          entry_year: string | null
          follow_up_status: string
          id: string
          intended_countries: string[]
          intended_program: string
          name: string
          notes: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          budget?: string | null
          created_at?: string
          education: string
          entry_year?: string | null
          follow_up_status?: string
          id?: string
          intended_countries?: string[]
          intended_program: string
          name: string
          notes?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          budget?: string | null
          created_at?: string
          education?: string
          entry_year?: string | null
          follow_up_status?: string
          id?: string
          intended_countries?: string[]
          intended_program?: string
          name?: string
          notes?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          biography: string | null
          biography_hash: string | null
          biography_zh: string | null
          created_at: string
          department_slug: string | null
          display_name: string | null
          email: string | null
          image_url: string | null
          is_active: boolean
          last_error: string | null
          last_seen_at: string | null
          last_synced_at: string | null
          listed_role: string | null
          orcid_url: string | null
          other_sections: Json
          phone: string | null
          profile_url: string
          publications: Json
          research_interests: string[]
          role: string | null
          search_text: string
          supervision: Json
          updated_at: string
        }
        Insert: {
          biography?: string | null
          biography_hash?: string | null
          biography_zh?: string | null
          created_at?: string
          department_slug?: string | null
          display_name?: string | null
          email?: string | null
          image_url?: string | null
          is_active?: boolean
          last_error?: string | null
          last_seen_at?: string | null
          last_synced_at?: string | null
          listed_role?: string | null
          orcid_url?: string | null
          other_sections?: Json
          phone?: string | null
          profile_url: string
          publications?: Json
          research_interests?: string[]
          role?: string | null
          search_text?: string
          supervision?: Json
          updated_at?: string
        }
        Update: {
          biography?: string | null
          biography_hash?: string | null
          biography_zh?: string | null
          created_at?: string
          department_slug?: string | null
          display_name?: string | null
          email?: string | null
          image_url?: string | null
          is_active?: boolean
          last_error?: string | null
          last_seen_at?: string | null
          last_synced_at?: string | null
          listed_role?: string | null
          orcid_url?: string | null
          other_sections?: Json
          phone?: string | null
          profile_url?: string
          publications?: Json
          research_interests?: string[]
          role?: string | null
          search_text?: string
          supervision?: Json
          updated_at?: string
        }
        Relationships: []
      }
      staff_sync_state: {
        Row: {
          id: number
          last_discovery_at: string | null
          last_run_at: string | null
          last_status: string | null
          locked_until: string | null
          paused_reason: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          last_discovery_at?: string | null
          last_run_at?: string | null
          last_status?: string | null
          locked_until?: string | null
          paused_reason?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          last_discovery_at?: string | null
          last_run_at?: string | null
          last_status?: string | null
          locked_until?: string | null
          paused_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_staff_sync_lease: { Args: never; Returns: boolean }
      booking_slot_counts: {
        Args: { _date: string }
        Returns: {
          booked: number
          time_slot: string
        }[]
      }
      cancel_booking: {
        Args: { _code: string; _phone: string }
        Returns: boolean
      }
      cancel_booking_by_code: { Args: { _code: string }; Returns: boolean }
      search_staff: {
        Args: {
          _departments?: string[]
          _limit?: number
          _offset?: number
          _q?: string
        }
        Returns: {
          biography: string
          biography_zh: string
          department_slug: string
          display_name: string
          image_url: string
          listed_role: string
          profile_url: string
          research_interests: string[]
          role: string
          total: number
        }[]
      }
      verify_staff_sync_token: { Args: { _token: string }; Returns: boolean }
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
