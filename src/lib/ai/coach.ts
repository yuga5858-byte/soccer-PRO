import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { CoachContext } from "@/lib/ai/context";
import { summarizeContextForPrompt } from "@/lib/ai/context";
import type { CoachMessage } from "@/lib/types";

const SYSTEM_PROMPT = `あなたは安羅夕雅専属の「AI監督」です。彼を22歳までにプロサッカー選手にすることだけを目的にしています。
一般的なアドバイスではなく、渡されたデータ（プロ指数、ACL状態、練習量、試合成績、能力値）を根拠にした、具体的で厳しくも愛のあるコーチングを日本語で行ってください。
出力は必ず以下のJSON形式のみで返してください（説明文やコードブロックは不要）:
{"headline": "一言タイトル（20文字以内）", "message": "3〜5文の朝のコーチングメッセージ", "focusAreas": ["今日集中すべき項目を1〜3個"]}`;

function ruleBasedMessage(ctx: CoachContext): Omit<CoachMessage, "id" | "date" | "createdAt" | "source"> {
  const focusAreas: string[] = [];
  const sentences: string[] = [];

  const breakdown = ctx.breakdown;
  const sortedWeak = Object.entries(breakdown).sort((a, b) => a[1] - b[1]);
  const weakest = sortedWeak[0];

  if (ctx.latestAcl && (ctx.latestAcl.pain >= 6 || ctx.latestAcl.anxiety >= 6)) {
    focusAreas.push("ACL回復優先");
    sentences.push(
      `左膝の痛みレベルが${ctx.latestAcl.pain}/10、不安感が${ctx.latestAcl.anxiety}/10と高い状態です。今日は無理な負荷をかけず、回復メニューを最優先にしてください。`
    );
  } else if (ctx.latestLog && ctx.latestLog.sleepHours != null && ctx.latestLog.sleepHours < 6.5) {
    focusAreas.push("回復優先");
    sentences.push(
      `睡眠が${ctx.latestLog.sleepHours}時間と不足しています。プロを目指すなら回復も練習と同じ価値があります。今日は睡眠を最優先に。`
    );
  } else if (weakest[0] === "aclCondition") {
    focusAreas.push("ACLケア");
    sentences.push("ACLの状態を最優先で管理してください。焦らず段階的に負荷を戻していきましょう。");
  } else {
    const weaknessMap: Record<string, string> = {
      defense: "守備強度",
      agility: "アジリティ",
      tactics: "戦術理解",
    };
    const focus = ctx.profile.weaknesses.find((w) =>
      Object.values(weaknessMap).includes(w)
    );
    focusAreas.push(focus ?? "守備強度");
    sentences.push(
      `今日は${focus ?? "守備強度"}を強化してください。モドリッチのような選手は攻撃だけでなく守備の強度も一流です。`
    );
  }

  sentences.push(`現在のプロ指数は${ctx.proIndex}/100。22歳までにプロになるという目標から逆算して、今日の積み上げを大切に。`);
  sentences.push(`強みであるスルーパスとキープ力はさらに磨きをかけ、パスの精度でチームを動かす存在になってください。`);

  return {
    headline: focusAreas[0] ? `今日は${focusAreas[0]}に集中` : "今日も一歩前進",
    message: sentences.join(" "),
    focusAreas,
  };
}

export async function generateCoachMessage(
  ctx: CoachContext
): Promise<Omit<CoachMessage, "id" | "date" | "createdAt">> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { ...ruleBasedMessage(ctx), source: "rule-based" };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: summarizeContextForPrompt(ctx) }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    const parsed = JSON.parse(extractJson(text));
    return {
      headline: parsed.headline ?? "今日のコーチング",
      message: parsed.message ?? text,
      focusAreas: parsed.focusAreas ?? [],
      source: "claude",
    };
  } catch (err) {
    console.error("Claude coach generation failed, falling back to rule-based", err);
    return { ...ruleBasedMessage(ctx), source: "rule-based" };
  }
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in response");
  return text.slice(start, end + 1);
}
