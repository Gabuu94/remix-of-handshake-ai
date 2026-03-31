import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import PackagePopup from "@/components/PackagePopup";
import { formatMoney } from "@/lib/currency";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isActive } = useSubscription();
  const queryClient = useQueryClient();
  const [submission, setSubmission] = useState("");
  const [showPackage, setShowPackage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: existing } = useQuery({
    queryKey: ["completion", id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("task_completions").select("*").eq("task_id", id!).eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: completions } = useQuery({
    queryKey: ["my-completions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("task_completions").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const completedCount = completions?.filter(c => c.status === "approved").length || 0;
  const hasReachedFreeLimit = !isActive && completedCount >= 2;

  const handleSubmit = async () => {
    if (hasReachedFreeLimit) { setShowPackage(true); return; }
    if (!submission.trim()) { toast.error("Please enter your submission"); return; }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("complete-task", {
        body: { task_id: id, submission_text: submission },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to submit");

      toast.success(`Task completed! You earned ${formatMoney(data.earned)}. Balance: ${formatMoney(data.balance)}`);
      queryClient.invalidateQueries({ queryKey: ["completion", id] });
      queryClient.invalidateQueries({ queryKey: ["my-completions"] });
      queryClient.invalidateQueries({ queryKey: ["profile-balance"] });
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
      queryClient.invalidateQueries({ queryKey: ["completions-stats"] });
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (!task) {
    return <div className="py-20 text-center text-muted-foreground">Task not found</div>;
  }

  return (
    <div className="mx-auto max-w-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </button>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="outline">{task.category}</Badge>
          <Badge variant="outline">{task.difficulty}</Badge>
        </div>
        <h1 className="mb-2 text-2xl font-bold">{task.title}</h1>
        <p className="mb-6 text-muted-foreground">{task.description}</p>
        <div className="mb-6 text-2xl font-bold text-green-400">{formatMoney(task.reward)}</div>

        {hasReachedFreeLimit && !existing ? (
          <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-6 text-center">
            <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Free Task Limit Reached</h3>
            <p className="mb-4 text-sm text-muted-foreground">Upgrade your account to continue earning with unlimited tasks.</p>
            <Button onClick={() => setShowPackage(true)} className="bg-purple-500 hover:bg-purple-600">View Packages</Button>
          </div>
        ) : existing ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
            <p className="font-medium text-green-400">✓ Completed — {formatMoney(existing.earned_amount || 0)} earned</p>
            {existing.submission_text && <p className="mt-2 text-sm text-muted-foreground">{existing.submission_text}</p>}
          </div>
        ) : (
          <div>
            <h3 className="mb-3 font-semibold">Submit Your Response</h3>
            <Textarea placeholder="Enter your task submission here..." value={submission} onChange={(e) => setSubmission(e.target.value)} className="mb-4 min-h-[150px]" />
            <Button onClick={handleSubmit} disabled={!submission.trim() || submitting} className="bg-green-500 hover:bg-green-600">
              {submitting ? "Submitting..." : "Submit Task"}
            </Button>
          </div>
        )}
      </div>

      {showPackage && <PackagePopup onClose={() => setShowPackage(false)} />}
    </div>
  );
}
