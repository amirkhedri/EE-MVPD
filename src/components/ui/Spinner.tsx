import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin",
        className,
      )}
    />
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 text-brand-500 py-16">
      <Spinner className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
