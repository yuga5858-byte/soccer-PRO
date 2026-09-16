import * as repo from "@/lib/db/repo";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildCoachContext } from "@/lib/ai/context";
import { generateCoachMessage } from "@/lib/ai/coach";
import { todayIso, formatDate } from "@/lib/utils";
import { Bot, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

async function ensureTodayMessage() {
  const today = todayIso();
  const existing = repo.getCoachMessage(today);
  if (existing) return existing;

  const ctx = buildCoachContext();
  const generated = await generateCoachMessage(ctx);
  return repo.addCoachMessage({ ...generated, date: today });
}

export default async function CoachPage() {
  const today = await ensureTodayMessage();
  const history = repo.listCoachMessages().filter((m) => m.date !== today.date);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title="AI監督" subtitle="毎朝の過去データに基づくコーチング" />

      <GlassCard className="flex flex-col gap-3 border-2 border-[var(--accent-soft)]">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)]">
            <Bot size={20} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--foreground-muted)]">{formatDate(today.date)}</p>
            <p className="text-base font-bold">{today.headline}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed">{today.message}</p>
        {today.focusAreas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {today.focusAreas.map((f) => (
              <span
                key={f}
                className="flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]"
              >
                <Sparkles size={12} />
                {f}
              </span>
            ))}
          </div>
        )}
        <span className="text-[10px] uppercase tracking-widest text-[var(--foreground-muted)]">
          source: {today.source}
        </span>
      </GlassCard>

      {history.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--foreground-muted)]">過去のメッセージ</h3>
          {history.map((m) => (
            <GlassCard key={m.id} className="!p-4">
              <p className="text-xs text-[var(--foreground-muted)]">{formatDate(m.date)}</p>
              <p className="text-sm font-semibold">{m.headline}</p>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">{m.message}</p>
            </GlassCard>
          ))}
        </section>
      )}
    </div>
  );
}
