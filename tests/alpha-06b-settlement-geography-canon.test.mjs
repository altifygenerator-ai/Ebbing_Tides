import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

import {
  CANON_WORLD_LOCATIONS,
  CANON_SETTLEMENTS,
  CANON_MARITIME_POIS,
  CANON_WORLD_LOCATION_BY_ID,
  SETTLEMENT_GEOGRAPHY_RULES,
  WORLD_SETTLEMENT_GEOGRAPHY_CANON_VERSION,
  WORLD_SETTLEMENT_GEOGRAPHY_CANON_MAP_ASSET_ID,
  WORLD_SETTLEMENT_GEOGRAPHY_CANON_RECORD_ASSET_ID
} from '../public/alpha/js/data/seed/settlementCanon.js';
import { PORTS } from '../public/alpha/js/data/seed/ports.js';
import { POINTS_OF_INTEREST } from '../public/alpha/js/data/seed/pois.js';
import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';

test('World Settlement & Maritime Geography Canon 0.1 is registered as authoritative shipped data', () => {
  assert.equal(WORLD_SETTLEMENT_GEOGRAPHY_CANON_VERSION, '0.1');
  assert.equal(SETTLEMENT_GEOGRAPHY_RULES.length, 4);
  assert.equal(CANON_SETTLEMENTS.length, 42);
  assert.equal(CANON_MARITIME_POIS.length, 7);
  assert.equal(CANON_WORLD_LOCATIONS.length, 49);
  assert.equal(new Set(CANON_WORLD_LOCATIONS.map(x => x.id)).size, CANON_WORLD_LOCATIONS.length);
});

test('all six canon regional settlement groups are represented', () => {
  const regions = new Set(CANON_WORLD_LOCATIONS.map(x => x.canonicalRegion));
  assert.deepEqual([...regions].sort(), [
    'asterian_sea',
    'eastern_approaches_kaishin',
    'outer_isles_greywater_coast',
    'serath',
    'skeldra',
    'vesperan_strait'
  ]);
});

test('current playable ports and POIs remain aligned to the canon registry', () => {
  for (const port of PORTS) {
    const canon = CANON_WORLD_LOCATION_BY_ID[port.id];
    assert.ok(canon, `missing canon entry for playable port ${port.id}`);
    assert.equal(canon.kind, 'settlement');
    assert.equal(canon.playableInCurrentAlpha, true);
    assert.equal(canon.gameplayEntityId, port.id);
  }
  for (const poi of POINTS_OF_INTEREST) {
    const canon = CANON_WORLD_LOCATION_BY_ID[poi.id];
    assert.ok(canon, `missing canon entry for playable POI ${poi.id}`);
    assert.equal(canon.kind, 'poi');
    assert.equal(canon.playableInCurrentAlpha, true);
    assert.equal(canon.gameplayEntityId, poi.id);
  }
});

test('reserved-world settlement names required by canon exist without becoming playable', () => {
  for (const id of [
    'settlement.hrafnvik','settlement.kaldstrand','settlement.bjornhavn','settlement.runeskar',
    'settlement.greywater','settlement.port_meridian','settlement.saltwake','settlement.saint_corren','settlement.redhook','settlement.gullreach',
    'settlement.thalassa','settlement.myrine','settlement.eirenos','settlement.pelasion','settlement.southwatch','settlement.lantern_key',
    'settlement.qasirah','settlement.safir','settlement.ryosen','settlement.shido','settlement.linhai','settlement.kuroseki'
  ]) {
    assert.ok(CANON_WORLD_LOCATION_BY_ID[id], `missing ${id}`);
    assert.equal(CANON_WORLD_LOCATION_BY_ID[id].playableInCurrentAlpha, false);
  }
});

test('source spelling discrepancy for Aurelia is preserved as an alias rather than discarded', () => {
  const aurelia = CANON_WORLD_LOCATION_BY_ID['settlement.aurelia'];
  assert.equal(aurelia.name, 'Aurelia');
  assert.ok(aurelia.aliases.includes('Aurellia'));
});

test('canon source images are shipped and registered through stable asset IDs', () => {
  const map = ASSET_BY_ID[WORLD_SETTLEMENT_GEOGRAPHY_CANON_MAP_ASSET_ID];
  const record = ASSET_BY_ID[WORLD_SETTLEMENT_GEOGRAPHY_CANON_RECORD_ASSET_ID];
  assert.equal(map.status, 'APPROVED_ANCHOR');
  assert.equal(record.status, 'APPROVED_ANCHOR');
  assert.ok(existsSync(`public/alpha${map.path}`));
  assert.ok(existsSync(`public/alpha${record.path}`));
  assert.ok(readFileSync(`public/alpha${map.path}`).length > 1_000_000);
  assert.ok(readFileSync(`public/alpha${record.path}`).length > 1_000_000);
});
