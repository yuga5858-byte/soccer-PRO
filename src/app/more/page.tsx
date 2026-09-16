import Link from "next/link";
import { Dumbbell, ShieldPlus, Video, Film, UserCircle, Activity } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeading } from "@/components/ui/section-heading";

const ITEMS = [
  { href: "/training", label: "トレーニング管理", desc: "サッカー・筋トレの記録", icon: Dumbbell },
  { href: "/acl", label: "ACL管理", desc: "痛み・不安感・可動域", icon: ShieldPlus },
  { href: "/video/squat", label: "スクワット分析", desc: "AI映像分析（ACLリスク）", icon: Video },
  { href: "/video/match", label: "試合映像分析", desc: "AI映像分析（プレー傾向）", icon: Film },
  { href: "/abilities", label: "能力値", desc: "レーダーチャート", icon: Activity },
  { href: "/profile", label: "人生RPG / プロフィール", desc: "レベル・XP・基本情報", icon: UserCircle },
] as const;

export default function MorePage() {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeading title="その他" subtitle="すべての機能" />
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href}>
            <GlassCard className="flex h-full flex-col gap-2 !p-4">
              <Icon size={22} className="text-[var(--accent)]" />
              <span className="text-sm font-semibold leading-tight">{label}</span>
              <span className="text-xs text-[var(--foreground-muted)]">{desc}</span>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
