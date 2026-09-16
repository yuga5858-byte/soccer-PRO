import * as repo from "@/lib/db/repo";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { AbilityRadarChart } from "@/components/ability-radar-chart";
import type { Abilities } from "@/lib/types";

const LABELS: Record<keyof Abilities, string> = {
  pass: "パス",
  throughPass: "スルーパス",
  kick: "キック",
  keep: "キープ力",
  vision: "視野",
  tactics: "戦術理解",
  defense: "守備",
  agility: "アジリティ",
  mental: "メンタル",
  resilience: "レジリエンス",
};

export const dynamic = "force-dynamic";

const STRENGTH_KEYS: Array<keyof Abilities> = ["pass", "throughPass", "kick", "keep"];

function tierLabel(value: number) {
  if (value >= 85) return { label: "S", color: "var(--gold)" };
  if (value >= 70) return { label: "A", color: "var(--success)" };
  if (value >= 55) return { label: "B", color: "var(--accent)" };
  if (value >= 40) return { label: "C", color: "var(--warning)" };
  return { label: "D", color: "var(--danger)" };
}

export default function AbilitiesPage() {
  const abilities = repo.getAbilities();
  const keys = Object.keys(abilities) as Array<keyof Abilities>;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeading title="能力値" subtitle="ゲーム風ステータス表示" />

      <GlassCard>
        <AbilityRadarChart abilities={abilities} />
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        {keys.map((key) => {
          const value = abilities[key];
          const tier = tierLabel(value);
          const isStrength = STRENGTH_KEYS.includes(key);
          return (
            <GlassCard key={key} className="flex flex-col gap-2 !p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--foreground-muted)]">{LABELS[key]}</span>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: tier.color }}
                >
                  {tier.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight">{value}</span>
                <span className="text-xs text-[var(--foreground-muted)]">/100</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${value}%`, background: isStrength ? "var(--gold)" : "var(--accent)" }}
                />
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
