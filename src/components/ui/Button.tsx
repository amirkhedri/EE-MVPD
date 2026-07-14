import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-300 shadow-sm",
  secondary:
    "bg-sky-brand-100 text-sky-brand-600 hover:bg-sky-brand-200 focus-visible:ring-sky-brand-200",
  outline:
    "border border-brand-200 text-brand-700 bg-white hover:bg-brand-50 focus-visible:ring-brand-200",
  ghost: "text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-200",
  danger:
    "bg-accent-500 text-white hover:bg-accent-600 focus-visible:ring-accent-500/40",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 focus-visible:ring-accent-500/40 shadow-sm",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 gap-2 rounded-xl",
  lg: "text-base px-6 py-3.5 gap-2 rounded-xl",
  icon: "p-2.5 rounded-xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
