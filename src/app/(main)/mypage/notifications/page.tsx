"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mypage"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">通知設定</h1>
      </div>
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-sm">メール通知</span>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm">改善案件の期限通知</span>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm">調査レポート通知</span>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </label>
      </div>
    </div>
  );
}
