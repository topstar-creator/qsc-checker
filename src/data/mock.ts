import type { RankingPeriod, RankingType } from "@/lib/types";

export interface RankingRow {
  rank: number;
  id: string;
  name: string;
  monthlyScores: { label: string; score: number | null }[];
  average: number;
  trend: "up" | "down" | "flat";
  improvementRate?: number;
}

export interface MockStore {
  id: string;
  name: string;
  code: string;
}

export interface MockReport {
  id: string;
  storeId: string;
  storeName: string;
  totalScore: number;
  inspectedAt: string;
  issues: { question: string; score: number; comment?: string }[];
  aiSummary?: string;
  aiDiscussionPoints?: string[];
}

export interface MockCase {
  id: string;
  title: string;
  storeName: string;
  status: "pending" | "in_progress" | "reported" | "rejected" | "done";
  dueDate: string;
  issueItem: string;
}

export const mockStores: MockStore[] = [
  { id: "1", name: "渋谷店", code: "SBY" },
  { id: "2", name: "新宿店", code: "SJK" },
  { id: "3", name: "池袋店", code: "IKB" },
  { id: "4", name: "横浜店", code: "YKH" },
];

export const mockGroups = [
  { id: "g1", name: "東京エリア", type: "area" },
  { id: "g2", name: "神奈川エリア", type: "area" },
  { id: "g3", name: "カジュアルダイニング", type: "brand" },
];

export function getMockRankings(
  type: RankingType,
  period: RankingPeriod
): RankingRow[] {
  const months =
    period === "1m"
      ? ["6月"]
      : period === "3m"
        ? ["4月", "5月", "6月"]
        : period === "6m"
          ? ["1月", "2月", "3月", "4月", "5月", "6月"]
          : ["7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月"];

  if (type === "group") {
    return [
      {
        rank: 1,
        id: "g1",
        name: "東京エリア",
        monthlyScores: months.map((l, i) => ({ label: l, score: 91 - i * 0.3 })),
        average: 90.2,
        trend: "up",
      },
      {
        rank: 2,
        id: "g2",
        name: "神奈川エリア",
        monthlyScores: months.map((l) => ({ label: l, score: 87.5 })),
        average: 87.5,
        trend: "flat",
      },
    ];
  }

  if (type === "improvement") {
    return mockStores.map((s, i) => ({
      rank: i + 1,
      id: s.id,
      name: s.name,
      monthlyScores: months.slice(-3).map((l) => ({ label: l, score: null })),
      average: 88 + i,
      trend: i % 2 === 0 ? "up" : "flat",
      improvementRate: [5.2, 3.1, 1.8, -0.5][i],
    }));
  }

  const data = [
    { scores: [92, 94, 95], avg: 93.7 },
    { scores: [88, 90, 91], avg: 89.7 },
    { scores: [86, 87, 88], avg: 87.0 },
    { scores: [84, 85, 86], avg: 85.0 },
  ];

  return mockStores.map((s, i) => ({
    rank: i + 1,
    id: s.id,
    name: s.name,
    monthlyScores: months.slice(-3).map((label, mi) => ({
      label,
      score: data[i]?.scores[mi] ?? 85,
    })),
    average: data[i]?.avg ?? 85,
    trend: i < 2 ? "up" : "flat",
  }));
}

export const mockReports: MockReport[] = mockStores.map((s, i) => ({
  id: `r${s.id}`,
  storeId: s.id,
  storeName: s.name,
  totalScore: [93.7, 89.7, 87.0, 85.0][i],
  inspectedAt: "2026-06-15",
  issues:
    i === 0
      ? [
          { question: "調味料・付属品の補充", score: 65, comment: "空容器が複数" },
          { question: "トイレの清潔感", score: 72, comment: "手洗い場に水渍" },
        ]
      : [],
  aiSummary:
    i === 0
      ? "接客は高評価ですが、調味料補充とトイレ清掃に改善余地があります。"
      : undefined,
  aiDiscussionPoints:
    i === 0
      ? [
          "調味料補充の頻度と担当を明確化する",
          "トイレ清掃チェックリストの見直し",
          "ピーク時間帯のオペレーション確認",
        ]
      : undefined,
}));

export const mockCases: MockCase[] = [
  {
    id: "c1",
    title: "調味料補充の改善",
    storeName: "渋谷店",
    status: "in_progress",
    dueDate: "2026-06-28",
    issueItem: "調味料・付属品の補充",
  },
  {
    id: "c2",
    title: "トイレ清掃の標準化",
    storeName: "渋谷店",
    status: "pending",
    dueDate: "2026-07-05",
    issueItem: "トイレの清潔感",
  },
  {
    id: "c3",
    title: "接客スピード改善",
    storeName: "新宿店",
    status: "done",
    dueDate: "2026-06-01",
    issueItem: "注文対応のスピード",
  },
];

export const defaultQuestions = [
  "店舗入口・外観の清潔感",
  "店内全体の清掃状態",
  "トイレの清潔感",
  "厨房・調理エリアの衛生",
  "スタッフの身だしなみ",
  "挨拶・声出し",
  "接客態度・笑顔",
  "注文対応のスピード",
  "商品説明・提案",
  "会計・退店時の対応",
];
