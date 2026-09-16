import type { AclLog } from "@/lib/types";

export interface InjuryRiskResult {
  riskScore: number; // 0-100, higher = higher risk
  riskLevel: "low" | "moderate" | "high" | "critical";
  message: string;
  recommendations: string[];
}

export function analyzeInjuryRisk(logs: AclLog[]): InjuryRiskResult {
  const recent = logs.slice(-7);
  if (recent.length === 0) {
    return {
      riskScore: 30,
      riskLevel: "low",
      message: "データが不足しています。毎日の記録を継続してください。",
      recommendations: ["毎日ACLログを入力する"],
    };
  }

  const latest = recent[recent.length - 1];
  const avgPain = avg(recent.map((l) => l.pain));
  const avgAnxiety = avg(recent.map((l) => l.anxiety));
  const avgSwelling = avg(recent.map((l) => l.swelling));

  const painTrend = trend(recent.map((l) => l.pain));
  const swellingTrend = trend(recent.map((l) => l.swelling));

  let riskScore =
    latest.pain * 6 + avgPain * 3 + avgAnxiety * 3 + avgSwelling * 4 + (painTrend > 0 ? 10 : 0) + (swellingTrend > 0 ? 8 : 0);
  riskScore = Math.min(100, Math.max(0, riskScore));

  const riskLevel: InjuryRiskResult["riskLevel"] =
    riskScore >= 70 ? "critical" : riskScore >= 50 ? "high" : riskScore >= 30 ? "moderate" : "low";

  const recommendations: string[] = [];
  const messages: string[] = [];

  messages.push(
    `過去3回のACL断裂歴があるため、わずかな変化も見逃さない前提でモニタリングしています。`
  );

  if (riskLevel === "critical") {
    messages.push(`痛み・腫れが高いレベルで推移しており、再断裂リスクが高い状態です。`);
    recommendations.push("練習・筋トレを中止し、専門医の診察を受ける");
    recommendations.push("アイシングと患部の完全休養を優先する");
  } else if (riskLevel === "high") {
    messages.push(`痛みまたは腫れが上昇傾向にあります。負荷を落として様子を見る必要があります。`);
    recommendations.push("高強度トレーニングを避け、可動域訓練に切り替える");
    recommendations.push("2〜3日以内に痛みが改善しなければ受診する");
  } else if (riskLevel === "moderate") {
    messages.push(`症状は落ち着いていますが、油断せず段階的な負荷管理を続けてください。`);
    recommendations.push("アジリティ・方向転換系は強度を70%に抑える");
    recommendations.push("股関節・膝周りのケアストレッチを毎日実施する");
  } else {
    messages.push(`状態は安定しています。現在の負荷管理を継続してください。`);
    recommendations.push("現在の練習強度を維持しつつ、可動域を記録し続ける");
  }

  if (painTrend > 0) recommendations.push("痛みが上昇傾向。直近のトレーニング内容を見直す");
  if (swellingTrend > 0) recommendations.push("腫れが増加傾向。アイシング頻度を増やす");
  if (avgAnxiety >= 5) recommendations.push("不安感が高いため、心理面のサポート（メンタルケア）も取り入れる");

  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    message: messages.join(" "),
    recommendations: Array.from(new Set(recommendations)),
  };
}

function avg(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

function trend(values: number[]): number {
  if (values.length < 2) return 0;
  const mid = Math.floor(values.length / 2);
  const firstHalf = avg(values.slice(0, mid || 1));
  const secondHalf = avg(values.slice(mid));
  return secondHalf - firstHalf;
}
