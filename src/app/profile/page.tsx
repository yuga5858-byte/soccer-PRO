import * as repo from "@/lib/db/repo";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { levelProgress, XP_SOURCE_LABEL } from "@/lib/xp";
import { Star, Target, Moon, Pill, Ruler } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const profile = repo.getProfile();
  const xpEvents = repo.listXpEvents();
  const totalXp = profile.xp + xpEvents.reduce((s, e) => s + e.amount, 0);
  const { level, progressPct, nextLevelXp, currentLevelXp } = levelProgress(totalXp);

  const bySource = xpEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] ?? 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title="人生RPG" subtitle={`${profile.name} のステータス`} />

      <GlassCard className="flex flex-col items-center gap-2 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)] text-2xl font-bold text-[var(--accent)]">
          #{profile.jerseyNumber}
        </div>
        <p className="text-xl font-bold">{profile.name}</p>
        <p className="text-xs text-[var(--foreground-muted)]">
          {profile.university} / {profile.position}（{profile.subPosition}）
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Star size={16} className="text-[var(--gold)]" />
          <span className="text-lg font-bold">Lv. {level}</span>
        </div>
        <div className="w-full px-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-1 text-center text-[10px] text-[var(--foreground-muted)]">
            {totalXp - currentLevelXp} / {nextLevelXp - currentLevelXp} XP · 合計 {totalXp} XP
          </p>
        </div>
      </GlassCard>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-[var(--foreground-muted)]">経験値の獲得元</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(bySource).map(([source, amount]) => (
            <GlassCard key={source} className="!p-4">
              <p className="text-xs text-[var(--foreground-muted)]">{XP_SOURCE_LABEL[source] ?? source}</p>
              <p className="text-xl font-bold">{amount} XP</p>
            </GlassCard>
          ))}
          {Object.keys(bySource).length === 0 && (
            <p className="col-span-2 text-xs text-[var(--foreground-muted)]">まだ経験値の記録がありません。</p>
          )}
        </div>
      </section>

      <GlassCard className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Target size={16} className="text-[var(--accent)]" /> 目標
        </div>
        <ul className="flex flex-col gap-1">
          {profile.goals.map((g) => (
            <li key={g} className="text-sm text-[var(--foreground-muted)]">
              ・{g}
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Ruler size={16} className="text-[var(--accent)]" /> 基本情報
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="身長" value={`${profile.heightCm}cm`} />
          <Info label="体重 / 目標" value={`${profile.weightKg}kg / ${profile.targetWeightKg}kg`} />
          <Info label="利き足" value={profile.dominantFoot === "right" ? "右" : "左"} />
          <Info label="プレースタイル" value={profile.playStyle} />
          <Info label="憧れの選手" value={profile.idolPlayer} />
          <Info label="ベンチプレス" value={`${profile.benchPressKg}kg`} />
          <Info label="スクワット" value={`${profile.squatKg}kg`} />
          <Info label="握力" value={`${profile.gripStrengthKg}kg`} />
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Moon size={16} className="text-[var(--accent)]" /> 生活リズム
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Info label="睡眠" value={`${profile.sleepHours}時間`} />
          <Info label="就寝" value={profile.bedTime} />
          <Info label="起床" value={profile.wakeTime} />
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Pill size={16} className="text-[var(--accent)]" /> 怪我歴・サプリ
        </div>
        <ul className="flex flex-col gap-1 text-sm text-[var(--foreground-muted)]">
          {profile.injuryHistory.map((h) => (
            <li key={h}>・{h}</li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          サプリ: {profile.supplements.join(" / ")}
        </p>
      </GlassCard>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--foreground-muted)]">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
