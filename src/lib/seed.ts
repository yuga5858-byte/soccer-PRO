import type { Database, Profile, Abilities } from "@/lib/types";

const uid = (prefix: string, i: number) => `${prefix}_seed_${i}`;

export const defaultProfile: Profile = {
  id: "anra_yuga",
  name: "安羅夕雅",
  age: 20,
  birthTargetAge: 22,
  proDeadlineDate: (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().slice(0, 10);
  })(),
  university: "大阪経済大学",
  position: "ボランチ",
  subPosition: "トップ下",
  dominantFoot: "right",
  heightCm: 177,
  weightKg: 72,
  targetWeightKg: 75,
  jerseyNumber: 10,
  playStyle: "プレイメーカー型ボランチ",
  idolPlayer: "ルカ・モドリッチ",
  strengths: ["スルーパス", "パス", "キック精度", "ボールキープ"],
  weaknesses: ["守備強度", "アジリティ", "戦術理解"],
  injuryHistory: ["左ACL断裂 3回", "現在の痛みレベル 4/10", "現在の不安感 4/10"],
  supplements: ["コラーゲン", "ビタミン"],
  goals: [
    "プロサッカー選手になる",
    "満員のスタジアムで勝利する",
    "彼女を幸せにする",
    "将来的にSNS事業を展開する",
  ],
  sleepHours: 7,
  bedTime: "00:30",
  wakeTime: "08:00",
  mealsPerDay: 3,
  benchPressKg: 90,
  squatKg: 100,
  gripStrengthKg: 40,
  level: 1,
  xp: 0,
  createdAt: new Date().toISOString(),
};

export const defaultAbilities: Abilities = {
  pass: 78,
  throughPass: 82,
  kick: 76,
  keep: 74,
  vision: 70,
  tactics: 52,
  defense: 40,
  agility: 45,
  mental: 65,
  resilience: 55,
};

export function buildSeedDatabase(): Database {
  const today = new Date();
  const isoDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  return {
    profile: defaultProfile,
    abilities: defaultAbilities,
    dailyLogs: [2, 1, 0].map((d, i) => ({
      id: uid("log", i),
      date: isoDate(d),
      weightKg: 72 + i * 0.1,
      sleepHours: 7,
      painLevel: 4,
      anxietyLevel: 4,
      mood: 7,
      note: null,
      createdAt: new Date().toISOString(),
    })),
    dailyTasks: [],
    soccerSessions: [],
    strengthSessions: [],
    aclLogs: [2, 1, 0].map((d, i) => ({
      id: uid("acl", i),
      date: isoDate(d),
      pain: 4,
      anxiety: 4,
      swelling: 2,
      rangeOfMotionDeg: 130,
      notes: null,
      createdAt: new Date().toISOString(),
    })),
    matches: [],
    videoAnalyses: [],
    coachMessages: [],
    xpEvents: [],
    proIndexHistory: [],
  };
}
