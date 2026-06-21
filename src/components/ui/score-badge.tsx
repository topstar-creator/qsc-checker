import { cn } from "@/lib/utils";

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const color =
    score >= 90
      ? "bg-green-100 text-green-800"
      : score >= 80
        ? "bg-teal-100 text-teal-800"
        : score >= 70
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-800";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold",
        color,
        className
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}
