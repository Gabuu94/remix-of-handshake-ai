import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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
      toast.success("STK Push sent! Check your phone and enter your M-Pesa PIN.");
    } catch (err: any) {
      toast.error(err.message || "Payment initiation failed");
      setPaymentStatus("failed");
      setLoading(false);
    }
  };

  // Poll for payment status
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
      } catch (err) {
        // Continue polling
      }
    }, 5000);

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === "pending") {
        setPaymentStatus("failed");
        setLoading(false);
        toast.error("Payment timed out. Please try again.");
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [checkoutId]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <DialogHeader>
          <DialogTitle>Subscribe to {plan.name}</DialogTitle>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
            <h3 className="mb-2 text-lg font-bold">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground">Your {plan.name} plan is now active.</p>
            <Button className="mt-4" onClick={onClose}>Start Working</Button>
          </div>
        ) : paymentStatus === "failed" ? (
          <div className="py-8 text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h3 className="mb-2 text-lg font-bold">Payment Failed</h3>
            <p className="mb-4 text-sm text-muted-foreground">The payment was not completed.</p>
            <Button onClick={() => { setPaymentStatus("idle"); setCheckoutId(""); }}>Try Again</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-lg font-bold text-primary">KES {plan.price}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                placeholder="0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-muted-foreground">Enter the phone number registered with M-Pesa</p>
            </div>

            <Button className="w-full" onClick={handlePay} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {checkoutId ? "Waiting for payment..." : "Sending STK Push..."}
                </>
              ) : (
                `Pay KES ${plan.price}`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
