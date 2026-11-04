import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "dist");
const frontendFiles = [
  "index.html",
  "style.css",
  "ramen-future.css",
  "script.js",
  "account.html",
  "account.css",
  "account.js",
];

mkdirSync(output, { recursive: true });

for (const file of frontendFiles) {
  copyFileSync(join(root, file), join(output, file));
}
