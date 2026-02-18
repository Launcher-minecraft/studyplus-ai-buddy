import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { key } = await req.json();
    if (!key || typeof key !== "string" || key.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Clé invalide." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find unused key server-side (user never sees the keys)
    const { data: keyData, error: findError } = await supabase
      .from("vip_keys")
      .select("id")
      .eq("key", key.trim())
      .eq("used", false)
      .single();

    if (findError || !keyData) {
      return new Response(JSON.stringify({ error: "Clé VIP invalide ou déjà utilisée." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark key as used
    const { error: updateKeyError } = await supabase
      .from("vip_keys")
      .update({ used: true, used_by: user.id })
      .eq("id", keyData.id);

    if (updateKeyError) throw new Error("Failed to activate key");

    // Upgrade profile
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ subscription_status: "vip" })
      .eq("user_id", user.id);

    if (updateProfileError) throw new Error("Failed to upgrade profile");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("activate-vip error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
