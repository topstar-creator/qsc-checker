import fs from "fs";
import path from "path";

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f === "route.ts") {
      let c = fs.readFileSync(p, "utf8");
      if (!/export async function (POST|PATCH|DELETE)/.test(c)) continue;

      if (!c.includes('persistDb')) {
        c = c.replace(
          /from "@\/lib\/db\/init";/,
          'from "@/lib/db/init";\nimport { persistDb } from "@/lib/db";'
        );
      }
      c = c.replace(
        /(\n\s+)(return NextResponse\.json)/g,
        "$1persistDb();\n$1$2"
      );
      fs.writeFileSync(p, c);
    }
  }
}

walk("src/app/api");
console.log("persist hooks added");
