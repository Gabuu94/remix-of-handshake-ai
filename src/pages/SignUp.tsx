import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User } from "lucide-react";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country] = useState("Kenya");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully!");
      navigate("/assessment");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Avatar Icon */}
      <div className="mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20">
        <User className="h-10 w-10 text-blue-400" />
      </div>
      <h1 className="mt-4 text-2xl font-bold">Create Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Join us and start earning today</p>

      <form onSubmit={handleSubmit} className="mt-6 w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <Label>Full Name *</Label>
          <Input placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 bg-secondary/50 border-border" />
        </div>
        <div>
          <Label>Phone Number *</Label>
          <Input placeholder="+254 700 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 bg-secondary/50 border-border" />
        </div>
        <div>
          <Label>Email Address *</Label>
          <Input type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 bg-secondary/50 border-border" />
        </div>
        <div>
          <Label>Country *</Label>
          <Input value={country} disabled className="mt-1 bg-secondary/50 border-border text-foreground" />
        </div>
        <div>
          <Label>Password * (minimum 4 characters)</Label>
          <Input type="password" placeholder="Create a secure password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} className="mt-1 bg-secondary/50 border-border" />
        </div>
        <div>
          <Label>Confirm Password *</Label>
          <Input type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 bg-secondary/50 border-border" />
        </div>
        <div>
          <Label>Referral Code (Optional)</Label>
          <Input placeholder="Enter referral code if you have one" value={referral} onChange={(e) => setReferral(e.target.value)} className="mt-1 bg-green-500/10 border-green-500/40 text-green-400 placeholder:text-green-400/60" />
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-purple-500 py-4 text-lg font-bold text-white transition-opacity disabled:opacity-50 hover:bg-purple-600">
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-xs text-muted-foreground">* All fields are required</p>
      </form>
    </div>
  );
}
