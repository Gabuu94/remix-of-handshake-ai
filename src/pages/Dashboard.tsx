import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useBalance } from "@/hooks/useBalance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import WithdrawModal from "@/components/WithdrawModal";
import PackagePopup from "@/components/PackagePopup";
import LiveWithdrawalBar from "@/components/LiveWithdrawalBar";
import { formatMoney, formatRewardRange } from "@/lib/currency";

const categoryMap: Record<string, string> = {
  "Code Review": "CODE", "Mathematics": "MATH", "Research & Writing": "WRITING",
  "Data Annotation": "DATA", "AI Evaluation": "EVAL", "Safety & Alignment": "SAFETY",
  "Prompt Engineering": "CODE", "Translation": "LANG", "Creative Writing": "WRITING", "Documentation": "WRITING",
};

const categoryColors: Record<string, string> = {
  CODE: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  MATH: "bg-red-500/10 text-red-400 border-red-500/30",
  WRITING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  RESEARCH: "bg-green-500/10 text-green-400 border-green-500/30",
  EVAL: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  SAFETY: "bg-red-500/10 text-red-400 border-red-500/30",
  LANG: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  DATA: "bg-green-500/10 text-green-400 border-green-500/30",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { isActive } = useSubscription();
  const { balance } = useBalance();
  const navigate = useNavigate();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showPackagePopup, setShowPackagePopup] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: completions } = useQuery({
    queryKey: ["completions-stats", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("task_completions").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const tasksCompleted = completions?.filter(c => c.status === "approved").length || 0;
  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  const mustUpgrade = !isActive;

  useEffect(() => {
    if (!isActive) {
      const timer = setTimeout(() => setShowPackagePopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleTaskClick = (taskId: string) => {
    if (hasReachedFreeLimit) {
      setShowPackagePopup(true);
      return;
    }
    navigate(`/dashboard/tasks/${taskId}`);
  };

  const getCompletion = (taskId: string) => completions?.find(c => c.task_id === taskId);

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Welcome back,</p>
          <h1 className="text-lg font-bold">{firstName}</h1>
        </div>
        <span className="text-base">✅</span>
      </div>

      {/* Balance Card */}
      <div className="mb-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">💰</span>
              <span className="text-[10px] text-muted-foreground">Available Balance</span>
            </div>
            <p className="text-xl font-bold">{formatMoney(balance)}</p>
          </div>
          <button
            onClick={() => setShowWithdraw(true)}
            className="flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2 text-xs font-bold text-white hover:bg-green-600"
          >
            💸 Withdraw
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card px-2 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Tasks</p>
          <p className="text-sm font-bold">400+</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-2 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Available</p>
          <p className="text-sm font-bold">24 hrs</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-2 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Active Users</p>
          <p className="text-sm font-bold">1,205</p>
        </div>
      </div>

      {/* Live Withdrawals Bar */}
      <LiveWithdrawalBar />

      {/* Free plan notice */}
      {!isActive && (
        <div className="mb-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-1.5">
          <p className="text-[11px] text-yellow-400">
            ⚡ Free: {FREE_TASK_LIMIT - tasksCompleted > 0 ? `${FREE_TASK_LIMIT - tasksCompleted} surveys left` : "Limit reached — upgrade"}
          </p>
        </div>
      )}

      {/* Start Earning - All Surveys */}
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
          <span>💼</span> Start Earning
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {tasks?.map((task) => {
            const completion = getCompletion(task.id);
            const isCompleted = completion?.status === "approved";
            const tag = categoryMap[task.category] || task.category.toUpperCase().slice(0, 6);
            const tagColor = categoryColors[tag] || "bg-purple-500/10 text-purple-400 border-purple-500/30";

            return (
              <div key={task.id} className="flex flex-col rounded-2xl border border-border bg-card p-3">
                <h3 className="mb-1 text-xs font-bold leading-tight">{task.title}</h3>
                <p className="mb-1.5 text-[10px] text-muted-foreground line-clamp-2">{task.description}</p>
                <p className="mb-2 text-[11px] font-semibold text-green-400">{formatRewardRange(task.reward)}</p>

                {isCompleted ? (
                  <button className="mt-auto flex w-full items-center justify-center gap-1 rounded-xl bg-green-500/10 py-1.5 text-[10px] font-semibold text-green-400">
                    <CheckCircle className="h-3 w-3" /> Completed
                  </button>
                ) : hasReachedFreeLimit ? (
                  <button
                    onClick={() => setShowPackagePopup(true)}
                    className="mt-auto flex w-full items-center justify-center gap-1 rounded-xl bg-purple-500/10 py-1.5 text-[10px] font-semibold text-purple-400"
                  >
                    <Lock className="h-3 w-3" /> Upgrade
                  </button>
                ) : (
                  <button
                    onClick={() => handleTaskClick(task.id)}
                    className="mt-auto flex w-full items-center justify-center gap-1 rounded-xl bg-green-500 py-1.5 text-[10px] font-bold text-white hover:bg-green-600"
                  >
                    Start Earning →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showWithdraw && (
        <WithdrawModal balance={balance} onClose={() => setShowWithdraw(false)} isActive={isActive} />
      )}

      {showPackagePopup && (
        <PackagePopup onClose={() => setShowPackagePopup(false)} />
      )}
    </div>
  );
}
