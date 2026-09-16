import * as repo from "@/lib/db/repo";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { VideoUploader } from "@/components/video-uploader";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function SquatAnalysisPage() {
  const analyses = repo.listVideoAnalyses().filter((a) => a.type === "squat");

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title="スクワット動作分析" subtitle="MediaPipeによる骨格認識でACLリスクを可視化" />
      <VideoUploader type="squat" />

      <section className="flex flex-col gap-3">
        {analyses.map((a) => (
          <GlassCard key={a.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{formatDate(a.date)}</span>
              <span className="text-xs text-[var(--foreground-muted)]">{a.fileName}</span>
            </div>
            {a.squatResult && (
              <>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <Metric label="左右差" value={`${a.squatResult.leftRightAsymmetryPct}%`} />
                  <Metric label="深さ" value={a.squatResult.depthScore} />
                  <Metric label="膝の向き" value={a.squatResult.kneeValgusScore} />
                  <Metric
                    label="ACLリスク"
                    value={a.squatResult.aclRiskScore}
                    danger={a.squatResult.aclRiskScore >= 60}
                  />
                </div>
                <ul className="flex flex-col gap-1">
                  {a.squatResult.improvementPoints.map((p, i) => (
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

function Metric({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="rounded-lg bg-[var(--accent-soft)] py-2">
      <div className="font-semibold" style={{ color: danger ? "var(--danger)" : undefined }}>
        {value}
      </div>
      <div className="text-[9px] text-[var(--foreground-muted)]">{label}</div>
    </div>
  );
}
