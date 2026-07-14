import { Outlet } from "react-router-dom";
import { LayoutDashboard, BadgeCheck, MessageSquareWarning } from "lucide-react";
import { AppShell, type NavItem } from "@/layouts/AppShell";

const navItems: NavItem[] = [
  { to: "/admin/overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: "/admin/verification", label: "Verification", icon: <BadgeCheck className="w-5 h-5" /> },
  { to: "/admin/disputes", label: "Disputes", icon: <MessageSquareWarning className="w-5 h-5" /> },
];

export default function AdminLayout() {
  return (
    <AppShell appLabel="Admin / AI Core" navItems={navItems} accent="slate">
      <Outlet />
    </AppShell>
  );
}
