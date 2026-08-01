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
      agent_conversations: {
        Row: {
          business_id: string | null
          channel: string
          created_at: string
          customer_contact: string | null
          customer_name: string | null
          external_id: string | null
          id: string
          lang: string
          lead_id: string | null
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          channel?: string
          created_at?: string
          customer_contact?: string | null
          customer_name?: string | null
          external_id?: string | null
          id?: string
          lang?: string
          lead_id?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          channel?: string
          created_at?: string
          customer_contact?: string | null
          customer_name?: string | null
          external_id?: string | null
          id?: string
          lang?: string
          lead_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_settings: {
        Row: {
          business_id: string | null
          business_name: string
          created_at: string
          greeting_bn: string
          greeting_en: string
          id: string
          instructions: string
          is_enabled: boolean
          model: string
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          business_name?: string
          created_at?: string
          greeting_bn?: string
          greeting_en?: string
          id?: string
          instructions?: string
          is_enabled?: boolean
          model?: string
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          business_name?: string
          created_at?: string
          greeting_bn?: string
          greeting_en?: string
          id?: string
          instructions?: string
          is_enabled?: boolean
          model?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_api_keys: {
        Row: {
          business_id: string
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_api_keys_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_integrations: {
        Row: {
          auth_header_name: string | null
          auth_header_value: string | null
          business_id: string
          created_at: string
          extra_headers: Json
          id: string
          last_error: string | null
          last_status: string | null
          last_sync_at: string | null
          order_create_url: string | null
          product_detail_url: string | null
          products_url: string | null
          updated_at: string
        }
        Insert: {
          auth_header_name?: string | null
          auth_header_value?: string | null
          business_id: string
          created_at?: string
          extra_headers?: Json
          id?: string
          last_error?: string | null
          last_status?: string | null
          last_sync_at?: string | null
          order_create_url?: string | null
          product_detail_url?: string | null
          products_url?: string | null
          updated_at?: string
        }
        Update: {
          auth_header_name?: string | null
          auth_header_value?: string | null
          business_id?: string
          created_at?: string
          extra_headers?: Json
          id?: string
          last_error?: string | null
          last_status?: string | null
          last_sync_at?: string | null
          order_create_url?: string | null
          product_detail_url?: string | null
          products_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_products: {
        Row: {
          business_id: string
          created_at: string
          currency: string
          description: string | null
          external_id: string
          id: string
          image_url: string | null
          name: string
          price: number | null
          product_url: string | null
          raw: Json | null
          stock_quantity: number | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          currency?: string
          description?: string | null
          external_id: string
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          product_url?: string | null
          raw?: Json | null
          stock_quantity?: number | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          external_id?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          product_url?: string | null
          raw?: Json | null
          stock_quantity?: number | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_training_docs: {
        Row: {
          business_id: string
          content: string
          created_at: string
          doc_type: string
          id: string
          is_enabled: boolean
          lang: string
          title: string
          updated_at: string
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string
          doc_type?: string
          id?: string
          is_enabled?: boolean
          lang?: string
          title: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string
          doc_type?: string
          id?: string
          is_enabled?: boolean
          lang?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_training_docs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          industry: string | null
          is_active: boolean
          name: string
          owner_id: string
          plan: string
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          name: string
          owner_id: string
          plan?: string
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          name?: string
          owner_id?: string
          plan?: string
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          project_type: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          project_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          project_type?: string | null
        }
        Relationships: []
      }
      lead_orders: {
        Row: {
          business_id: string
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          external_order_ref: string | null
          id: string
          items: Json
          lead_id: string | null
          push_attempts: number
          push_response: Json | null
          push_status: string
          shipping_address: string | null
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_order_ref?: string | null
          id?: string
          items?: Json
          lead_id?: string | null
          push_attempts?: number
          push_response?: Json | null
          push_status?: string
          shipping_address?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_order_ref?: string | null
          id?: string
          items?: Json
          lead_id?: string | null
          push_attempts?: number
          push_response?: Json | null
          push_status?: string
          shipping_address?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_orders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_id: string
          category: string
          channel: string
          conversation_id: string | null
          created_at: string
          customer_contact: string | null
          customer_name: string | null
          estimated_value: number | null
          id: string
          intent_score: number
          lang: string
          notes: string | null
          stage: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: string
          channel?: string
          conversation_id?: string | null
          created_at?: string
          customer_contact?: string | null
          customer_name?: string | null
          estimated_value?: number | null
          id?: string
          intent_score?: number
          lang?: string
          notes?: string | null
          stage?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: string
          channel?: string
          conversation_id?: string | null
          created_at?: string
          customer_contact?: string | null
          customer_name?: string | null
          estimated_value?: number | null
          id?: string
          intent_score?: number
          lang?: string
          notes?: string | null
          stage?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_channels: {
        Row: {
          access_token: string
          app_secret: string | null
          business_id: string | null
          channel: string
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          last_event_at: string | null
          page_id: string | null
          phone_number_id: string | null
          updated_at: string
          verify_token: string
        }
        Insert: {
          access_token: string
          app_secret?: string | null
          business_id?: string | null
          channel: string
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          last_event_at?: string | null
          page_id?: string | null
          phone_number_id?: string | null
          updated_at?: string
          verify_token: string
        }
        Update: {
          access_token?: string
          app_secret?: string | null
          business_id?: string | null
          channel?: string
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          last_event_at?: string | null
          page_id?: string | null
          phone_number_id?: string | null
          updated_at?: string
          verify_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_channels_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sharee_products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: string
          shipping_city: string
          shipping_cost: number | null
          shipping_district: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address: string
          shipping_city: string
          shipping_cost?: number | null
          shipping_district?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_cost?: number | null
          shipping_district?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          alt_text: string | null
          aspect_ratio: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          project_id: string
        }
        Insert: {
          alt_text?: string | null
          aspect_ratio?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          project_id: string
        }
        Update: {
          alt_text?: string | null
          aspect_ratio?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          category: string
          client: string | null
          cover_image_url: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          location: string | null
          slug: string
          title: string
          updated_at: string
          year: string
        }
        Insert: {
          category: string
          client?: string | null
          cover_image_url: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          slug: string
          title: string
          updated_at?: string
          year: string
        }
        Update: {
          category?: string
          client?: string | null
          cover_image_url?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          slug?: string
          title?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          review_text: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          review_text?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          review_text?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sharee_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sharee_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      sharee_product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sharee_product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sharee_products"
            referencedColumns: ["id"]
          },
        ]
      }
      sharee_products: {
        Row: {
          care_instructions: string | null
          category_id: string | null
          color: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          fabric_type: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          sale_price: number | null
          sku: string | null
          slug: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          care_instructions?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          fabric_type?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          sale_price?: number | null
          sku?: string | null
          slug: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          care_instructions?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          fabric_type?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          sale_price?: number | null
          sku?: string | null
          slug?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sharee_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "sharee_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          feature_gates: Json | null
          id: string
          is_active: boolean
          name: string
          onboarding_completed: boolean | null
          onboarding_data: Json | null
          plan: string | null
          privacy_level: string | null
          sales_daddy_prompt: string | null
          security_flags: Json | null
          slug: string
          timezone: string
          trial_ends_at: string | null
        }
        Insert: {
          created_at?: string
          feature_gates?: Json | null
          id?: string
          is_active?: boolean
          name: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          plan?: string | null
          privacy_level?: string | null
          sales_daddy_prompt?: string | null
          security_flags?: Json | null
          slug: string
          timezone?: string
          trial_ends_at?: string | null
        }
        Update: {
          created_at?: string
          feature_gates?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          plan?: string | null
          privacy_level?: string | null
          sales_daddy_prompt?: string | null
          security_flags?: Json | null
          slug?: string
          timezone?: string
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      inventory_products: {
        Row: {
          attributes: Json | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          external_id: string | null
          id: string
          name: string
          price: number | null
          sku: string | null
          source: string | null
          stock_quantity: number | null
          synced_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attributes?: Json | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          name: string
          price?: number | null
          sku?: string | null
          source?: string | null
          stock_quantity?: number | null
          synced_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attributes?: Json | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          name?: string
          price?: number | null
          sku?: string | null
          source?: string | null
          stock_quantity?: number | null
          synced_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          details: Json | null
          id: string
          ip: string | null
          resource: string | null
          resource_id: string | null
          tenant_id: string
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          details?: Json | null
          id?: string
          ip?: string | null
          resource?: string | null
          resource_id?: string | null
          tenant_id: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip?: string | null
          resource?: string | null
          resource_id?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      feature_gate_definitions: {
        Row: {
          created_at: string
          description: string | null
          feature_key: string
          id: string
          min_plan: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          feature_key: string
          id?: string
          min_plan?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          feature_key?: string
          id?: string
          min_plan?: string | null
          name?: string
        }
        Relationships: []
      }
      credentials: {
        Row: {
          account_name: string | null
          api_key_encrypted: string
          created_at: string
          id: string
          provider: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          api_key_encrypted: string
          created_at?: string
          id?: string
          provider: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          api_key_encrypted?: string
          created_at?: string
          id?: string
          provider?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credentials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_business: { Args: { _business_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "customer" | "super_admin"
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
      app_role: ["admin", "customer"],
    },
  },
} as const
