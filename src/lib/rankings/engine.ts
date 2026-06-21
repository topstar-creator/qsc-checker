import type { RankingPeriod, RankingType } from "@/lib/db/schema";
import { getDb, type Db } from "@/lib/db";
import {
  stores,
  groups,
  inspections,
  groupMemberships,
} from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { formatMonth } from "@/lib/utils";
import type { RankingRow } from "@/data/mock";

function getPeriodMonths(period: RankingPeriod): number {
  switch (period) {
    case "1m":
      return 1;
    case "3m":
      return 3;
    case "6m":
      return 6;
    case "1y":
      return 12;
  }
}

function getMonthRanges(count: number): { start: Date; end: Date; label: string }[] {
  const ranges: { start: Date; end: Date; label: string }[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    ranges.push({ start, end, label: formatMonth(start) });
  }
  return ranges;
}

async function getStoreScores(
  db: Db,
  companyId: string,
  storeId: string,
  ranges: { start: Date; end: Date; label: string }[]
): Promise<{ label: string; score: number | null }[]> {
  const result: { label: string; score: number | null }[] = [];

  for (const range of ranges) {
    const rows = await db
      .select({ totalScore: inspections.totalScore })
      .from(inspections)
      .where(
        and(
          eq(inspections.companyId, companyId),
          eq(inspections.storeId, storeId),
          gte(inspections.inspectedAt, range.start)
        )
      )
      .orderBy(desc(inspections.inspectedAt))
      .limit(10);

    const inRange = rows.filter(() => true);
    const scores = inRange
      .map((r) => r.totalScore)
      .filter((s): s is number => s != null);

    result.push({
      label: range.label,
      score:
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : null,
    });
  }

  return result;
}

export async function computeRankings(
  companyId: string,
  type: RankingType,
  period: RankingPeriod,
  groupId?: string
): Promise<RankingRow[]> {
  const db = await getDb();
  const monthCount = getPeriodMonths(period);
  const ranges = getMonthRanges(monthCount);

  if (type === "store") {
    let storeList = await db
      .select()
      .from(stores)
      .where(and(eq(stores.companyId, companyId), eq(stores.isActive, true)));

    if (groupId) {
      const members = await db
        .select({ storeId: groupMemberships.storeId })
        .from(groupMemberships)
        .where(eq(groupMemberships.groupId, groupId));
      const memberIds = new Set(members.map((m) => m.storeId));
      storeList = storeList.filter((s) => memberIds.has(s.id));
    }

    const rows: RankingRow[] = [];
    for (const store of storeList) {
      const monthlyScores = await getStoreScores(db, companyId, store.id, ranges);
      const validScores = monthlyScores
        .map((m) => m.score)
        .filter((s): s is number => s != null);
      const average =
        validScores.length > 0
          ? validScores.reduce((a, b) => a + b, 0) / validScores.length
          : 0;

      const trend =
        validScores.length >= 2
          ? validScores[validScores.length - 1] > validScores[0]
            ? "up"
            : validScores[validScores.length - 1] < validScores[0]
              ? "down"
              : "flat"
          : "flat";

      rows.push({
        rank: 0,
        id: store.id,
        name: store.name,
        monthlyScores,
        average,
        trend,
      });
    }

    rows.sort((a, b) => b.average - a.average);
    rows.forEach((r, i) => (r.rank = i + 1));
    return rows;
  }

  if (type === "group") {
    const groupList = await db
      .select()
      .from(groups)
      .where(eq(groups.companyId, companyId));

    const rows: RankingRow[] = [];
    for (const group of groupList) {
      const members = await db
        .select({ storeId: groupMemberships.storeId })
        .from(groupMemberships)
        .where(eq(groupMemberships.groupId, group.id));

      if (members.length === 0) continue;

      const storeScores: number[][] = [];
      for (const m of members) {
        const monthly = await getStoreScores(db, companyId, m.storeId, ranges);
        storeScores.push(
          monthly.map((ms) => ms.score ?? 0).filter((s) => s > 0)
        );
      }

      const monthlyScores = ranges.map((range, i) => {
        const monthAvgs = storeScores
          .map((ss) => ss[i])
          .filter((s) => s != null && s > 0);
        return {
          label: range.label,
          score:
            monthAvgs.length > 0
              ? monthAvgs.reduce((a, b) => a + b, 0) / monthAvgs.length
              : null,
        };
      });

      const validScores = monthlyScores
        .map((m) => m.score)
        .filter((s): s is number => s != null);
      const average =
        validScores.length > 0
          ? validScores.reduce((a, b) => a + b, 0) / validScores.length
          : 0;

      rows.push({
        rank: 0,
        id: group.id,
        name: group.name,
        monthlyScores,
        average,
        trend: "flat",
      });
    }

    rows.sort((a, b) => b.average - a.average);
    rows.forEach((r, i) => (r.rank = i + 1));
    return rows;
  }

  // improvement rate
  const halfCount = Math.max(1, Math.floor(monthCount / 2));
  const recentRanges = ranges.slice(-halfCount);
  const priorRanges = ranges.slice(0, halfCount);

  let storeList = await db
    .select()
    .from(stores)
    .where(and(eq(stores.companyId, companyId), eq(stores.isActive, true)));

  if (groupId) {
    const members = await db
      .select({ storeId: groupMemberships.storeId })
      .from(groupMemberships)
      .where(eq(groupMemberships.groupId, groupId));
    const memberIds = new Set(members.map((m) => m.storeId));
    storeList = storeList.filter((s) => memberIds.has(s.id));
  }

  const rows: RankingRow[] = [];
  for (const store of storeList) {
    const recent = await getStoreScores(db, companyId, store.id, recentRanges);
    const prior = await getStoreScores(db, companyId, store.id, priorRanges);

    const recentAvg =
      recent.filter((r) => r.score != null).reduce((a, r) => a + (r.score ?? 0), 0) /
        (recent.filter((r) => r.score != null).length || 1);
    const priorAvg =
      prior.filter((r) => r.score != null).reduce((a, r) => a + (r.score ?? 0), 0) /
        (prior.filter((r) => r.score != null).length || 1);

    const improvementRate =
      priorAvg > 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : 0;

    rows.push({
      rank: 0,
      id: store.id,
      name: store.name,
      monthlyScores: recent,
      average: recentAvg,
      trend: improvementRate > 0 ? "up" : improvementRate < 0 ? "down" : "flat",
      improvementRate,
    });
  }

  rows.sort((a, b) => (b.improvementRate ?? 0) - (a.improvementRate ?? 0));
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}
