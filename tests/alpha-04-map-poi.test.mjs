import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';
import { PORTS, PORT_BY_ID } from '../public/alpha/js/data/seed/ports.js';
import { POINTS_OF_INTEREST, POI_BY_ID } from '../public/alpha/js/data/seed/pois.js';
import { GLOBAL_ATLAS, NAVIGATION_VIEW, getWorldCell } from '../public/alpha/js/data/seed/worldMap.js';
import { findSeaPath, navigationTargetForPoi } from '../public/alpha/js/game/navigation.js';
import { beginNavigation, advanceVoyage } from '../public/alpha/js/game/travel.js';

const here = path.dirname(fileURLToPath(import.meta.url));

function game(seed='alpha04-map') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name: 'Atlas Captain' }, seed);
}

function finishVoyage(state) {
  let guard = 120;
  while (state.voyage && guard-- > 0) {
    const result = advanceVoyage(state, 4);
    assert.equal(result.ok, true);
    if (state.encounter && state.encounter.phase !== 'resolved') state.encounter.phase = 'resolved';
  }
  assert.ok(guard > 0, 'voyage should finish inside bounded test');
}

test('Alpha 0.6D far camera can open the complete 120x80 strategic atlas', () => {
  assert.equal(GLOBAL_ATLAS.width, 120);
  assert.equal(GLOBAL_ATLAS.height, 80);
  assert.equal(NAVIGATION_VIEW.width, 120);
  assert.equal(NAVIGATION_VIEW.height, 80);
  assert.equal(GLOBAL_ATLAS.visualAssetId, 'map.world_atlas.labeled_v06d');
  const mapAsset = ASSET_BY_ID[GLOBAL_ATLAS.visualAssetId];
  assert.equal(mapAsset.type, 'MAP_REFERENCE');
  assert.equal(mapAsset.status, 'APPROVED_ANCHOR');
  assert.equal(ASSET_BY_ID['ui.navigation.approved_reference'].status, 'APPROVED_ANCHOR');
  const diskPath = path.resolve(here, '..', 'public', mapAsset.path.replace(/^\//,''));
  assert.ok(fs.existsSync(diskPath), 'illustrated atlas asset should ship with the playable build');
});

test('every current port is an enterable destination with a land marker and water approach', () => {
  for (const port of PORTS) {
    assert.equal(getWorldCell(port.point).terrain, 'land', `${port.name} marker should align to land art/collision`);
    assert.equal(getWorldCell(port.approachPoint).navigable, true, `${port.name} harbor approach should be navigable`);
    assert.ok(port.arrivalActions.some((action) => action.id === 'town'), `${port.name} must expose an enter-town action`);
    assert.ok(port.arrivalActions.length >= 5, `${port.name} should expose contextual destination actions`);
  }
});

test('known POIs use the same navigation target and arrival architecture as ports', () => {
  const state = game('poi-arrival');
  const poi = POI_BY_ID['poi.old_veyr_beacon'];
  assert.ok(state.player.knownPoiIds.includes(poi.id));
  assert.equal(getWorldCell(poi.point).terrain, 'land');
  assert.equal(getWorldCell(poi.approachPoint).navigable, true);
  assert.ok(poi.arrivalActions.some((action) => action.id === 'enter_site'));
  const target = navigationTargetForPoi(poi.id);
  assert.ok(target);
  assert.equal(beginNavigation(state, target).ok, true);
  finishVoyage(state);
  assert.equal(state.player.currentPortId, undefined);
  assert.equal(state.player.currentPoiId, poi.id);
  assert.equal(state.arrival?.destination.type, 'poi');
  assert.equal(state.arrival?.destination.id, poi.id);
  assert.deepEqual(state.ships[state.player.shipId].position, poi.approachPoint);
});

test('all authored Skeldran POIs can be reached without crossing land', () => {
  const start = PORT_BY_ID['port.veyrholm'].approachPoint;
  for (const poi of POINTS_OF_INTEREST) {
    const pathCells = findSeaPath(start, poi.approachPoint);
    assert.ok(pathCells.length > 1, `${poi.name} should have a valid route`);
    assert.deepEqual(pathCells.at(-1), poi.approachPoint);
    for (const point of pathCells) assert.equal(getWorldCell(point).navigable, true, `${poi.name} route crossed blocked cell ${point.x},${point.y}`);
  }
});

test('Alpha 0.3 save positions migrate onto the illustrated Alpha 0.4 atlas', async () => {
  const fresh = game('v03-migrate');
  const old = structuredClone(fresh);
  old.schemaVersion = 3;
  delete old.player.knownPoiIds;
  old.player.currentPortId = 'port.veyrholm';
  old.ships[old.player.shipId].dockedAtPortId = 'port.veyrholm';
  old.ships[old.player.shipId].position = { x: 24, y: 18 };
  const store = new Map([['ebbing-tides.alpha.save', JSON.stringify(old)]]);
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() { return store.size; }
  };
  const { loadLocal } = await import(`../public/alpha/js/services/localSave.js?alpha04=${Date.now()}`);
  const migrated = loadLocal();
  assert.equal(migrated.schemaVersion, 12);
  assert.ok(migrated.player.knownPoiIds.includes('poi.old_veyr_beacon'));
  assert.deepEqual(migrated.ships[migrated.player.shipId].position, PORT_BY_ID['port.veyrholm'].approachPoint);
});
