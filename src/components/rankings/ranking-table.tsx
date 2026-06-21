"use client";

import Link from "next/link";
import type { RankingRow } from "@/data/mock";
import { ScoreBadge } from "@/components/ui/score-badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { RankingType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RankingTableProps {
  rows: RankingRow[];
  type: RankingType;
  linkPrefix?: string;
}

export function RankingTable({ rows, type, linkPrefix = "/reports" }: RankingTableProps) {
  const monthLabels = rows[0]?.monthlyScores.map((m) => m.label) ?? [];

  return (
    <div className="flex h-full min-h-[12rem] flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="scrollbar-subtle flex-1 overflow-auto">
        <table className="w-full min-w-[400px] text-2xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
            <tr className="border-b">
              <th className="sticky left-0 z-20 bg-muted/95 px-2.5 py-2.5 text-left font-medium text-muted-foreground backdrop-blur-sm">
                順位
              </th>
              <th className="sticky left-[2.25rem] z-20 min-w-[4.5rem] bg-muted/95 px-2 py-2.5 text-left font-medium text-muted-foreground backdrop-blur-sm">
                {type === "group" ? "グループ" : "店舗"}
              </th>
              {monthLabels.map((label) => (
                <th
                  key={label}
                  className="px-2 py-2.5 text-center font-medium text-muted-foreground whitespace-nowrap tabular-nums"
                >
                  {label}
                </th>
              ))}
              <th className="px-2 py-2.5 text-center font-medium text-muted-foreground whitespace-nowrap">
                {type === "improvement" ? "改善率" : "平均"}
              </th>
              <th className="px-2 py-2.5 text-center font-medium text-muted-foreground">
                推移
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-accent/40",
                  i % 2 === 1 && "bg-muted/20"
                )}
              >
                <td className="sticky left-0 z-[1] bg-card px-2.5 py-3 font-bold tabular-nums">
                  {row.rank}
                </td>
                <td className="sticky left-[2.25rem] z-[1] bg-card px-2 py-3">
                  <Link
                    href={`${linkPrefix}?store=${row.id}`}
                    className="font-medium text-primary hover:underline line-clamp-1"
                  >
                    {row.name}
                  </Link>
                </td>
                {row.monthlyScores.map((m) => (
                  <td
                    key={m.label}
                    className="px-2 py-3 text-center tabular-nums text-foreground/90"
                  >
                    {m.score != null ? m.score.toFixed(0) : "—"}
                  </td>
                ))}
                <td className="px-2 py-3 text-center">
                  {type === "improvement" ? (
                    <span
                      className={cn(
                        "text-2xs font-semibold tabular-nums",
                        (row.improvementRate ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {(row.improvementRate ?? 0) >= 0 ? "+" : ""}
                      {(row.improvementRate ?? 0).toFixed(1)}%
                    </span>
                  ) : (
                    <ScoreBadge score={row.average} className="text-2xs px-2 py-0" />
                  )}
                </td>
                <td className="px-2 py-3 text-center">
                  {row.trend === "up" && (
                    <TrendingUp className="inline h-4 w-4 text-green-600" aria-label="上昇" />
                  )}
                  {row.trend === "down" && (
                    <TrendingDown className="inline h-4 w-4 text-red-500" aria-label="下降" />
                  )}
                  {row.trend === "flat" && (
                    <Minus className="inline h-4 w-4 text-muted-foreground/60" aria-label="横ばい" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
