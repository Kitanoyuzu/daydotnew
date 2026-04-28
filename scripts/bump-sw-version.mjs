import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const swPath = path.join(repoRoot, "sw.js");

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

const src = fs.readFileSync(swPath, "utf8");
const re = /^const\s+VERSION\s*=\s*["']([^"']+)["']\s*;\s*$/m;
const m = src.match(re);
if (!m) {
  console.error(`VERSION not found in ${swPath}`);
  process.exit(1);
}

const next = `daydot-v2-${nowStamp()}`;
const out = src.replace(re, `const VERSION = "${next}";`);
fs.writeFileSync(swPath, out, "utf8");
console.log(`Updated sw.js VERSION: ${m[1]} -> ${next}`);

