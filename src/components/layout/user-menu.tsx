"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Check } from "lucide-react";
import { useRole } from "@/components/layout/role-context";
import {
  DEMO_USERS,
  ROLE_LABELS,
  getInitial,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function AvatarCircle({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary ring-2 ring-primary/15",
        className
      )}
    >
      {getInitial(name)}
    </span>
  );
}

export function UserMenu() {
  const { role, userName, setDevUser } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (!isDev) {
    return (
      <Link
        href="/mypage"
        className="transition-opacity hover:opacity-80"
        aria-label={`${userName} のマイページ`}
        title={userName}
      >
        <AvatarCircle name={userName} />
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 rounded-full pr-1 transition-colors",
          "hover:bg-muted/60",
          open && "bg-muted/60"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="ユーザーメニュー"
      >
        <AvatarCircle name={userName} />
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+0.375rem)] z-50 w-56 overflow-hidden rounded-xl border border-border/80 bg-background shadow-lg"
        >
          <div className="border-b border-border/60 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <AvatarCircle name={userName} className="h-8 w-8 text-xs" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="text-2xs text-muted-foreground">
                  {ROLE_LABELS[role] ?? role}
                </p>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            <p className="px-2 py-1 text-2xs font-medium text-muted-foreground">
              ユーザーを切り替え
            </p>
            {DEMO_USERS.map((user) => {
              const active =
                user.role === role && user.userName === userName;
              return (
                <button
                  key={`${user.role}-${user.userName}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setDevUser(user);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                    active ? "bg-primary/10" : "hover:bg-muted/60"
                  )}
                >
                  <AvatarCircle name={user.userName} className="h-7 w-7 text-2xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{user.userName}</p>
                    <p className="text-2xs text-muted-foreground">
                      {ROLE_LABELS[user.role]}
                    </p>
                  </div>
                  {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
