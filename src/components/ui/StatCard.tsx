import type { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: "brand" | "success" | "accent" | "sky" | "neutral";
  hint?: string;
}

const toneClasses = {
  brand: "bg-brand-100 text-brand-700",
  success: "bg-emerald-100 text-emerald-700",
  accent: "bg-accent-500/10 text-accent-600",
  sky: "bg-sky-brand-100 text-sky-brand-600",
  neutral: "bg-slate-100 text-slate-600",
};

export function StatCard({ label, value, icon, tone = "brand", hint }: StatCardProps) {
  return (
    <Card className="p-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-brand-600/80 font-medium">{label}</p>
        <p className="text-2xl font-bold text-brand-900 mt-1">{value}</p>
        {hint && <p className="text-xs text-brand-500/70 mt-1">{hint}</p>}
      </div>
      {icon && (
        <div className={cn("rounded-xl p-2.5 shrink-0", toneClasses[tone])}>{icon}</div>
      )}
    </Card>
  );
}
