import type { ReactNode } from "react";

export function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-[var(--foreground-muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
