"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORE_PRICE_PER_MONTH } from "@/lib/billing/stripe";

interface BillingInfo {
  status: string;
  statusLabel: string;
  statusColor: string;
  storeCount: number;
  trialEndsAt?: string;
  monthlyAmount: number;
  isTrial: boolean;
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => r.json())
      .then((d) => setBilling(d.billing));
  }, []);

  if (!billing) {
    return <div className="p-4 text-center text-muted-foreground">読み込み中...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mypage"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-bold">課金管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            契約情報
            <span className={`text-xs px-2 py-1 rounded-full ${billing.statusColor}`}>
              {billing.statusLabel}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">登録店舗数</span>
            <span className="font-medium">{billing.storeCount}店舗</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">月額料金</span>
            <span className="font-medium">
              ¥{billing.monthlyAmount.toLocaleString()}/月
            </span>
          </div>
          {billing.isTrial && billing.trialEndsAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">トライアル終了</span>
              <span className="font-medium">{billing.trialEndsAt}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-2 border-t">
            3ヶ月無料トライアル後、店舗数 × ¥{STORE_PRICE_PER_MONTH.toLocaleString()}/月 で課金されます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
