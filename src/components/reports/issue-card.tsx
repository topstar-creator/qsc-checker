"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface IssueCardProps {
  question: string;
  score: number;
  comment?: string;
  onCreateCase?: () => void;
}

export function IssueCard({ question, score, comment, onCreateCase }: IssueCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{question}</p>
            {comment && <p className="text-xs text-muted-foreground mt-1">{comment}</p>}
          </div>
          <ScoreBadge score={score} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Camera className="h-3 w-3" />
          <span>写真添付あり</span>
        </div>
        {onCreateCase && (
          <Button size="sm" variant="outline" className="w-full" onClick={onCreateCase}>
            改善案件を作成
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
