import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, Copy, Check } from "lucide-react";

interface Props {
  plan: { id: string; name: string; price: number; duration_days: number };
  onClose: () => void;
}

export default function PaymentModal({ plan, onClose }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mpesaMessage, setMpesaMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying" | "success" | "failed">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const kesAmount = plan.price;
  const priceDisplay = `KSh ${kesAmount.toLocaleString()}`;
  const tillNumber = "7172200";

  const copyTill = () => {
    navigator.clipboard.writeText(tillNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (!mpesaMessage.trim()) {
      toast.error("Please paste your M-Pesa confirmation message");
      return;
    }
    setLoading(true);
    setPaymentStatus("verifying");
    setErrorMsg("");

    try {
      const { data, error } = await supabase.functions.invoke("verify-mpesa-message", {
        body: {
          mpesa_message: mpesaMessage.trim(),
          plan_id: plan.id,
          expected_amount: kesAmount,
        },
      });

      if (error) throw error;
      if (!data?.success) {
        setErrorMsg(data?.error || "Payment verification failed");
        setPaymentStatus("failed");
        setLoading(false);
        return;
      }

      setPaymentStatus("success");
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Payment verified! Your subscription is now active.");
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed");
      setPaymentStatus("failed");
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <DialogHeader>
          <DialogTitle>Subscribe to {plan.name}</DialogTitle>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">🎉 Payment Verified!</h3>
            <p className="text-sm text-muted-foreground">Your <span className="font-semibold text-foreground">{plan.name}</span> plan is now active.</p>
            <p className="mt-1 text-xs text-green-400">You can now access all tasks and withdraw earnings</p>
            <Button className="mt-6 bg-green-500 hover:bg-green-600" onClick={onClose}>Start Earning →</Button>
          </div>
        ) : paymentStatus === "failed" ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Verification Failed</h3>
            <p className="mb-4 text-sm text-muted-foreground">{errorMsg}</p>
            <Button onClick={() => { setPaymentStatus("idle"); setMpesaMessage(""); setErrorMsg(""); }}>Try Again</Button>
          </div>
        ) : paymentStatus === "verifying" ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-green-400" />
            <h3 className="mb-2 text-xl font-bold">Verifying Payment...</h3>
            <p className="text-sm text-muted-foreground">Checking your M-Pesa confirmation message</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Plan summary */}
            <div className="rounded-xl border border-border bg-secondary/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Today</span>
                <span className="text-lg font-bold text-green-400">{priceDisplay}</span>
              </div>
            </div>

            {/* How to Pay */}
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <h3 className="mb-3 text-center text-lg font-bold text-green-400">How To Pay</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-orange-400" />
                  <span className="text-sm">Go to M-PESA</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-orange-400" />
                  <span className="text-sm">Select: <strong>Lipa na M-PESA</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-orange-400" />
                  <span className="text-sm">Select: <strong>Buy Goods and Services</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-orange-400" />
                  <div className="flex items-center gap-2 text-sm">
                    <span>Enter till no: <strong>{tillNumber}</strong></span>
                    <button onClick={copyTill} className="rounded-lg bg-orange-500/20 p-1.5 text-orange-400 hover:bg-orange-500/30">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-orange-400" />
                  <span className="text-sm">Enter amount: <strong>{priceDisplay}</strong></span>
                </div>
              </div>
            </div>

            {/* Paste confirmation message */}
            <div>
              <Label htmlFor="mpesa-msg" className="text-sm font-semibold">Paste M-Pesa Confirmation Message</Label>
              <Textarea
                id="mpesa-msg"
                placeholder="e.g. SJ12ABC123 Confirmed. Ksh300.00 paid to GURUTECH INVESTORS..."
                value={mpesaMessage}
                onChange={(e) => setMpesaMessage(e.target.value)}
                className="mt-1 min-h-[80px] text-xs"
                disabled={loading}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Paste the full SMS you received from M-Pesa after payment
              </p>
            </div>

            <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={handleConfirm} disabled={loading}>
              Confirm Payment ✅
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
