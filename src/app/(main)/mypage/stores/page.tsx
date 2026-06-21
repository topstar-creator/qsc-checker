"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Store {
  id: string;
  name: string;
  code?: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const load = () =>
    fetch("/api/stores")
      .then((r) => r.json())
      .then((d) => setStores(d.stores ?? []));

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name) return;
    await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    });
    setName("");
    setCode("");
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/stores/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mypage"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">店舗登録</h1>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div><Label>店舗名</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>店舗コード</Label><Input value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <Button onClick={add} className="w-full"><Plus className="h-4 w-4 mr-1" />追加</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {stores.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                {s.code && <p className="text-xs text-muted-foreground">{s.code}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
