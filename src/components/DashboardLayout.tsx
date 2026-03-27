import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, HelpCircle, DollarSign, Home, LogOut, Menu, X, Bell } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const bottomNav = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Earnings", path: "/dashboard/earnings", icon: LayoutDashboard },
  { label: "Withdraw", path: "/dashboard/earnings", icon: DollarSign, isCenter: true },
  { label: "Help", path: "/dashboard/plans", icon: HelpCircle },
];

const topNavItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Tasks", path: "/dashboard/tasks" },
  { label: "Earnings", path: "/dashboard/earnings" },
  { label: "Plans", path: "/dashboard/plans" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background pb-20" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500">
                <span className="text-xs font-bold text-white">R</span>
              </div>
              <span className="text-lg font-bold">REMOTASK</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {topNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-purple-500 text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-md p-1.5 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white"
              title="Sign out"
            >
              {initials}
            </button>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-border px-4 py-3 md:hidden">
            {topNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-purple-500 text-white" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button onClick={handleSignOut} className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
        <div className="flex items-center justify-around py-2">
          {bottomNav.map((item) => {
            const isActive = location.pathname === item.path && !item.isCenter;
            if (item.isCenter) {
              return (
                <Link key={item.label} to={item.path} className="relative -mt-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="mt-1 block text-center text-[10px] text-green-400">{item.label}</span>
                </Link>
              );
            }
            return (
              <Link key={item.label} to={item.path} className="flex flex-col items-center gap-1">
                <item.icon className={`h-5 w-5 ${isActive ? "text-purple-400" : "text-muted-foreground"}`} />
                <span className={`text-[10px] ${isActive ? "text-purple-400" : "text-muted-foreground"}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
