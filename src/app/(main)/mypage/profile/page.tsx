"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRole } from "@/components/layout/role-context";

export default function ProfilePage() {
  const { userName } = useRole();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mypage"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">プロフィール</h1>
      </div>
      <div className="space-y-3">
        <div><Label>名前</Label><Input defaultValue={userName} /></div>
        <div><Label>メール</Label><Input type="email" defaultValue="user@example.com" disabled /></div>
      </div>
    </div>
  );
}
