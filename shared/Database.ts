
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "artist_tags": {
                  Row: {
                    "artist": string,"count": number,"tag": string
                  }
                  Insert: {
                    "artist": string,"count": number,"tag": string
                  }
                  Update: {
                    "artist"?: string,"count"?: number,"tag"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "artist_tags_artist_fkey"
      columns: ["artist"]
isOneToOne: false
      referencedRelation: "artists"
      referencedColumns: ["name"]
    },{
      foreignKeyName: "artist_tags_tag_fkey"
      columns: ["tag"]
isOneToOne: false
      referencedRelation: "tags"
      referencedColumns: ["name"]
    }
                  ]
                },"artists": {
                  Row: {
                    "name": string,"tags_fetched": boolean,"url": string | null
                  }
                  Insert: {
                    "name": string,"tags_fetched"?: boolean,"url"?: string | null
                  }
                  Update: {
                    "name"?: string,"tags_fetched"?: boolean,"url"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"plays": {
                  Row: {
                    "artist": string,"date": string,"name": string,"user": string
                  }
                  Insert: {
                    "artist": string,"date": string,"name": string,"user": string
                  }
                  Update: {
                    "artist"?: string,"date"?: string,"name"?: string,"user"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "play_user_fkey"
      columns: ["user"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["user"]
    },{
      foreignKeyName: "plays_artist_fkey"
      columns: ["artist"]
isOneToOne: false
      referencedRelation: "artists"
      referencedColumns: ["name"]
    },{
      foreignKeyName: "plays_name_artist_fkey"
      columns: ["name","artist"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["name","artist"]
    }
                  ]
                },"tags": {
                  Row: {
                    "name": string,"url": string | null
                  }
                  Insert: {
                    "name": string,"url"?: string | null
                  }
                  Update: {
                    "name"?: string,"url"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"track_tags": {
                  Row: {
                    "artist": string,"count": number | null,"tag": string,"track": string
                  }
                  Insert: {
                    "artist": string,"count"?: number | null,"tag": string,"track": string
                  }
                  Update: {
                    "artist"?: string,"count"?: number | null,"tag"?: string,"track"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tack_tags_name_artist_fkey"
      columns: ["track","artist"]
isOneToOne: false
      referencedRelation: "tracks"
      referencedColumns: ["name","artist"]
    },{
      foreignKeyName: "tack_tags_tag_fkey"
      columns: ["tag"]
isOneToOne: false
      referencedRelation: "tags"
      referencedColumns: ["name"]
    }
                  ]
                },"tracks": {
                  Row: {
                    "album": string,"artist": string,"name": string,"tags_fetched": boolean
                  }
                  Insert: {
                    "album": string,"artist": string,"name": string,"tags_fetched"?: boolean
                  }
                  Update: {
                    "album"?: string,"artist"?: string,"name"?: string,"tags_fetched"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"users": {
                  Row: {
                    "created_at": string,"last_refreshed": string | null,"url": string,"user": string
                  }
                  Insert: {
                    "created_at"?: string,"last_refreshed"?: string | null,"url": string,"user": string
                  }
                  Update: {
                    "created_at"?: string,"last_refreshed"?: string | null,"url"?: string,"user"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "listening_clock": {
                  Row: {
                    "count": number | null,"hour": number | null,"trunc_day": string | null,"trunc_month": string | null,"trunc_week": string | null,"user": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "play_user_fkey"
      columns: ["user"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["user"]
    }
                  ]
                },"listening_clock_day": {
                  Row: {
                    "count": number | null,"date": string | null,"hour": number | null,"user": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "play_user_fkey"
      columns: ["user"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["user"]
    }
                  ]
                },"listening_clock_month": {
                  Row: {
                    "count": number | null,"date": string | null,"hour": number | null,"user": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "play_user_fkey"
      columns: ["user"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["user"]
    }
                  ]
                },"listening_clock_week": {
                  Row: {
                    "count": number | null,"date": string | null,"hour": number | null,"user": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "play_user_fkey"
      columns: ["user"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["user"]
    }
                  ]
                },"play_tags": {
                  Row: {
                    "date": string | null,"tag": string | null,"trunc_day": string | null,"trunc_month": string | null,"trunc_week": string | null,"user": string | null
                  }
                  Relationships: [
                    
                  ]
                },"play_tags_day": {
                  Row: {
                    "count": number | null,"date": string | null,"tag": string | null,"user": string | null
                  }
                  Relationships: [
                    
                  ]
                },"play_tags_month": {
                  Row: {
                    "count": number | null,"date": string | null,"tag": string | null,"user": string | null
                  }
                  Relationships: [
                    
                  ]
                },"play_tags_week": {
                  Row: {
                    "count": number | null,"date": string | null,"tag": string | null,"user": string | null
                  }
                  Relationships: [
                    
                  ]
                },"plays_day": {
                  Row: {
                    "count": number | null,"date": string | null,"user": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "play_user_fkey"
      columns: ["user"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["user"]
    }
                  ]
                },"plays_month": {
                  Row: {
                    "count": number | null,"date": string | null,"user": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "play_user_fkey"
      columns: ["user"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["user"]
    }
                  ]
                },"plays_week": {
                  Row: {
                    "count": number | null,"date": string | null,"user": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "play_user_fkey"
      columns: ["user"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["user"]
    }
                  ]
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const

