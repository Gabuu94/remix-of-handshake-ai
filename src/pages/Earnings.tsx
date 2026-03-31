import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useBalance } from "@/hooks/useBalance";
import { DollarSign, TrendingUp, Calendar, CheckCircle, Wallet } from "lucide-react";
import { useState, useMemo } from "react";
import WithdrawModal from "@/components/WithdrawModal";
import PackagePopup from "@/components/PackagePopup";
import { formatMoney } from "@/lib/currency";

export default function Earnings() {
  const { user } = useAuth();
  const { isActive } = useSubscription();
  const { balance } = useBalance();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showPackage, setShowPackage] = useState(false);

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

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeek = completions?.filter(c => c.status === "approved" && new Date(c.created_at) >= weekStart).reduce((sum, c) => sum + (c.earned_amount || 0), 0) || 0;
  const thisMonth = completions?.filter(c => c.status === "approved" && new Date(c.created_at) >= monthStart).reduce((sum, c) => sum + (c.earned_amount || 0), 0) || 0;

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

  const handleWithdraw = () => {
    if (!isActive) { setShowPackage(true); return; }
    setShowWithdraw(true);
  };

  const stats = [
    { label: "This Week", value: formatMoney(thisWeek), sub: "Current week", icon: DollarSign },
    { label: "This Month", value: formatMoney(thisMonth), sub: "Current month", icon: TrendingUp },
    { label: "All Time", value: formatMoney(totalEarned), sub: `${totalTasks} tasks`, icon: Calendar },
    { label: "Tasks Done", value: totalTasks, sub: "Total submissions", icon: CheckCircle },
  ];

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">Track your income and withdraw funds.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-green-400" />
            <div>
              <p className="font-semibold">Available Balance</p>
              <p className="text-2xl font-bold text-green-400">{formatMoney(balance)}</p>
            </div>
          </div>
          <button onClick={handleWithdraw} className="rounded-xl bg-green-500 px-6 py-2 text-sm font-bold text-white hover:bg-green-600">
            💸 Withdraw
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-green-400" />
            </div>
            <p className="mt-2 text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-green-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 font-semibold">Weekly Earnings</h3>
        <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
          {chartData.map((d) => (
            <div key={d.name} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{formatMoney(d.value)}</span>
              <div className="w-full rounded-t-md bg-green-500 transition-all" style={{ height: `${Math.max(d.height, 4)}%`, minHeight: 4 }} />
              <span className="text-[10px] text-muted-foreground">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
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
                  <p className="font-medium text-sm">{c.tasks?.title || "Task"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">{formatMoney(c.earned_amount || 0)}</p>
                  <p className={`text-xs capitalize ${c.status === "approved" ? "text-green-400" : c.status === "rejected" ? "text-red-400" : "text-yellow-400"}`}>
                    {c.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showWithdraw && <WithdrawModal balance={balance} onClose={() => setShowWithdraw(false)} isActive={isActive} />}
      {showPackage && <PackagePopup onClose={() => setShowPackage(false)} />}
    </div>
  );
}
