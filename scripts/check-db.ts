import { getDb } from "../src/lib/db/index";
import { companies, stores, reports, users, inspections } from "../src/lib/db/schema";

async function main() {
  const db = await getDb();
  console.log("companies", (await db.select().from(companies)).length);
  console.log("users", (await db.select().from(users)).map((u) => u.email));
  console.log("stores", (await db.select().from(stores)).length);
  console.log("reports", (await db.select().from(reports)).length);
  console.log("inspections", (await db.select().from(inspections)).length);
}

main().catch(console.error);
