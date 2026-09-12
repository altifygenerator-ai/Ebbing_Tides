import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { ASSET_REGISTRY } from "../public/alpha/js/data/seed/assets.js";
import { POINTS_OF_INTEREST } from "../public/alpha/js/data/seed/pois.js";
import { PORTS } from "../public/alpha/js/data/seed/ports.js";
import { GLOBAL_ATLAS } from "../public/alpha/js/data/seed/worldMap.js";

const lock = JSON.parse(
  await readFile(new URL("./fixtures/atlas-registration-v06d.json", import.meta.url), "utf8")
);
const lodManifest = JSON.parse(
  await readFile(new URL("../public/alpha/atlas-lod-manifest.json", import.meta.url), "utf8")
);

function assertPointInsideAtlas(point, label) {
  assert.ok(point && Number.isInteger(point.x) && Number.isInteger(point.y), `${label} must use integer grid coordinates`);
  assert.ok(point.x >= 0 && point.x < lock.atlas.width, `${label}.x must remain inside the atlas`);
  assert.ok(point.y >= 0 && point.y < lock.atlas.height, `${label}.y must remain inside the atlas`);
}

function assertLocationRegistration(actualRows, expectedById, kind) {
  assert.equal(actualRows.length, Object.keys(expectedById).length, `${kind} count changed`);
  const actualIds = actualRows.map((row) => row.id).sort();
  const expectedIds = Object.keys(expectedById).sort();
  assert.deepEqual(actualIds, expectedIds, `${kind} IDs changed`);

  for (const row of actualRows) {
    const expected = expectedById[row.id];
    assert.deepEqual(row.point, expected.point, `${row.id} map point changed`);
    assert.deepEqual(row.approachPoint, expected.approachPoint, `${row.id} approach point changed`);
    assertPointInsideAtlas(row.point, `${row.id}.point`);
    assertPointInsideAtlas(row.approachPoint, `${row.id}.approachPoint`);
  }
}

test("Alpha 0.6D atlas registration stays locked at 120x80 / 49 canonical locations", () => {
  assert.equal(GLOBAL_ATLAS.width, lock.atlas.width);
  assert.equal(GLOBAL_ATLAS.height, lock.atlas.height);
  assert.equal(GLOBAL_ATLAS.cellScaleNm, lock.atlas.cellScaleNm);

  assertLocationRegistration(PORTS, lock.ports, "port");
  assertLocationRegistration(POINTS_OF_INTEREST, lock.pois, "POI");
  assert.equal(PORTS.length + POINTS_OF_INTEREST.length, 49, "canonical location total changed");

  const ids = [...PORTS, ...POINTS_OF_INTEREST].map((row) => row.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate canonical location ID");
});

test("canonical raster and Atlas LOD manifest use the exact same world registration", () => {
  const canonical = ASSET_REGISTRY.find((asset) => asset.assetId === GLOBAL_ATLAS.visualAssetId);
  assert.ok(canonical, "canonical atlas asset missing from registry");
  assert.equal(canonical.path, "/art/maps/world_atlas_labeled_v06d_master.webp");
  assert.deepEqual(canonical.mapRegistration?.globalBounds, { x: 0, y: 0, width: 120, height: 80 });
  assert.equal(canonical.mapRegistration?.nativePixelWidth, 6000);
  assert.equal(canonical.mapRegistration?.nativePixelHeight, 4000);

  assert.equal(lodManifest.registrationVersion, GLOBAL_ATLAS.version);
  assert.deepEqual(lodManifest.globalBounds, canonical.mapRegistration.globalBounds);
  assert.equal(lodManifest.cellScaleNm, GLOBAL_ATLAS.cellScaleNm);

  const fallback = lodManifest.levels.find((level) => level.id === lodManifest.fallbackLevelId);
  assert.ok(fallback && fallback.status === "active", "LOD fallback must exist and stay active");
  assert.equal(fallback.kind, "single");
  assert.equal(fallback.path, canonical.path);
  assert.equal(fallback.pixelWidth, canonical.mapRegistration.nativePixelWidth);
  assert.equal(fallback.pixelHeight, canonical.mapRegistration.nativePixelHeight);
});

test("planned high-resolution tile levels preserve the 3:2 atlas and exact 120x80 coverage", () => {
  for (const level of lodManifest.levels.filter((entry) => entry.kind === "tiles")) {
    assert.equal(level.pixelWidth / level.pixelHeight, 3 / 2, `${level.id} must stay 3:2`);
    assert.equal(level.columns * level.tileWorldWidth, lock.atlas.width, `${level.id} world width coverage changed`);
    assert.equal(level.rows * level.tileWorldHeight, lock.atlas.height, `${level.id} world height coverage changed`);
    assert.equal(level.columns * level.tilePixelWidth, level.pixelWidth, `${level.id} pixel width coverage changed`);
    assert.equal(level.rows * level.tilePixelHeight, level.pixelHeight, `${level.id} pixel height coverage changed`);
    assert.equal(level.pixelWidth / lock.atlas.width, level.pixelsPerCell, `${level.id} horizontal registration changed`);
    assert.equal(level.pixelHeight / lock.atlas.height, level.pixelsPerCell, `${level.id} vertical registration changed`);
  }
});
