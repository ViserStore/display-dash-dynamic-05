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
      admin_users: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          password_hash: string
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          password_hash: string
          role?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          password_hash?: string
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          app_about: string | null
          app_description: string | null
          app_download_url: string | null
          app_downloads_count: string | null
          app_logo_url: string | null
          app_name: string | null
          app_rating: number | null
          app_reviews_count: string | null
          app_screenshots: string[] | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          app_about?: string | null
          app_description?: string | null
          app_download_url?: string | null
          app_downloads_count?: string | null
          app_logo_url?: string | null
          app_name?: string | null
          app_rating?: number | null
          app_reviews_count?: string | null
          app_screenshots?: string[] | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          app_about?: string | null
          app_description?: string | null
          app_download_url?: string | null
          app_downloads_count?: string | null
          app_logo_url?: string | null
          app_name?: string | null
          app_rating?: number | null
          app_reviews_count?: string | null
          app_screenshots?: string[] | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      bot_tokens: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          status: string
          symbol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          status?: string
          symbol: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          status?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      coins: {
        Row: {
          created_at: string | null
          id: number
          image_url: string | null
          profit_loss: number | null
          status: string | null
          symbol: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          image_url?: string | null
          profit_loss?: number | null
          status?: string | null
          symbol: string
        }
        Update: {
          created_at?: string | null
          id?: number
          image_url?: string | null
          profit_loss?: number | null
          status?: string | null
          symbol?: string
        }
        Relationships: []
      }
      contact_details: {
        Row: {
          created_at: string
          id: string
          link: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          link: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_checkin_settings: {
        Row: {
          bonus_amount: number
          created_at: string
          day_name: string
          id: string
          updated_at: string
        }
        Insert: {
          bonus_amount?: number
          created_at?: string
          day_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          bonus_amount?: number
          created_at?: string
          day_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      deposit_methods: {
        Row: {
          created_at: string
          currency: string
          deposit_address: string | null
          id: string
          image_url: string
          max_amount: number | null
          min_amount: number | null
          name: string
          order_priority: number
          status: string
          symbol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency: string
          deposit_address?: string | null
          id?: string
          image_url: string
          max_amount?: number | null
          min_amount?: number | null
          name: string
          order_priority?: number
          status?: string
          symbol?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          deposit_address?: string | null
          id?: string
          image_url?: string
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          order_priority?: number
          status?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          deposit_method_id: string | null
          id: string
          status: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          deposit_method_id?: string | null
          id?: string
          status?: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deposit_method_id?: string | null
          id?: string
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_deposit_method_id_fkey"
            columns: ["deposit_method_id"]
            isOneToOne: false
            referencedRelation: "deposit_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_transactions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invested_at: string
          investment_amount: number
          latest_return_amount: number
          next_return_at: string | null
          nft_id: string
          return_amount: number
          return_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          invested_at?: string
          investment_amount: number
          latest_return_amount?: number
          next_return_at?: string | null
          nft_id: string
          return_amount?: number
          return_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invested_at?: string
          investment_amount?: number
          latest_return_amount?: number
          next_return_at?: string | null
          nft_id?: string
          return_amount?: number
          return_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_transactions_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      nfts: {
        Row: {
          created_at: string
          details: string | null
          id: string
          image_url: string | null
          is_verified: boolean
          max_invest_limit: number
          max_profit_percentage: number
          min_invest_limit: number
          min_profit_percentage: number
          nft_date: string | null
          status: string
          title: string
          updated_at: string
          validity_days: number
          website_link: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean
          max_invest_limit?: number
          max_profit_percentage?: number
          min_invest_limit?: number
          min_profit_percentage?: number
          nft_date?: string | null
          status?: string
          title: string
          updated_at?: string
          validity_days?: number
          website_link?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean
          max_invest_limit?: number
          max_profit_percentage?: number
          min_invest_limit?: number
          min_profit_percentage?: number
          nft_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          validity_days?: number
          website_link?: string | null
        }
        Relationships: []
      }
      notice_settings: {
        Row: {
          created_at: string
          id: string
          scrolling_notice: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          scrolling_notice?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          scrolling_notice?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_settings: {
        Row: {
          active: boolean
          bonus_percentage: number
          created_at: string
          id: string
          level_number: number
          setting_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          bonus_percentage?: number
          created_at?: string
          id?: string
          level_number: number
          setting_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          bonus_percentage?: number
          created_at?: string
          id?: string
          level_number?: number
          setting_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          currency_symbol: string
          email_verification: boolean
          id: string
          imgbb_api_key: string | null
          kyc_verification: boolean
          refer_need: number
          signup_bonus: number
          site_currency: string
          site_title: string
          transfer_charge: number
          transfer_min_limit: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_symbol?: string
          email_verification?: boolean
          id?: string
          imgbb_api_key?: string | null
          kyc_verification?: boolean
          refer_need?: number
          signup_bonus?: number
          site_currency?: string
          site_title?: string
          transfer_charge?: number
          transfer_min_limit?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_symbol?: string
          email_verification?: boolean
          id?: string
          imgbb_api_key?: string | null
          kyc_verification?: boolean
          refer_need?: number
          signup_bonus?: number
          site_currency?: string
          site_title?: string
          transfer_charge?: number
          transfer_min_limit?: number
          updated_at?: string
        }
        Relationships: []
      }
      trade_settings: {
        Row: {
          bot_daily_trade_limit: number
          bot_max_trade_amount: number
          bot_min_trade_amount: number
          bot_profit_type: string
          created_at: string
          id: string
          manual_daily_trade_limit: number
          manual_max_trade_amount: number
          manual_min_trade_amount: number
          time_profit_settings: Json
          updated_at: string
        }
        Insert: {
          bot_daily_trade_limit?: number
          bot_max_trade_amount?: number
          bot_min_trade_amount?: number
          bot_profit_type?: string
          created_at?: string
          id?: string
          manual_daily_trade_limit?: number
          manual_max_trade_amount?: number
          manual_min_trade_amount?: number
          time_profit_settings?: Json
          updated_at?: string
        }
        Update: {
          bot_daily_trade_limit?: number
          bot_max_trade_amount?: number
          bot_min_trade_amount?: number
          bot_profit_type?: string
          created_at?: string
          id?: string
          manual_daily_trade_limit?: number
          manual_max_trade_amount?: number
          manual_min_trade_amount?: number
          time_profit_settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      trade_transactions: {
        Row: {
          action: string
          amount: number
          buy_price: number | null
          close_price: number | null
          closing_time: string | null
          created_at: string
          id: string
          price: number
          profit_loss: number | null
          return_time: string | null
          status: string
          symbol: string
          trade_close_price: number | null
          trade_status: string | null
          trade_type: string
          updated_at: string
          user_id: string
          win_loss: string | null
        }
        Insert: {
          action: string
          amount: number
          buy_price?: number | null
          close_price?: number | null
          closing_time?: string | null
          created_at?: string
          id?: string
          price: number
          profit_loss?: number | null
          return_time?: string | null
          status?: string
          symbol: string
          trade_close_price?: number | null
          trade_status?: string | null
          trade_type: string
          updated_at?: string
          user_id: string
          win_loss?: string | null
        }
        Update: {
          action?: string
          amount?: number
          buy_price?: number | null
          close_price?: number | null
          closing_time?: string | null
          created_at?: string
          id?: string
          price?: number
          profit_loss?: number | null
          return_time?: string | null
          status?: string
          symbol?: string
          trade_close_price?: number | null
          trade_status?: string | null
          trade_type?: string
          updated_at?: string
          user_id?: string
          win_loss?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bot_trades: {
        Row: {
          close_time: string | null
          coins: string[] | null
          created_at: string
          id: string
          invest_amount: number | null
          open_time: string
          profit: number | null
          profit_loss: number | null
          profit_or_lose: string | null
          profit_percent: number | null
          return_amount: number | null
          return_time: string | null
          status: string
          trade_timer: number
          updated_at: string
          user_id: string
        }
        Insert: {
          close_time?: string | null
          coins?: string[] | null
          created_at?: string
          id?: string
          invest_amount?: number | null
          open_time?: string
          profit?: number | null
          profit_loss?: number | null
          profit_or_lose?: string | null
          profit_percent?: number | null
          return_amount?: number | null
          return_time?: string | null
          status?: string
          trade_timer?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          close_time?: string | null
          coins?: string[] | null
          created_at?: string
          id?: string
          invest_amount?: number | null
          open_time?: string
          profit?: number | null
          profit_loss?: number | null
          profit_or_lose?: string | null
          profit_percent?: number | null
          return_amount?: number | null
          return_time?: string | null
          status?: string
          trade_timer?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bot_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_checkins: {
        Row: {
          bonus_amount: number
          checkin_date: string
          created_at: string
          day_name: string
          id: string
          user_id: string
        }
        Insert: {
          bonus_amount?: number
          checkin_date?: string
          created_at?: string
          day_name: string
          id?: string
          user_id: string
        }
        Update: {
          bonus_amount?: number
          checkin_date?: string
          created_at?: string
          day_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          balance: number
          bot_balance: number
          created_at: string
          full_name: string | null
          id: string
          password_hash: string
          pay_id: string | null
          referral_code: string | null
          referral_earnings: number | null
          referred_by: string | null
          total_referrals: number | null
          updated_at: string
          username: string
          withdraw_pin: string | null
        }
        Insert: {
          balance?: number
          bot_balance?: number
          created_at?: string
          full_name?: string | null
          id?: string
          password_hash: string
          pay_id?: string | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          total_referrals?: number | null
          updated_at?: string
          username: string
          withdraw_pin?: string | null
        }
        Update: {
          balance?: number
          bot_balance?: number
          created_at?: string
          full_name?: string | null
          id?: string
          password_hash?: string
          pay_id?: string | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          total_referrals?: number | null
          updated_at?: string
          username?: string
          withdraw_pin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      withdraw_methods: {
        Row: {
          charge_percentage: number
          created_at: string
          currency: string
          exchange_rate: number
          id: string
          image_url: string
          max_amount: number | null
          min_amount: number | null
          name: string
          order_priority: number
          status: string
          symbol: string
          updated_at: string
          user_info_label: string
        }
        Insert: {
          charge_percentage?: number
          created_at?: string
          currency: string
          exchange_rate?: number
          id?: string
          image_url: string
          max_amount?: number | null
          min_amount?: number | null
          name: string
          order_priority?: number
          status?: string
          symbol?: string
          updated_at?: string
          user_info_label?: string
        }
        Update: {
          charge_percentage?: number
          created_at?: string
          currency?: string
          exchange_rate?: number
          id?: string
          image_url?: string
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          order_priority?: number
          status?: string
          symbol?: string
          updated_at?: string
          user_info_label?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_address: string
          status: string
          updated_at: string
          user_id: string
          withdraw_method_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_address: string
          status?: string
          updated_at?: string
          user_id: string
          withdraw_method_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_address?: string
          status?: string
          updated_at?: string
          user_id?: string
          withdraw_method_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_withdraw_method_id_fkey"
            columns: ["withdraw_method_id"]
            isOneToOne: false
            referencedRelation: "withdraw_methods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_balance: {
        Args: { user_id: string; amount: number }
        Returns: undefined
      }
      deduct_user_balance: {
        Args: { user_id: string; amount: number }
        Returns: undefined
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_server_time: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      handle_deposit_referral_commission: {
        Args: { deposit_user_id: string; deposit_amount: number }
        Returns: undefined
      }
      handle_trade_win_referral_commission: {
        Args: { winning_user_id: string; trade_amount: number }
        Returns: undefined
      }
      process_nft_returns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
