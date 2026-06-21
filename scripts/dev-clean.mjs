import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const nextDir = path.join(root, ".next");

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("Removed .next cache");
}

console.log("Starting dev server...");
const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: root,
});

child.on("exit", (code) => process.exit(code ?? 0));
