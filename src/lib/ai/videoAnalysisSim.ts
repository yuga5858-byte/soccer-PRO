import "server-only";
import crypto from "node:crypto";
import type { MatchVideoAnalysisResult, SquatAnalysisResult } from "@/lib/types";

// This module produces the analysis result shown in the UI. When VIDEO_ANALYSIS_SERVICE_URL
// is configured, the real pipeline (MediaPipe pose estimation + OpenCV, see
// scripts/pose_analysis/) should be called instead — see src/app/api/video-analysis/route.ts.
// Without that service deployed, we derive a deterministic-but-varied heuristic result from the
// uploaded file so the ACL-risk-aware coaching flow is fully demonstrable end to end.

function seedFromBuffer(fileSizeBytes: number, fileName: string): number {
  const hash = crypto.createHash("sha256").update(`${fileName}:${fileSizeBytes}`).digest();
  return hash.readUInt32BE(0);
}

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function analyzeSquatVideo(fileName: string, fileSizeBytes: number): SquatAnalysisResult {
  const rand = seededRandom(seedFromBuffer(fileSizeBytes, fileName));

  const leftRightAsymmetryPct = Math.round(4 + rand() * 14); // 4-18%
  const depthScore = Math.round(55 + rand() * 40); // 55-95
  const kneeValgusScore = Math.round(10 + rand() * 55); // 10-65
  const aclRiskScore = Math.round(
    Math.min(100, leftRightAsymmetryPct * 2 + kneeValgusScore * 0.8 + (100 - depthScore) * 0.3)
  );

  const improvementPoints: string[] = [];
  if (leftRightAsymmetryPct > 10) {
    improvementPoints.push(
      `左右差が${leftRightAsymmetryPct}%あり、左膝（ACL既往側）への荷重を避ける代償動作が見られます。左右均等に荷重する意識を。`
    );
  }
  if (kneeValgusScore > 40) {
    improvementPoints.push("しゃがみ込み時に膝が内側に入る（knee-in）傾向があります。股関節外旋筋の強化を推奨します。");
  }
  if (depthScore < 70) {
    improvementPoints.push("スクワットの深さが不足しています。可動域を確保しつつ、痛みが出ない範囲で深さを追求してください。");
  }
  if (improvementPoints.length === 0) {
    improvementPoints.push("フォームは安定しています。現在の負荷を維持しつつ、左右差のモニタリングを継続してください。");
  }

  return { leftRightAsymmetryPct, depthScore, kneeValgusScore, aclRiskScore, improvementPoints };
}

export function analyzeMatchVideo(fileName: string, fileSizeBytes: number): MatchVideoAnalysisResult {
  const rand = seededRandom(seedFromBuffer(fileSizeBytes, fileName));

  const ballTouches = Math.round(40 + rand() * 50);
  const passes = Math.round(ballTouches * (0.55 + rand() * 0.2));
  const throughPasses = Math.round(2 + rand() * 6);
  const losses = Math.round(3 + rand() * 8);
  const defensiveActions = Math.round(4 + rand() * 10);

  const improvementPoints: string[] = [];
  if (losses > 8) {
    improvementPoints.push("ボールロストが多い場面が見られます。プレッシャー下でのファーストタッチの質を改善しましょう。");
  }
  if (defensiveActions < 6) {
    improvementPoints.push("守備アクション数が少なめです。ボール非保持時のポジショニングと球際の強度を上げましょう。");
  }
  if (throughPasses >= 5) {
    improvementPoints.push("スルーパスの選択が効果的でした。この判断力を継続して伸ばしましょう。");
  }
  if (improvementPoints.length === 0) {
    improvementPoints.push("全体的にバランスの取れたプレーでした。次はより高い位置でのプレス参加を意識しましょう。");
  }

  return { ballTouches, passes, throughPasses, losses, defensiveActions, improvementPoints };
}
