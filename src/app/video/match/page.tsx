import * as repo from "@/lib/db/repo";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { VideoUploader } from "@/components/video-uploader";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function MatchVideoAnalysisPage() {
  const analyses = repo.listVideoAnalyses().filter((a) => a.type === "match");

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title="サッカー映像分析" subtitle="試合動画からプレー傾向を分析" />
      <VideoUploader type="match" />

      <section className="flex flex-col gap-3">
        {analyses.map((a) => (
          <GlassCard key={a.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{formatDate(a.date)}</span>
              <span className="text-xs text-[var(--foreground-muted)]">{a.fileName}</span>
            </div>
            {a.matchResult && (
              <>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <Metric label="タッチ" value={a.matchResult.ballTouches} />
                  <Metric label="パス" value={a.matchResult.passes} />
                  <Metric label="スルーパス" value={a.matchResult.throughPasses} />
                  <Metric label="ロスト" value={a.matchResult.losses} />
                  <Metric label="守備" value={a.matchResult.defensiveActions} />
                </div>
                <ul className="flex flex-col gap-1">
                  {a.matchResult.improvementPoints.map((p, i) => (
                    <li key={i} className="text-xs text-[var(--foreground-muted)]">
                      ・{p}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </GlassCard>
        ))}
        {analyses.length === 0 && (
          <p className="text-center text-xs text-[var(--foreground-muted)]">まだ分析結果がありません。</p>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-[var(--accent-soft)] py-2">
      <div className="font-semibold">{value}</div>
      <div className="text-[9px] text-[var(--foreground-muted)]">{label}</div>
    </div>
  );
}
