import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, CheckCircle, Clock, TrendingUp } from "lucide-react";

export default function Earnings() {
  const { user } = useAuth();

  const { data: completions, isLoading } = useQuery({
    queryKey: ["earnings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_completions")
        .select("*, tasks(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalEarned = completions?.filter(c => c.status === "approved").reduce((sum, c) => sum + (c.earned_amount || 0), 0) || 0;
  const pendingEarnings = completions?.filter(c => c.status === "submitted").reduce((sum, c) => sum + (c.earned_amount || 0), 0) || 0;
  const totalTasks = completions?.length || 0;

  const stats = [
    { label: "Total Earned", value: `KES ${totalEarned}`, icon: DollarSign },
    { label: "Pending Earnings", value: `KES ${pendingEarnings}`, icon: Clock },
    { label: "Tasks Done", value: totalTasks, icon: CheckCircle },
    { label: "Avg Per Task", value: `KES ${totalTasks > 0 ? Math.round(totalEarned / totalTasks) : 0}`, icon: TrendingUp },
  ];

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">Track your earnings and completed tasks.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">Transaction History</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : completions?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No transactions yet. Complete tasks to start earning!</div>
        ) : (
          <div className="divide-y divide-border">
            {completions?.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{c.tasks?.title || "Task"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">KES {c.earned_amount || 0}</p>
                  <p className={`text-xs capitalize ${c.status === "approved" ? "text-success" : c.status === "rejected" ? "text-destructive" : "text-warning"}`}>
                    {c.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
