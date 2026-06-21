"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CaseStatusBadge } from "@/components/improvements/case-status-badge";
import { ApprovalActions } from "@/components/improvements/approval-actions";
import { AiAssistPanel } from "@/components/reports/ai-assist-panel";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MediaUploader } from "@/components/inspections/media-uploader";
import { useRole } from "@/components/layout/role-context";
import { formatDate } from "@/lib/utils";
import type { CaseStatus } from "@/lib/db/schema";

interface CaseDetail {
  id: string;
  title: string;
  storeName: string;
  status: CaseStatus;
  issueItem?: string;
  issueComment?: string;
  assigneeName?: string;
  dueDate?: string;
  rootCause?: string;
  actionPlan?: string;
  implementation?: string;
  verificationResult?: string;
  timeline: { status: string; comment?: string; userName: string; createdAt: string }[];
  aiSummary?: string;
  aiDiscussionPoints?: string[];
}

export default function ImprovementDetailPage() {
  const params = useParams();
  const { role } = useRole();
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    rootCause: "",
    actionPlan: "",
    implementation: "",
  });
  const [afterMedia, setAfterMedia] = useState<
    { type: "photo" | "video"; url: string; name: string }[]
  >([]);

  const load = () => {
    fetch(`/api/improvements/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setDetail(d.case);
        setForm({
          rootCause: d.case?.rootCause ?? "",
          actionPlan: d.case?.actionPlan ?? "",
          implementation: d.case?.implementation ?? "",
        });
      })
      .catch(() => {});
  };

  useEffect(load, [params.id]);

  const updateStatus = async (status: CaseStatus, extra?: Record<string, string>) => {
    setLoading(true);
    try {
      await fetch(`/api/improvements/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...form, ...extra }),
      });
      load();
    } finally {
      setLoading(false);
    }
  };

  if (!detail) {
    return <div className="p-4 text-center text-muted-foreground">読み込み中...</div>;
  }

  return (
    <div className="pb-32 space-y-4">
      <div className="p-4 flex items-center gap-2 border-b">
        <Link href="/improvements">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{detail.title}</h1>
          <p className="text-xs text-muted-foreground">{detail.storeName}</p>
        </div>
        <CaseStatusBadge status={detail.status} />
      </div>

      <section className="px-4 space-y-2">
        <h2 className="text-sm font-semibold">指摘内容</h2>
        <div className="rounded-lg border p-3 text-sm space-y-1 bg-muted/30">
          <p className="font-medium">{detail.issueItem}</p>
          {detail.issueComment && (
            <p className="text-muted-foreground">{detail.issueComment}</p>
          )}
        </div>
      </section>

      <section className="px-4 space-y-3">
        <h2 className="text-sm font-semibold">計画</h2>
        <div className="space-y-2">
          <Label>担当者</Label>
          <Input value={detail.assigneeName ?? ""} disabled />
          <Label>期限</Label>
          <Input
            value={detail.dueDate ? formatDate(detail.dueDate) : ""}
            disabled
          />
          <Label>原因仮説</Label>
          <Textarea
            value={form.rootCause}
            onChange={(e) => setForm((f) => ({ ...f, rootCause: e.target.value }))}
            disabled={detail.status === "done"}
          />
          <Label>対応方針</Label>
          <Textarea
            value={form.actionPlan}
            onChange={(e) => setForm((f) => ({ ...f, actionPlan: e.target.value }))}
            disabled={detail.status === "done"}
          />
        </div>
      </section>

      <section className="px-4 space-y-3">
        <h2 className="text-sm font-semibold">実施</h2>
        <Label>実施内容</Label>
        <Textarea
          value={form.implementation}
          onChange={(e) => setForm((f) => ({ ...f, implementation: e.target.value }))}
          disabled={!["in_progress", "rejected"].includes(detail.status)}
        />
        <Label>改善後写真</Label>
        <MediaUploader files={afterMedia} onChange={setAfterMedia} />
      </section>

      <section className="px-4">
        <AiAssistPanel
          summary={detail.aiSummary}
          discussionPoints={detail.aiDiscussionPoints}
        />
      </section>

      <section className="px-4 space-y-2">
        <h2 className="text-sm font-semibold">タイムライン</h2>
        {detail.timeline.map((t, i) => (
          <div key={i} className="flex gap-3 text-sm border-l-2 border-muted pl-3 py-1">
            <div>
              <CaseStatusBadge status={t.status as CaseStatus} />
              <p className="text-muted-foreground text-xs mt-1">
                {t.userName} · {formatDate(t.createdAt)}
              </p>
              {t.comment && <p className="mt-1">{t.comment}</p>}
            </div>
          </div>
        ))}
      </section>

      <ApprovalActions
        role={role}
        status={detail.status}
        loading={loading}
        onStartWork={() => updateStatus("in_progress")}
        onSubmitReport={() => updateStatus("reported", form)}
        onApprove={() => updateStatus("done", { verificationResult: "承認済み" })}
        onReject={() => updateStatus("rejected", { verificationResult: "差戻し" })}
      />
    </div>
  );
}
