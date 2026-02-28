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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          app_id: number | null
          asset_id: number | null
          bounty_per_student: number
          bounty_pool: number
          created_at: string
          creator_wallet: string
          deadline: string | null
          description: string
          enrollment_fee: number
          id: string
          max_students: number
          skill_tags: string[] | null
          status: string
          title: string
          tx_hash: string | null
          updated_at: string
        }
        Insert: {
          app_id?: number | null
          asset_id?: number | null
          bounty_per_student?: number
          bounty_pool?: number
          created_at?: string
          creator_wallet: string
          deadline?: string | null
          description: string
          enrollment_fee?: number
          id?: string
          max_students?: number
          skill_tags?: string[] | null
          status?: string
          title: string
          tx_hash?: string | null
          updated_at?: string
        }
        Update: {
          app_id?: number | null
          asset_id?: number | null
          bounty_per_student?: number
          bounty_pool?: number
          created_at?: string
          creator_wallet?: string
          deadline?: string | null
          description?: string
          enrollment_fee?: number
          id?: string
          max_students?: number
          skill_tags?: string[] | null
          status?: string
          title?: string
          tx_hash?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          campaign_id: string
          id: string
          ipfs_metadata_hash: string | null
          minted_at: string
          nft_asset_id: number | null
          student_wallet: string
          submission_id: string
          tx_hash: string | null
        }
        Insert: {
          campaign_id: string
          id?: string
          ipfs_metadata_hash?: string | null
          minted_at?: string
          nft_asset_id?: number | null
          student_wallet: string
          submission_id: string
          tx_hash?: string | null
        }
        Update: {
          campaign_id?: string
          id?: string
          ipfs_metadata_hash?: string | null
          minted_at?: string
          nft_asset_id?: number | null
          student_wallet?: string
          submission_id?: string
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          campaign_id: string
          enrolled_at: string
          id: string
          student_wallet: string
          tx_hash: string | null
        }
        Insert: {
          campaign_id: string
          enrolled_at?: string
          id?: string
          student_wallet: string
          tx_hash?: string | null
        }
        Update: {
          campaign_id?: string
          enrolled_at?: string
          id?: string
          student_wallet?: string
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          ai_feedback: string | null
          ai_score: number | null
          campaign_id: string
          description: string
          id: string
          ipfs_hash: string | null
          ipfs_url: string | null
          reviewed_at: string | null
          reward_claimed: boolean
          reward_tx_hash: string | null
          status: string
          student_wallet: string
          submitted_at: string
          title: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_score?: number | null
          campaign_id: string
          description: string
          id?: string
          ipfs_hash?: string | null
          ipfs_url?: string | null
          reviewed_at?: string | null
          reward_claimed?: boolean
          reward_tx_hash?: string | null
          status?: string
          student_wallet: string
          submitted_at?: string
          title: string
        }
        Update: {
          ai_feedback?: string | null
          ai_score?: number | null
          campaign_id?: string
          description?: string
          id?: string
          ipfs_hash?: string | null
          ipfs_url?: string | null
          reviewed_at?: string | null
          reward_claimed?: boolean
          reward_tx_hash?: string | null
          status?: string
          student_wallet?: string
          submitted_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          wallet_address?: string
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
    Enums: {},
  },
} as const
