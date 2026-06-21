"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Step = 1 | 2 | 3;

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    industry: "飲食",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    storeName: "",
    storeCode: "",
  });

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登録に失敗しました");
        return;
      }
      router.push("/home");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>新規登録</CardTitle>
          <p className="text-sm text-muted-foreground">
            ステップ {step} / 3 —{" "}
            {step === 1 ? "会社情報" : step === 2 ? "管理者アカウント" : "最初の店舗"}
          </p>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label>会社名</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="株式会社サンプル"
                />
              </div>
              <div>
                <Label>業種</Label>
                <select
                  className="w-full h-10 rounded-md border px-3 text-sm"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                >
                  <option value="飲食">飲食</option>
                  <option value="小売">小売</option>
                  <option value="サービス">サービス</option>
                </select>
              </div>
              <Button className="w-full" onClick={() => setStep(2)} disabled={!form.companyName}>
                次へ
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label>管理者名</Label>
                <Input
                  value={form.adminName}
                  onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                />
              </div>
              <div>
                <Label>メールアドレス</Label>
                <Input
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>パスワード</Label>
                <Input
                  type="password"
                  value={form.adminPassword}
                  onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>戻る</Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={!form.adminName || !form.adminEmail || !form.adminPassword}
                >
                  次へ
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Label>店舗名</Label>
                <Input
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  placeholder="本店"
                />
              </div>
              <div>
                <Label>店舗コード（任意）</Label>
                <Input
                  value={form.storeCode}
                  onChange={(e) => setForm({ ...form, storeCode: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                3ヶ月間無料でご利用いただけます。4ヶ月目以降は店舗数に応じて課金されます。
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>戻る</Button>
                <Button className="flex-1" onClick={submit} disabled={loading || !form.storeName}>
                  {loading ? "登録中..." : "登録完了"}
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            既にアカウントをお持ちの方は{" "}
            <Link href="/auth/sign-in" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
