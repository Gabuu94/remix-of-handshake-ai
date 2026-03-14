import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LIPWA_API_KEY = Deno.env.get("LIPWA_API_KEY");
    if (!LIPWA_API_KEY) throw new Error("LIPWA_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { checkout_id } = await req.json();
    if (!checkout_id) throw new Error("checkout_id is required");

    // First check our DB
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("checkout_request_id", checkout_id)
      .single();

    if (payment && payment.status !== "pending") {
      return new Response(
        JSON.stringify({
          status: payment.status === "success" ? "payment.success" : "payment.failed",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check Lipwa API for status
    const statusResponse = await fetch(
      `https://pay.lipwa.app/api/status?ref=${checkout_id}`,
      {
        headers: { Authorization: `Bearer ${LIPWA_API_KEY}` },
      }
    );

    const statusData = await statusResponse.json();

    return new Response(
      JSON.stringify({ status: statusData.status || "payment.queued" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Status check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
