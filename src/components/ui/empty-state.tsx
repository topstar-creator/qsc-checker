interface EmptyStateProps {
  message: string;
  hint?: string;
}

export function EmptyState({ message, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {hint && <p className="text-2xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
