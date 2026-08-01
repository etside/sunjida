import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check super admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (path === "stats") {
      // Platform-wide stats
      const [tenantsResult, usersResult, conversationsResult] = await Promise.all([
        supabase.from("tenants").select("id, plan", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("agent_conversations").select("id", { count: "exact" }),
      ]);

      const planCounts: Record<string, number> = {};
      tenantsResult.data?.forEach((t) => {
        const plan = t.plan || "free";
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      });

      return new Response(
        JSON.stringify({
          total_tenants: tenantsResult.count || 0,
          total_users: usersResult.count || 0,
          total_conversations: conversationsResult.count || 0,
          plan_distribution: planCounts,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path === "tenants" && req.method === "GET") {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ tenants: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "tenants" && req.method === "PUT") {
      const body = await req.json();
      const { tenantId, plan, feature_gates, trial_ends_at, sales_daddy_prompt } = body;

      if (!tenantId) {
        return new Response(JSON.stringify({ error: "tenantId is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updateData: Record<string, unknown> = {};
      if (plan) updateData.plan = plan;
      if (feature_gates) updateData.feature_gates = feature_gates;
      if (trial_ends_at) updateData.trial_ends_at = trial_ends_at;
      if (sales_daddy_prompt !== undefined) updateData.sales_daddy_prompt = sales_daddy_prompt;

      const { data, error } = await supabase
        .from("tenants")
        .update(updateData)
        .eq("id", tenantId)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await supabase.from("audit_logs").insert({
        tenant_id: tenantId,
        actor: user.email || user.id,
        action: "tenant_update",
        resource: "tenants",
        resource_id: tenantId,
        details: updateData,
      });

      return new Response(JSON.stringify({ tenant: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "audit-logs" && req.method === "GET") {
      const tenantId = url.searchParams.get("tenant_id");
      const action = url.searchParams.get("action");
      const limit = parseInt(url.searchParams.get("limit") || "50");

      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (tenantId) query = query.eq("tenant_id", tenantId);
      if (action) query = query.eq("action", action);

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ logs: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
