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
      monthly_audit_log: {
        Row: {
          action: string
          actor: string | null
          at: string
          client_id: string | null
          detail: Json
          id: string
          ip: unknown
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          actor?: string | null
          at?: string
          client_id?: string | null
          detail?: Json
          id?: string
          ip?: unknown
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          actor?: string | null
          at?: string
          client_id?: string | null
          detail?: Json
          id?: string
          ip?: unknown
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      monthly_clients: {
        Row: {
          created_at: string
          display_name: string
          id: string
          org_id: string
          package: string | null
          slug: string
          status: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          org_id: string
          package?: string | null
          slug: string
          status?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          org_id?: string
          package?: string | null
          slug?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "monthly_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_code_attempts: {
        Row: {
          credential_id: string | null
          expires_at: string
          finished: boolean
          generation: number | null
          id: string
          reservation_window: string | null
          successful: boolean
        }
        Insert: {
          credential_id?: string | null
          expires_at: string
          finished?: boolean
          generation?: number | null
          id?: string
          reservation_window?: string | null
          successful?: boolean
        }
        Update: {
          credential_id?: string | null
          expires_at?: string
          finished?: boolean
          generation?: number | null
          id?: string
          reservation_window?: string | null
          successful?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "monthly_code_attempts_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "monthly_code_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_code_budget: {
        Row: {
          id: boolean
          used: number
          window_start: string
        }
        Insert: {
          id?: boolean
          used?: number
          window_start?: string
        }
        Update: {
          id?: boolean
          used?: number
          window_start?: string
        }
        Relationships: []
      }
      monthly_code_credentials: {
        Row: {
          active: boolean
          created_by: string
          failures: number
          generation: number
          id: string
          iterations: number
          locked_until: string | null
          salt: string
          selector: string
          synthetic: boolean
          verifier: string
          window_start: string
        }
        Insert: {
          active?: boolean
          created_by: string
          failures?: number
          generation?: number
          id?: string
          iterations?: number
          locked_until?: string | null
          salt: string
          selector: string
          synthetic?: boolean
          verifier: string
          window_start?: string
        }
        Update: {
          active?: boolean
          created_by?: string
          failures?: number
          generation?: number
          id?: string
          iterations?: number
          locked_until?: string | null
          salt?: string
          selector?: string
          synthetic?: boolean
          verifier?: string
          window_start?: string
        }
        Relationships: []
      }
      monthly_code_request_budget: {
        Row: {
          id: boolean
          used: number
          window_start: string
        }
        Insert: {
          id?: boolean
          used?: number
          window_start?: string
        }
        Update: {
          id?: boolean
          used?: number
          window_start?: string
        }
        Relationships: []
      }
      monthly_code_scopes: {
        Row: {
          client_id: string
          credential_id: string
        }
        Insert: {
          client_id: string
          credential_id: string
        }
        Update: {
          client_id?: string
          credential_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_code_scopes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "monthly_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_code_scopes_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "monthly_code_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_code_sessions: {
        Row: {
          credential_id: string
          digest: string
          expires_at: string
          generation: number
          revoked_at: string | null
        }
        Insert: {
          credential_id: string
          digest: string
          expires_at: string
          generation: number
          revoked_at?: string | null
        }
        Update: {
          credential_id?: string
          digest?: string
          expires_at?: string
          generation?: number
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_code_sessions_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "monthly_code_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_memberships: {
        Row: {
          client_id: string
          grant_source: string
          granted_at: string
          granted_by: string
          id: string
          revoked_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          client_id: string
          grant_source: string
          granted_at?: string
          granted_by: string
          id?: string
          revoked_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          client_id?: string
          grant_source?: string
          granted_at?: string
          granted_by?: string
          id?: string
          revoked_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "monthly_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_organizations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      monthly_provisioning: {
        Row: {
          created_at: string
          created_by: string
          email: string
          failure: string | null
          request_id: string
          state: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          failure?: string | null
          request_id: string
          state?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          failure?: string | null
          request_id?: string
          state?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      monthly_report_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_by: string
          dataset: Json
          dataset_sha256: string
          html_path: string
          id: string
          notes: string | null
          pdf_path: string
          published_at: string | null
          published_by: string | null
          report_id: string
          state: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_by: string
          dataset: Json
          dataset_sha256: string
          html_path: string
          id?: string
          notes?: string | null
          pdf_path: string
          published_at?: string | null
          published_by?: string | null
          report_id: string
          state?: string
          version: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_by?: string
          dataset?: Json
          dataset_sha256?: string
          html_path?: string
          id?: string
          notes?: string | null
          pdf_path?: string
          published_at?: string | null
          published_by?: string | null
          report_id?: string
          state?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_report_versions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "monthly_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reports: {
        Row: {
          client_id: string
          created_at: string
          id: string
          kind: string
          period_end: string
          period_label: string
          period_start: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          kind: string
          period_end: string
          period_label: string
          period_start: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          kind?: string
          period_end?: string
          period_label?: string
          period_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "monthly_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_settings: {
        Row: {
          auth_sending_enabled: boolean
          code_real_access_enabled: boolean
          id: boolean
        }
        Insert: {
          auth_sending_enabled?: boolean
          code_real_access_enabled?: boolean
          id?: boolean
        }
        Update: {
          auth_sending_enabled?: boolean
          code_real_access_enabled?: boolean
          id?: boolean
        }
        Relationships: []
      }
      monthly_staff: {
        Row: {
          role: string
          synthetic: boolean
          user_id: string
        }
        Insert: {
          role: string
          synthetic?: boolean
          user_id: string
        }
        Update: {
          role?: string
          synthetic?: boolean
          user_id?: string
        }
        Relationships: []
      }
      monthly_staging: {
        Row: {
          attempts: number
          base_path: string
          bytes: Json | null
          client_id: string
          created_at: string
          created_by: string
          failure: string | null
          fingerprint: string | null
          lease_expires_at: string | null
          lease_token: string | null
          report_id: string
          request_id: string
          state: string
          sums: Json | null
          version: number
          version_id: string | null
        }
        Insert: {
          attempts?: number
          base_path: string
          bytes?: Json | null
          client_id: string
          created_at?: string
          created_by: string
          failure?: string | null
          fingerprint?: string | null
          lease_expires_at?: string | null
          lease_token?: string | null
          report_id: string
          request_id: string
          state?: string
          sums?: Json | null
          version: number
          version_id?: string | null
        }
        Update: {
          attempts?: number
          base_path?: string
          bytes?: Json | null
          client_id?: string
          created_at?: string
          created_by?: string
          failure?: string | null
          fingerprint?: string | null
          lease_expires_at?: string | null
          lease_token?: string | null
          report_id?: string
          request_id?: string
          state?: string
          sums?: Json | null
          version?: number
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_staging_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "monthly_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_staging_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "monthly_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_staging_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "monthly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          client_slug: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          client_slug?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          client_slug?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      monthly_admin_commit_version: {
        Args: {
          p_dataset: Json
          p_detail: Json
          p_notes: string
          p_request: string
          p_sha: string
        }
        Returns: string
      }
      monthly_admin_create_client: {
        Args: {
          p_display: string
          p_org: string
          p_package: string
          p_slug: string
        }
        Returns: string
      }
      monthly_admin_create_org: { Args: { p_name: string }; Returns: string }
      monthly_admin_create_report: {
        Args: {
          p_client: string
          p_end: string
          p_kind: string
          p_label: string
          p_start: string
        }
        Returns: string
      }
      monthly_admin_fail_staging: {
        Args: { p_reason: string; p_request: string }
        Returns: undefined
      }
      monthly_admin_provision_begin: {
        Args: { p_email: string; p_request: string }
        Returns: {
          state: string
          user_id: string
        }[]
      }
      monthly_admin_provision_finish: {
        Args: { p_failure: string; p_request: string; p_user: string }
        Returns: undefined
      }
      monthly_admin_reserve_version: {
        Args: { p_report: string; p_request: string }
        Returns: {
          base_path: string
          state: string
          version: number
          version_id: string
        }[]
      }
      monthly_admin_stage_acquire: {
        Args: {
          p_bytes: Json
          p_lease_seconds?: number
          p_report: string
          p_request: string
          p_sums: Json
        }
        Returns: {
          base_path: string
          bytes: Json
          lease: string
          state: string
          sums: Json
          version: number
          version_id: string
        }[]
      }
      monthly_admin_stage_commit: {
        Args: {
          p_dataset: Json
          p_lease: string
          p_notes: string
          p_request: string
        }
        Returns: string
      }
      monthly_admin_stage_release: {
        Args: {
          p_fatal: boolean
          p_lease: string
          p_orphans: Json
          p_reason: string
          p_request: string
        }
        Returns: boolean
      }
      monthly_assert_import_client: {
        Args: { p_client: string }
        Returns: undefined
      }
      monthly_can_client: { Args: { cid: string }; Returns: boolean }
      monthly_can_version: { Args: { vid: string }; Returns: boolean }
      monthly_code_access: {
        Args: {
          p_action: string
          p_digest: string
          p_format?: string
          p_version?: string
        }
        Returns: Json
      }
      monthly_code_audit: {
        Args: { p_action: string; p_credential?: string; p_detail?: Json }
        Returns: undefined
      }
      monthly_code_begin: { Args: { p_selector: string }; Returns: Json }
      monthly_code_finish: {
        Args: { p_attempt: string; p_digest: string; p_match: boolean }
        Returns: Json
      }
      monthly_code_manage: {
        Args: {
          p_action: string
          p_clients?: string[]
          p_id?: string
          p_salt?: string
          p_selector?: string
          p_verifier?: string
        }
        Returns: string
      }
      monthly_code_request_gate: { Args: never; Returns: boolean }
      monthly_grant: {
        Args: { cid: string; mrole: string; source: string; uid: string }
        Returns: string
      }
      monthly_require_admin: { Args: never; Returns: string }
      monthly_require_real_admin: { Args: never; Returns: string }
      monthly_revoke: { Args: { mid: string }; Returns: undefined }
      monthly_staff_role: { Args: never; Returns: string }
      monthly_stage_fingerprint: {
        Args: { p_bytes: Json; p_sums: Json }
        Returns: string
      }
      monthly_stage_payload_ok: {
        Args: { p_bytes: Json; p_sums: Json }
        Returns: boolean
      }
      monthly_transition: {
        Args: { next_state: string; vid: string }
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
