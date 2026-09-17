import * as repo from "@/lib/db/repo";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { NumberField, TextField } from "@/components/ui/number-field";
import { StrengthForm } from "@/components/strength-form";
import { HistoryChart } from "@/components/history-chart";
import { submitSoccerSession } from "@/app/actions";
import { formatDate, todayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function TrainingPage() {
  const soccerSessions = repo.listSoccerSessions();
  const strengthSessions = repo.listStrengthSessions();

  const soccerChartData = [...soccerSessions]
    .slice(0, 14)
    .reverse()
    .map((s) => ({
      date: formatDate(s.date),
      練習: s.practiceMinutes,
      自主練: s.selfPracticeMinutes,
    }));

  const strengthChartData = [...strengthSessions]
    .slice(0, 14)
    .reverse()
    .map((s) => ({
      date: formatDate(s.date),
      総負荷: s.sets.reduce((sum, set) => sum + set.weightKg * set.reps * set.sets, 0),
    }));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title="トレーニング管理" subtitle="サッカー・筋トレを毎日記録" />

      <section>
        <h3 className="mb-2 text-sm font-semibold text-[var(--foreground-muted)]">サッカー練習</h3>
        <GlassCard>
          <form action={submitSoccerSession} className="flex flex-col gap-3">
            <input type="hidden" name="date" value={todayIso()} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField name="practiceMinutes" label="練習時間 (分)" defaultValue={0} />
              <NumberField name="selfPracticeMinutes" label="自主練時間 (分)" defaultValue={0} />
              <NumberField name="ballTouches" label="ボールタッチ数" defaultValue={0} />
              <NumberField name="videoAnalysisMinutes" label="動画分析時間 (分)" defaultValue={0} />
            </div>
            <TextField name="notes" label="メモ" placeholder="任意" />
            <Button type="submit">サッカー練習を記録</Button>
          </form>
        </GlassCard>
      </section>

      {soccerChartData.length > 0 && (
        <GlassCard>
          <p className="mb-2 text-xs text-[var(--foreground-muted)]">練習時間の推移</p>
          <HistoryChart
            data={soccerChartData}
            lines={[
              { key: "練習", color: "var(--accent)", label: "練習" },
              { key: "自主練", color: "var(--gold)", label: "自主練" },
            ]}
          />
        </GlassCard>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-[var(--foreground-muted)]">筋力トレーニング</h3>
        <GlassCard>
          <StrengthForm />
        </GlassCard>
      </section>

      {strengthChartData.length > 0 && (
        <GlassCard>
          <p className="mb-2 text-xs text-[var(--foreground-muted)]">総負荷（重量×回数×セット）の推移</p>
          <HistoryChart data={strengthChartData} lines={[{ key: "総負荷", color: "var(--danger)", label: "総負荷" }]} />
        </GlassCard>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-[var(--foreground-muted)]">履歴</h3>
        {soccerSessions.slice(0, 10).map((s) => (
          <GlassCard key={s.id} className="!p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{formatDate(s.date)}</span>
              <span className="text-xs text-[var(--foreground-muted)]">
                練習{s.practiceMinutes}分 / 自主練{s.selfPracticeMinutes}分
              </span>
            </div>
            {s.notes && <p className="mt-1 text-xs text-[var(--foreground-muted)]">{s.notes}</p>}
          </GlassCard>
        ))}
        {soccerSessions.length === 0 && (
          <p className="text-xs text-[var(--foreground-muted)]">まだ記録がありません。</p>
        )}
      </section>
    </div>
  );
}
