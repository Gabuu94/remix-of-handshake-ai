import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

type Method = "mpesa" | "paypal" | "bank" | null;

function UpgradePrompt({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-4 text-center py-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
        <span className="text-3xl">🔒</span>
      </div>
      <h3 className="text-lg font-bold">Upgrade Required</h3>
      <p className="text-sm text-muted-foreground">
        You need an active package to withdraw funds. Upgrade your account to unlock instant M-Pesa withdrawals.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Later</Button>
        <Button className="flex-1 bg-purple-500 hover:bg-purple-600" onClick={() => { onClose(); navigate("/dashboard/plans"); }}>
          Upgrade Now ✨
        </Button>
      </div>
    </div>
  );
}

export default function WithdrawModal({ balance, onClose, isActive }: Props) {
  const [method, setMethod] = useState<Method>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleWithdraw = () => {
    if (!isActive) {
      setShowUpgrade(true);
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
    if (!name.trim()) { toast.error("Enter your full name"); return; }
    if (!phone.trim() || phone.length < 10) { toast.error("Enter a valid M-Pesa phone number"); return; }
    toast.success(`Withdrawal of KES ${amt} via M-Pesa initiated successfully! You'll receive the funds shortly.`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        {showUpgrade ? (
          <UpgradePrompt onClose={onClose} />
        ) : !method ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Available: <span className="font-bold text-green-400">KES {balance.toLocaleString()}</span></p>
            <p className="text-sm text-muted-foreground">Select withdrawal method:</p>

            <button
              onClick={() => setMethod("mpesa")}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-green-500/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <span className="text-lg font-bold text-green-400">M</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-medium">Mobile Money (M-Pesa)</p>
                <p className="text-xs text-muted-foreground">Safaricom • Instant transfer</p>
              </div>
            </button>

            <div className="relative flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/10 p-4 opacity-50 cursor-not-allowed">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                <span className="text-sm font-bold text-blue-400">PP</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-medium">PayPal</p>
                <p className="text-xs text-muted-foreground">1-3 business days</p>
              </div>
              <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">Coming Soon</span>
            </div>

            <div className="relative flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/10 p-4 opacity-50 cursor-not-allowed">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                <span className="text-sm font-bold text-purple-400">BT</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-medium">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">2-5 business days</p>
              </div>
              <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">Coming Soon</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Available: <span className="font-bold text-green-400">KES {balance.toLocaleString()}</span></p>

            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 flex items-center gap-2">
              <span className="text-lg">📱</span>
              <p className="text-sm font-medium text-green-400">M-Pesa (Safaricom)</p>
            </div>

            <div>
              <Label>Full Name</Label>
              <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>M-Pesa Phone Number</Label>
              <Input placeholder="0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
              <p className="mt-1 text-xs text-muted-foreground">Safaricom number registered with M-Pesa</p>
            </div>
            <div>
              <Label>Amount (KES)</Label>
              <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setMethod(null)}>Back</Button>
              <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={handleWithdraw}>Withdraw via M-Pesa</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
