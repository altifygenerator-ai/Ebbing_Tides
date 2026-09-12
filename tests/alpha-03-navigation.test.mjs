import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { PORTS, PORT_BY_ID } from '../public/alpha/js/data/seed/ports.js';
import { ATLAS_REGIONS, GLOBAL_ATLAS, getWorldCell } from '../public/alpha/js/data/seed/worldMap.js';
import { findSeaPath, navigationTargetForPort, navigationTargetForSea, plotCourse } from '../public/alpha/js/game/navigation.js';
import { beginNavigation, advanceVoyage } from '../public/alpha/js/game/travel.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';

function game(seed='alpha03-nav') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name: 'Chart Captain' }, seed);
}

function finishVoyage(state) {
  let guard = 80;
  while (state.voyage && guard-- > 0) {
    const result = advanceVoyage(state, 4);
    assert.equal(result.ok, true);
    if (state.encounter && state.encounter.phase !== 'resolved') {
      // Remove the interruption only for routing tests. Encounter behavior is covered elsewhere.
      state.encounter.phase = 'resolved';
    }
  }
  assert.ok(guard > 0, 'voyage should finish inside bounded navigation test');
}

test('Alpha 0.6D world expansion keeps global registration and activates every canonical regional window', () => {
  assert.equal(GLOBAL_ATLAS.width, 120);
  assert.equal(GLOBAL_ATLAS.height, 80);
  const activeRegionIds = new Set(ATLAS_REGIONS.filter((region) => region.development === 'active').map((region) => region.id));
  for (const id of ['great_western_ocean', 'northwestern_sea', 'ardaran_gate', 'asteria', 'vesperan_strait', 'serath', 'kaishin', 'outer_isles']) {
    assert.equal(activeRegionIds.has(id), true, `${id} should be active after the Alpha 0.6D world-expansion pass`);
  }
  assert.equal(ATLAS_REGIONS.some((region) => region.development === 'reserved'), false, 'current canonical atlas windows should no longer retain pre-expansion reserved flags');
});

test('port markers are land while every port approach is a navigable water cell', () => {
  for (const port of PORTS) {
    assert.equal(getWorldCell(port.point).navigable, false, `${port.name} marker should sit on land`);
    assert.equal(getWorldCell(port.approachPoint).navigable, true, `${port.name} approach must be water`);
    assert.notDeepEqual(port.point, port.approachPoint);
  }
});

test('A* plotted courses never enter land cells and end at the harbor approach', () => {
  const from = PORT_BY_ID['port.stormvik'];
  const to = PORT_BY_ID['port.ironhaven'];
  const path = findSeaPath(from.approachPoint, to.approachPoint);
  assert.ok(path.length > 2);
  assert.deepEqual(path[0], from.approachPoint);
  assert.deepEqual(path.at(-1), to.approachPoint);
  for (const point of path) assert.equal(getWorldCell(point).navigable, true, `path entered blocked cell ${point.x},${point.y}`);
  assert.notDeepEqual(path.at(-1), to.point, 'ship should not path onto the painted land marker');
});

test('click-equivalent open-water target produces a plotted trail and empty-sea arrival leaves the player at sea', () => {
  const state = game('open-water-route');
  const target = navigationTargetForSea({ x: 20, y: 24 });
  assert.ok(target);
  const preview = plotCourse(state, target);
  assert.ok(preview.path.length > 1);
  assert.deepEqual(preview.path.at(-1), target.point);
  assert.ok(preview.path.every((point) => getWorldCell(point).navigable));
  assert.equal(beginNavigation(state, target).ok, true);
  finishVoyage(state);
  assert.equal(state.player.currentPortId, undefined);
  assert.equal(state.arrival, undefined, 'open-water arrival should not force a destination screen');
  const ship = state.ships[state.player.shipId];
  assert.deepEqual(ship.position, target.point);
  assert.ok(state.worldEvents.some((event) => event.type === 'sea_position_reached'));
});

test('port arrival creates the destination arrival state and exposes place-specific actions', () => {
  const state = game('port-arrival');
  const target = navigationTargetForPort('port.thorenfjord');
  assert.ok(target);
  assert.equal(beginNavigation(state, target).ok, true);
  finishVoyage(state);
  assert.equal(state.player.currentPortId, 'port.thorenfjord');
  assert.equal(state.arrival?.destination.id, 'port.thorenfjord');
  assert.deepEqual(state.ships[state.player.shipId].position, PORT_BY_ID['port.thorenfjord'].approachPoint);
  const labels = PORT_BY_ID['port.thorenfjord'].arrivalActions.map((action) => action.label);
  assert.ok(labels.includes('Great Hall of Thoren'));
  assert.ok(labels.includes('Royal Steward\'s Hall'));
  assert.ok(labels.includes('Pilgrim Market'));
});

test('persistent NPC traffic also remains on navigable cells as the hidden world advances', () => {
  const state = game('npc-pathing');
  for (let i = 0; i < 12; i += 1) {
    advanceWorld(state, 4);
    for (const ship of Object.values(state.ships)) {
      if (ship.disposition === 'player') continue;
      const rounded = { x: Math.round(ship.position.x), y: Math.round(ship.position.y) };
      assert.equal(getWorldCell(rounded).navigable, true, `${ship.name} moved into land at ${rounded.x},${rounded.y}`);
    }
  }
});
