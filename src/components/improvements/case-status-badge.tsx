import type { CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; className: string }
> = {
  pending: { label: "未対応", className: "bg-gray-100 text-gray-700" },
  in_progress: { label: "対応中", className: "bg-blue-100 text-blue-700" },
  reported: { label: "報告済み", className: "bg-purple-100 text-purple-700" },
  rejected: { label: "差戻し", className: "bg-red-100 text-red-700" },
  done: { label: "完了", className: "bg-green-100 text-green-700" },
};

export function CaseStatusBadge({
  status,
  className,
}: {
  status: CaseStatus | string;
  className?: string;
}) {
  const config = STATUS_CONFIG[status as CaseStatus] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
