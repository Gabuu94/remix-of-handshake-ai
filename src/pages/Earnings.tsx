import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, TrendingUp, Calendar, CheckCircle, Wallet } from "lucide-react";
import { useState, useMemo } from "react";
import WithdrawModal from "@/components/WithdrawModal";

export default function Earnings() {
  const { user } = useAuth();
  const [showWithdraw, setShowWithdraw] = useState(false);

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
  const totalTasks = completions?.filter(c => c.status === "approved").length || 0;

  // Weekly earnings
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeek = completions?.filter(c => c.status === "approved" && new Date(c.created_at) >= weekStart).reduce((sum, c) => sum + (c.earned_amount || 0), 0) || 0;
  const thisMonth = completions?.filter(c => c.status === "approved" && new Date(c.created_at) >= monthStart).reduce((sum, c) => sum + (c.earned_amount || 0), 0) || 0;

  // Weekly chart data (last 7 days)
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = Array(7).fill(0);
    completions?.filter(c => c.status === "approved" && new Date(c.created_at) >= weekStart).forEach(c => {
      const day = new Date(c.created_at).getDay();
      data[day] += (c.earned_amount || 0);
    });
    const max = Math.max(...data, 1);
    return days.map((name, i) => ({ name, value: data[i], height: (data[i] / max) * 100 }));
  }, [completions]);

  const stats = [
    { label: "This Week", value: `KES ${thisWeek}`, sub: "Current week", icon: DollarSign },
    { label: "This Month", value: `KES ${thisMonth}`, sub: "Current month", icon: TrendingUp },
    { label: "All Time", value: `KES ${totalEarned}`, sub: `${totalTasks} tasks`, icon: Calendar },
    { label: "Tasks Completed", value: totalTasks, sub: "Total submissions", icon: CheckCircle },
  ];

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">Track your income and payment history.</p>
      </div>

      {/* Withdraw Funds */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Withdraw Funds</p>
              <p className="text-sm text-muted-foreground">Transfer your earnings to M-Pesa or PayPal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="text-xl font-bold text-primary">KES {totalEarned}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowWithdraw(true)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-secondary/30 p-6 transition-colors hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
              <span className="text-lg font-bold text-green-400">M</span>
            </div>
            <p className="font-medium">M-Pesa</p>
            <p className="text-xs text-muted-foreground">Instant transfer</p>
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-secondary/30 p-6 transition-colors hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
              <span className="text-sm font-bold text-blue-400">PP</span>
            </div>
            <p className="font-medium">PayPal</p>
            <p className="text-xs text-muted-foreground">1-3 business days</p>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-primary">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Earnings Chart */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-semibold">Weekly Earnings</h3>
        <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
          {chartData.map((d) => (
            <div key={d.name} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">KES {d.value}</span>
              <div
                className="w-full rounded-t-md bg-primary transition-all"
                style={{ height: `${Math.max(d.height, 4)}%`, minHeight: 4 }}
              />
              <span className="text-xs text-muted-foreground">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
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
                  <p className={`text-xs capitalize ${c.status === "approved" ? "text-green-400" : c.status === "rejected" ? "text-destructive" : "text-yellow-400"}`}>
                    {c.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showWithdraw && (
        <WithdrawModal
          balance={totalEarned}
          onClose={() => setShowWithdraw(false)}
        />
      )}
    </div>
  );
}
