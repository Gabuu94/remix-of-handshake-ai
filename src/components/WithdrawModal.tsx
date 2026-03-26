import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  balance: number;
  onClose: () => void;
  isActive?: boolean;
}

export default function WithdrawModal({ balance, onClose, isActive }: Props) {
  const [method, setMethod] = useState<"mpesa" | "paypal" | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");

  const handleWithdraw = () => {
    if (!isActive) {
      toast.error("You need an active account package to withdraw funds.");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > balance) {
      toast.error("Insufficient balance. Your available balance is KES " + balance);
      return;
    }
    if (method === "mpesa") {
      if (!name.trim()) { toast.error("Enter your name"); return; }
      if (!phone.trim() || phone.length < 10) { toast.error("Enter a valid M-Pesa phone number"); return; }
    }
    if (method === "paypal") {
      if (!email.trim() || !email.includes("@")) { toast.error("Enter a valid PayPal email"); return; }
    }
    toast.success(`Withdrawal of KES ${amt} via ${method === "mpesa" ? "M-Pesa" : "PayPal"} initiated successfully!`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        {!method ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Available: <span className="font-bold text-green-400">KES {balance}</span></p>
            <p className="text-sm text-muted-foreground">Select withdrawal method:</p>
            <button
              onClick={() => setMethod("mpesa")}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-green-500/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <span className="text-lg font-bold text-green-400">M</span>
              </div>
              <div className="text-left">
                <p className="font-medium">M-Pesa</p>
                <p className="text-xs text-muted-foreground">Instant transfer</p>
              </div>
            </button>
            <button
              onClick={() => setMethod("paypal")}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-blue-500/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                <span className="text-sm font-bold text-blue-400">PP</span>
              </div>
              <div className="text-left">
                <p className="font-medium">PayPal</p>
                <p className="text-xs text-muted-foreground">1-3 business days</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Available: <span className="font-bold text-green-400">KES {balance}</span></p>
            {method === "mpesa" ? (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>M-Pesa Phone Number</Label>
                  <Input placeholder="0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                </div>
              </>
            ) : (
              <div>
                <Label>PayPal Email</Label>
                <Input placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
              </div>
            )}
            <div>
              <Label>Amount (KES)</Label>
              <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setMethod(null)}>Back</Button>
              <Button className="flex-1" onClick={handleWithdraw}>Withdraw</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
