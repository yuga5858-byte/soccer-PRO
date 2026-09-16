"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/db/repo";
import { todayIso } from "@/lib/utils";
import type { StrengthSet } from "@/lib/types";

const num = (fd: FormData, key: string): number | null => {
  const v = fd.get(key);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export async function submitDailyLog(formData: FormData) {
  const date = (formData.get("date") as string) || todayIso();
  repo.upsertDailyLog({
    date,
    weightKg: num(formData, "weightKg"),
    sleepHours: num(formData, "sleepHours"),
    painLevel: num(formData, "painLevel"),
    anxietyLevel: num(formData, "anxietyLevel"),
    mood: num(formData, "mood"),
    note: (formData.get("note") as string) || null,
  });
  revalidatePath("/");
}

export async function submitSoccerSession(formData: FormData) {
  const date = (formData.get("date") as string) || todayIso();
  repo.addSoccerSession({
    date,
    practiceMinutes: num(formData, "practiceMinutes") ?? 0,
    selfPracticeMinutes: num(formData, "selfPracticeMinutes") ?? 0,
    ballTouches: num(formData, "ballTouches") ?? 0,
    videoAnalysisMinutes: num(formData, "videoAnalysisMinutes") ?? 0,
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath("/training");
  revalidatePath("/");
}

export async function submitStrengthSession(formData: FormData) {
  const date = (formData.get("date") as string) || todayIso();
  const exercises = formData.getAll("exercise") as string[];
  const weights = formData.getAll("weightKg") as string[];
  const reps = formData.getAll("reps") as string[];
  const sets = formData.getAll("sets") as string[];

  const strengthSets: StrengthSet[] = exercises
    .map((exercise, i) => ({
      exercise,
      weightKg: Number(weights[i]) || 0,
      reps: Number(reps[i]) || 0,
      sets: Number(sets[i]) || 0,
    }))
    .filter((s) => s.exercise.trim().length > 0);

  if (strengthSets.length > 0) {
    repo.addStrengthSession({
      date,
      sets: strengthSets,
      notes: (formData.get("notes") as string) || null,
    });
  }
  revalidatePath("/training");
  revalidatePath("/");
}

export async function submitAclLog(formData: FormData) {
  const date = (formData.get("date") as string) || todayIso();
  repo.upsertAclLog({
    date,
    pain: num(formData, "pain") ?? 0,
    anxiety: num(formData, "anxiety") ?? 0,
    swelling: num(formData, "swelling") ?? 0,
    rangeOfMotionDeg: num(formData, "rangeOfMotionDeg"),
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath("/acl");
  revalidatePath("/");
}

export async function submitMatch(formData: FormData) {
  const date = (formData.get("date") as string) || todayIso();
  repo.addMatch({
    date,
    opponent: (formData.get("opponent") as string) || null,
    minutesPlayed: num(formData, "minutesPlayed") ?? 0,
    goals: num(formData, "goals") ?? 0,
    assists: num(formData, "assists") ?? 0,
    passSuccessRate: num(formData, "passSuccessRate") ?? 0,
    progressivePasses: num(formData, "progressivePasses") ?? 0,
    throughPassesCompleted: num(formData, "throughPassesCompleted") ?? 0,
    keyPasses: num(formData, "keyPasses") ?? 0,
    ballsWon: num(formData, "ballsWon") ?? 0,
    ballsLost: num(formData, "ballsLost") ?? 0,
    selfRating: num(formData, "selfRating") ?? 0,
    selfEvaluation: (formData.get("selfEvaluation") as string) || null,
  });
  revalidatePath("/matches");
  revalidatePath("/");
}

export async function toggleTaskAction(id: string) {
  repo.toggleTask(id);
  revalidatePath("/");
}
