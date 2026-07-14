import {
  Activity,
  TrendingUp,
  MessageSquareWarning,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { disputeTickets, systemAlerts } from "@/lib/mockData";
import type { SystemAlert } from "@/lib/types";

const weeklyShifts = [
  { day: "Mon", shifts: 96 },
  { day: "Tue", shifts: 104 },
  { day: "Wed", shifts: 112 },
  { day: "Thu", shifts: 98 },
  { day: "Fri", shifts: 121 },
  { day: "Sat", shifts: 87 },
  { day: "Sun", shifts: 76 },
];

const alertToneMap: Record<SystemAlert["level"], "accent" | "warning" | "sky"> = {
  critical: "accent",
  warning: "warning",
  info: "sky",
};

export default function Overview() {
  const openDisputes = disputeTickets.filter((t) => t.status !== "resolved").length;

  return (
    <div>
      <PageHeader
        title="System Overview"
        description="A high-level snapshot of platform health, matching performance, and active operations."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Shifts"
          value="128"
          tone="brand"
          hint="Currently in progress"
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label="Match Success Rate"
          value="94%"
          tone="success"
          hint="Last 30 days"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Open Disputes"
          value={String(openDisputes)}
          tone="accent"
          hint="Requiring attention"
          icon={<MessageSquareWarning className="w-5 h-5" />}
        />
        <StatCard
          label="Nurses Online"
          value="342"
          tone="sky"
          hint="Available right now"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Shifts Completed</CardTitle>
          <CardDescription>Daily completed shifts over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyShifts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="shifts" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent events requiring visibility or action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {systemAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start justify-between gap-4 rounded-lg border p-3",
                alert.level === "critical"
                  ? "border-accent-500/30 bg-accent-500/5"
                  : "border-slate-200 bg-white",
              )}
            >
              <div className="flex items-start gap-3">
                {alert.level === "critical" && (
                  <AlertTriangle className="w-4 h-4 text-accent-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{alert.time}</p>
                </div>
              </div>
              <Badge tone={alertToneMap[alert.level]} className="shrink-0 capitalize">
                {alert.level}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
