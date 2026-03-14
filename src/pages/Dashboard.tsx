import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, DollarSign, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { subscription, isActive } = useSubscription();

  const { data: completions } = useQuery({
    queryKey: ["completions-stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_completions")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const totalEarned = completions?.filter(c => c.status === "approved").reduce((sum, c) => sum + (c.earned_amount || 0), 0) || 0;
  const tasksCompleted = completions?.filter(c => c.status === "approved").length || 0;
  const tasksPending = completions?.filter(c => c.status === "submitted").length || 0;

  const stats = [
    { label: "Total Earned", value: `KES ${totalEarned}`, icon: DollarSign, color: "text-primary" },
    { label: "Tasks Completed", value: tasksCompleted, icon: CheckCircle, color: "text-success" },
    { label: "Pending Review", value: tasksPending, icon: Clock, color: "text-warning" },
    { label: "Subscription", value: isActive ? "Active" : "Inactive", icon: ListTodo, color: isActive ? "text-success" : "text-destructive" },
  ];

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {!isActive && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="mb-2 text-lg font-semibold">Unlock Tasks</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Subscribe to a plan to start completing tasks and earning money.
          </p>
          <Link to="/dashboard/plans">
            <Button>View Plans</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
