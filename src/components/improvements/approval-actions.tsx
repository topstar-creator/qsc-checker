"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApprovalActionsProps {
  role: string;
  status: string;
  onApprove?: () => void;
  onReject?: () => void;
  onSubmitReport?: () => void;
  onStartWork?: () => void;
  loading?: boolean;
}

export function ApprovalActions({
  role,
  status,
  onApprove,
  onReject,
  onSubmitReport,
  onStartWork,
  loading,
}: ApprovalActionsProps) {
  const isSv = ["sv", "company_admin", "platform_admin"].includes(role);
  const isStore = role === "store_manager";

  return (
    <div className={cn("fixed bottom-16 left-0 right-0 border-t bg-background p-4 safe-bottom")}>
      <div className="mx-auto flex max-w-lg gap-2">
        {status === "pending" && isStore && onStartWork && (
          <Button className="flex-1" onClick={onStartWork} disabled={loading}>
            対応を開始
          </Button>
        )}
        {status === "in_progress" && isStore && onSubmitReport && (
          <Button className="flex-1" onClick={onSubmitReport} disabled={loading}>
            改善報告を提出
          </Button>
        )}
        {status === "reported" && isSv && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onReject}
              disabled={loading}
            >
              差戻し
            </Button>
            <Button className="flex-1" onClick={onApprove} disabled={loading}>
              承認
            </Button>
          </>
        )}
        {status === "rejected" && isStore && onSubmitReport && (
          <Button className="flex-1" onClick={onSubmitReport} disabled={loading}>
            再提出
          </Button>
        )}
      </div>
    </div>
  );
}
