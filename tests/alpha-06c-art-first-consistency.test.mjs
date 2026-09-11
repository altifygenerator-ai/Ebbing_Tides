import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { LOCATION_PRESENTATION_ART, PRESENTATION_BASE_ART, PRESENTATION_ART_GAPS } from '../public/alpha/js/data/seed/presentationArt.js';
import { CANON_WORLD_LOCATION_BY_ID } from '../public/alpha/js/data/seed/settlementCanon.js';

const root = process.cwd();
const publicPath = (webPath) => join(root, 'public', webPath.replace(/^\//, ''));
const mainSource = () => readFileSync(join(root, 'src/alpha/main.ts'), 'utf8');

test('art-first presentation rule is committed as permanent project canon', () => {
  const path = join(root, 'docs/canon/ART_FIRST_UI_PRESENTATION_RULE.md');
  assert.ok(existsSync(path));
  const text = readFileSync(path, 'utf8');
  assert.match(text, /Ebbing Tides is art-directed first and system-driven underneath/i);
  assert.match(text, /Functional pass \+ visual fail = feature incomplete/i);
});

test('all major consistency-pass presentation bases are shipped as real assets', () => {
  for (const [key, webPath] of Object.entries(PRESENTATION_BASE_ART)) {
    assert.ok(existsSync(publicPath(webPath)), `${key} base art is missing at ${webPath}`);
  }
});

test('every mapped canonical location art alias exists on disk and points to a canonical location', () => {
  for (const [id, webPath] of Object.entries(LOCATION_PRESENTATION_ART)) {
    assert.ok(CANON_WORLD_LOCATION_BY_ID[id] || id.startsWith('port.'), `${id} is not a canonical location id`);
    assert.ok(existsSync(publicPath(webPath)), `${id} art missing at ${webPath}`);
  }
});

test('current playable art integration covers supplied port/POI art and explicitly leaves Thorenfjord as a gap', () => {
  for (const id of ['port.veyrholm','port.ironhaven','port.stormvik','poi.old_veyr_beacon','poi.greywater_wrecks']) {
    assert.ok(LOCATION_PRESENTATION_ART[id], `missing live art mapping for ${id}`);
  }
  assert.equal(LOCATION_PRESENTATION_ART['port.thorenfjord'], undefined);
  assert.ok(PRESENTATION_ART_GAPS.some((row) => row.includes('Thorenfjord')));
});

test('player-facing renderers consume art-directed production surfaces and POI art rather than generic-only presentation', () => {
  const source = mainSource();
  for (const token of [
    'creator-production-screen',
    'ship-production-screen',
    'naval-combat-screen',
    'market-production-screen',
    'crew-production-screen',
    'journal-production-screen',
    'poiArtStyle(poi.id)'
  ]) assert.ok(source.includes(token), `missing art-directed renderer token ${token}`);
});

test('supplied art packages are preserved while exploratory candidate screens remain reference-only', () => {
  for (const dir of [
    'public/art/library/canonical',
    'public/art/library/approved',
    'public/art/library/candidate-reference',
    'public/art/ui/ability-library',
    'public/art/ships/tokens',
    'public/art/props'
  ]) assert.ok(existsSync(join(root, dir)), `missing integrated art library ${dir}`);
  const source = mainSource();
  assert.equal(source.includes('EXPLORATORY_inventory_finished_game_panel'), false);
  assert.equal(source.includes('EXPLORATORY_navigation_finished_game_panel'), false);
  assert.equal(source.includes('EXPLORATORY_port_finished_game_panel'), false);
});
