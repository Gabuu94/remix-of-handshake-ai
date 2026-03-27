import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Lock } from "lucide-react";
import { useState } from "react";
import PaymentModal from "./PaymentModal";

interface Props {
  onClose: () => void;
}

const planDetails: Record<string, { tasks: string; perTask: string; daily: string; monthly: string }> = {
  Beginner: { tasks: "9 tasks/day", perTask: "KES 80 – 180/task", daily: "KES 500", monthly: "KES 15,000" },
  "Average Skilled": { tasks: "15 tasks/day", perTask: "KES 120 – 280/task", daily: "KES 870", monthly: "KES 26,000" },
  Expert: { tasks: "25 tasks/day", perTask: "KES 180 – 400/task", daily: "KES 1,200", monthly: "KES 36,000" },
  Elite: { tasks: "40 tasks/day", perTask: "KES 250 – 500/task", daily: "KES 1,400", monthly: "KES 42,000" },
};

export default function PackagePopup({ onClose }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              <Lock className="h-5 w-5 text-yellow-400" />
              Account Package Required
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            You need an active account package to access tasks and withdraw funds. Choose a plan to get started:
          </p>

          <div className="mt-2 space-y-3">
            {plans?.map((plan) => {
              const details = planDetails[plan.name] || planDetails.Beginner;
              const isPopular = plan.name === "Expert";
              return (
                <div
                  key={plan.id}
                  className={`relative cursor-pointer rounded-xl border p-4 transition-colors hover:border-purple-500/50 ${
                    isPopular ? "border-yellow-500/50 bg-yellow-500/5" : "border-border bg-card"
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {isPopular && (
                    <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                      <Crown className="h-3 w-3" /> POPULAR
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{details.tasks} • {details.perTask}</p>
                      <p className="text-xs text-green-400">Daily: {details.daily} • Monthly: {details.monthly}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-400">KES {plan.price}</p>
                      <p className="text-[10px] text-muted-foreground">/month</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => { setSelectedPlan(null); onClose(); }} />
      )}
    </>
  );
}
