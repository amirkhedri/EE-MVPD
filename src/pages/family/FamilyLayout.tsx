import { Outlet } from "react-router-dom";
import { ClipboardList, Users, Activity, Wallet as WalletIcon, Inbox } from "lucide-react";
import { AppShell, type NavItem } from "@/layouts/AppShell";

const navItems: NavItem[] = [
  { to: "/family/onboarding", label: "Onboarding", icon: <ClipboardList className="w-5 h-5" /> },
  { to: "/family/matches", label: "Find a Nurse", icon: <Users className="w-5 h-5" /> },
  { to: "/family/requests", label: "My Requests", icon: <Inbox className="w-5 h-5" /> },
  { to: "/family/care-log", label: "Care Log", icon: <Activity className="w-5 h-5" /> },
  { to: "/family/wallet", label: "Wallet", icon: <WalletIcon className="w-5 h-5" /> },
];

export default function FamilyLayout() {
  return (
    <AppShell appLabel="Family Portal" navItems={navItems} accent="brand">
      <Outlet />
    </AppShell>
  );
}
