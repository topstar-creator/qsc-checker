import { getDb } from "./index";
import {
  companies,
  users,
  stores,
  groups,
  groupMemberships,
  checkSheets,
  questions,
  subscriptions,
  inspections,
  inspectionAnswers,
  reports,
  improvementCases,
  caseStatusHistory,
  userStoreAssignments,
} from "./schema";
import { hashPassword } from "../auth/password";
import { id } from "../utils";
import { eq } from "drizzle-orm";

const DEFAULT_QUESTIONS = [
  { text: "店舗入口・外観の清潔感", category: "清潔感" },
  { text: "店内全体の清掃状態", category: "清潔感" },
  { text: "トイレの清潔感", category: "清潔感" },
  { text: "厨房・調理エリアの衛生", category: "清潔感" },
  { text: "スタッフの身だしなみ", category: "清潔感" },
  { text: "挨拶・声出し", category: "サービス" },
  { text: "接客態度・笑顔", category: "サービス" },
  { text: "注文対応のスピード", category: "サービス" },
  { text: "商品説明・提案", category: "サービス" },
  { text: "会計・退店時の対応", category: "サービス" },
  { text: "料理・商品の見た目", category: "品質" },
  { text: "料理・商品の温度", category: "品質" },
  { text: "料理・商品の味・品質", category: "品質" },
  { text: "提供スピード", category: "品質" },
  { text: "メニュー・品揃え", category: "品質" },
  { text: "調味料・付属品の補充", category: "清潔感" },
  { text: "テーブル・座席の清潔感", category: "清潔感" },
  { text: "BGM・店内環境", category: "サービス" },
  { text: "クレーム対応力", category: "サービス" },
  { text: "スタッフ間の連携", category: "サービス" },
  { text: "オペレーションの標準化", category: "品質" },
  { text: "在庫・食材管理", category: "品質" },
  { text: "アレルギー・安全対応", category: "品質" },
  { text: "POP・店内掲示", category: "サービス" },
  { text: "混雑時の対応", category: "サービス" },
  { text: "電話対応", category: "サービス" },
  { text: "予約・待ち対応", category: "サービス" },
  { text: "持ち帰り・デリバリー品質", category: "品質" },
  { text: "開店・閉店作業", category: "清潔感" },
  { text: "総合評価", category: "品質" },
];

