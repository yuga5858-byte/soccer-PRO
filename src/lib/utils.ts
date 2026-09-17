import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function daysUntil(targetDateIso: string): number {
  const diff = new Date(targetDateIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" });
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
