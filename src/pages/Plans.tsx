import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";

export default function Plans() {
  const { user } = useAuth();
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

  const planFeatures: Record<string, string[]> = {
    Starter: ["20 tasks per month", "Basic AI evaluation tasks", "Standard support", "M-Pesa withdrawals"],
    Pro: ["100 tasks per month", "Premium high-paying tasks", "Priority support", "M-Pesa withdrawals", "Code review tasks"],
    Elite: ["Unlimited tasks", "All task categories", "Dedicated support", "Instant M-Pesa payouts", "Highest paying tasks", "Early access to new tasks"],
  };

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground">Select a plan to unlock tasks and start earning.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-80 animate-pulse rounded-xl border border-border bg-card" />)}
        </div>
      ) : (
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {plans?.map((plan, i) => {
            const isPro = plan.name === "Pro";
            const isCurrentPlan = isActive && (subscription as any)?.plan_id === plan.id;
            const features = planFeatures[plan.name] || [];

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border bg-card p-6 ${isPro ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      <Crown className="h-3 w-3" /> Most Popular
                    </span>
                  </div>
                )}
                <h3 className="mb-1 text-lg font-bold">{plan.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">KES {plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                ) : (
                  <Button
                    className={`w-full ${isPro ? "" : "variant-outline"}`}
                    variant={isPro ? "default" : "outline"}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    Subscribe
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
