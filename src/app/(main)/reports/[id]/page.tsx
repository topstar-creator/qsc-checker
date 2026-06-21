"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ScoreTrendChart } from "@/components/reports/score-trend-chart";
import { IssueCard } from "@/components/reports/issue-card";
import { AiAssistPanel } from "@/components/reports/ai-assist-panel";
import { ScoreBadge } from "@/components/ui/score-badge";
import { mockReports } from "@/data/mock";

interface ReportDetail {
  id: string;
  storeName: string;
  totalScore: number;
  inspectedAt: string;
  trend: { month: string; score: number }[];
  issues: { question: string; score: number; comment?: string }[];
  aiSummary?: string;
  aiDiscussionPoints?: string[];
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then((r) => r.json())
      .then((data) => setReport(data.report))
      .catch(() => {
        const mock = mockReports.find((r) => r.id === params.id) ?? mockReports[0];
        setReport({
          id: mock.id,
          storeName: mock.storeName,
          totalScore: mock.totalScore,
          inspectedAt: mock.inspectedAt,
          trend: [
            { month: "4月", score: 92 },
            { month: "5月", score: 94 },
            { month: "6月", score: mock.totalScore },
          ],
          issues: mock.issues,
          aiSummary: mock.aiSummary,
          aiDiscussionPoints: mock.aiDiscussionPoints,
        });
      });
  }, [params.id]);

  const regenerateAi = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/ai/report/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: true }),
      });
      const data = await res.json();
      setReport((prev) =>
        prev
          ? {
              ...prev,
              aiSummary: data.summary,
              aiDiscussionPoints: data.discussionPoints,
            }
          : prev
      );
    } finally {
      setAiLoading(false);
    }
  };

  const createCase = async (issue: { question: string; score: number; comment?: string }) => {
    const res = await fetch("/api/improvements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: params.id,
        title: `${issue.question}の改善`,
        issueItem: issue.question,
        issueComment: issue.comment,
      }),
    });
    const data = await res.json();
    if (data.case?.id) router.push(`/improvements/${data.case.id}`);
  };

  if (!report) {
    return <div className="p-4 text-center text-muted-foreground">読み込み中...</div>;
  }

  return (
    <div className="p-4 space-y-6 pb-8">
      <div className="flex items-center gap-2">
        <Link href="/reports" className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold">{report.storeName}</h1>
          <p className="text-xs text-muted-foreground">調査レポート</p>
        </div>
        <div className="ml-auto">
          <ScoreBadge score={report.totalScore} />
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold mb-2">スコア推移</h2>
        <ScoreTrendChart data={report.trend} />
      </section>

      {report.issues.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">指摘事項</h2>
          {report.issues.map((issue, i) => (
            <IssueCard
              key={i}
              {...issue}
              onCreateCase={() => createCase(issue)}
            />
          ))}
        </section>
      )}

      <AiAssistPanel
        summary={report.aiSummary}
        discussionPoints={report.aiDiscussionPoints}
        onRegenerate={regenerateAi}
        loading={aiLoading}
      />
    </div>
  );
}
