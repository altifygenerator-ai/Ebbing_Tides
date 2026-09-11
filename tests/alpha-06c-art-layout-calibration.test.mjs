import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { equipmentMaleLayout } from '../public/alpha/js/artLayouts/character/equipmentMale.js';
import { equipmentFemaleLayout } from '../public/alpha/js/artLayouts/character/equipmentFemale.js';
import { ART_LAYOUT_REGISTRY } from '../public/alpha/js/artLayouts/registry.js';

const root = process.cwd();
const mainSource = readFileSync(join(root, 'src/alpha/main.ts'), 'utf8');
const canvasSource = readFileSync(join(root, 'src/artLayouts/ArtDirectedCanvas.ts'), 'utf8');
const styles = readFileSync(join(root, 'public/alpha/styles.css'), 'utf8');

function assertNormalized(layout) {
  assert.ok(layout.nativeWidth > 0 && layout.nativeHeight > 0);
  for (const [id, region] of Object.entries(layout.regions)) {
    assert.ok(region.x >= 0 && region.x <= 1, `${layout.layoutId}.${id}.x`);
    assert.ok(region.y >= 0 && region.y <= 1, `${layout.layoutId}.${id}.y`);
    assert.ok(region.width > 0 && region.width <= 1, `${layout.layoutId}.${id}.width`);
    assert.ok(region.height > 0 && region.height <= 1, `${layout.layoutId}.${id}.height`);
    assert.ok(region.x + region.width <= 1.0001, `${layout.layoutId}.${id} exceeds canvas width`);
    assert.ok(region.y + region.height <= 1.0001, `${layout.layoutId}.${id} exceeds canvas height`);
  }
}

function renderedRect(region, width, height) {
  return {
    x: region.x * width,
    y: region.y * height,
    width: region.width * width,
    height: region.height * height
  };
}

test('ArtDirectedCanvas infrastructure and permanent calibration directive are shipped', () => {
  assert.ok(existsSync(join(root, 'src/artLayouts/ArtDirectedCanvas.ts')));
  assert.ok(existsSync(join(root, 'src/artLayouts/types.ts')));
  assert.ok(existsSync(join(root, 'src/artLayouts/registry.ts')));
  assert.ok(existsSync(join(root, 'docs/canon/ART_LAYOUT_CALIBRATION_SYSTEM.md')));
  assert.match(canvasSource, /renderArtDirectedCanvas/);
  assert.match(canvasSource, /artCalibrationEnabled/);
  assert.match(canvasSource, /Copy Region Values/i);
  assert.match(canvasSource, /ResizeObserver/);
});

test('male and female equipment layouts are separate normalized manifests with logical asset ids', () => {
  assert.notEqual(equipmentMaleLayout, equipmentFemaleLayout);
  assert.equal(equipmentMaleLayout.assetId, 'ui.character.equipment.male.runtime');
  assert.equal(equipmentFemaleLayout.assetId, 'ui.character.equipment.female.runtime');
  assertNormalized(equipmentMaleLayout);
  assertNormalized(equipmentFemaleLayout);
  assert.ok(ART_LAYOUT_REGISTRY[equipmentMaleLayout.layoutId]);
  assert.ok(ART_LAYOUT_REGISTRY[equipmentFemaleLayout.layoutId]);
  assert.notDeepEqual(equipmentMaleLayout.regions.head, equipmentFemaleLayout.regions.head, 'sex variants must not be forced onto one coordinate map');
});

test('equipment manifests define art regions for inventory, filters, item detail and semantic worn slots', () => {
  for (const layout of [equipmentMaleLayout, equipmentFemaleLayout]) {
    for (const id of ['head','neck','cloak','chest','mainHand','offHand','hands','belt','accessory1','accessory2','legs','relic','tool','boots','filterAll','filterWeapons','filterClothing','filterTools','filterGoods','filterCharts','filterDocuments','inventoryGrid','itemDetail']) {
      assert.ok(layout.regions[id], `${layout.layoutId} missing ${id}`);
    }
    assert.equal(layout.regions.inventoryGrid.type, 'inventory_area');
    assert.equal(layout.regions.head.type, 'equipment_slot');
    assert.equal(layout.regions.itemDetail.type, 'text_area');
  }
});

test('current equipment screen renders through ArtDirectedCanvas instead of hardcoded percentage positioning', () => {
  assert.match(mainSource, /renderArtDirectedCanvas/);
  assert.match(mainSource, /artLayoutById/);
  assert.match(mainSource, /ui\.character\.equipment/);
  assert.match(mainSource, /initializeArtDirectedCanvases/);
  assert.match(mainSource, /installArtCalibrationShortcut/);
  assert.doesNotMatch(mainSource, /EQUIPMENT_SLOT_LAYOUTS/);
  assert.doesNotMatch(mainSource, /EQUIPMENT_GRID_LAYOUT/);
});

test('fixed art canvas preserves one coordinate space and never uses cover cropping', () => {
  assert.match(styles, /\.art-directed-canvas\{[^}]*position:relative[^}]*width:100%/s);
  assert.match(styles, /\.art-directed-base\{[^}]*width:100%[^}]*height:100%[^}]*object-fit:fill/s);
  assert.doesNotMatch(styles, /\.art-directed-base\{[^}]*object-fit:cover/s);
});

test('normalized geometry preserves exact proportional alignment at required desktop resolutions', () => {
  const viewports = [[1920,1080],[1600,900],[1440,900],[1366,768]];
  for (const layout of [equipmentMaleLayout, equipmentFemaleLayout]) {
    const region = layout.regions.mainHand;
    for (const [viewportWidth] of viewports) {
      const canvasWidth = Math.min(viewportWidth, layout.nativeWidth);
      const canvasHeight = canvasWidth * layout.nativeHeight / layout.nativeWidth;
      const rect = renderedRect(region, canvasWidth, canvasHeight);
      assert.ok(Math.abs(rect.x / canvasWidth - region.x) < 1e-9);
      assert.ok(Math.abs(rect.y / canvasHeight - region.y) < 1e-9);
      assert.ok(Math.abs(rect.width / canvasWidth - region.width) < 1e-9);
      assert.ok(Math.abs(rect.height / canvasHeight - region.height) < 1e-9);
    }
  }
});
