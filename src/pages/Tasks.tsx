import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Lock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import PackagePopup from "@/components/PackagePopup";

const categoryFilters = ["All", "CODE", "MATH", "WRITING", "RESEARCH", "EVAL", "SAFETY", "LANG", "DATA"];

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

export default function Tasks() {
  const { isActive } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showPackage, setShowPackage] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: completions } = useQuery({
    queryKey: ["my-completions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("task_completions").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const filteredTasks = tasks?.filter((task) => {
    if (activeFilter === "All") return true;
    const tag = categoryMap[task.category] || task.category.toUpperCase();
    return tag === activeFilter;
  });

  const getCompletion = (taskId: string) => completions?.find(c => c.task_id === taskId);
  const completedCount = completions?.filter(c => c.status === "approved").length || 0;

  // Free accounts: only 1 task allowed
  const freeTaskLimit = 1;
  const hasReachedFreeLimit = !isActive && completedCount >= freeTaskLimit;

  const handleTaskClick = (taskId: string) => {
    if (hasReachedFreeLimit) {
      setShowPackage(true);
      return;
    }
    navigate(`/dashboard/tasks/${taskId}`);
  };

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">💼 Start Earning</h1>
        <p className="text-muted-foreground">Browse and complete tasks to earn KES.</p>
        {!isActive && (
          <div className="mt-2 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-2">
            <p className="text-xs text-yellow-400">
              ⚡ Free account: {freeTaskLimit - completedCount > 0 ? `${freeTaskLimit - completedCount} task remaining` : "Limit reached — upgrade to continue"}
            </p>
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categoryFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "border-purple-500 bg-purple-500/10 text-purple-400"
                : "border-border text-muted-foreground hover:border-purple-500/50 hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {filteredTasks?.map((task) => {
            const completion = getCompletion(task.id);
            const isCompleted = completion?.status === "approved";
            const tag = categoryMap[task.category] || task.category.toUpperCase().slice(0, 6);
            const tagColor = categoryColors[tag] || "bg-purple-500/10 text-purple-400 border-purple-500/30";

            return (
              <div key={task.id} className="flex flex-col rounded-2xl border border-border bg-card p-4">
                <Badge variant="outline" className={`mb-2 w-fit text-[10px] font-semibold ${tagColor}`}>
                  {tag}
                </Badge>
                <h3 className="mb-1 text-sm font-bold leading-tight">{task.title}</h3>
                <p className="mb-2 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                <p className="mb-3 text-xs font-semibold text-green-400">KES {task.reward} per task</p>

                {isCompleted ? (
                  <button className="mt-auto flex w-full items-center justify-center gap-1 rounded-xl bg-green-500/10 py-2 text-xs font-semibold text-green-400">
                    <CheckCircle className="h-3 w-3" /> Completed
                  </button>
                ) : hasReachedFreeLimit ? (
                  <button
                    onClick={() => setShowPackage(true)}
                    className="mt-auto flex w-full items-center justify-center gap-1 rounded-xl bg-purple-500/10 py-2 text-xs font-semibold text-purple-400"
                  >
                    <Lock className="h-3 w-3" /> Upgrade to Unlock
                  </button>
                ) : (
                  <button
                    onClick={() => handleTaskClick(task.id)}
                    className="mt-auto flex w-full items-center justify-center gap-1 rounded-xl bg-green-500 py-2 text-xs font-bold text-white hover:bg-green-600"
                  >
                    Start Earning →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showPackage && <PackagePopup onClose={() => setShowPackage(false)} />}
    </div>
  );
}
