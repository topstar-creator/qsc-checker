"use client";

import type { RankingPeriod, RankingType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPES: { value: RankingType; label: string }[] = [
  { value: "store", label: "店舗" },
  { value: "group", label: "グループ" },
  { value: "improvement", label: "改善率" },
];

const PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: "1m", label: "当月" },
  { value: "3m", label: "3ヶ月" },
  { value: "6m", label: "6ヶ月" },
  { value: "1y", label: "1年" },
];

interface FilterBarProps {
  type: RankingType;
  period: RankingPeriod;
  groupId?: string;
  groups?: { id: string; name: string }[];
  onTypeChange: (type: RankingType) => void;
  onPeriodChange: (period: RankingPeriod) => void;
  onGroupChange?: (groupId: string) => void;
}

export function FilterBar({
  type,
  period,
  groupId,
  groups = [],
  onTypeChange,
  onPeriodChange,
  onGroupChange,
}: FilterBarProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex gap-1 rounded-lg bg-muted/80 p-1">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => onTypeChange(t.value)}
            className={cn(
              "flex-1 rounded-md px-2 py-2 text-2xs font-medium transition-all",
              type === t.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={cn(
              "flex-1 rounded-full px-2 py-1.5 text-2xs font-medium transition-colors",
              period === p.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/80 text-muted-foreground hover:bg-muted"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {groups.length > 0 && onGroupChange && (
        <select
          value={groupId ?? ""}
          onChange={(e) => onGroupChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">すべてのグループ</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
