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

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid authentication");

    const { amount, phone_number, plan_id } = await req.json();

    if (!amount || !phone_number || !plan_id) {
      throw new Error("Missing required fields: amount, phone_number, plan_id");
    }

    if (amount < 10) throw new Error("Minimum amount is KES 10");

    // Create subscription record
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id,
        status: "pending",
      })
      .select()
      .single();

    if (subError) throw new Error(`Subscription error: ${subError.message}`);

    // Get the edge function URL for callback
    const callbackUrl = `${supabaseUrl}/functions/v1/lipwa-callback`;

    // Send STK Push via Lipwa
    const lipwaResponse = await fetch("https://pay.lipwa.app/api/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LIPWA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        phone_number,
        channel_id: "CH_F02EB871",
        callback_url: callbackUrl,
        api_ref: JSON.stringify({
          user_id: user.id,
          subscription_id: subscription.id,
          plan_id,
        }),
      }),
    });

    const lipwaData = await lipwaResponse.json();

    if (!lipwaResponse.ok) {
      throw new Error(`Lipwa error: ${JSON.stringify(lipwaData)}`);
    }

    // Save payment record
    const { error: payError } = await supabase.from("payments").insert({
      user_id: user.id,
      subscription_id: subscription.id,
      amount,
      phone_number,
      checkout_request_id: lipwaData.CheckoutRequestID,
      merchant_request_id: lipwaData.MerchantRequestID,
      status: "pending",
    });

    if (payError) console.error("Payment record error:", payError);

    return new Response(
      JSON.stringify({
        success: true,
        checkout_request_id: lipwaData.CheckoutRequestID,
        message: lipwaData.CustomerMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
