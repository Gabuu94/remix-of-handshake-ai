import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Shield, Star } from "lucide-react";
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";

const planIcons: Record<string, any> = {
  Beginner: Zap,
  "Average Skilled": Star,
  Expert: Crown,
  Elite: Shield,
};

const planFeatures: Record<string, string[]> = {
  Beginner: ["9 tasks per day", "KES 50 – KES 150 per task", "KES 2,000 daily expected", "KES 50,000 monthly expected", "M-Pesa withdrawals"],
  "Average Skilled": ["15 tasks per day", "KES 100 – KES 250 per task", "KES 5,000 daily expected", "KES 120,000 monthly expected", "Priority support"],
  Expert: ["25 tasks per day", "KES 150 – KES 400 per task", "KES 8,000 daily expected", "KES 200,000 monthly expected", "Premium tasks access"],
  Elite: ["40 tasks per day", "KES 300 – KES 600 per task", "KES 15,000 daily expected", "KES 400,000 monthly expected", "VIP support & bonuses"],
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Account Packages</h1>
        <p className="text-muted-foreground">Choose an account package to start earning.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-80 animate-pulse rounded-xl border border-border bg-card" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans?.map((plan) => {
            const isExpert = plan.name === "Expert";
            const isCurrentPlan = isActive && (subscription as any)?.plan_id === plan.id;
            const features = planFeatures[plan.name] || [];
            const IconComp = planIcons[plan.name] || Zap;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-5 ${isExpert ? "border-yellow-500/50 bg-card shadow-lg shadow-yellow-500/5" : "border-border bg-card"}`}
              >
                {isExpert && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 text-xs font-semibold text-yellow-400">
                      <Crown className="h-3 w-3" /> MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <IconComp className={`h-5 w-5 ${isExpert ? "text-yellow-400" : "text-primary"}`} />
                </div>

                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-3xl font-bold">KES {plan.price}</span>
                  <span className="text-sm text-muted-foreground"> /month</span>
                </div>

                <ul className="mb-5 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                ) : (
                  <Button
                    className={`w-full ${isExpert ? "bg-purple-500 text-white hover:bg-purple-600" : ""}`}
                    variant={isExpert ? "default" : "outline"}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    Get {plan.name}
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
