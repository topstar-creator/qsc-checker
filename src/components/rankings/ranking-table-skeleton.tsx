export function RankingTableSkeleton() {
  return (
    <div className="flex h-full min-h-[12rem] flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm animate-pulse">
      <div className="border-b bg-muted/40 px-3 py-3">
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 flex-1 rounded bg-muted" />
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-0 divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-4">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-4 flex-1 rounded bg-muted/80" />
            <div className="h-5 w-10 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
