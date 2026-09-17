import * as repo from "@/lib/db/repo";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { NumberField, TextField } from "@/components/ui/number-field";
import { SliderField } from "@/components/ui/slider-field";
import { submitMatch } from "@/app/actions";
import { formatDate, todayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function MatchesPage() {
  const matches = repo.listMatches();

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title="試合分析" subtitle="試合ごとのスタッツと自己評価" />

      <GlassCard>
        <form action={submitMatch} className="flex flex-col gap-4">
          <input type="hidden" name="date" value={todayIso()} />
          <TextField name="opponent" label="対戦相手" placeholder="任意" />
          <div className="grid grid-cols-2 gap-3">
            <NumberField name="minutesPlayed" label="出場時間 (分)" defaultValue={0} />
            <NumberField name="goals" label="ゴール" defaultValue={0} />
            <NumberField name="assists" label="アシスト" defaultValue={0} />
            <NumberField name="passSuccessRate" label="パス成功率 (%)" defaultValue={0} />
            <NumberField name="progressivePasses" label="前進パス" defaultValue={0} />
            <NumberField name="throughPassesCompleted" label="スルーパス成功数" defaultValue={0} />
            <NumberField name="keyPasses" label="キーパス" defaultValue={0} />
            <NumberField name="ballsWon" label="ボール奪取" defaultValue={0} />
            <NumberField name="ballsLost" label="ロスト" defaultValue={0} />
          </div>
          <SliderField name="selfRating" label="自己評価" defaultValue={7} suffix="/10" />
          <TextField name="selfEvaluation" label="自己評価コメント" textarea placeholder="今日のプレーの振り返り" />
          <Button type="submit">試合を記録</Button>
        </form>
      </GlassCard>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--foreground-muted)]">履歴</h3>
        {matches.map((m) => (
          <GlassCard key={m.id} className="flex flex-col gap-2 !p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{formatDate(m.date)}</span>
              {m.opponent && <span className="text-xs text-[var(--foreground-muted)]">vs {m.opponent}</span>}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <Stat label="出場" value={`${m.minutesPlayed}分`} />
              <Stat label="G" value={m.goals} />
              <Stat label="A" value={m.assists} />
              <Stat label="パス%" value={`${m.passSuccessRate}%`} />
              <Stat label="スルーパス" value={m.throughPassesCompleted} />
              <Stat label="キーパス" value={m.keyPasses} />
              <Stat label="奪取" value={m.ballsWon} />
              <Stat label="ロスト" value={m.ballsLost} />
            </div>
            {m.selfEvaluation && <p className="text-xs text-[var(--foreground-muted)]">{m.selfEvaluation}</p>}
          </GlassCard>
        ))}
        {matches.length === 0 && <p className="text-xs text-[var(--foreground-muted)]">まだ試合記録がありません。</p>}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-[var(--accent-soft)] py-1.5">
      <div className="font-semibold">{value}</div>
      <div className="text-[9px] text-[var(--foreground-muted)]">{label}</div>
    </div>
  );
}
