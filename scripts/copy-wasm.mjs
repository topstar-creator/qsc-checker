import fs from "fs";
import path from "path";

const src = path.join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm");
const dest = path.join(process.cwd(), "public", "sql-wasm.wasm");

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log("Copied sql-wasm.wasm to public/");
}
