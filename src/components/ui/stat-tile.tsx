import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

export function StatTile({
  label,
  value,
  unit,
  icon,
  accent,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  accent?: "default" | "danger" | "success" | "gold";
  className?: string;
}) {
  const accentColor =
    accent === "danger"
      ? "text-[var(--danger)]"
      : accent === "success"
        ? "text-[var(--success)]"
        : accent === "gold"
          ? "text-gradient-gold"
          : "text-[var(--foreground)]";

  return (
    <GlassCard className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-[var(--foreground-muted)]">{label}</span>
        {icon && <span className="text-[var(--foreground-muted)]">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-3xl font-semibold tracking-tight", accentColor)}>{value}</span>
        {unit && <span className="text-sm text-[var(--foreground-muted)]">{unit}</span>}
      </div>
    </GlassCard>
  );
}
