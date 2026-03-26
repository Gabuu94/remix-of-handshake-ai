import { Link } from "react-router-dom";
import { CheckSquare, DollarSign, Smartphone, Gift } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: "📝", title: "Easy Tasks", description: "Text annotation, classification, and more" },
  { icon: "💵", title: "Instant Payments", description: "Withdraw earnings directly to M-Pesa" },
  { icon: "📱", title: "Work Anywhere", description: "Complete tasks on your phone anytime" },
  { icon: "🎁", title: "Welcome Bonus", description: "Get up to KES 600 bonus when you sign up!" },
];

export default function Index() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Logo & Icon */}
      <div className="mt-8 mb-2 flex h-28 w-28 items-center justify-center rounded-3xl bg-purple-500/80 shadow-lg shadow-purple-500/20">
        <span className="text-5xl">💰</span>
      </div>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">REMO-TASK</h1>
      <p className="mt-1 text-sm font-semibold text-purple-400">Earn Money by Training AI</p>

      {/* Welcome Card */}
      <div className="mt-6 w-full max-w-md rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-3 text-center text-lg font-bold">Welcome to the Future of Earning</h2>
        <p className="text-center text-sm text-muted-foreground">
          Complete simple AI training tasks and earn real money. Flexible work hours, instant payments via M-Pesa, and unlimited earning potential. Join thousands of earners today!
        </p>
      </div>

      {/* Features */}
      <div className="mt-4 w-full max-w-md rounded-2xl border border-border bg-card p-5">
        <div className="space-y-5">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-4">
              <span className="text-3xl">{f.icon}</span>
              <div>
                <p className="font-bold">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="mt-4 w-full max-w-md rounded-2xl border border-border bg-card p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setAgreed(!agreed)}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
              agreed ? "border-purple-500 bg-purple-500" : "border-muted-foreground"
            }`}
          >
            {agreed && <span className="text-xs text-white font-bold">✓</span>}
          </div>
          <span className="text-sm text-muted-foreground">I agree to the Terms & Conditions and Privacy Policy</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="mt-6 w-full max-w-md space-y-3">
        <Link to="/signup">
          <button
            disabled={!agreed}
            className="w-full rounded-2xl bg-purple-500 py-4 text-lg font-bold text-white transition-opacity disabled:opacity-40 hover:bg-purple-600"
          >
            Create Account
          </button>
        </Link>
        <Link to="/signin">
          <button className="mt-3 w-full rounded-2xl border border-purple-500/30 py-4 text-lg font-bold text-purple-400 transition-colors hover:bg-purple-500/10">
            Already Have Account? Sign In
          </button>
        </Link>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">Version 1.0 • Powered by AI</p>
    </div>
  );
}
