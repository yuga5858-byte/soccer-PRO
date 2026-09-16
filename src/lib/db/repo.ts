import "server-only";
import { v4 as uuid } from "uuid";
import { readDb, writeDb } from "@/lib/db/local";
import type {
  AclLog,
  CoachMessage,
  DailyLog,
  DailyTask,
  MatchRecord,
  Profile,
  ProIndexSnapshot,
  SoccerTrainingSession,
  StrengthSession,
  VideoAnalysis,
  XpEvent,
  Abilities,
} from "@/lib/types";

// NOTE: This repository currently persists to a local JSON file (see lib/db/local.ts),
// which keeps the app fully functional without external services. The schema mirrors
// supabase/schema.sql 1:1, so swapping the implementation of each function below to
// call lib/db/supabase.ts is a contained change when a real Supabase project is wired up.

export function getProfile(): Profile {
  return readDb().profile;
}

export function updateProfile(patch: Partial<Profile>): Profile {
  const db = writeDb((db) => {
    db.profile = { ...db.profile, ...patch };
  });
  return db.profile;
}

export function getAbilities(): Abilities {
  return readDb().abilities;
}

export function updateAbilities(patch: Partial<Abilities>): Abilities {
  const db = writeDb((db) => {
    db.abilities = { ...db.abilities, ...patch };
  });
  return db.abilities;
}

