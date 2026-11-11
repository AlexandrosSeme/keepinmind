// Creates db/db.json from db/seed.json for `npm run api`.
// Usage: node scripts/ensure-db.mjs [--reset]
//   (no flag) only creates db.json when it does not exist yet
//   --reset   overwrites db.json with the seed data
// db/seed.json is generated (scripts/generate-seed.mjs) when missing.
import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const seed = fileURLToPath(new URL("../db/seed.json", import.meta.url));
const db = fileURLToPath(new URL("../db/db.json", import.meta.url));
const reset = process.argv.includes("--reset");

if (!existsSync(seed)) {
  await import("./generate-seed.mjs");
}

if (reset || !existsSync(db)) {
  copyFileSync(seed, db);
  console.log(`[api] ${reset ? "Reset" : "Created"} db/db.json from db/seed.json`);
}
