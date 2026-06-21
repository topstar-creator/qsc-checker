export default function MainLoading() {
  return (
    <div className="page-fill animate-pulse">
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-36 rounded-md bg-muted" />
          <div className="h-3 w-28 rounded-md bg-muted/70" />
        </div>
        <div className="h-9 w-9 rounded-full bg-muted" />
      </div>
      <div className="h-10 rounded-lg bg-muted/80" />
      <div className="h-8 rounded-full bg-muted/80" />
      <div className="min-h-0 flex-1 rounded-xl bg-muted/60" />
    </div>
  );
}
