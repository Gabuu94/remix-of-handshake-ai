import { useEffect, useState } from "react";

const sampleWithdrawals = [
  { phone: "254712***890", amount: 350 },
  { phone: "254798***123", amount: 1200 },
  { phone: "254701***456", amount: 580 },
  { phone: "254733***789", amount: 900 },
  { phone: "254722***234", amount: 2100 },
  { phone: "254710***567", amount: 450 },
  { phone: "254745***012", amount: 760 },
  { phone: "254756***345", amount: 1500 },
  { phone: "254768***678", amount: 320 },
  { phone: "254781***901", amount: 670 },
];

export default function WithdrawalNotifications() {
  const [notification, setNotification] = useState<{ phone: string; amount: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      const item = sampleWithdrawals[Math.floor(Math.random() * sampleWithdrawals.length)];
      setNotification(item);
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    const interval = setInterval(show, 15000 + Math.random() * 10000);
    const initial = setTimeout(show, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, []);

  if (!notification || !visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
          <span className="text-sm font-bold text-green-400">M</span>
        </div>
        <div>
          <p className="text-sm font-medium">
            {notification.phone} just withdrew <span className="text-primary">KES {notification.amount}</span>
          </p>
          <p className="text-xs text-muted-foreground">via M-Pesa • just now</p>
        </div>
      </div>
    </div>
  );
}
