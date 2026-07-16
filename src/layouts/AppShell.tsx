import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
// Ensure this path matches where you actually saved your LanguageSwitcher component
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"; 

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

interface AppShellProps {
  appLabel: string;
  navItems: NavItem[];
  accent?: "brand" | "sky" | "slate";
  children: ReactNode;
}

const accentBg = {
  brand: "bg-brand-700",
  sky: "bg-sky-brand-600",
  slate: "bg-slate-800",
};

const roleLabel: Record<string, string> = {
  family: "Requester",
  nurse: "Caregiver",
  admin: "Operations",
};

export function AppShell({ appLabel, navItems, accent = "brand", children }: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name ?? "Guest";
  const userRole = user ? roleLabel[user.role] ?? user.role : "";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-brand-50">
      {/* Desktop sidebar */}
      <aside className={cn("hidden md:flex md:w-64 flex-col text-white shrink-0", accentBg[accent])}>
        {/* Adjusted this header to hold the Language Switcher safely on the right */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="bg-white/15 rounded-lg p-1.5">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold leading-tight">CareLink</p>
              <p className="text-xs text-white/70 leading-tight">{appLabel}</p>
            </div>
          </div>
          {/* Inserted Language Switcher here */}
          <LanguageSwitcher />
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white mb-3"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
          <div className="flex items-center gap-2.5">
            <Avatar name={userName} size="sm" />
            <div className="leading-tight">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-white/60">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className={cn("md:hidden flex items-center justify-between p-4 text-white", accentBg[accent])}>
          <span className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">{appLabel}</span>
          </span>
          {/* Grouped Switcher and Avatar together for Mobile */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={handleLogout} aria-label="Log out">
              <Avatar name={userName} size="sm" />
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-100 flex items-center justify-around py-2 px-1 z-10">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium",
                  isActive ? "text-brand-700" : "text-brand-400",
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}