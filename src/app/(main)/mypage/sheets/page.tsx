"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Sheet {
  id: string;
  name: string;
  questionCount?: number;
}

interface Question {
  id: string;
  text: string;
  category: string;
  sortOrder: number;
}

export default function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQ, setNewQ] = useState({ text: "", category: "品質" });

  useEffect(() => {
    fetch("/api/check-sheets")
      .then((r) => r.json())
      .then((d) => setSheets(d.sheets ?? []));
  }, []);

  useEffect(() => {
    if (!selectedSheet) return;
    fetch(`/api/check-sheets/${selectedSheet}/questions`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions ?? []));
  }, [selectedSheet]);

  const addQuestion = async () => {
    if (!selectedSheet || !newQ.text) return;
    await fetch(`/api/check-sheets/${selectedSheet}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQ),
    });
    setNewQ({ text: "", category: "品質" });
    const res = await fetch(`/api/check-sheets/${selectedSheet}/questions`);
    const d = await res.json();
    setQuestions(d.questions ?? []);
  };

  const deleteQuestion = async (qId: string) => {
    if (!selectedSheet) return;
    await fetch(`/api/check-sheets/${selectedSheet}/questions/${qId}`, { method: "DELETE" });
    setQuestions((qs) => qs.filter((q) => q.id !== qId));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mypage"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">チェックシート管理</h1>
      </div>

      <div className="space-y-2">
        {sheets.map((s) => (
          <Button
            key={s.id}
            variant={selectedSheet === s.id ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => setSelectedSheet(s.id)}
          >
            {s.name} ({s.questionCount ?? 0}問)
          </Button>
        ))}
      </div>

      {selectedSheet && (
        <>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div><Label>設問テキスト</Label><Input value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} /></div>
              <div><Label>カテゴリ</Label><Input value={newQ.category} onChange={(e) => setNewQ({ ...newQ, category: e.target.value })} /></div>
              <Button onClick={addQuestion} className="w-full"><Plus className="h-4 w-4 mr-1" />設問追加</Button>
            </CardContent>
          </Card>

          <div className="space-y-1">
            {questions.map((q) => (
              <div key={q.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p>{q.sortOrder}. {q.text}</p>
                  <p className="text-xs text-muted-foreground">{q.category}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)}>削除</Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
