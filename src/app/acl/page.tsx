import * as repo from "@/lib/db/repo";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { NumberField, TextField } from "@/components/ui/number-field";
import { SliderField } from "@/components/ui/slider-field";
import { HistoryChart } from "@/components/history-chart";
import { submitAclLog } from "@/app/actions";
import { analyzeInjuryRisk } from "@/lib/ai/injuryRisk";
import { formatDate, todayIso } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

const RISK_COLOR: Record<string, string> = {
  low: "var(--success)",
  moderate: "var(--warning)",
  high: "var(--danger)",
  critical: "var(--danger)",
};

const RISK_LABEL: Record<string, string> = {
  low: "低リスク",
  moderate: "中リスク",
  high: "高リスク",
  critical: "重大リスク",
};

export default function AclPage() {
  const logs = repo.listAclLogs();
  const today = todayIso();
  const todayLog = logs.find((l) => l.date === today);
  const risk = analyzeInjuryRisk(logs);

  const chartData = logs.slice(-14).map((l) => ({
    date: formatDate(l.date),
    痛み: l.pain,
    不安感: l.anxiety,
    腫れ: l.swelling,
  }));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title="ACL管理" subtitle="左膝ACL断裂3回の既往を継続モニタリング" />

      <GlassCard className="flex items-start gap-3">
        <ShieldAlert size={28} style={{ color: RISK_COLOR[risk.riskLevel] }} className="mt-0.5 shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: RISK_COLOR[risk.riskLevel] }}>
              {RISK_LABEL[risk.riskLevel]}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">リスクスコア {risk.riskScore}/100</span>
          </div>
          <p className="mt-1 text-sm">{risk.message}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {risk.recommendations.map((r, i) => (
              <li key={i} className="text-xs text-[var(--foreground-muted)]">
                ・{r}
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>

      <GlassCard>
        <form action={submitAclLog} className="flex flex-col gap-4">
          <input type="hidden" name="date" value={today} />
          <SliderField name="pain" label="痛み" defaultValue={todayLog?.pain ?? 4} suffix="/10" />
          <SliderField name="anxiety" label="不安感" defaultValue={todayLog?.anxiety ?? 4} suffix="/10" />
          <SliderField name="swelling" label="腫れ" defaultValue={todayLog?.swelling ?? 0} suffix="/10" />
          <NumberField
            name="rangeOfMotionDeg"
            label="可動域 (度)"
            defaultValue={todayLog?.rangeOfMotionDeg ?? 130}
          />
          <TextField name="notes" label="メモ" defaultValue={todayLog?.notes ?? ""} placeholder="任意" />
          <Button type="submit">今日のACL状態を記録</Button>
        </form>
      </GlassCard>

      {chartData.length > 0 && (
        <GlassCard>
          <p className="mb-2 text-xs text-[var(--foreground-muted)]">痛み・不安感・腫れの推移</p>
          <HistoryChart
            data={chartData}
            lines={[
              { key: "痛み", color: "var(--danger)", label: "痛み" },
              { key: "不安感", color: "var(--warning)", label: "不安感" },
              { key: "腫れ", color: "var(--accent)", label: "腫れ" },
            ]}
          />
        </GlassCard>
      )}
    </div>
  );
}
