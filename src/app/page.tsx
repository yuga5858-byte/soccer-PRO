import Link from "next/link";
import { CheckCircle2, Circle, Flame } from "lucide-react";
import * as repo from "@/lib/db/repo";
import { computeProIndex } from "@/lib/proIndex";
import { levelProgress } from "@/lib/xp";
import { buildCoachContext } from "@/lib/ai/context";
import { generateDailyTasks } from "@/lib/ai/tasks";
import { GlassCard } from "@/components/ui/glass-card";
import { StatTile } from "@/components/ui/stat-tile";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SectionHeading } from "@/components/ui/section-heading";
import { daysUntil, todayIso } from "@/lib/utils";
import { toggleTaskAction } from "@/app/actions";

export const dynamic = "force-dynamic";

async function ensureTodayTasks() {
  const today = todayIso();
  const existing = repo.listDailyTasks(today);
  if (existing.length > 0) return existing;

  const ctx = buildCoachContext();
  const drafts = await generateDailyTasks(ctx);
  return repo.replaceTodayTasks(today, drafts);
}

export default async function HomePage() {
  const profile = repo.getProfile();
  const dailyLogs = repo.listDailyLogs();
  const aclLogs = repo.listAclLogs();
  const matches = repo.listMatches();
  const soccerSessions = repo.listSoccerSessions();
  const strengthSessions = repo.listStrengthSessions();
  const xpEvents = repo.listXpEvents();

  const { score } = computeProIndex({
    profile,
    dailyLogs,
    aclLogs,
    matches,
    soccerSessions,
    strengthSessions,
  });

  const totalXp = profile.xp + xpEvents.reduce((s, e) => s + e.amount, 0);
  const { level, progressPct, nextLevelXp, currentLevelXp } = levelProgress(totalXp);

  const today = todayIso();
  const todayLog = dailyLogs.find((l) => l.date === today);
  const todayAcl = aclLogs.find((l) => l.date === today);
  const tasks = await ensureTodayTasks();

  const daysLeft = daysUntil(profile.proDeadlineDate);

  return (
    <div className="flex flex-col gap-5">
      <GlassCard className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--foreground-muted)]">プロ指数</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {profile.name} ・ {profile.position} #{profile.jerseyNumber}
          </p>
        </div>
        <ProgressRing value={score} label={`${score}`} sublabel="/ 100" color="var(--accent)" />
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="今日の体重"
          value={todayLog?.weightKg ?? profile.weightKg}
          unit="kg"
          accent={todayLog?.weightKg && todayLog.weightKg >= profile.targetWeightKg ? "success" : "default"}
        />
        <StatTile label="今日の睡眠" value={todayLog?.sleepHours ?? "—"} unit="時間" />
        <StatTile
          label="今日の痛み"
          value={todayAcl?.pain ?? "—"}
          unit="/10"
          accent={(todayAcl?.pain ?? 0) >= 6 ? "danger" : "default"}
        />
        <StatTile label="22歳までの残り日数" value={daysLeft} unit="日" accent="gold" />
      </div>

      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--foreground-muted)]">レベル</p>
            <p className="text-2xl font-bold tracking-tight">Lv. {level}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
            <Flame size={14} className="text-[var(--warning)]" />
            {totalXp - currentLevelXp} / {nextLevelXp - currentLevelXp} XP
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </GlassCard>

      <section>
        <SectionHeading title="今日のタスク" subtitle="AIコーチが自動生成" />
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <form key={task.id} action={toggleTaskAction.bind(null, task.id)}>
              <button
                type="submit"
                className="glass-panel flex w-full items-start gap-3 p-4 text-left"
              >
                {task.done ? (
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[var(--success)]" />
                ) : (
                  <Circle size={20} className="mt-0.5 shrink-0 text-[var(--foreground-muted)]" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.done ? "line-through opacity-50" : ""}`}>
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">{task.reason}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--accent)]">
                  +{task.xpReward}XP
                </span>
              </button>
            </form>
          ))}
        </div>
      </section>

      <Link href="/coach" className="glass-panel block p-4 text-center text-sm font-medium text-[var(--accent)]">
        今朝のAI監督メッセージを見る →
      </Link>
    </div>
  );
}
