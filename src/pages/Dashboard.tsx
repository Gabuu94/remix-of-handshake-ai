import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, DollarSign, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import WithdrawModal from "@/components/WithdrawModal";
import PackagePopup from "@/components/PackagePopup";

const taskCategories = [
  { emoji: "📝", name: "Text Annotation", desc: "Tag and label text data", reward: "KES 50 - 100 per task" },
  { emoji: "🏷️", name: "Content Classification", desc: "Categorize content items", reward: "KES 70 - 120 per task" },
  { emoji: "📊", name: "Data Categorization", desc: "Organize data efficiently", reward: "KES 85 - 150 per task" },
  { emoji: "🔍", name: "Pattern Recognition", desc: "Identify data patterns", reward: "KES 100 - 150 per task" },
  { emoji: "🔤", name: "Sentence Arrangement", desc: "Arrange text sequences", reward: "KES 50 - 80 per task" },
  { emoji: "🎁", name: "Refer & Earn", desc: "Invite friends to earn", reward: "KES 100 per user" },
];

const liveWithdrawals = [
  { flag: "🇰🇪", phone: "+254 71***890", amount: "KES 2,500", time: "1 hour ago" },
  { flag: "🇰🇪", phone: "+254 72***123", amount: "KES 4,800", time: "2 hours ago" },
  { flag: "🇰🇪", phone: "+254 70***456", amount: "KES 1,200", time: "3 hours ago" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { isActive } = useSubscription();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showPackagePopup, setShowPackagePopup] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: completions } = useQuery({
    queryKey: ["completions-stats", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("task_completions").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const totalEarned = completions?.filter(c => c.status === "approved").reduce((sum, c) => sum + (c.earned_amount || 0), 0) || 0;
  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  // Show package popup on mount if no active subscription
  useEffect(() => {
    if (!isActive) {
      const timer = setTimeout(() => setShowPackagePopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleWithdraw = () => {
    if (!isActive) {
      setShowPackagePopup(true);
      return;
    }
    setShowWithdraw(true);
  };

  const handleTaskClick = () => {
    if (!isActive) {
      setShowPackagePopup(true);
      return;
    }
  };

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold">{firstName}</h1>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
          <span className="text-lg">✅</span>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="h-6 w-6 text-green-400" />
          <span className="text-sm text-muted-foreground">Available Balance</span>
        </div>
        <p className="text-4xl font-bold">KES {totalEarned.toLocaleString()}.00</p>
        <button
          onClick={handleWithdraw}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-3 text-lg font-bold text-white hover:bg-green-600"
        >
          💸 Withdraw
        </button>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Available Tasks</p>
          <p className="mt-1 text-xl font-bold">961+</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="mt-1 text-xl font-bold">24 hrs</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Active Users</p>
          <p className="mt-1 text-xl font-bold">1,280</p>
        </div>
      </div>

      {/* Live Withdrawals */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <h2 className="text-lg font-bold">Live Withdrawals</h2>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> LIVE
          </span>
        </div>
        {liveWithdrawals.map((w, i) => (
          <div key={i} className="mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="text-2xl">{w.flag}</span>
            <div className="flex-1">
              <p className="font-medium">{w.phone}</p>
              <p className="text-xs text-green-400">✓ Withdrawal Successful</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{w.amount}</p>
              <p className="text-xs text-muted-foreground">⏱ {w.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Start Earning - Task Categories */}
      <div className="mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <span>💼</span> Start Earning
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {taskCategories.map((cat) => (
            <div key={cat.name} className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-1 text-2xl">{cat.emoji}</p>
              <h3 className="font-bold text-sm">{cat.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{cat.desc}</p>
              <p className="mt-2 text-xs font-semibold text-green-400">{cat.reward}</p>
              <Link to={isActive ? "/dashboard/tasks" : "#"} onClick={handleTaskClick}>
                <button className="mt-3 w-full rounded-xl bg-green-500 py-2 text-sm font-bold text-white hover:bg-green-600">
                  Start Earning →
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {showWithdraw && (
        <WithdrawModal balance={totalEarned} onClose={() => setShowWithdraw(false)} isActive={isActive} />
      )}

      {showPackagePopup && (
        <PackagePopup onClose={() => setShowPackagePopup(false)} />
      )}
    </div>
  );
}
