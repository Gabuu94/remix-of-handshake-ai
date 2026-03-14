import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Clock, CheckCircle, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const categoryFilters = ["All", "CODE", "MATH", "WRITING", "RESEARCH", "EVAL", "SAFETY", "LANG", "DATA"];

const categoryMap: Record<string, string> = {
  "Code Review": "CODE",
  "Mathematics": "MATH",
  "Research & Writing": "WRITING",
  "Data Annotation": "DATA",
  "AI Evaluation": "EVAL",
  "Safety & Alignment": "SAFETY",
  "Prompt Engineering": "CODE",
  "Translation": "LANG",
  "Creative Writing": "WRITING",
  "Documentation": "WRITING",
};

const categoryColors: Record<string, string> = {
  CODE: "bg-primary/10 text-primary border-primary/30",
  MATH: "bg-destructive/10 text-destructive border-destructive/30",
  WRITING: "bg-warning/10 text-warning border-warning/30",
  RESEARCH: "bg-success/10 text-success border-success/30",
  EVAL: "bg-primary/10 text-primary border-primary/30",
  SAFETY: "bg-destructive/10 text-destructive border-destructive/30",
  LANG: "bg-warning/10 text-warning border-warning/30",
  DATA: "bg-success/10 text-success border-success/30",
};

export default function Tasks() {
  const { isActive } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

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

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">Browse and start available tasks. Click "Start Task" to begin.</p>
      </div>

      {/* Category Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categoryFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks?.map((task) => {
            const locked = task.requires_subscription && !isActive;
            const completion = getCompletion(task.id);
            const isCompleted = completion?.status === "approved";
            const tag = categoryMap[task.category] || task.category.toUpperCase().slice(0, 6);
            const tagColor = categoryColors[tag] || "bg-primary/10 text-primary border-primary/30";
            const estimatedTime = task.difficulty === "easy" ? "~5 min" : task.difficulty === "hard" ? "~40 min" : "~30 min";

            return (
              <div
                key={task.id}
                className={`group flex flex-col rounded-xl border bg-card transition-colors ${
                  isCompleted ? "border-success/40" : locked ? "border-destructive/20" : "border-border hover:border-primary/50"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-4 pb-0">
                  <Badge variant="outline" className={`text-xs font-semibold ${tagColor}`}>
                    {tag}
                  </Badge>
                  <div className="flex items-center gap-1 text-lg font-bold">
                    {isCompleted && <Sparkles className="h-4 w-4 text-primary" />}
                    KES {task.reward}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-4">
                  <h3 className="mb-2 font-semibold leading-tight">{task.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-xs ${isCompleted ? "border-success/30 text-success" : "border-success/30 text-success"}`}>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {isCompleted ? "Completed" : "Available"}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {estimatedTime}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-0">
                  {isCompleted ? (
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-success/10 py-2.5 text-sm font-semibold text-success">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </button>
                  ) : locked ? (
                    <button
                      onClick={() => navigate("/dashboard/plans")}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Lock className="h-4 w-4" />
                      Unlock with Subscription
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Start Task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
