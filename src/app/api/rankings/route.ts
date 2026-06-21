import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { getSession } from "@/lib/auth/session";
import { computeRankings } from "@/lib/rankings/engine";
import type { RankingPeriod, RankingType } from "@/lib/db/schema";

export async function GET(request: Request) {
  await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "store") as RankingType;
  const period = (searchParams.get("period") ?? "3m") as RankingPeriod;
  const groupId = searchParams.get("groupId") || undefined;

  const rows = await computeRankings(session.companyId, type, period, groupId);

  return NextResponse.json({ rows });
}
