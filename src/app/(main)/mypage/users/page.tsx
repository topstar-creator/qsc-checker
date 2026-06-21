"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLES = [
  { value: "company_admin", label: "会社管理者" },
  { value: "sv", label: "SV" },
  { value: "store_manager", label: "店長" },
  { value: "inspector", label: "調査員" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "store_manager" });

  const load = () =>
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));

  useEffect(() => { load(); }, []);

  const add = async () => {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "", password: "", role: "store_manager" });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mypage"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">ユーザー登録</h1>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div><Label>名前</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>メール</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>パスワード</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div>
            <Label>権限</Label>
            <select className="w-full h-10 rounded-md border px-3 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <Button onClick={add} className="w-full"><Plus className="h-4 w-4 mr-1" />追加</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email} · {ROLES.find((r) => r.value === u.role)?.label}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(u.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
