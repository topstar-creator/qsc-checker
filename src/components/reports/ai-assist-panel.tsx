"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiAssistPanelProps {
  summary?: string;
  discussionPoints?: string[];
  onRegenerate?: () => void;
  loading?: boolean;
}

export function AiAssistPanel({
  summary,
  discussionPoints = [],
  onRegenerate,
  loading,
}: AiAssistPanelProps) {
  return (
    <Card className="border-teal-200 bg-teal-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          AI アシスト
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            ※参考情報です
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">分析中...</p>
        ) : (
          <>
            {summary && <p className="text-sm">{summary}</p>}
            {discussionPoints.length > 0 && (
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                {discussionPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </>
        )}
        {onRegenerate && (
          <Button size="sm" variant="ghost" onClick={onRegenerate} disabled={loading}>
            <RefreshCw className="h-3 w-3 mr-1" />
            再生成
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
