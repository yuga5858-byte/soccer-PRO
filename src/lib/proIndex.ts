import type {
  AclLog,
  DailyLog,
  MatchRecord,
  Profile,
  ProIndexBreakdown,
  SoccerTrainingSession,
  StrengthSession,
} from "@/lib/types";

const WEIGHTS: Record<keyof ProIndexBreakdown, number> = {
  practiceVolume: 20,
  matchPerformance: 20,
  physicalCondition: 15,
  aclCondition: 15,
  strength: 10,
  sleep: 10,
  mental: 10,
};

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

function scorePracticeVolume(sessions: SoccerTrainingSession[]): number {
  const last7 = sessions.slice(-7);
  if (last7.length === 0) return 30;
  const avgMinutes =
    last7.reduce((s, x) => s + x.practiceMinutes + x.selfPracticeMinutes, 0) / last7.length;
  // 150 min/day (practice + self) treated as full score
  return clamp((avgMinutes / 150) * 100);
}

function scoreMatchPerformance(matches: MatchRecord[]): number {
  const last5 = matches.slice(0, 5);
  if (last5.length === 0) return 50;
  const avgRating = last5.reduce((s, m) => s + m.selfRating, 0) / last5.length;
  const avgPassRate = last5.reduce((s, m) => s + m.passSuccessRate, 0) / last5.length;
  return clamp(avgRating * 6 + avgPassRate * 0.4);
}

function scorePhysicalCondition(profile: Profile, logs: DailyLog[]): number {
  const latest = logs[logs.length - 1];
  const weight = latest?.weightKg ?? profile.weightKg;
  const weightDiff = Math.abs(weight - profile.targetWeightKg);
  const weightScore = clamp(100 - weightDiff * 15);
  const painScore = latest?.painLevel != null ? clamp(100 - latest.painLevel * 10) : 60;
  return clamp(weightScore * 0.5 + painScore * 0.5);
}

function scoreAclCondition(aclLogs: AclLog[]): number {
  const latest = aclLogs[aclLogs.length - 1];
  if (!latest) return 60;
  const painScore = clamp(100 - latest.pain * 10);
  const anxietyScore = clamp(100 - latest.anxiety * 10);
  const swellingScore = clamp(100 - latest.swelling * 12);
  return clamp(painScore * 0.4 + anxietyScore * 0.35 + swellingScore * 0.25);
}

function scoreStrength(profile: Profile, sessions: StrengthSession[]): number {
  const baselineTotal = profile.benchPressKg + profile.squatKg + profile.gripStrengthKg * 2;
  const recentVolume = sessions.slice(-7).reduce(
    (sum, s) => sum + s.sets.reduce((a, set) => a + set.weightKg * set.reps * set.sets, 0),
    0
  );
  const consistency = clamp((sessions.slice(-7).length / 4) * 100);
  const baselineScore = clamp((baselineTotal / 320) * 100);
  return clamp(baselineScore * 0.6 + consistency * 0.4 + Math.min(recentVolume / 2000, 10));
}

function scoreSleep(logs: DailyLog[]): number {
  const last7 = logs.slice(-7).filter((l) => l.sleepHours != null);
  if (last7.length === 0) return 60;
  const avg = last7.reduce((s, l) => s + (l.sleepHours ?? 0), 0) / last7.length;
  // 8 hours = 100, scaled down/up around ideal range 7-9h
  if (avg >= 7 && avg <= 9) return 100;
  const diff = avg < 7 ? 7 - avg : avg - 9;
  return clamp(100 - diff * 20);
}

function scoreMental(logs: DailyLog[]): number {
  const last7 = logs.slice(-7).filter((l) => l.mood != null);
  if (last7.length === 0) return 60;
  const avg = last7.reduce((s, l) => s + (l.mood ?? 0), 0) / last7.length;
  return clamp(avg * 10);
}

export interface ProIndexInput {
  profile: Profile;
  dailyLogs: DailyLog[];
  aclLogs: AclLog[];
  matches: MatchRecord[];
  soccerSessions: SoccerTrainingSession[];
  strengthSessions: StrengthSession[];
}

export function computeProIndex(input: ProIndexInput): { score: number; breakdown: ProIndexBreakdown } {
  const breakdown: ProIndexBreakdown = {
    practiceVolume: scorePracticeVolume(input.soccerSessions),
    matchPerformance: scoreMatchPerformance(input.matches),
    physicalCondition: scorePhysicalCondition(input.profile, input.dailyLogs),
    aclCondition: scoreAclCondition(input.aclLogs),
    strength: scoreStrength(input.profile, input.strengthSessions),
    sleep: scoreSleep(input.dailyLogs),
    mental: scoreMental(input.dailyLogs),
  };

  const score = (Object.keys(breakdown) as Array<keyof ProIndexBreakdown>).reduce(
    (sum, key) => sum + (breakdown[key] * WEIGHTS[key]) / 100,
    0
  );

  return { score: Math.round(clamp(score)), breakdown };
}
