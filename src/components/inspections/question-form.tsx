"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreBadge } from "@/components/ui/score-badge";

interface QuestionFormProps {
  question: string;
  category: string;
  index: number;
  total: number;
  score: number;
  comment: string;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
}

export function QuestionForm({
  question,
  category,
  index,
  total,
  score,
  comment,
  onScoreChange,
  onCommentChange,
}: QuestionFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{category}</span>
        <span>
          {index + 1} / {total}
        </span>
      </div>
      <h2 className="text-lg font-semibold">{question}</h2>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => onScoreChange(Number(e.target.value))}
          className="flex-1"
        />
        <ScoreBadge score={score} />
      </div>
      <Textarea
        placeholder="コメント（任意）"
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
      />
      <div className="flex gap-2">
        {[100, 80, 60, 40].map((s) => (
          <Button
            key={s}
            type="button"
            variant={score === s ? "default" : "outline"}
            size="sm"
            onClick={() => onScoreChange(s)}
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}