export function listDailyLogs(): DailyLog[] {
  return [...readDb().dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
}

export function getDailyLog(date: string): DailyLog | undefined {
  return readDb().dailyLogs.find((l) => l.date === date);
}

export function upsertDailyLog(input: Omit<DailyLog, "id" | "createdAt">): DailyLog {
  const db = writeDb((db) => {
    const existingIdx = db.dailyLogs.findIndex((l) => l.date === input.date);
    if (existingIdx >= 0) {
      db.dailyLogs[existingIdx] = { ...db.dailyLogs[existingIdx], ...input };
    } else {
      db.dailyLogs.push({ ...input, id: uuid(), createdAt: new Date().toISOString() });
    }
  });
  return db.dailyLogs.find((l) => l.date === input.date)!;
}

export function listDailyTasks(date?: string): DailyTask[] {
  const tasks = readDb().dailyTasks;
  return date ? tasks.filter((t) => t.date === date) : tasks;
}

export function replaceTodayTasks(date: string, tasks: Omit<DailyTask, "id" | "date" | "done">[]): DailyTask[] {
  const db = writeDb((db) => {
    db.dailyTasks = db.dailyTasks.filter((t) => t.date !== date);
    for (const t of tasks) {
      db.dailyTasks.push({ ...t, id: uuid(), date, done: false });
    }
  });
  return db.dailyTasks.filter((t) => t.date === date);
}

export function toggleTask(id: string): DailyTask | undefined {
  const db = writeDb((db) => {
    const task = db.dailyTasks.find((t) => t.id === id);
    if (task) {
      task.done = !task.done;
      if (task.done) {
        db.xpEvents.push({
          id: uuid(),
          date: task.date,
          source: "task",
          amount: task.xpReward,
          reason: `タスク完了: ${task.title}`,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });
  return db.dailyTasks.find((t) => t.id === id);
}

export function listSoccerSessions(): SoccerTrainingSession[] {
  return [...readDb().soccerSessions].sort((a, b) => b.date.localeCompare(a.date));
}

export function addSoccerSession(input: Omit<SoccerTrainingSession, "id" | "createdAt">): SoccerTrainingSession {
  const session: SoccerTrainingSession = { ...input, id: uuid(), createdAt: new Date().toISOString() };
  writeDb((db) => {
    db.soccerSessions.push(session);
    const xp = Math.round(input.practiceMinutes / 6 + input.selfPracticeMinutes / 8 + input.videoAnalysisMinutes / 10);
    db.xpEvents.push({
      id: uuid(),
      date: input.date,
      source: "practice",
      amount: Math.max(5, xp),
      reason: "サッカートレーニング記録",
      createdAt: new Date().toISOString(),
    });
  });
  return session;
}

export function listStrengthSessions(): StrengthSession[] {
  return [...readDb().strengthSessions].sort((a, b) => b.date.localeCompare(a.date));
}

export function addStrengthSession(input: Omit<StrengthSession, "id" | "createdAt">): StrengthSession {
  const session: StrengthSession = { ...input, id: uuid(), createdAt: new Date().toISOString() };
  writeDb((db) => {
    db.strengthSessions.push(session);
    const volume = input.sets.reduce((sum, s) => sum + s.weightKg * s.reps * s.sets, 0);
    db.xpEvents.push({
      id: uuid(),
      date: input.date,
      source: "strength",
      amount: Math.max(5, Math.round(volume / 500)),
      reason: "筋力トレーニング記録",
      createdAt: new Date().toISOString(),
    });
  });
  return session;
}

export function listAclLogs(): AclLog[] {
  return [...readDb().aclLogs].sort((a, b) => a.date.localeCompare(b.date));
}

export function upsertAclLog(input: Omit<AclLog, "id" | "createdAt">): AclLog {
  const db = writeDb((db) => {
    const idx = db.aclLogs.findIndex((l) => l.date === input.date);
    if (idx >= 0) {
      db.aclLogs[idx] = { ...db.aclLogs[idx], ...input };
    } else {
      db.aclLogs.push({ ...input, id: uuid(), createdAt: new Date().toISOString() });
    }
  });
  return db.aclLogs.find((l) => l.date === input.date)!;
}

export function listMatches(): MatchRecord[] {
  return [...readDb().matches].sort((a, b) => b.date.localeCompare(a.date));
}

export function addMatch(input: Omit<MatchRecord, "id" | "createdAt">): MatchRecord {
  const match: MatchRecord = { ...input, id: uuid(), createdAt: new Date().toISOString() };
  writeDb((db) => {
    db.matches.push(match);
    const xp = 40 + input.goals * 15 + input.assists * 10 + Math.round(input.keyPasses * 2);
    db.xpEvents.push({
      id: uuid(),
      date: input.date,
      source: "match",
      amount: xp,
      reason: "試合記録",
      createdAt: new Date().toISOString(),
    });
  });
  return match;
}

export function listVideoAnalyses(): VideoAnalysis[] {
  return [...readDb().videoAnalyses].sort((a, b) => b.date.localeCompare(a.date));
}

export function addVideoAnalysis(input: Omit<VideoAnalysis, "id" | "createdAt">): VideoAnalysis {
  const analysis: VideoAnalysis = { ...input, id: uuid(), createdAt: new Date().toISOString() };
  writeDb((db) => {
    db.videoAnalyses.push(analysis);
    if (analysis.status === "completed") {
      db.xpEvents.push({
        id: uuid(),
        date: input.date,
        source: "video_analysis",
        amount: 20,
        reason: "映像分析完了",
        createdAt: new Date().toISOString(),
      });
    }
  });
  return analysis;
}

export function updateVideoAnalysis(id: string, patch: Partial<VideoAnalysis>): VideoAnalysis | undefined {
  const db = writeDb((db) => {
    const idx = db.videoAnalyses.findIndex((v) => v.id === id);
    if (idx >= 0) {
      const wasCompleted = db.videoAnalyses[idx].status === "completed";
      db.videoAnalyses[idx] = { ...db.videoAnalyses[idx], ...patch };
      if (!wasCompleted && db.videoAnalyses[idx].status === "completed") {
        db.xpEvents.push({
          id: uuid(),
          date: db.videoAnalyses[idx].date,
          source: "video_analysis",
          amount: 20,
          reason: "映像分析完了",
          createdAt: new Date().toISOString(),
        });
      }
    }
  });
  return db.videoAnalyses.find((v) => v.id === id);
}

export function listCoachMessages(): CoachMessage[] {
  return [...readDb().coachMessages].sort((a, b) => b.date.localeCompare(a.date));
}

export function getCoachMessage(date: string): CoachMessage | undefined {
  return readDb().coachMessages.find((m) => m.date === date);
}

export function addCoachMessage(input: Omit<CoachMessage, "id" | "createdAt">): CoachMessage {
  const message: CoachMessage = { ...input, id: uuid(), createdAt: new Date().toISOString() };
  writeDb((db) => {
    db.coachMessages = db.coachMessages.filter((m) => m.date !== input.date);
    db.coachMessages.push(message);
  });
  return message;
}

export function listXpEvents(): XpEvent[] {
  return [...readDb().xpEvents].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listProIndexHistory(): ProIndexSnapshot[] {
  return [...readDb().proIndexHistory].sort((a, b) => a.date.localeCompare(b.date));
}

export function recordProIndexSnapshot(snapshot: ProIndexSnapshot): ProIndexSnapshot {
  writeDb((db) => {
    db.proIndexHistory = db.proIndexHistory.filter((s) => s.date !== snapshot.date);
    db.proIndexHistory.push(snapshot);
  });
  return snapshot;
}

export function getFullDb() {
  return readDb();
}
