"use client";

import Link from "next/link";
import { useRole } from "@/components/layout/role-context";
import { getInitial } from "@/lib/types";
import { cn } from "@/lib/utils";

export function UserAvatar({ className }: { className?: string }) {
  const { userName } = useRole();

  return (
    <Link
      href="/mypage"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary ring-2 ring-primary/15 transition-colors hover:bg-primary/20",
        className
      )}
      aria-label={`${userName} のマイページ`}
      title={userName}
    >
      {getInitial(userName)}
    </Link>
  );
}
