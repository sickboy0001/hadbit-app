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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      logical_physical_uid: {
        Row: {
          create_at: string
          delete_flg: number
          dir: string
          domain: string
          id: number
          logical_filename: string
          physical_filename: string
          update_at: string
        }
        Insert: {
          create_at?: string
          delete_flg: number
          dir: string
          domain: string
          id?: number
          logical_filename: string
          physical_filename: string
          update_at?: string
        }
        Update: {
          create_at?: string
          delete_flg?: number
          dir?: string
          domain?: string
          id?: number
          logical_filename?: string
          physical_filename?: string
          update_at?: string
        }
        Relationships: []
      }
      mail_to_id: {
        Row: {
          id: number
          mail: string
        }
        Insert: {
          id?: number
          mail: string
        }
        Update: {
          id?: number
          mail?: string
        }
        Relationships: []
      }
      Post: {
        Row: {
          content: string
          createdAt: string
          id: number
          title: string
          username: string
        }
        Insert: {
          content: string
          createdAt?: string
          id?: number
          title: string
          username: string
        }
        Update: {
          content?: string
          createdAt?: string
          id?: number
          title?: string
          username?: string
        }
        Relationships: []
      }
      qps_queryplans: {
        Row: {
          create_at: string | null
          id: number
          is_archive: boolean
          is_open: boolean
          title: string
          update_at: string | null
          user_id: number
          xml: string
          xml_hash: string
        }
        Insert: {
          create_at?: string | null
          id?: number
          is_archive: boolean
          is_open: boolean
          title: string
          update_at?: string | null
          user_id: number
          xml: string
          xml_hash: string
        }
        Update: {
          create_at?: string | null
          id?: number
          is_archive?: boolean
          is_open?: boolean
          title?: string
          update_at?: string | null
          user_id?: number
          xml?: string
          xml_hash?: string
        }
        Relationships: []
      }
      qps_queryplans_linkedurl: {
        Row: {
          id: number
          queryplans_id: number
          uuid: string
        }
        Insert: {
          id?: number
          queryplans_id: number
          uuid: string
        }
        Update: {
          id?: number
          queryplans_id?: number
          uuid?: string
        }
        Relationships: []
      }
      start_post: {
        Row: {
          content: string
          create_at: string
          delete_flg: boolean
          id: number
          public_flg: boolean
          title: string
          type_id: number
          update_at: string
          user_id: number
        }
        Insert: {
          content: string
          create_at?: string
          delete_flg?: boolean
          id?: number
          public_flg?: boolean
          title: string
          type_id: number
          update_at?: string
          user_id: number
        }
        Update: {
          content?: string
          create_at?: string
          delete_flg?: boolean
          id?: number
          public_flg?: boolean
          title?: string
          type_id?: number
          update_at?: string
          user_id?: number
        }
        Relationships: []
      }
      start_post_duplicate: {
        Row: {
          content: string
          create_at: string
          delete_flg: boolean
          id: number
          public_flg: boolean
          title: string
          type_id: number
          update_at: string
          user_id: number
        }
        Insert: {
          content: string
          create_at?: string
          delete_flg?: boolean
          id: number
          public_flg?: boolean
          title: string
          type_id: number
          update_at?: string
          user_id: number
        }
        Update: {
          content?: string
          create_at?: string
          delete_flg?: boolean
          id?: number
          public_flg?: boolean
          title?: string
          type_id?: number
          update_at?: string
          user_id?: number
        }
        Relationships: []
      }
      start_type: {
        Row: {
          disp_name: string
          display_order: number
          id: number
          name: string
          title_name: string
        }
        Insert: {
          disp_name: string
          display_order: number
          id?: number
          name: string
          title_name: string
        }
        Update: {
          disp_name?: string
          display_order?: number
          id?: number
          name?: string
          title_name?: string
        }
        Relationships: []
      }
      start_type_duplicate: {
        Row: {
          disp_name: string
          display_order: number
          id: number
          name: string
          title_name: string
        }
        Insert: {
          disp_name: string
          display_order: number
          id: number
          name: string
          title_name: string
        }
        Update: {
          disp_name?: string
          display_order?: number
          id?: number
          name?: string
          title_name?: string
        }
        Relationships: []
      }
      tag_mas: {
        Row: {
          create_at: string
          description: string | null
          favorite_flg: boolean
          id: number
          name: string | null
          public_flg: boolean
          tag_name: string | null
          update_at: string
          user_id: number
          visible_flg: boolean
        }
        Insert: {
          create_at?: string
          description?: string | null
          favorite_flg?: boolean
          id?: number
          name?: string | null
          public_flg?: boolean
          tag_name?: string | null
          update_at?: string
          user_id: number
          visible_flg?: boolean
        }
        Update: {
          create_at?: string
          description?: string | null
          favorite_flg?: boolean
          id?: number
          name?: string | null
          public_flg?: boolean
          tag_name?: string | null
          update_at?: string
          user_id?: number
          visible_flg?: boolean
        }
        Relationships: []
      }
      tag_order: {
        Row: {
          create_at: string
          id: number
          tag_ids: string | null
          type: string
          update_at: string
          user_id: number
        }
        Insert: {
          create_at?: string
          id?: number
          tag_ids?: string | null
          type: string
          update_at?: string
          user_id: number
        }
        Update: {
          create_at?: string
          id?: number
          tag_ids?: string | null
          type?: string
          update_at?: string
          user_id?: number
        }
        Relationships: []
      }
      user_info: {
        Row: {
          comment: string | null
          create_at: string
          delete_flg: boolean
          id: number
          name: string | null
          update_at: string
          user_id: number
        }
        Insert: {
          comment?: string | null
          create_at?: string
          delete_flg?: boolean
          id?: number
          name?: string | null
          update_at?: string
          user_id: number
        }
        Update: {
          comment?: string | null
          create_at?: string
          delete_flg?: boolean
          id?: number
          name?: string | null
          update_at?: string
          user_id?: number
        }
        Relationships: []
      }
      zst_post: {
        Row: {
          content: string
          create_at: string
          current_at: string | null
          delete_flg: boolean
          id: number
          public_content_flg: boolean
          public_flg: boolean
          second: number
          title: string
          update_at: string
          user_id: number
          write_end_at: string | null
          write_start_at: string | null
        }
        Insert: {
          content: string
          create_at?: string
          current_at?: string | null
          delete_flg?: boolean
          id?: number
          public_content_flg?: boolean
          public_flg?: boolean
          second: number
          title: string
          update_at?: string
          user_id: number
          write_end_at?: string | null
          write_start_at?: string | null
        }
        Update: {
          content?: string
          create_at?: string
          current_at?: string | null
          delete_flg?: boolean
          id?: number
          public_content_flg?: boolean
          public_flg?: boolean
          second?: number
          title?: string
          update_at?: string
          user_id?: number
          write_end_at?: string | null
          write_start_at?: string | null
        }
        Relationships: []
      }
      zst_tag_link: {
        Row: {
          create_at: string
          display_order: number | null
          id: number
          post_id: number | null
          tag_id: number | null
          update_at: string
        }
        Insert: {
          create_at?: string
          display_order?: number | null
          id?: number
          post_id?: number | null
          tag_id?: number | null
          update_at?: string
        }
        Update: {
          create_at?: string
          display_order?: number | null
          id?: number
          post_id?: number | null
          tag_id?: number | null
          update_at?: string
        }
        Relationships: []
      }
      zst_title_history: {
        Row: {
          create_at: string
          id: number
          title_id: number
          user_id: number
        }
        Insert: {
          create_at?: string
          id?: number
          title_id: number
          user_id: number
        }
        Update: {
          create_at?: string
          id?: number
          title_id?: number
          user_id?: number
        }
        Relationships: []
      }
      zst_title_sample: {
        Row: {
          comment: string | null
          create_at: string
          id: number
          title: string
        }
        Insert: {
          comment?: string | null
          create_at?: string
          id?: number
          title: string
        }
        Update: {
          comment?: string | null
          create_at?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      zst_user_sample_title: {
        Row: {
          auto_create_flg: number
          create_at: string
          id: number
          invalid_flg: number | null
          name: string
          public_flg: number | null
          user_id: number
        }
        Insert: {
          auto_create_flg: number
          create_at?: string
          id?: number
          invalid_flg?: number | null
          name: string
          public_flg?: number | null
          user_id: number
        }
        Update: {
          auto_create_flg?: number
          create_at?: string
          id?: number
          invalid_flg?: number | null
          name?: string
          public_flg?: number | null
          user_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      qps_queryplans_list_view: {
        Row: {
          create_at: string | null
          id: number | null
          is_archive: boolean | null
          is_open: boolean | null
          title: string | null
          update_at: string | null
          uuid: string | null
          xml: string | null
          xml_hash: string | null
        }
        Relationships: []
      }
      random_zst_title_sample: {
        Row: {
          comment: string | null
          create_at: string | null
          id: number | null
          title: string | null
        }
        Insert: {
          comment?: string | null
          create_at?: string | null
          id?: number | null
          title?: string | null
        }
        Update: {
          comment?: string | null
          create_at?: string | null
          id?: number | null
          title?: string | null
        }
        Relationships: []
      }
      random_zst_user_sample_title: {
        Row: {
          auto_create_flg: number | null
          create_at: string | null
          id: number | null
          invalid_flg: number | null
          name: string | null
          public_flg: number | null
          user_id: number | null
        }
        Insert: {
          auto_create_flg?: number | null
          create_at?: string | null
          id?: number | null
          invalid_flg?: number | null
          name?: string | null
          public_flg?: number | null
          user_id?: number | null
        }
        Update: {
          auto_create_flg?: number | null
          create_at?: string | null
          id?: number | null
          invalid_flg?: number | null
          name?: string | null
          public_flg?: number | null
          user_id?: number | null
        }
        Relationships: []
      }
      view_zst_post_daily_public_count: {
        Row: {
          count: number | null
          current_at: string | null
          public_flg: boolean | null
        }
        Relationships: []
      }
      view_zst_post_daily_public_tag_count: {
        Row: {
          count: number | null
          current_at: string | null
          public_flg: boolean | null
          tag_id: number | null
          user_id: number | null
        }
        Relationships: []
      }
      view_zst_post_with_tags: {
        Row: {
          content: string | null
          create_at: string | null
          current_at: string | null
          delete_flg: boolean | null
          id: number | null
          public_content_flg: boolean | null
          public_flg: boolean | null
          second: number | null
          tag_id: number | null
          title: string | null
          update_at: string | null
          user_id: number | null
          write_end_at: string | null
          write_start_at: string | null
        }
        Relationships: []
      }
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
    Enums: {},
  },
} as const
