import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle, Clock, DollarSign, TrendingUp, Code, Calculator, PenTool, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const taskCategories = [
  { name: "Coding Tasks", description: "Programming & development tasks", icon: Code, category: "Code Review" },
  { name: "Math Tasks", description: "Mathematical computations", icon: Calculator, category: "Mathematics" },
  { name: "Writing Tasks", description: "Content creation & writing", icon: PenTool, category: "Research & Writing" },
  { name: "Research Tasks", description: "Data research & analysis", icon: Search, category: "Data Annotation" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { subscription, isActive } = useSubscription();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: tasks } = useQuery({
    queryKey: ["all-tasks-count"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").eq("is_active", true);
      return data || [];
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

  const totalTasks = tasks?.length || 0;
  const completedTasks = completions?.filter(c => c.status === "approved").length || 0;
  const totalEarned = completions?.filter(c => c.status === "approved").reduce((sum, c) => sum + (c.earned_amount || 0), 0) || 0;
  const availableTasks = totalTasks - (completions?.length || 0);
  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  const stats = [
    { label: "Available Tasks", value: availableTasks > 0 ? availableTasks : totalTasks, sub: `${totalTasks} total`, icon: TrendingUp },
    { label: "Total Earned", value: `KES ${totalEarned}`, sub: `${completedTasks} tasks paid`, icon: DollarSign },
    { label: "Completed", value: completedTasks, sub: "Keep it up!", icon: CheckCircle },
    { label: "Tasks Available", value: totalTasks, sub: "New tasks added daily", icon: Clock },
  ];

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="text-muted-foreground">You have {availableTasks > 0 ? availableTasks : totalTasks} tasks available. Let's get to work.</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-primary">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Subscription CTA */}
      {!isActive && (
        <div className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="mb-2 text-lg font-semibold">Unlock Tasks</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Subscribe to a plan to start completing tasks and earning money.
          </p>
          <Link to="/dashboard/plans">
            <Button>View Plans</Button>
          </Link>
        </div>
      )}

      {/* Browse Tasks */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">Browse Tasks</h2>
        <Link to="/dashboard/tasks" className="flex items-center gap-1 text-sm text-primary hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {taskCategories.map((cat) => (
          <div key={cat.name} className="rounded-xl border border-border bg-card p-5">
            <cat.icon className="mb-4 h-8 w-8 text-primary" />
            <h3 className="font-semibold">{cat.name}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{cat.description}</p>
            <Link to="/dashboard/tasks">
              <Button className="w-full gap-2" size="sm">
                View Tasks <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
