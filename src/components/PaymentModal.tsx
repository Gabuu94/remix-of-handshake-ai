import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, Smartphone } from "lucide-react";

interface Props {
  plan: { id: string; name: string; price: number; duration_days: number };
  onClose: () => void;
}

export default function PaymentModal({ plan, onClose }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [checkoutId, setCheckoutId] = useState("");

  const priceDisplay = `$${(plan.price / 100).toFixed(2)}`;

  const handlePay = async () => {
    if (!phone.trim()) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }
    setLoading(true);
    setPaymentStatus("pending");

    try {
      const { data, error } = await supabase.functions.invoke("lipwa-payment", {
        body: {
          amount: plan.price,
          phone_number: phone,
          plan_id: plan.id,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Payment failed");

      setCheckoutId(data.checkout_request_id);
    } catch (err: any) {
      toast.error(err.message || "Payment initiation failed");
      setPaymentStatus("failed");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkoutId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke("check-payment", {
          body: { checkout_id: checkoutId },
        });
        if (data?.status === "payment.success") {
          setPaymentStatus("success");
          setLoading(false);
          clearInterval(interval);
          queryClient.invalidateQueries({ queryKey: ["subscription"] });
          toast.success("Payment successful! Your subscription is now active.");
        } else if (data?.status === "payment.failed") {
          setPaymentStatus("failed");
          setLoading(false);
          clearInterval(interval);
          toast.error("Payment failed or was cancelled.");
        }
      } catch (err) {}
    }, 5000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === "pending") {
        setPaymentStatus("failed");
        setLoading(false);
        toast.error("Payment timed out. Please try again.");
      }
    }, 120000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [checkoutId]);

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
            <h3 className="mb-2 text-xl font-bold">🎉 Payment Successful!</h3>
            <p className="text-sm text-muted-foreground">Your <span className="font-semibold text-foreground">{plan.name}</span> plan is now active.</p>
            <p className="mt-1 text-xs text-green-400">You can now access all tasks and withdraw earnings</p>
            <Button className="mt-6 bg-green-500 hover:bg-green-600" onClick={onClose}>Start Earning →</Button>
          </div>
        ) : paymentStatus === "failed" ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Payment Failed</h3>
            <p className="mb-4 text-sm text-muted-foreground">The payment was not completed. Please try again.</p>
            <Button onClick={() => { setPaymentStatus("idle"); setCheckoutId(""); }}>Try Again</Button>
          </div>
        ) : paymentStatus === "pending" ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 animate-pulse">
              <Smartphone className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">📲 Check Your Phone!</h3>
            <p className="text-sm text-muted-foreground">
              We've sent an M-Pesa payment request to <span className="font-semibold text-foreground">{phone}</span>
            </p>
            <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-sm font-medium text-green-400">Enter your M-Pesa PIN to complete payment</p>
              <p className="mt-1 text-xs text-muted-foreground">Amount: {priceDisplay}</p>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-green-400" />
              <span className="text-sm text-muted-foreground">Waiting for confirmation...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-lg font-bold text-green-400">{priceDisplay}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input id="phone" placeholder="0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" disabled={loading} />
              <p className="mt-1 text-xs text-muted-foreground">Enter the phone number registered with M-Pesa</p>
            </div>

            <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={handlePay} disabled={loading}>
              Pay {priceDisplay} via M-Pesa 📲
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
