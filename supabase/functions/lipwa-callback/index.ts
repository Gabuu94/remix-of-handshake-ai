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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log("Lipwa callback received:", JSON.stringify(body));

    const { status, checkout_id, mpesa_code, api_ref } = body;

    // Parse api_ref
    let refData: any = {};
    try {
      refData = typeof api_ref === "string" ? JSON.parse(api_ref) : api_ref;
    } catch {
      refData = {};
    }

    // Update payment record
    const { data: payment } = await supabase
      .from("payments")
      .update({
        status: status === "payment.success" ? "success" : "failed",
        mpesa_code: mpesa_code || null,
      })
      .eq("checkout_request_id", checkout_id)
      .select()
      .single();

    // If successful, activate subscription
    if (status === "payment.success" && payment?.subscription_id) {
      const now = new Date();
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("id", payment.subscription_id)
        .single();

      const durationDays = (sub as any)?.plans?.duration_days || 30;
      const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", payment.subscription_id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Callback error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
