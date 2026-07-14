import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: "brand" | "success" | "accent" | "sky";
  className?: string;
  trackClassName?: string;
}

const toneClasses = {
  brand: "bg-brand-500",
  success: "bg-success-500",
  accent: "bg-accent-500",
  sky: "bg-sky-brand-500",
};

export function ProgressBar({
  value,
  max = 100,
  tone = "brand",
  className,
  trackClassName,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full h-2.5 rounded-full bg-brand-100 overflow-hidden", trackClassName)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", toneClasses[tone], className)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
