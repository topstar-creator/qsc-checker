import fs from "fs";
import path from "path";

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f === "route.ts") {
      let c = fs.readFileSync(p, "utf8");
      c = c.replace(/const db = (?:const db = )+/g, "const db = ");
      c = c.replace(/\n\s*persistDb\(\);\n\n\s*return NextResponse\.json\(\{ error:/g, "\n    return NextResponse.json({ error:");
      fs.writeFileSync(p, c);
    }
  }
}

walk("src/app/api");
console.log("fixed");