export async function runSeed() {
  const db = await getDb();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@example.com"))
    .limit(1);
  if (existing.length > 0) return;

  const now = new Date();
  const companyId = id();
  const trialEnds = new Date(now);
  trialEnds.setMonth(trialEnds.getMonth() + 3);

  await db.insert(companies).values({
    id: companyId,
    name: "サンプル飲食株式会社",
    industry: "飲食",
    createdAt: now,
  });

  await db.insert(subscriptions).values({
    id: id(),
    companyId,
    status: "trialing",
    storeCount: 4,
    trialEndsAt: trialEnds,
    createdAt: now,
  });

  const adminId = id();
  const svId = id();
  const managerId = id();

  await db.insert(users).values([
    {
      id: adminId,
      companyId,
      email: "admin@example.com",
      passwordHash: await hashPassword("admin123"),
      name: "田中 太郎",
      role: "company_admin",
      notifyEmail: true,
      createdAt: now,
    },
    {
      id: svId,
      companyId,
      email: "sv@example.com",
      passwordHash: await hashPassword("sv123456"),
      name: "佐藤 花子",
      role: "sv",
      notifyEmail: true,
      createdAt: now,
    },
    {
      id: managerId,
      companyId,
      email: "manager@example.com",
      passwordHash: await hashPassword("manager1"),
      name: "鈴木 一郎",
      role: "store_manager",
      notifyEmail: true,
      createdAt: now,
    },
  ]);

  const storeData = [
    { name: "渋谷店", code: "SBY" },
    { name: "新宿店", code: "SJK" },
    { name: "池袋店", code: "IKB" },
    { name: "横浜店", code: "YKH" },
  ];

  const storeIds: string[] = [];
  for (const s of storeData) {
    const storeId = id();
    storeIds.push(storeId);
    await db.insert(stores).values({
      id: storeId,
      companyId,
      name: s.name,
      code: s.code,
      isActive: true,
      createdAt: now,
    });
  }

  await db.insert(userStoreAssignments).values({
    id: id(),
    userId: managerId,
    storeId: storeIds[0],
  });

  const groupData = [
    { name: "東京エリア", type: "area" },
    { name: "神奈川エリア", type: "area" },
    { name: "カジュアルダイニング", type: "brand" },
  ];

  const groupIds: string[] = [];
  for (const g of groupData) {
    const groupId = id();
    groupIds.push(groupId);
    await db.insert(groups).values({
      id: groupId,
      companyId,
      name: g.name,
      type: g.type,
      createdAt: now,
    });
  }

  await db.insert(groupMemberships).values([
    { id: id(), groupId: groupIds[0], storeId: storeIds[0] },
    { id: id(), groupId: groupIds[0], storeId: storeIds[1] },
    { id: id(), groupId: groupIds[0], storeId: storeIds[2] },
    { id: id(), groupId: groupIds[1], storeId: storeIds[3] },
    ...storeIds.map((storeId) => ({
      id: id(),
      groupId: groupIds[2],
      storeId,
    })),
  ]);

  const sheetId = id();
  await db.insert(checkSheets).values({
    id: sheetId,
    companyId,
    name: "標準QSCチェックシート",
    description: "30項目の標準チェックリスト",
    isDefault: true,
    createdAt: now,
  });

  const questionIds: string[] = [];
  for (let i = 0; i < DEFAULT_QUESTIONS.length; i++) {
    const qId = id();
    questionIds.push(qId);
    await db.insert(questions).values({
      id: qId,
      checkSheetId: sheetId,
      text: DEFAULT_QUESTIONS[i].text,
      category: DEFAULT_QUESTIONS[i].category,
      type: "score",
      weight: 1,
      sortOrder: i + 1,
      required: true,
    });
  }

  const monthsAgo = [2, 1, 0];
  for (let si = 0; si < storeIds.length; si++) {
    const baseScore = 88 - si * 2;
    for (const m of monthsAgo) {
      const inspectedAt = new Date(now);
      inspectedAt.setMonth(inspectedAt.getMonth() - m);
      inspectedAt.setDate(15);

      const inspectionId = id();
      const totalScore = baseScore + m * 1.5 + Math.random() * 3;

      await db.insert(inspections).values({
        id: inspectionId,
        companyId,
        storeId: storeIds[si],
        checkSheetId: sheetId,
        inspectorId: svId,
        totalScore,
        comment: si === 0 && m === 0 ? "調味料補充とトイレ清掃に改善余地あり" : null,
        inspectedAt,
        createdAt: inspectedAt,
      });

      for (let qi = 0; qi < questionIds.length; qi++) {
        const score =
          qi === 15 && si === 0 && m === 0
            ? 65
            : totalScore - 5 + Math.random() * 10;
        await db.insert(inspectionAnswers).values({
          id: id(),
          inspectionId,
          questionId: questionIds[qi],
          score: Math.min(100, Math.max(0, score)),
        });
      }

      const reportId = id();
      await db.insert(reports).values({
        id: reportId,
        companyId,
        storeId: storeIds[si],
        inspectionId,
        totalScore,
        aiSummary:
          si === 0 && m === 0
            ? "接客は高評価ですが、調味料補充とトイレ清掃に改善余地があります。"
            : null,
        aiDiscussionPoints:
          si === 0 && m === 0
            ? JSON.stringify([
                "調味料補充の頻度と担当を明確化する",
                "トイレ清掃チェックリストの見直し",
                "ピーク時間帯のオペレーション確認",
              ])
            : null,
        createdAt: inspectedAt,
      });
    }
  }

  const caseId = id();
  await db.insert(improvementCases).values({
    id: caseId,
    companyId,
    storeId: storeIds[0],
    title: "調味料補充の改善",
    issueItem: "調味料・付属品の補充",
    issueComment: "調味料が複数空になっていた",
    assigneeId: managerId,
    dueDate: new Date(now.getTime() + 7 * 86400000),
    rootCause: "ピーク時の補充タイミングが不明確",
    actionPlan: "2時間ごとの補充チェックを導入",
    status: "in_progress",
    createdById: svId,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(caseStatusHistory).values([
    {
      id: id(),
      caseId,
      status: "pending",
      comment: "SVより改善案件を起票",
      userId: svId,
      createdAt: new Date(now.getTime() - 3 * 86400000),
    },
    {
      id: id(),
      caseId,
      status: "in_progress",
      comment: "店舗にて対応開始",
      userId: managerId,
      createdAt: new Date(now.getTime() - 1 * 86400000),
    },
  ]);
}
