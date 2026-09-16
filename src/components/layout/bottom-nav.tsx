"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Trophy, Bot, Grid2x2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/abilities", label: "能力", icon: Activity },
  { href: "/matches", label: "試合", icon: Trophy },
  { href: "/coach", label: "コーチ", icon: Bot },
  { href: "/more", label: "その他", icon: Grid2x2 },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[560px] justify-center px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="glass-nav flex w-full items-center justify-between rounded-[24px] px-2 py-2 shadow-lg">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
