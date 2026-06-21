"use client";

import Link from "next/link";
import { useRole } from "@/components/layout/role-context";
import { ROLE_LABELS } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Store,
  Users,
  FolderTree,
  ClipboardList,
  CreditCard,
  User,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";

const ADMIN_MENU = [
  { href: "/mypage/stores", label: "店舗登録", icon: Store },
  { href: "/mypage/users", label: "ユーザー登録", icon: Users },
  { href: "/mypage/groups", label: "グループ登録", icon: FolderTree },
  { href: "/mypage/sheets", label: "チェックシート管理", icon: ClipboardList },
  { href: "/mypage/billing", label: "課金管理", icon: CreditCard },
];

const SV_MENU = [
  { href: "/mypage/stores", label: "担当店舗管理", icon: Store },
  { href: "/mypage/groups", label: "担当グループ管理", icon: FolderTree },
];

const STORE_MENU = [
  { href: "/mypage/profile", label: "プロフィール管理", icon: User },
  { href: "/mypage/notifications", label: "通知設定", icon: Bell },
];

export default function MyPage() {
  const { role, userName } = useRole();

  const menu =
    role === "company_admin" || role === "platform_admin"
      ? [...ADMIN_MENU, ...STORE_MENU]
      : role === "sv"
        ? [...SV_MENU, ...STORE_MENU]
        : STORE_MENU;

  const handleLogout = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/auth/sign-in";
  };

  return (
    <div className="page-scroll space-y-4">
      <PageHeader
        title="マイページ"
        subtitle={`${userName} / ${ROLE_LABELS[role] ?? role}`}
      />

      <Card>
        <CardContent className="p-0 divide-y">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        ログアウト
      </Button>
    </div>
  );
}
