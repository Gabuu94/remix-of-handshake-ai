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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid authentication");

    const { mpesa_message, plan_id, expected_amount } = await req.json();

    if (!mpesa_message || !plan_id || !expected_amount) {
      throw new Error("Missing required fields");
    }

    // Parse the M-Pesa message
    const msg = mpesa_message.toUpperCase();

    // Check it's paid to GURUTECH INVESTORS or FINTECH VENTURES LCC
    if (!msg.includes("GURUTECH INVESTORS") && !msg.includes("FINTECH VENTURES LCC") && !msg.includes("FINTECH VENTURES")) {
      throw new Error("Payment must be made to GURUTECH INVESTORS or FINTECH VENTURES LCC (Till 7172200). Please check and try again.");
    }

    // Extract amount from message - patterns like "Ksh300.00" or "KSH 300.00" or "Ksh1,300.00"
    const amountMatch = msg.match(/KSH?\s?([\d,]+(?:\.\d{2})?)/i);
    if (!amountMatch) {
      throw new Error("Could not find the payment amount in your message. Please paste the full M-Pesa SMS.");
    }

    const paidAmount = parseFloat(amountMatch[1].replace(/,/g, ""));
    
    if (paidAmount < expected_amount) {
      throw new Error(`Amount paid (KSh ${paidAmount}) is less than required (KSh ${expected_amount}). Please pay the correct amount.`);
    }

    // Extract M-Pesa code (first word, usually like "SJ12ABC123")
    const codeMatch = mpesa_message.trim().match(/^([A-Z0-9]{8,12})/i);
    const mpesaCode = codeMatch ? codeMatch[1].toUpperCase() : null;

    // Check if this M-Pesa code was already used
    if (mpesaCode) {
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("mpesa_code", mpesaCode)
        .maybeSingle();

      if (existingPayment) {
        throw new Error("This M-Pesa confirmation message has already been used. Please make a new payment.");
      }
    }

    // Create subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id,
        status: "active",
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (subError) throw new Error(`Subscription error: ${subError.message}`);

    // Save payment record
    await supabase.from("payments").insert({
      user_id: user.id,
      subscription_id: subscription.id,
      amount: paidAmount,
      phone_number: "manual",
      mpesa_code: mpesaCode,
      status: "completed",
    });

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
