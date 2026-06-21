"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuestionForm } from "@/components/inspections/question-form";
import { MediaUploader } from "@/components/inspections/media-uploader";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { ListCardItem } from "@/components/ui/list-card-item";
import { PageHeader } from "@/components/layout/page-header";
import { defaultQuestions, mockStores } from "@/data/mock";
import { fetchJson } from "@/lib/api/fetch-json";

type Step = "store" | "sheet" | "questions" | "media" | "review";

interface Store {
  id: string;
  name: string;
}

interface Sheet {
  id: string;
  name: string;
}

interface Question {
  id: string;
  text: string;
  category: string;
}

export default function InspectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("store");
  const [stores, setStores] = useState<Store[]>([]);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { score: number; comment: string }>>({});
  const [media, setMedia] = useState<{ type: "photo" | "video"; url: string; name: string }[]>([]);
  const [overallComment, setOverallComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    fetchJson<{ stores: Store[] }>("/api/stores").then((res) => {
      if (res.ok && res.data.stores?.length) {
        setStores(res.data.stores);
      } else if (res.ok) {
        setStores([]);
      } else {
        setStores(mockStores.map((s) => ({ id: s.id, name: s.name })));
      }
      setLoadingStores(false);
    });
    fetchJson<{ sheets: Sheet[] }>("/api/check-sheets").then((res) => {
      if (res.ok && res.data.sheets?.length) {
        setSheets(res.data.sheets);
      } else if (!res.ok) {
        setSheets([{ id: "1", name: "標準QSCチェックシート" }]);
      } else {
        setSheets(res.data.sheets ?? []);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedSheet) return;
    fetch(`/api/check-sheets/${selectedSheet}/questions`)
      .then((r) => r.json())
      .then((d) => {
        if (d.questions?.length) {
          setQuestions(d.questions);
        } else {
          setQuestions(
            defaultQuestions.map((text, i) => ({
              id: String(i),
              text,
              category: i < 5 ? "清潔感" : i < 10 ? "サービス" : "品質",
            }))
          );
        }
      })
      .catch(() =>
        setQuestions(
          defaultQuestions.map((text, i) => ({
            id: String(i),
            text,
            category: "QSC",
          }))
        )
      );
  }, [selectedSheet]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStore,
          checkSheetId: selectedSheet,
          comment: overallComment,
          answers: questions.map((q) => ({
            questionId: q.id,
            score: answers[q.id]?.score ?? 80,
            comment: answers[q.id]?.comment ?? "",
          })),
        }),
      });
      const data = await res.json();
      if (data.reportId) router.push(`/reports/${data.reportId}`);
      else router.push("/reports");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStoreName = stores.find((s) => s.id === selectedStore)?.name;

  if (step === "store") {
    return (
      <div className="page-fill">
        <PageHeader title="調査開始" subtitle="店舗を選択してください" />

        <div className="page-list-area space-y-2">
          {loadingStores ? (
            <EmptyState message="読み込み中..." />
          ) : stores.length === 0 ? (
            <EmptyState
              message="店舗が登録されていません"
              hint="マイページ → 店舗登録 から追加してください"
            />
          ) : (
            stores.map((s) => (
              <ListCardItem
                key={s.id}
                title={s.name}
                subtitle="タップして調査を開始"
                onClick={() => {
                  setSelectedStore(s.id);
                  setStep("sheet");
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  if (step === "sheet") {
    return (
      <div className="page-fill">
        <PageHeader
          title="チェックシート選択"
          subtitle={selectedStoreName ?? "店舗を選択中"}
        />

        <div className="page-list-area space-y-2">
          {sheets.length === 0 ? (
            <EmptyState message="チェックシートがありません" />
          ) : (
            sheets.map((s) => (
              <ListCardItem
                key={s.id}
                title={s.name}
                subtitle="30項目の標準チェック"
                onClick={() => {
                  setSelectedSheet(s.id);
                  setStep("questions");
                }}
              />
            ))
          )}
        </div>

        <div className="shrink-0 px-1 pb-1">
          <Button variant="ghost" className="w-full" onClick={() => setStep("store")}>
            戻る
          </Button>
        </div>
      </div>
    );
  }

  if (step === "questions" && questions.length > 0) {
    const q = questions[currentQ];
    const ans = answers[q.id] ?? { score: 80, comment: "" };

    return (
      <div className="page-scroll space-y-6">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
        <QuestionForm
          question={q.text}
          category={q.category}
          index={currentQ}
          total={questions.length}
          score={ans.score}
          comment={ans.comment}
          onScoreChange={(score) =>
            setAnswers((prev) => ({ ...prev, [q.id]: { ...ans, score } }))
          }
          onCommentChange={(comment) =>
            setAnswers((prev) => ({ ...prev, [q.id]: { ...ans, comment } }))
          }
        />
        <div className="flex gap-2">
          {currentQ > 0 && (
            <Button variant="outline" onClick={() => setCurrentQ((c) => c - 1)}>
              前へ
            </Button>
          )}
          {currentQ < questions.length - 1 ? (
            <Button className="flex-1" onClick={() => setCurrentQ((c) => c + 1)}>
              次へ
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => setStep("media")}>
              写真・コメントへ
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (step === "media") {
    return (
      <div className="page-scroll space-y-4">
        <h1 className="text-xl font-bold">写真・動画・コメント</h1>
        <MediaUploader files={media} onChange={setMedia} />
        <div className="space-y-2">
          <Label>全体コメント</Label>
          <Textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            placeholder="調査全体の所見"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep("questions")}>
            戻る
          </Button>
          <Button className="flex-1" onClick={() => setStep("review")}>
            確認へ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-scroll space-y-4">
      <h1 className="text-xl font-bold">送信確認</h1>
      <p className="text-sm text-muted-foreground">
        {questions.length}項目の回答を送信します
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep("media")}>
          戻る
        </Button>
        <Button className="flex-1" onClick={submit} disabled={submitting}>
          {submitting ? "送信中..." : "調査結果を送信"}
        </Button>
      </div>
    </div>
  );
}
