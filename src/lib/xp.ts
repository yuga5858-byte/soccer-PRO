// Simple RPG-style leveling curve: level 1 starts at 0 XP; each level requires more XP than the last.
export function xpRequiredForLevel(level: number): number {
  return Math.round(60 * (level - 1) * level); // cumulative XP needed to reach `level`
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= totalXp) {
    level += 1;
  }
  return level;
}

export function levelProgress(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPct: number;
} {
  const level = levelFromXp(totalXp);
  const currentLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  const progressPct = clampPct(((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);
  return { level, currentLevelXp, nextLevelXp, progressPct };
}

function clampPct(v: number) {
  return Math.min(100, Math.max(0, v));
}

export const XP_SOURCE_LABEL: Record<string, string> = {
  practice: "サッカー練習",
  strength: "筋力トレーニング",
  match: "試合",
  study: "戦術学習",
  video_analysis: "映像分析",
  task: "デイリータスク",
};
