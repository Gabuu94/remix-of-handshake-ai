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

    const { task_id, submission_text } = await req.json();
    if (!task_id) throw new Error("Missing task_id");

    // Get task reward
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("reward")
      .eq("id", task_id)
      .single();

    if (taskError || !task) throw new Error("Task not found");

    // Check if already completed
    const { data: existing } = await supabase
      .from("task_completions")
      .select("id")
      .eq("task_id", task_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) throw new Error("Task already completed");

    // Insert completion as approved
    const { error: insertError } = await supabase.from("task_completions").insert({
      user_id: user.id,
      task_id,
      submission_text: submission_text || "",
      status: "approved",
      earned_amount: task.reward,
    });

    if (insertError) throw new Error(insertError.message);

    // Update profile balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    const newBalance = (profile?.balance || 0) + task.reward;
    await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ success: true, earned: task.reward, balance: newBalance }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
