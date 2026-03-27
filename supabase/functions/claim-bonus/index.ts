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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid authentication");

    // Check if bonus already claimed
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance, welcome_bonus_claimed")
      .eq("user_id", user.id)
      .single();

    if (profile?.welcome_bonus_claimed) {
      return new Response(
        JSON.stringify({ success: false, error: "Bonus already claimed", balance: profile.balance }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credit KES 600 bonus
    const newBalance = (profile?.balance || 0) + 600;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ balance: newBalance, welcome_bonus_claimed: true })
      .eq("user_id", user.id);

    if (updateError) throw new Error(updateError.message);

    return new Response(
      JSON.stringify({ success: true, balance: newBalance }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
