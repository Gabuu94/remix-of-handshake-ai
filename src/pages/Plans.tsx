import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Crown, Star } from "lucide-react";
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";

const planColors: Record<string, string> = {
  Beginner: "text-cyan-400",
  "Average Skilled": "text-green-400",
  Expert: "text-yellow-400",
  Elite: "text-purple-400",
};

const planFeatures: Record<string, string[]> = {
  Beginner: [
    "📋 9 tasks per day",
    "💰 $0.90 – 1.80 per task",
    "📊 Expected daily: $16.50",
    "💵 Expected monthly: $400",
    "📱 M-Pesa withdrawals",
  ],
  "Average Skilled": [
    "📋 15 tasks per day",
    "💰 $1.20 – 2.80 per task",
    "📊 Expected daily: $22.00",
    "💵 Expected monthly: $650",
    "⭐ Priority support",
  ],
  Expert: [
    "📋 25 tasks per day",
    "💰 $1.80 – 4.00 per task",
    "📊 Expected daily: $30.00",
    "💵 Expected monthly: $900",
    "🏆 Premium tasks access",
  ],
  Elite: [
    "📋 40 tasks per day",
    "💰 $2.50 – 5.00 per task",
    "📊 Expected daily: $40.00",
    "💵 Expected monthly: $1,200",
    "👑 VIP support & bonuses",
  ],
};

export default function Plans() {
  const { subscription, isActive } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 text-4xl">💎</div>
        <h1 className="text-xl font-bold">Choose Your Account Type</h1>
        <p className="text-sm text-muted-foreground mt-1">Start earning today with flexible task-based income</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-card" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {plans?.map((plan) => {
            const isPopular = plan.name === "Average Skilled";
            const isCurrentPlan = isActive && (subscription as any)?.plan_id === plan.id;
            const features = planFeatures[plan.name] || [];
            const titleColor = planColors[plan.name] || "text-primary";

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-5 ${isPopular ? "border-yellow-500/50 bg-card" : "border-border bg-card"}`}
              >
                {isPopular && (
                  <div className="flex justify-center mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 text-xs font-semibold text-yellow-400">
                      <Star className="h-3 w-3" /> MOST POPULAR
                    </span>
                  </div>
                )}

                <h3 className={`text-center text-sm font-bold uppercase tracking-wider ${titleColor}`}>{plan.name} Account</h3>

                <div className="my-3 text-center">
                  <span className="text-4xl font-bold">${(plan.price / 100).toFixed(2)}</span>
                </div>

                <p className="text-center text-xs text-muted-foreground mb-4">{plan.description}</p>

                <div className="border-t border-border pt-4 mb-4">
                  <ul className="space-y-2">
                    {features.map((f) => (
                      <li key={f} className="text-sm">{f}</li>
                    ))}
                  </ul>
                </div>

                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                ) : (
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    Buy Account
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}
