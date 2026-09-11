/**
 * Kopieert de Sveltia CMS-bundle uit node_modules naar public/admin.
 * Zo laadt de beheeromgeving niet van een externe CDN: de versie staat vast
 * in package.json en een upgrade is een bewuste `npm update`.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const BUNDLE = "sveltia-cms.js";

let entry;
try {
  // '@sveltia/cms' verwijst naar dist/sveltia-cms.mjs; wij willen de
  // browserbundle die daarnaast staat.
  entry = require.resolve("@sveltia/cms");
} catch {
  console.error("[cms] @sveltia/cms niet gevonden. Draai eerst `npm install`.");
  process.exit(1);
}

const destDir = join(process.cwd(), "public", "admin");
await mkdir(destDir, { recursive: true });
await copyFile(join(dirname(entry), BUNDLE), join(destDir, BUNDLE));
console.log(`[cms] public/admin/${BUNDLE} bijgewerkt`);
