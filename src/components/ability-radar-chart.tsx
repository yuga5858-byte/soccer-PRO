"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
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

export function AbilityRadarChart({ abilities }: { abilities: Abilities }) {
  const data = (Object.keys(LABELS) as Array<keyof Abilities>).map((key) => ({
    subject: LABELS[key],
    value: abilities[key],
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="var(--border-subtle)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="能力値"
            dataKey="value"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
