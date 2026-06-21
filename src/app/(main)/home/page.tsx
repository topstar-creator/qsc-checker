"use client";

import { useEffect, useState } from "react";
import type { RankingPeriod, RankingType } from "@/lib/types";
import { FilterBar } from "@/components/rankings/filter-bar";
import { RankingTable } from "@/components/rankings/ranking-table";
import { PageHeader } from "@/components/layout/page-header";
import { HomeLoadingState } from "@/components/rankings/home-loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { RankingRow } from "@/data/mock";
import { getMockRankings } from "@/data/mock";
import { fetchJson } from "@/lib/api/fetch-json";

export default function HomePage() {
  const [type, setType] = useState<RankingType>("store");
  const [period, setPeriod] = useState<RankingPeriod>("3m");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    fetchJson<{ groups: { id: string; name: string }[] }>("/api/groups").then((res) => {
      if (res.ok) setGroups(res.data.groups ?? []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type, period });
    if (groupId) params.set("groupId", groupId);

    fetchJson<{ rows: RankingRow[] }>(`/api/rankings?${params}`).then((res) => {
      if (res.ok && res.data.rows?.length) {
        setRows(res.data.rows);
        setUsingMock(false);
      } else if (res.ok) {
        setRows([]);
        setUsingMock(false);
      } else {
        setRows(getMockRankings(type, period));
        setUsingMock(true);
      }
      setLoading(false);
    });
  }, [type, period, groupId]);

  return (
    <div className="page-fill">
      <PageHeader title="QSC ランキング" subtitle="直近3ヶ月平均スコア" />

      <div className="shrink-0">
        <FilterBar
          type={type}
          period={period}
          groupId={groupId}
          groups={groups}
          onTypeChange={setType}
          onPeriodChange={setPeriod}
          onGroupChange={setGroupId}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto scrollbar-subtle -mx-1 px-1">
        {loading ? (
          <HomeLoadingState />
        ) : rows.length === 0 ? (
          <EmptyState
            message="ランキングデータがありません"
            hint="店舗を登録して調査を実施すると表示されます"
          />
        ) : (
          <>
            {usingMock && (
              <p className="mb-2 text-2xs text-amber-700">
                デモデータを表示中です。API接続またはDBシードを確認してください。
              </p>
            )}
            <RankingTable rows={rows} type={type} />
          </>
        )}
      </div>
    </div>
  );
}
