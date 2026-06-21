import fs from "fs";
import path from "path";

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f === "route.ts") {
      let c = fs.readFileSync(p, "utf8");
      c = c.replace(/import \{ db \} from "@\/lib\/db";\r?\n/g, "");
      c = c.replace(/await ensureDbReady\(\);/g, "const db = await ensureDbReady();");
      fs.writeFileSync(p, c);
    }
  }
}

walk("src/app/api");
console.log("done");
