"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Group {
  id: string;
  name: string;
  type: string;
  storeCount?: number;
}

const GROUP_TYPES = [
  { value: "brand", label: "ブランド" },
  { value: "area", label: "エリア" },
  { value: "division", label: "事業部" },
  { value: "sv", label: "SV管轄" },
  { value: "custom", label: "カスタム" },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [form, setForm] = useState({ name: "", type: "area" });

  const load = () =>
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups ?? []));

  useEffect(() => { load(); }, []);

  const add = async () => {
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", type: "area" });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/groups/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mypage"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">グループ登録</h1>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div><Label>グループ名</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <Label>種類</Label>
            <select className="w-full h-10 rounded-md border px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {GROUP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <Button onClick={add} className="w-full"><Plus className="h-4 w-4 mr-1" />追加</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {groups.map((g) => (
          <Card key={g.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{g.name}</p>
                <p className="text-xs text-muted-foreground">
                  {GROUP_TYPES.find((t) => t.value === g.type)?.label}
                  {g.storeCount != null && ` · ${g.storeCount}店舗`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(g.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
