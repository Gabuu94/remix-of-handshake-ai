import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Shield } from "lucide-react";
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";

const planIcons: Record<string, any> = {
  Gold: Zap,
  Platinum: Crown,
  Diamond: Shield,
};

const planFeatures: Record<string, string[]> = {
  Gold: ["10 tasks per day", "$0.39 – $0.77 per task", "$7.70 daily income", "$115.50 monthly income", "$19.25 min. withdrawal"],
  Platinum: ["20 tasks per day", "$0.39 – $0.77 per task", "$15.40 daily income", "$231.00 monthly income", "$15.40 min. withdrawal"],
  Diamond: ["40 tasks per day", "$0.77 – $1.16 per task", "$30.80 daily income", "$462.00 monthly income", "$7.70 min. withdrawal"],
};

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

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Unlock All Tasks</h1>
        <p className="text-muted-foreground">Choose a plan to access premium tasks and earn more.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-96 animate-pulse rounded-xl border border-border bg-card" />)}
        </div>
      ) : (
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {plans?.map((plan) => {
            const isPlatinum = plan.name === "Platinum";
            const isCurrentPlan = isActive && (subscription as any)?.plan_id === plan.id;
            const features = planFeatures[plan.name] || [];
            const IconComp = planIcons[plan.name] || Zap;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-6 ${isPlatinum ? "border-yellow-500/50 bg-card shadow-lg shadow-yellow-500/5" : "border-border bg-card"}`}
              >
                {isPlatinum && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 text-xs font-semibold text-yellow-400">
                      <Crown className="h-3 w-3" /> MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <IconComp className={`h-6 w-6 ${isPlatinum ? "text-yellow-400" : "text-primary"}`} />
                </div>

                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-3xl font-bold">KES {plan.price}</span>
                  <span className="text-sm text-muted-foreground"> /month</span>
                </div>

                <ul className="mb-6 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                ) : (
                  <Button
                    className={`w-full ${isPlatinum ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                    variant={isPlatinum ? "default" : "outline"}
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
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
