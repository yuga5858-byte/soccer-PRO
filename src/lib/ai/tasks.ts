import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { CoachContext } from "@/lib/ai/context";
import { summarizeContextForPrompt } from "@/lib/ai/context";
import type { DailyTask } from "@/lib/types";

type TaskDraft = Omit<DailyTask, "id" | "date" | "done">;

const SYSTEM_PROMPT = `あなたは安羅夕雅専属のAIサッカーコーチです。彼を22歳までにプロサッカー選手にするために、今日1日の具体的なタスクを4〜6個生成してください。
彼の課題（守備強度・アジリティ・戦術理解）、ACLの状態、直近の練習量・睡眠・体重を踏まえてタスクを決めてください。
ACLの痛みや不安感が高い日は、無理な負荷を避け回復メニューを優先してください。
出力は必ず以下のJSON配列形式のみで返してください（説明文不要）:
[{"title": "タスク名", "category": "soccer|strength|recovery|study|mental|video", "reason": "このタスクが必要な理由（1文）", "xpReward": 10}]`;

function ruleBasedTasks(ctx: CoachContext): TaskDraft[] {
  const tasks: TaskDraft[] = [];
  const aclCritical = ctx.latestAcl && (ctx.latestAcl.pain >= 6 || ctx.latestAcl.anxiety >= 6);
  const lowSleep = ctx.latestLog?.sleepHours != null && ctx.latestLog.sleepHours < 6.5;

  if (aclCritical) {
    tasks.push({
      title: "ACL回復メニュー（アイシング・可動域ケア）",
      category: "recovery",
      reason: "膝の痛み・不安感が高いため、今日は負荷を上げず回復を最優先にします。",
      xpReward: 15,
    });
    tasks.push({
      title: "軽めのスルーパス精度ドリル（低負荷）",
      category: "soccer",
      reason: "強みのパス精度を、膝に負担をかけない形で維持します。",
      xpReward: 10,
    });
  } else {
    tasks.push({
      title: "1v1守備強度トレーニング 20分",
      category: "soccer",
      reason: "課題である守備強度を改善するための実戦形式ドリル。",
      xpReward: 15,
    });
    tasks.push({
      title: "アジリティラダートレーニング 15分",
      category: "strength",
      reason: "アジリティ強化。ボランチとして切り返しの速さを上げる。",
      xpReward: 12,
    });
  }

  tasks.push({
    title: "戦術理解: モドリッチの試合映像分析 20分",
    category: "video",
    reason: "戦術理解を深めるため、憧れの選手のプレー選択を分析する。",
    xpReward: 15,
  });

  if (lowSleep) {
    tasks.push({
      title: "今夜は0:30までに就寝",
      category: "recovery",
      reason: "睡眠不足はプロ指数と回復力に直結するため、睡眠を確保する。",
      xpReward: 10,
    });
  }

  if ((ctx.profile.targetWeightKg ?? 0) > (ctx.latestLog?.weightKg ?? ctx.profile.weightKg)) {
    tasks.push({
      title: "高タンパク食＋間食で+300kcal摂取",
      category: "recovery",
      reason: `目標体重${ctx.profile.targetWeightKg}kgに向けて、体づくりのための栄養摂取を意識する。`,
      xpReward: 8,
    });
  }

  tasks.push({
    title: "パス＆キープ力のフリースタイル練習 15分",
    category: "soccer",
    reason: "強みであるパス・キープ力をさらに研ぎ澄ませ、プレイメーカーとしての価値を高める。",
    xpReward: 10,
  });

  return tasks.slice(0, 6);
}

export async function generateDailyTasks(ctx: CoachContext): Promise<TaskDraft[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return ruleBasedTasks(ctx);

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: summarizeContextForPrompt(ctx) }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("No JSON array found");
    const parsed = JSON.parse(text.slice(start, end + 1)) as TaskDraft[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Empty task list");
    return parsed;
  } catch (err) {
    console.error("Claude task generation failed, falling back to rule-based", err);
    return ruleBasedTasks(ctx);
  }
}
