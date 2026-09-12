import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixture = JSON.parse(await readFile(new URL("./fixtures/atlas-registration-v06d.json", import.meta.url), "utf8"));
const manifest = JSON.parse(await readFile(new URL("../public/alpha/atlas-lod-manifest.json", import.meta.url), "utf8"));
const { PORTS } = await import("../public/alpha/js/data/seed/ports.js");
const { POINTS_OF_INTEREST } = await import("../public/alpha/js/data/seed/pois.js");
const { GLOBAL_ATLAS, WORLD_DEVELOPED_BOUNDS, getWorldCell } = await import("../public/alpha/js/data/seed/worldMap.js");

function compactPoint(point) {
  return { x: point.x, y: point.y };
}

function assertRegisteredLocations(actual, expectedById, label) {
  assert.equal(actual.length, Object.keys(expectedById).length, `${label} count drifted from atlas lock`);
  for (const entry of actual) {
    const locked = expectedById[entry.id];
    assert.ok(locked, `${entry.id} is missing from the atlas registration lock`);
    assert.deepEqual(compactPoint(entry.point), locked.point, `${entry.id} map point moved`);
    assert.deepEqual(compactPoint(entry.approachPoint), locked.approachPoint, `${entry.id} approach point moved`);
  }
}

test("atlas registration lock contains the complete 42-port / 7-POI world", () => {
  assert.equal(Object.keys(fixture.ports).length, 42);
  assert.equal(Object.keys(fixture.pois).length, 7);
  assert.deepEqual(fixture.atlas, { width: 120, height: 80, cellScaleNm: 20 });
  assert.equal(fixture.lockVersion, "WORLD_ATLAS_REGISTRATION_LOCK_0.6D_PASS1");
});

test("runtime ports and POIs remain exactly registered to the locked atlas", () => {
  assertRegisteredLocations(PORTS, fixture.ports, "port");
  assertRegisteredLocations(POINTS_OF_INTEREST, fixture.pois, "POI");
});

test("all locked approach points remain navigable", () => {
  for (const [id, entry] of [...Object.entries(fixture.ports), ...Object.entries(fixture.pois)]) {
    assert.equal(getWorldCell(entry.approachPoint).navigable, true, `${id} approach became non-navigable`);
  }
});

test("whole-world interaction bounds cover the canonical 120x80 atlas", () => {
  assert.equal(GLOBAL_ATLAS.width, 120);
  assert.equal(GLOBAL_ATLAS.height, 80);
  assert.equal(GLOBAL_ATLAS.cellScaleNm, 20);
  assert.deepEqual(WORLD_DEVELOPED_BOUNDS, { x: 0, y: 0, width: 120, height: 80 });
});

test("chart hit-grid uses whole-world bounds rather than the legacy Skeldra proving ground", async () => {
  const source = await readFile(new URL("../src/alpha/main.ts", import.meta.url), "utf8");
  const emitted = await readFile(new URL("../public/alpha/js/alpha/main.js", import.meta.url), "utf8");
  for (const [name, text] of [["source", source], ["emitted", emitted]]) {
    const renderStart = text.indexOf("function renderChart");
    assert.notEqual(renderStart, -1, `${name} renderChart missing`);
    const renderSlice = text.slice(renderStart, renderStart + 18000);
    assert.match(renderSlice, /WORLD_DEVELOPED_BOUNDS/, `${name} chart is not using whole-world bounds`);
    assert.doesNotMatch(renderSlice, /SKELDRA_DEVELOPED_BOUNDS/, `${name} chart still limits sea-cell interaction to Skeldra`);
  }
});

test("atlas LOD registration remains exact and higher levels tile without gaps", () => {
  assert.deepEqual(manifest.globalBounds, { x: 0, y: 0, width: 120, height: 80 });
  assert.equal(manifest.cellScaleNm, 20);
  const fallback = manifest.levels.find((level) => level.id === manifest.fallbackLevelId);
  assert.ok(fallback);
  assert.equal(fallback.status, "active");
  assert.equal(fallback.pixelWidth, 6000);
  assert.equal(fallback.pixelHeight, 4000);

  for (const level of manifest.levels.filter((entry) => entry.kind === "tiles")) {
    assert.equal(level.columns * level.tileWorldWidth, 120, `${level.id} world width coverage drifted`);
    assert.equal(level.rows * level.tileWorldHeight, 80, `${level.id} world height coverage drifted`);
    assert.equal(level.columns * level.tilePixelWidth, level.pixelWidth, `${level.id} pixel width coverage drifted`);
    assert.equal(level.rows * level.tilePixelHeight, level.pixelHeight, `${level.id} pixel height coverage drifted`);
    assert.equal(level.pixelWidth / 120, level.pixelsPerCell, `${level.id} horizontal registration drifted`);
    assert.equal(level.pixelHeight / 80, level.pixelsPerCell, `${level.id} vertical registration drifted`);
  }
});

test("alpha shell loads the resolution-aware atlas runtime", async () => {
  const html = await readFile(new URL("../public/alpha/index.html", import.meta.url), "utf8");
  const runtime = await readFile(new URL("../public/alpha/atlas-lod.js", import.meta.url), "utf8");
  assert.match(html, /\/alpha\/atlas-lod\.js/);
  assert.match(runtime, /requiredAtlasPixels/);
  assert.match(runtime, /data-atlas-tile/);
  assert.match(runtime, /devicePixelRatio/);
});
