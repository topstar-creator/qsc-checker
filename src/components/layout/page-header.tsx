"use client";

import { UserMenu } from "@/components/layout/user-menu";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-3">
      <div className="min-w-0 space-y-0.5">
        <h1 className="text-lg font-bold tracking-wide text-foreground">{title}</h1>
        {subtitle && <p className="text-2xs text-muted-foreground">{subtitle}</p>}
      </div>
      <UserMenu />
    </header>
  );
}
