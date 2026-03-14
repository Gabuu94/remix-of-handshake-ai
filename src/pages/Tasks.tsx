import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Lock, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Tasks() {
  const { isActive } = useSubscription();
  const navigate = useNavigate();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const difficultyColor = (d: string | null) => {
    if (d === "easy") return "bg-success/10 text-success border-success/20";
    if (d === "hard") return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-warning/10 text-warning border-warning/20";
  };

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Available Tasks</h1>
        <p className="text-muted-foreground">Browse and complete tasks to earn money.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks?.map((task) => {
            const locked = task.requires_subscription && !isActive;
            return (
              <div
                key={task.id}
                className={`group relative rounded-xl border border-border bg-card p-5 transition-colors ${locked ? "opacity-75" : "hover:border-primary/50 cursor-pointer"}`}
                onClick={() => {
                  if (locked) {
                    navigate("/dashboard/plans");
                  } else {
                    navigate(`/dashboard/tasks/${task.id}`);
                  }
                }}
              >
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
                    <div className="text-center">
                      <Lock className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Subscription Required</p>
                      <Link to="/dashboard/plans" className="mt-2 inline-block text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                        View Plans →
                      </Link>
                    </div>
                  </div>
                )}
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">{task.category}</Badge>
                  <Badge variant="outline" className={`text-xs ${difficultyColor(task.difficulty)}`}>
                    {task.difficulty}
                  </Badge>
                </div>
                <h3 className="mb-2 font-semibold">{task.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">KES {task.reward}</span>
                  {!locked && <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
