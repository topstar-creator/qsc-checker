import OpenAI from "openai";
import { getDb, persistDb } from "@/lib/db";
import { aiCache } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { id } from "@/lib/utils";

const openai = process.env.OPENAI_API_KEY?.startsWith("sk-")
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface AiAssistResult {
  summary: string;
  discussionPoints: string[];
  cached: boolean;
}

export async function getCachedAi(
  entityType: string,
  entityId: string
): Promise<AiAssistResult | null> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(aiCache)
    .where(
      and(eq(aiCache.entityType, entityType), eq(aiCache.entityId, entityId))
    )
    .limit(1);

  if (rows.length === 0) return null;
  return { ...JSON.parse(rows[0].content), cached: true };
}

async function saveCache(
  entityType: string,
  entityId: string,
  result: Omit<AiAssistResult, "cached">
) {
  const db = await getDb();
  await db.insert(aiCache).values({
    id: id(),
    entityType,
    entityId,
    content: JSON.stringify(result),
    createdAt: new Date(),
  });
  persistDb();
}

function mockAiReport(issues: { question: string; score: number }[]): AiAssistResult {
  const lowItems = issues.filter((i) => i.score < 80).map((i) => i.question);
  return {
    summary:
      lowItems.length > 0
        ? `接客は高評価ですが、${lowItems.slice(0, 2).join("と")}に改善余地があります。`
        : "全体的に良好なスコアです。好調な点を他店舗へ横展開することを検討してください。",
    discussionPoints:
      lowItems.length > 0
        ? [
            `${lowItems[0]}の原因と担当を明確化する`,
            "ピーク時間帯のオペレーションを確認する",
            "改善後の再チェック日程を決める",
          ]
        : ["好調要因の棚卸し", "ベストプラクティスの共有方法"],
    cached: false,
  };
}

export async function generateReportAi(
  entityId: string,
  issues: { question: string; score: number; comment?: string }[],
  regenerate = false
): Promise<AiAssistResult> {
  if (!regenerate) {
    const cached = await getCachedAi("report", entityId);
    if (cached) return cached;
  }

  if (!openai) {
    const result = mockAiReport(issues);
    await saveCache("report", entityId, result);
    return result;
  }

  const prompt = `あなたは飲食・小売店のQSC（品質・サービス・清潔感）改善アドバイザーです。
以下の調査結果を分析し、JSON形式で回答してください。
改善策を自動決定せず、店長・SV・本部が話し合うべき論点を提示してください。

指摘事項:
${issues.map((i) => `- ${i.question}: ${i.score}点 ${i.comment ?? ""}`).join("\n")}

回答形式:
{"summary":"2-3文の要約","discussionPoints":["論点1","論点2","論点3"]}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { summary: string; discussionPoints: string[] };
  const result = { summary: parsed.summary, discussionPoints: parsed.discussionPoints };
  await saveCache("report", entityId, result);
  return { ...result, cached: false };
}

export async function generateCaseAi(
  entityId: string,
  title: string,
  issueItem: string,
  regenerate = false
): Promise<AiAssistResult> {
  if (!regenerate) {
    const cached = await getCachedAi("case", entityId);
    if (cached) return cached;
  }

  if (!openai) {
    const result = {
      summary: `「${title}」について、${issueItem}が主な課題です。`,
      discussionPoints: [
        "なぜこの問題が発生したか（原因仮説）",
        "再発防止の具体的な手順",
        "誰がいつまでに何をするか",
      ],
      cached: false,
    };
    await saveCache("case", entityId, result);
    return result;
  }

  const prompt = `QSC改善案件のアシスト。改善策を決定せず、話し合いの論点を提示。
案件: ${title}
指摘項目: ${issueItem}
JSON: {"summary":"要約","discussionPoints":["論点1","論点2","論点3"]}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { summary: string; discussionPoints: string[] };
  const result = { summary: parsed.summary, discussionPoints: parsed.discussionPoints };
  await saveCache("case", entityId, result);
  return { ...result, cached: false };
}
