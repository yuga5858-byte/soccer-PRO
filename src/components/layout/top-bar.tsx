"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";

export function TopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes reads localStorage/system theme synchronously on the client, so resolvedTheme
  // differs between the server render and the client's first render. Gating on `mounted` avoids
  // that hydration mismatch (the documented next-themes workaround).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),16px)] pb-3">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tracking-tight">安羅夕雅OS</span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--foreground-muted)]">
          AI Soccer Coach
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="テーマ切り替え"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="glass-panel flex h-9 w-9 items-center justify-center !rounded-full"
        >
          {mounted && resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <Link
          href="/profile"
          aria-label="プロフィール"
          className="glass-panel flex h-9 w-9 items-center justify-center !rounded-full"
        >
          <User size={16} />
        </Link>
      </div>
    </header>
  );
}
