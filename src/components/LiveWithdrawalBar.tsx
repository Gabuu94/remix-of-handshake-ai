import { useEffect, useState } from "react";

const sampleWithdrawals = [
  { phone: "254712***890", amount: 2500, time: "12s ago" },
  { phone: "254798***123", amount: 4800, time: "34s ago" },
  { phone: "254701***456", amount: 1200, time: "1m ago" },
  { phone: "254733***789", amount: 3600, time: "2m ago" },
  { phone: "254722***234", amount: 8100, time: "3m ago" },
  { phone: "254710***567", amount: 1450, time: "5m ago" },
  { phone: "254745***012", amount: 5760, time: "7m ago" },
  { phone: "254756***345", amount: 2300, time: "9m ago" },
  { phone: "254768***678", amount: 920, time: "11m ago" },
  { phone: "254781***901", amount: 6700, time: "13m ago" },
];

export default function LiveWithdrawalBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSliding(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sampleWithdrawals.length);
        setIsSliding(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const item = sampleWithdrawals[currentIndex];

  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm">🌍</span>
        <h3 className="text-sm font-bold">Live Withdrawals</h3>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-green-500/20 border border-green-500/40 px-2.5 py-0.5 text-[10px] font-semibold text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className={`flex items-center gap-3 p-4 transition-all duration-500 ${
            isSliding ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 shrink-0">
            <span className="text-sm font-bold text-green-400">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">+{item.phone}</p>
            <p className="text-xs text-green-400">✓ Withdrawal Successful</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-green-400">KES {item.amount.toLocaleString()}.00</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              {item.time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}