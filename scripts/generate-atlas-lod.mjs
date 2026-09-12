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
if (level.kind !== "tiles") throw new Error(`${levelId} is not a tiled atlas level`);
if (!level.pathTemplate || !level.columns || !level.rows) throw new Error(`${levelId} is missing tile registration metadata`);

const sourceMeta = await sharp(SOURCE_PATH).metadata();
if (sourceMeta.width !== 6000 || sourceMeta.height !== 4000) {
  throw new Error(`Canonical source must remain exactly 6000x4000; got ${sourceMeta.width}x${sourceMeta.height}`);
}

const bounds = manifest.globalBounds;
if (bounds.x !== 0 || bounds.y !== 0 || bounds.width !== 120 || bounds.height !== 80) {
  throw new Error("Atlas global registration must remain 0,0 120x80");
}
if (manifest.cellScaleNm !== 20) throw new Error("Atlas scale must remain 20 nm per cell");

const sourcePixelsPerCellX = sourceMeta.width / bounds.width;
const sourcePixelsPerCellY = sourceMeta.height / bounds.height;
if (sourcePixelsPerCellX !== 50 || sourcePixelsPerCellY !== 50) {
  throw new Error("Canonical source registration drifted from 50 source pixels per world cell");
}

const expectedWidth = level.columns * level.tilePixelWidth;
const expectedHeight = level.rows * level.tilePixelHeight;
if (expectedWidth !== level.pixelWidth || expectedHeight !== level.pixelHeight) {
  throw new Error(`${levelId} tile dimensions do not cover declared pixel dimensions exactly`);
}
if (level.columns * level.tileWorldWidth !== bounds.width || level.rows * level.tileWorldHeight !== bounds.height) {
  throw new Error(`${levelId} tile world bounds do not cover the canonical 120x80 atlas exactly`);
}

function tileRelativePath(col, row) {
  return level.pathTemplate
    .replace(/^\//, "")
    .replaceAll("{col}", String(col))
    .replaceAll("{row}", String(row));
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function verifyTile(col, row) {
  const relative = tileRelativePath(col, row);
  const absolute = path.join(ROOT, "public", relative.replace(/^art\//, "art/"));
  const meta = await sharp(absolute).metadata();
  if (meta.width !== level.tilePixelWidth || meta.height !== level.tilePixelHeight) {
    throw new Error(`${relative}: expected ${level.tilePixelWidth}x${level.tilePixelHeight}, got ${meta.width}x${meta.height}`);
  }
  const data = await readFile(absolute);
  return { col, row, path: `/${relative}`, width: meta.width, height: meta.height, bytes: data.length, sha256: sha256(data) };
}

const outputDirectory = path.join(ROOT, "public", tileRelativePath(0, 0).split("/").slice(0, -1).join("/"));
if (clean && !verifyOnly) await rm(outputDirectory, { recursive: true, force: true });
if (!verifyOnly) await mkdir(outputDirectory, { recursive: true });

const reportTiles = [];
const scaleX = level.pixelWidth / sourceMeta.width;
const scaleY = level.pixelHeight / sourceMeta.height;
if (Math.abs(scaleX - scaleY) > 1e-9) throw new Error("Atlas LOD generation must use uniform scaling");

for (let row = 0; row < level.rows; row += 1) {
  for (let col = 0; col < level.columns; col += 1) {
    const relative = tileRelativePath(col, row);
    const absolute = path.join(ROOT, "public", relative);

    if (!verifyOnly) {
      const nominalLeft = Math.round(col * level.tileWorldWidth * sourcePixelsPerCellX);
      const nominalTop = Math.round(row * level.tileWorldHeight * sourcePixelsPerCellY);
      const nominalWidth = Math.round(level.tileWorldWidth * sourcePixelsPerCellX);
      const nominalHeight = Math.round(level.tileWorldHeight * sourcePixelsPerCellY);

      // Eight source pixels of overscan keep Lanczos/sharpen kernels continuous across tile seams.
      const pad = 8;
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

      await sharp(SOURCE_PATH)
        .extract({ left: extractLeft, top: extractTop, width: extractWidth, height: extractHeight })
        .resize(resizedWidth, resizedHeight, { kernel: sharp.kernel.lanczos3 })
        .sharpen({ sigma: 0.65, m1: 0.8, m2: 1.4, x1: 2, y2: 10, y3: 20 })
        .extract({ left: cropLeft, top: cropTop, width: level.tilePixelWidth, height: level.tilePixelHeight })
        .webp({ quality: 92, effort: 5, smartSubsample: true })
        .toFile(absolute);
    }

    reportTiles.push(await verifyTile(col, row));
    process.stdout.write(`\r${verifyOnly ? "verified" : "generated"} ${reportTiles.length}/${level.columns * level.rows} tiles`);
  }
}
process.stdout.write("\n");

const report = {
  generatorVersion: "ATLAS_LOD_GENERATOR_0.1",
  generatedAt: new Date().toISOString(),
  source: {
    path: "/art/maps/world_atlas_labeled_v06d_master.webp",
    width: sourceMeta.width,
    height: sourceMeta.height,
    note: "The 6000x4000 canonical master is itself projection-normalized from the approved lower-resolution source. This LOD is controlled raster resampling, not newly invented geography or true new painted detail."
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
  totalBytes: reportTiles.reduce((sum, tile) => sum + tile.bytes, 0),
  tiles: reportTiles
};

await mkdir(path.dirname(REPORT_PATH), { recursive: true });
await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

if (activate && level.status !== "active") {
  level.status = "active";
  level.sourceKind = "derived_sampling";
  level.activationNote = "Registered 2x sampling tiles generated from the locked 6000x4000 canonical atlas; geography and coordinates unchanged.";
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`activated ${level.id} in ${path.relative(ROOT, MANIFEST_PATH)}`);
}

console.log(`${verifyOnly ? "Verified" : "Generated"} ${level.id}: ${reportTiles.length} registered tiles, ${(report.totalBytes / 1024 / 1024).toFixed(1)} MiB total.`);
