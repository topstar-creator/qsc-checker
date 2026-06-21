"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KeyboardEvent, ReactNode } from "react";

interface ListCardItemProps {
  title: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  className?: string;
}

function CardInner({
  title,
  subtitle,
  trailing,
  className,
  interactive,
}: {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <Card
      className={cn(
        "border-border/70 shadow-sm transition-colors",
        interactive && "hover:bg-background active:scale-[0.99]",
        className
      )}
    >
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="font-medium">{title}</p>
          {subtitle && (
            <p className="text-2xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {trailing}
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ListCardItem({
  title,
  subtitle,
  href,
  onClick,
  trailing,
  className,
}: ListCardItemProps) {
  if (href) {
    return (
      <Link href={href} className="block w-full">
        <CardInner
          title={title}
          subtitle={subtitle}
          trailing={trailing}
          className={className}
          interactive
        />
      </Link>
    );
  }

  if (onClick) {
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    };

    return (
      <div
        role="button"
        tabIndex={0}
        className="block w-full cursor-pointer"
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <CardInner
          title={title}
          subtitle={subtitle}
          trailing={trailing}
          className={className}
          interactive
        />
      </div>
    );
  }

  return (
    <CardInner
      title={title}
      subtitle={subtitle}
      trailing={trailing}
      className={className}
    />
  );
}
