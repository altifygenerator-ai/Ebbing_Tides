import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "public/alpha/atlas-lod-manifest.json");
const SOURCE_PATH = path.join(ROOT, "public/art/maps/world_atlas_labeled_v06d_master.webp");
const REPORT_PATH = path.join(ROOT, "public/art/maps/lod/atlas-lod-generation-report.json");
const DEFAULT_LEVEL_ID = "atlas-12000-nav-tiles";
const args = new Set(process.argv.slice(2));
const verifyOnly = args.has("--verify-only");
const activate = args.has("--activate");
const clean = args.has("--clean");
const levelArg = process.argv.find((arg) => arg.startsWith("--level="));
const levelId = levelArg ? levelArg.slice("--level=".length) : DEFAULT_LEVEL_ID;

const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
const level = manifest.levels.find((candidate) => candidate.id === levelId);
if (!level) throw new Error(`Unknown atlas LOD level: ${levelId}`);
if (level.kind !== "tiles") throw new Error(`${levelId} is not tiled`);

const sourceMeta = await sharp(SOURCE_PATH).metadata();
if (sourceMeta.width !== 6000 || sourceMeta.height !== 4000) {
  throw new Error(`Canonical source must remain 6000x4000; got ${sourceMeta.width}x${sourceMeta.height}`);
}

const bounds = manifest.globalBounds;
if (bounds.x !== 0 || bounds.y !== 0 || bounds.width !== 120 || bounds.height !== 80) throw new Error("Atlas registration must remain 0,0 120x80");
if (manifest.cellScaleNm !== 20) throw new Error("Atlas scale must remain 20 nm/cell");

const sourcePpcX = sourceMeta.width / bounds.width;
const sourcePpcY = sourceMeta.height / bounds.height;
if (sourcePpcX !== 50 || sourcePpcY !== 50) throw new Error("Canonical registration drifted from 50 px/cell");
if (level.columns * level.tileWorldWidth !== 120 || level.rows * level.tileWorldHeight !== 80) throw new Error("Tile world coverage drifted");
if (level.columns * level.tilePixelWidth !== level.pixelWidth || level.rows * level.tilePixelHeight !== level.pixelHeight) throw new Error("Tile pixel coverage drifted");

function tileRelativePath(col, row) {
  return level.pathTemplate.replace(/^\//, "").replaceAll("{col}", String(col)).replaceAll("{row}", String(row));
}
function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}
async function verifyTile(col, row) {
  const relative = tileRelativePath(col, row);
  const absolute = path.join(ROOT, "public", relative);
  const meta = await sharp(absolute).metadata();
  if (meta.width !== level.tilePixelWidth || meta.height !== level.tilePixelHeight) throw new Error(`${relative}: bad dimensions`);
  const data = await readFile(absolute);
  return { col, row, path: `/${relative}`, width: meta.width, height: meta.height, bytes: data.length, sha256: sha256(data) };
}

const outDir = path.join(ROOT, "public", tileRelativePath(0, 0).split("/").slice(0, -1).join("/"));
if (clean && !verifyOnly) await rm(outDir, { recursive: true, force: true });
if (!verifyOnly) await mkdir(outDir, { recursive: true });

const reportTiles = [];
const scaleX = level.pixelWidth / sourceMeta.width;
const scaleY = level.pixelHeight / sourceMeta.height;
if (Math.abs(scaleX - scaleY) > 1e-9) throw new Error("LOD scaling must be uniform");

const source = sharp(SOURCE_PATH, { failOn: "warning" });
for (let row = 0; row < level.rows; row += 1) {
  for (let col = 0; col < level.columns; col += 1) {
    const relative = tileRelativePath(col, row);
    const absolute = path.join(ROOT, "public", relative);
    if (!verifyOnly) {
      const nominalLeft = Math.round(col * level.tileWorldWidth * sourcePpcX);
      const nominalTop = Math.round(row * level.tileWorldHeight * sourcePpcY);
      const nominalWidth = Math.round(level.tileWorldWidth * sourcePpcX);
      const nominalHeight = Math.round(level.tileWorldHeight * sourcePpcY);
      const pad = level.pixelWidth >= 24000 ? 10 : 8;
      const extractLeft = Math.max(0, nominalLeft - pad);
      const extractTop = Math.max(0, nominalTop - pad);
      const extractRight = Math.min(sourceMeta.width, nominalLeft + nominalWidth + pad);
      const extractBottom = Math.min(sourceMeta.height, nominalTop + nominalHeight + pad);
      const extractWidth = extractRight - extractLeft;
      const extractHeight = extractBottom - extractTop;
      const resizedWidth = Math.round(extractWidth * scaleX);
      const resizedHeight = Math.round(extractHeight * scaleY);
      const cropLeft = Math.round((nominalLeft - extractLeft) * scaleX);
      const cropTop = Math.round((nominalTop - extractTop) * scaleY);
      await source.clone()
        .extract({ left: extractLeft, top: extractTop, width: extractWidth, height: extractHeight })
        .resize(resizedWidth, resizedHeight, { kernel: sharp.kernel.lanczos3 })
        .sharpen(level.pixelWidth >= 24000 ? { sigma: 0.8, m1: 0.9, m2: 1.6, x1: 2, y2: 10, y3: 20 } : { sigma: 0.65, m1: 0.8, m2: 1.4, x1: 2, y2: 10, y3: 20 })
        .extract({ left: cropLeft, top: cropTop, width: level.tilePixelWidth, height: level.tilePixelHeight })
        .webp(level.pixelWidth >= 24000 ? { lossless: true, effort: 5 } : { quality: 100, effort: 6, smartSubsample: false })
        .toFile(absolute);
    }
    reportTiles.push(await verifyTile(col, row));
    process.stdout.write(`
${verifyOnly ? "verified" : "generated"} ${reportTiles.length}/${level.columns * level.rows} tiles`);
  }
}
process.stdout.write("\n");
const totalBytes = reportTiles.reduce((sum, tile) => sum + tile.bytes, 0);
if (verifyOnly) {
  console.log(`Verified ${levelId}: ${reportTiles.length} tiles, ${(totalBytes / 1048576).toFixed(1)} MiB.`);
  process.exit(0);
}
const report = {
  generatorVersion: "ATLAS_LOD_GENERATOR_0.5_TRUE_LEVEL_SWITCH",
  generatedAt: new Date().toISOString(),
  source: {
    path: "/art/maps/world_atlas_labeled_v06d_master.webp",
    width: sourceMeta.width,
    height: sourceMeta.height,
    note: "Registered delivery tiers derived from the canonical atlas master. Geography, markers, routes, and mechanics are unchanged."
  },
  registration: { ...bounds, cellScaleNm: manifest.cellScaleNm },
  level: {
    id: level.id,
    pixelWidth: level.pixelWidth,
    pixelHeight: level.pixelHeight,
    columns: level.columns,
    rows: level.rows,
    tileWorldWidth: level.tileWorldWidth,
    tileWorldHeight: level.tileWorldHeight,
    tilePixelWidth: level.tilePixelWidth,
    tilePixelHeight: level.tilePixelHeight
  },
  totalBytes,
  tiles: reportTiles
};
await mkdir(path.dirname(REPORT_PATH), { recursive: true });
await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}
`);
if (activate && level.status !== "active") {
  level.status = "active";
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}
`);
}
console.log(`Generated ${levelId}: ${reportTiles.length} tiles, ${(totalBytes / 1048576).toFixed(1)} MiB.`);
