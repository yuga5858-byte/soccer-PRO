import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.97] disabled:opacity-40",
        variant === "primary" && "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-soft)]",
        variant === "secondary" && "glass-panel !rounded-2xl text-[var(--foreground)]",
        variant === "ghost" && "text-[var(--accent)]",
        className
      )}
      {...props}
    />
  );
}
