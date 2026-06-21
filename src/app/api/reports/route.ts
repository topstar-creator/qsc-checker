import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/init";
import { getSession } from "@/lib/auth/session";
import {
  reports,
  stores,
  inspections,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const db = await ensureDbReady();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: reports.id,
      storeId: reports.storeId,
      storeName: stores.name,
      totalScore: reports.totalScore,
      inspectedAt: inspections.inspectedAt,
    })
    .from(reports)
    .innerJoin(stores, eq(reports.storeId, stores.id))
    .innerJoin(inspections, eq(reports.inspectionId, inspections.id))
    .where(eq(reports.companyId, session.companyId))
    .orderBy(desc(reports.createdAt));

  return NextResponse.json({
    reports: rows.map((r) => ({
      id: r.id,
      storeId: r.storeId,
      storeName: r.storeName,
      totalScore: r.totalScore,
      inspectedAt: r.inspectedAt?.toISOString() ?? new Date().toISOString(),
    })),
  });
}
