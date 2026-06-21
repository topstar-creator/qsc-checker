"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CaseStatusBadge } from "@/components/improvements/case-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { CaseStatus } from "@/lib/types";
import { mockCases } from "@/data/mock";
import { fetchJson } from "@/lib/api/fetch-json";

interface CaseItem {
  id: string;
  title: string;
  storeName: string;
  status: CaseStatus;
  dueDate?: string;
  issueItem?: string;
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "pending", label: "未対応" },
  { value: "in_progress", label: "対応中" },
  { value: "reported", label: "報告済み" },
  { value: "done", label: "完了" },
];

export default function ImprovementsPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    fetchJson<{ cases: CaseItem[] }>("/api/improvements").then((res) => {
      if (res.ok && res.data.cases?.length) {
        setCases(res.data.cases);
        setUsingMock(false);
      } else if (res.ok) {
        setCases([]);
        setUsingMock(false);
      } else {
        setCases(
          mockCases.map((c) => ({
            id: c.id,
            title: c.title,
            storeName: c.storeName,
            status: c.status,
            dueDate: c.dueDate,
            issueItem: c.issueItem,
          }))
        );
        setUsingMock(true);
      }
      setLoading(false);
    });
  }, []);

  const filtered = tab === "all" ? cases : cases.filter((c) => c.status === tab);

  return (
    <div className="page-fill">
      <PageHeader title="改善報告" subtitle="改善案件の管理" />

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col gap-3"
      >
        <TabsList className="grid h-auto shrink-0 grid-cols-5">
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="px-1 text-2xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="page-list-area">
          {usingMock && !loading && (
            <p className="mb-2 text-2xs text-amber-700">
              デモデータを表示中です。API接続またはDBシードを確認してください。
            </p>
          )}
          {STATUS_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0 space-y-2">
              {loading ? (
                <EmptyState message="読み込み中..." />
              ) : filtered.length === 0 ? (
                <EmptyState message="案件がありません" />
              ) : (
                filtered.map((c) => (
                  <Link key={c.id} href={`/improvements/${c.id}`}>
                    <Card className="border-border/70 shadow-sm transition-colors hover:bg-background">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{c.title}</p>
                            <p className="mt-1 text-2xs text-muted-foreground">
                              {c.storeName}
                              {c.issueItem && ` · ${c.issueItem}`}
                            </p>
                            {c.dueDate && (
                              <p className="text-2xs text-muted-foreground">
                                期限: {formatDate(c.dueDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <CaseStatusBadge status={c.status} />
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
