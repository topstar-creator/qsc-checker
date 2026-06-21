"use client";

import { useEffect, useState } from "react";
import { ScoreBadge } from "@/components/ui/score-badge";
import { ListCardItem } from "@/components/ui/list-card-item";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { mockReports } from "@/data/mock";
import { fetchJson } from "@/lib/api/fetch-json";

interface ReportItem {
  id: string;
  storeId: string;
  storeName: string;
  totalScore: number;
  inspectedAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    fetchJson<{ reports: ReportItem[] }>("/api/reports").then((res) => {
      if (res.ok && res.data.reports?.length) {
        setReports(res.data.reports);
        setUsingMock(false);
      } else if (res.ok) {
        setReports([]);
        setUsingMock(false);
      } else {
        setReports(
          mockReports.map((r) => ({
            id: r.id,
            storeId: r.storeId,
            storeName: r.storeName,
            totalScore: r.totalScore,
            inspectedAt: r.inspectedAt,
          }))
        );
        setUsingMock(true);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-fill">
      <PageHeader title="調査レポート" subtitle="店舗別の調査結果" />

      <div className="page-list-area space-y-2">
        {loading ? (
          <EmptyState message="読み込み中..." />
        ) : reports.length === 0 ? (
          <EmptyState
            message="レポートがありません"
            hint="「調査開始」から調査を実施してください"
          />
        ) : (
          <>
            {usingMock && (
              <p className="text-2xs text-amber-700">
                デモデータを表示中です。API接続またはDBシードを確認してください。
              </p>
            )}
            {reports.map((report) => (
              <ListCardItem
                key={report.id}
                href={`/reports/${report.id}`}
                title={report.storeName}
                subtitle={formatDate(report.inspectedAt)}
                trailing={<ScoreBadge score={report.totalScore} />}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
