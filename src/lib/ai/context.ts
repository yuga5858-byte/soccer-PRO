import "server-only";
import * as repo from "@/lib/db/repo";
import { computeProIndex } from "@/lib/proIndex";

export function buildCoachContext() {
  const profile = repo.getProfile();
  const abilities = repo.getAbilities();
  const dailyLogs = repo.listDailyLogs().slice(-14);
  const aclLogs = repo.listAclLogs().slice(-14);
  const matches = repo.listMatches().slice(0, 5);
  const soccerSessions = repo.listSoccerSessions().slice(0, 7);
  const strengthSessions = repo.listStrengthSessions().slice(0, 7);
  const { score, breakdown } = computeProIndex({
    profile,
    dailyLogs,
    aclLogs,
    matches,
    soccerSessions,
    strengthSessions,
  });

  const latestLog = dailyLogs[dailyLogs.length - 1];
  const latestAcl = aclLogs[aclLogs.length - 1];

  return {
    profile,
    abilities,
    proIndex: score,
    breakdown,
    latestLog,
    latestAcl,
    recentMatches: matches,
    recentSoccerSessions: soccerSessions,
    recentStrengthSessions: strengthSessions,
  };
}

export type CoachContext = ReturnType<typeof buildCoachContext>;

export function summarizeContextForPrompt(ctx: CoachContext): string {
  const lines: string[] = [];
  lines.push(`選手: ${ctx.profile.name}（${ctx.profile.age}歳 / ${ctx.profile.position}・${ctx.profile.subPosition}）`);
  lines.push(`目標: 22歳までにプロサッカー選手になる。憧れの選手はルカ・モドリッチ。`);
  lines.push(`強み: ${ctx.profile.strengths.join("、")} / 課題: ${ctx.profile.weaknesses.join("、")}`);
  lines.push(`プロ指数: ${ctx.proIndex}/100`);
  lines.push(
    `内訳: 練習量${Math.round(ctx.breakdown.practiceVolume)} 試合成績${Math.round(
      ctx.breakdown.matchPerformance
    )} 身体${Math.round(ctx.breakdown.physicalCondition)} ACL${Math.round(
      ctx.breakdown.aclCondition
    )} 筋力${Math.round(ctx.breakdown.strength)} 睡眠${Math.round(ctx.breakdown.sleep)} メンタル${Math.round(
      ctx.breakdown.mental
    )}`
  );
  if (ctx.latestLog) {
    lines.push(
      `直近ログ: 体重${ctx.latestLog.weightKg ?? "?"}kg 睡眠${ctx.latestLog.sleepHours ?? "?"}時間 痛み${
        ctx.latestLog.painLevel ?? "?"
      }/10 気分${ctx.latestLog.mood ?? "?"}/10`
    );
  }
  if (ctx.latestAcl) {
    lines.push(
      `ACL状態: 痛み${ctx.latestAcl.pain}/10 不安感${ctx.latestAcl.anxiety}/10 腫れ${ctx.latestAcl.swelling}/10`
    );
  }
  if (ctx.recentSoccerSessions.length > 0) {
    const avgPractice =
      ctx.recentSoccerSessions.reduce((s, x) => s + x.practiceMinutes, 0) / ctx.recentSoccerSessions.length;
    lines.push(`直近7回の平均練習時間: ${Math.round(avgPractice)}分`);
  }
  if (ctx.recentMatches.length > 0) {
    const m = ctx.recentMatches[0];
    lines.push(
      `直近の試合: パス成功率${m.passSuccessRate}% キーパス${m.keyPasses} スルーパス成功${m.throughPassesCompleted} 自己評価${m.selfRating}/10`
    );
  }
  lines.push(
    `能力値: パス${ctx.abilities.pass} スルーパス${ctx.abilities.throughPass} キック${ctx.abilities.kick} キープ${ctx.abilities.keep} 視野${ctx.abilities.vision} 戦術理解${ctx.abilities.tactics} 守備${ctx.abilities.defense} アジリティ${ctx.abilities.agility} メンタル${ctx.abilities.mental} レジリエンス${ctx.abilities.resilience}`
  );
  return lines.join("\n");
}
