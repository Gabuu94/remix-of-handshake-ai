import { useEffect, useState } from "react";

const sampleWithdrawals = [
  { phone: "254712***890", amount: 2500 },
  { phone: "254798***123", amount: 4800 },
  { phone: "254701***456", amount: 1200 },
  { phone: "254733***789", amount: 3600 },
  { phone: "254722***234", amount: 8100 },
  { phone: "254710***567", amount: 1450 },
  { phone: "254745***012", amount: 5760 },
  { phone: "254756***345", amount: 2300 },
  { phone: "254768***678", amount: 920 },
  { phone: "254781***901", amount: 6700 },
];

export default function WithdrawalNotifications() {
  const [notification, setNotification] = useState<{ phone: string; amount: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const show = () => {
      const item = sampleWithdrawals[Math.floor(Math.random() * sampleWithdrawals.length)];
      setNotification(item);
      setSecondsAgo(Math.floor(Math.random() * 30) + 2);
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    const interval = setInterval(show, 12000 + Math.random() * 8000);
    const initial = setTimeout(show, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, []);

  if (!notification || !visible) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right-full fade-in duration-500">
      <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl max-w-xs">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/20 shrink-0">
          <span className="text-sm font-bold text-green-400">M</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {notification.phone} withdrew <span className="text-green-400 font-bold">KES {notification.amount.toLocaleString()}</span>
          </p>
          <p className="text-xs text-muted-foreground">via M-Pesa • {secondsAgo}s ago</p>
        </div>
      </div>
    </div>
  );
}
