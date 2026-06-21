"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, ClipboardCheck, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/reports", label: "レポート", icon: FileText },
  { href: "/inspect", label: "調査開始", icon: ClipboardCheck },
  { href: "/improvements", label: "改善報告", icon: TrendingUp },
  { href: "/mypage", label: "マイページ", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-2xs transition-colors",
                active
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn("h-5 w-5 shrink-0", active && "stroke-[2.5]")}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
