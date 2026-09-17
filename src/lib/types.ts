// Domain types for 安羅夕雅OS — a single-user AI soccer coach personal OS.

export type Foot = "right" | "left" | "both";

export interface Profile {
  id: string;
  name: string;
  age: number;
  birthTargetAge: number; // pro debut target age (22)
  proDeadlineDate: string; // ISO date — the day 安羅夕雅 turns birthTargetAge
  university: string;
  position: string;
  subPosition: string;
  dominantFoot: Foot;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  jerseyNumber: number;
  playStyle: string;
  idolPlayer: string;
  strengths: string[];
  weaknesses: string[];
  injuryHistory: string[];
  supplements: string[];
  goals: string[];
  sleepHours: number;
  bedTime: string; // "00:00"
  wakeTime: string; // "08:00"
  mealsPerDay: number;
  benchPressKg: number;
  squatKg: number;
  gripStrengthKg: number;
  level: number;
  xp: number;
  createdAt: string;
}

export type AbilityKey =
  | "pass"
  | "throughPass"
  | "kick"
  | "keep"
  | "vision"
  | "tactics"
  | "defense"
  | "agility"
  | "mental"
  | "resilience";

export type Abilities = Record<AbilityKey, number>; // 0-100

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number | null;
  sleepHours: number | null;
  painLevel: number | null; // 0-10
  anxietyLevel: number | null; // 0-10
  mood: number | null; // 0-10
  note: string | null;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  date: string;
  title: string;
  category: "soccer" | "strength" | "recovery" | "study" | "mental" | "video";
  reason: string;
  done: boolean;
  xpReward: number;
}

export interface SoccerTrainingSession {
  id: string;
  date: string;
  practiceMinutes: number;
  selfPracticeMinutes: number;
  ballTouches: number;
  videoAnalysisMinutes: number;
  notes: string | null;
  createdAt: string;
}

export interface StrengthSet {
  exercise: string;
  weightKg: number;
  reps: number;
  sets: number;
}

export interface StrengthSession {
  id: string;
  date: string;
  sets: StrengthSet[];
  notes: string | null;
  createdAt: string;
}

export interface AclLog {
  id: string;
  date: string;
  pain: number; // 0-10
  anxiety: number; // 0-10
  swelling: number; // 0-10
  rangeOfMotionDeg: number | null;
  notes: string | null;
  createdAt: string;
}

export interface MatchRecord {
  id: string;
  date: string;
  opponent: string | null;
  minutesPlayed: number;
  goals: number;
  assists: number;
  passSuccessRate: number; // 0-100
  progressivePasses: number;
  throughPassesCompleted: number;
  keyPasses: number;
  ballsWon: number;
  ballsLost: number;
  selfRating: number; // 0-10
  selfEvaluation: string | null;
  createdAt: string;
}

export type VideoAnalysisType = "squat" | "match";

export interface SquatAnalysisResult {
  leftRightAsymmetryPct: number;
  depthScore: number; // 0-100
  kneeValgusScore: number; // 0-100, higher = more inward collapse risk
  aclRiskScore: number; // 0-100
  improvementPoints: string[];
}

export interface MatchVideoAnalysisResult {
  ballTouches: number;
  passes: number;
  throughPasses: number;
  losses: number;
  defensiveActions: number;
  improvementPoints: string[];
}

export interface VideoAnalysis {
  id: string;
  date: string;
  type: VideoAnalysisType;
  fileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  squatResult: SquatAnalysisResult | null;
  matchResult: MatchVideoAnalysisResult | null;
  createdAt: string;
}

export interface CoachMessage {
  id: string;
  date: string;
  headline: string;
  message: string;
  focusAreas: string[];
  source: "claude" | "openai" | "rule-based";
  createdAt: string;
}

export type XpSource = "practice" | "strength" | "match" | "study" | "video_analysis" | "task";

export interface XpEvent {
  id: string;
  date: string;
  source: XpSource;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface ProIndexBreakdown {
  practiceVolume: number;
  matchPerformance: number;
  physicalCondition: number;
  aclCondition: number;
  strength: number;
  sleep: number;
  mental: number;
}

export interface ProIndexSnapshot {
  date: string;
  score: number; // 0-100
  breakdown: ProIndexBreakdown;
}

export interface Database {
  profile: Profile;
  abilities: Abilities;
  dailyLogs: DailyLog[];
  dailyTasks: DailyTask[];
  soccerSessions: SoccerTrainingSession[];
  strengthSessions: StrengthSession[];
  aclLogs: AclLog[];
  matches: MatchRecord[];
  videoAnalyses: VideoAnalysis[];
  coachMessages: CoachMessage[];
  xpEvents: XpEvent[];
  proIndexHistory: ProIndexSnapshot[];
}
