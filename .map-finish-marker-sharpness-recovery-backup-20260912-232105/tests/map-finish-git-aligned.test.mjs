import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixture = JSON.parse(await readFile(new URL("./fixtures/atlas-registration-v06d.json", import.meta.url), "utf8"));
const manifest = JSON.parse(await readFile(new URL("../public/alpha/atlas-lod-manifest.json", import.meta.url), "utf8"));
const { PORTS } = await import("../public/alpha/js/data/seed/ports.js");
const { POINTS_OF_INTEREST } = await import("../public/alpha/js/data/seed/pois.js");
const { GLOBAL_ATLAS, getWorldCell } = await import("../public/alpha/js/data/seed/worldMap.js");

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

test("current world remains the locked 120x80 / 20 nm atlas with 42 ports and 7 POIs", () => {
  assert.deepEqual(fixture.atlas, { width: 120, height: 80, cellScaleNm: 20 });
  assert.equal(Object.keys(fixture.ports).length, 42);
  assert.equal(Object.keys(fixture.pois).length, 7);
  assert.equal(GLOBAL_ATLAS.width, 120);
  assert.equal(GLOBAL_ATLAS.height, 80);
  assert.equal(GLOBAL_ATLAS.cellScaleNm, 20);
  assertRegisteredLocations(PORTS, fixture.ports, "port");
  assertRegisteredLocations(POINTS_OF_INTEREST, fixture.pois, "POI");
});

test("all registered approach points remain navigable", () => {
  for (const [id, entry] of [...Object.entries(fixture.ports), ...Object.entries(fixture.pois)]) {
    assert.equal(getWorldCell(entry.approachPoint).navigable, true, `${id} approach became non-navigable`);
  }
});

test("atlas LOD remains registered to the same world coordinates", () => {
  assert.deepEqual(manifest.globalBounds, { x: 0, y: 0, width: 120, height: 80 });
  assert.equal(manifest.cellScaleNm, 20);
  const fallback = manifest.levels.find((level) => level.id === manifest.fallbackLevelId);
  assert.ok(fallback);
  assert.equal(fallback.path, "/art/maps/world_atlas_labeled_v06d_master.webp");
  assert.equal(fallback.pixelWidth, 6000);
  assert.equal(fallback.pixelHeight, 4000);
  const nav = manifest.levels.find((level) => level.id === "atlas-12000-nav-tiles");
  assert.ok(nav);
  assert.equal(nav.status, "active");
  assert.equal(nav.columns, 6);
  assert.equal(nav.rows, 4);
  assert.equal(nav.tileWorldWidth, 20);
  assert.equal(nav.tileWorldHeight, 20);
  assert.equal(nav.tilePixelWidth, 2000);
  assert.equal(nav.tilePixelHeight, 2000);
  assert.equal(nav.columns * nav.tileWorldWidth, 120);
  assert.equal(nav.rows * nav.tileWorldHeight, 80);
});

test("current Tideworn navigation architecture is present and atlas runtime only observes it", async () => {
  const main = await readFile(new URL("../src/alpha/main.ts", import.meta.url), "utf8");
  const runtime = await readFile(new URL("../public/alpha/atlas-lod.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../public/alpha/atlas-quality.css", import.meta.url), "utf8");
  assert.match(main, /async function runVoyageUntilAttention/);
  assert.match(main, /VOYAGE_AUTOMATION_TWEEN_TARGET_MS\s*=\s*3000/);
  assert.match(main, /VOYAGE_AUTOMATION_TWEEN_MIN_MS\s*=\s*70/);
  assert.match(main, /VOYAGE_AUTOMATION_TWEEN_MAX_MS\s*=\s*170/);
  assert.match(main, /function applyMapCameraToDom/);
  assert.match(main, /svg\.chart-v04/);
  assert.match(main, /atlas-art/);
  assert.match(main, /SKELDRA_DEVELOPED_BOUNDS/);
  assert.match(runtime, /MutationObserver/);
  assert.match(runtime, /svg\.chart-v04/);
  assert.match(runtime, /image\.atlas-art/);
  assert.match(runtime, /attributeFilter:\s*\["viewBox"\]/);
  assert.doesNotMatch(runtime, /addEventListener\("(?:pointerdown|pointermove|pointerup|wheel|click)"/);
  assert.match(css, /pointer-events:\s*none/);
});

test("alpha shell loads atlas presentation after the current launcher assets", async () => {
  const html = await readFile(new URL("../public/alpha/index.html", import.meta.url), "utf8");
  assert.match(html, /\/alpha\/styles\.css/);
  assert.match(html, /\/alpha\/start-menu\.css/);
  assert.match(html, /\/alpha\/atlas-quality\.css/);
  assert.match(html, /\/alpha\/js\/alpha\/main\.js/);
  assert.match(html, /\/alpha\/js\/alpha\/startMenu\.js/);
  assert.match(html, /\/alpha\/atlas-lod\.js/);
  assert.ok(html.indexOf("/alpha/atlas-quality.css") > html.indexOf("/alpha/styles.css"));
  assert.ok(html.indexOf("/alpha/atlas-lod.js") > html.indexOf("/alpha/js/alpha/main.js"));
});

test("Naval Audio Variation Hotfix v2 remains installed and untouched", async () => {
  const main = await readFile(new URL("../src/alpha/main.ts", import.meta.url), "utf8");
  const audio = await readFile(new URL("../src/alpha/audio.ts", import.meta.url), "utf8");

  assert.match(main, /let navalAudioEncounterId/);
  assert.match(main, /let navalOpeningRoundVolleyPlayed\s*=\s*false/);
  assert.match(main, /if\s*\(!navalOpeningRoundVolleyPlayed\)/);
  assert.match(main, /cue\("cannon_round"\)/);
  assert.match(main, /cue\("cannon"\)/);

  assert.match(audio, /\/audio\/combat\/naval\/round_shot_volley\.ogg/);
  assert.match(audio, /\/audio\/combat\/naval\/cannon_round_shot\.ogg/);
  assert.match(audio, /\/audio\/combat\/naval\/chain_shot_volley\.ogg/);
  assert.match(audio, /\/audio\/combat\/naval\/maneuver_crew_cue\.ogg/);
  assert.match(audio, /\/audio\/combat\/naval\/naval_combat_music_loop\.ogg/);
  assert.match(audio, /chance:\s*0\.42/);
  assert.match(audio, /chance:\s*0\.68/);
  assert.match(audio, /chance:\s*0\.50/);
  assert.match(audio, /const firstUnlock\s*=\s*!this\.unlocked/);
});
