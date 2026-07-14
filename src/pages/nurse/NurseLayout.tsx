import { Outlet } from "react-router-dom";
import { ListChecks, PiggyBank, GraduationCap, Inbox } from "lucide-react";
import { AppShell, type NavItem } from "@/layouts/AppShell";

const navItems: NavItem[] = [
  { to: "/nurse/requests", label: "Requests", icon: <Inbox className="w-5 h-5" /> },
  { to: "/nurse/shift", label: "Shift", icon: <ListChecks className="w-5 h-5" /> },
  { to: "/nurse/finance", label: "Finance", icon: <PiggyBank className="w-5 h-5" /> },
  { to: "/nurse/academy", label: "Academy", icon: <GraduationCap className="w-5 h-5" /> },
];

export default function NurseLayout() {
  return (
    <AppShell appLabel="Caregiver Portal" navItems={navItems} accent="sky">
      <Outlet />
    </AppShell>
  );
}
