import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { equipItem, purchaseItem } from '../public/alpha/js/game/inventory.js';
import { installRefit } from '../public/alpha/js/game/shipyard.js';
import { recordShipIntel, intelFreshnessLabel } from '../public/alpha/js/game/intelligence.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';
import { beginDeckDrill, personalCombatAction } from '../public/alpha/js/game/personalCombat.js';

function game(seed = 'alpha02-test') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name: 'Alpha Two Captain' }, seed);
}

test('Alpha 0.2 systems remain present inside Alpha 0.5A', () => {
  const state = game('structure-seed');
  assert.equal(state.schemaVersion, 12);
  assert.ok(state.player.character.visualDna.eyeColor);
  assert.ok(state.player.character.portraitId);
  assert.ok(state.player.inventory.length >= 4);
  assert.ok(state.player.equipment.mainHand);
  assert.ok(state.player.equipment.offHand);
  assert.ok(state.player.equipment.chest);
  assert.ok(state.player.crew.length >= 4);
  assert.ok(Object.keys(state.ships).length >= 7, 'player + six persistent NPC vessels expected');
});

test('equipment purchase and equip mutate canonical inventory and event history', () => {
  const state = game('inventory-seed');
  state.player.character.crowns = 500;
  const purchased = purchaseItem(state, 'item.weapon.common_boarding_axe');
  assert.equal(purchased.ok, true);
  const axe = state.player.inventory.find((item) => item.definitionId === 'item.weapon.common_boarding_axe');
  assert.ok(axe);
  const equipped = equipItem(state, axe.id);
  assert.equal(equipped.ok, true);
  assert.equal(state.player.equipment.mainHand, axe.id);
  assert.ok(state.worldEvents.some((event) => event.type === 'equipment_purchased'));
  assert.ok(state.worldEvents.some((event) => event.type === 'equipment_changed'));
});

test('ship refit consumes time and money and permanently changes ship capability', () => {
  const state = game('refit-seed');
  state.player.character.crowns = 500;
  const ship = state.ships[state.player.shipId];
  const beforeSails = ship.systems.sailsMax;
  const beforeSea = ship.seaworthiness;
  const beforeHour = state.absoluteHour;
  const result = installRefit(state, 'refit.storm_rigging');
  assert.equal(result.ok, true);
  assert.ok(ship.refits.includes('refit.storm_rigging'));
  assert.equal(ship.systems.sailsMax, beforeSails + 8);
  assert.equal(ship.seaworthiness, beforeSea + 1);
  assert.equal(state.absoluteHour, beforeHour + 12);
  assert.equal(state.worldEvents.at(-1)?.type, 'ship_refit_installed');
});

test('ship intelligence remains a last-known snapshot while the hidden ship keeps moving', () => {
  const state = game('intel-seed');
  const contact = state.ships['ship.stormcrow'];
  recordShipIntel(state, contact, true, 'Test observation', 100);
  const observed = structuredClone(state.player.shipIntel[contact.id].lastKnownPosition);
  advanceWorld(state, 12);
  assert.notDeepEqual(contact.position, observed, 'hidden simulation ship should have moved');
  assert.deepEqual(state.player.shipIntel[contact.id].lastKnownPosition, observed, 'player intel must not become live GPS');
  assert.equal(intelFreshnessLabel(state, contact.id), 'recent');
});

test('personal combat uses AP, stances and real equipment without creating drill injuries', () => {
  const state = game('drill-seed');
  const started = beginDeckDrill(state);
  assert.equal(started.ok, true);
  assert.equal(state.personalCombat.playerAP, 6);
  const stance = personalCombatAction(state, 'stance_defensive');
  assert.equal(stance.ok, true);
  assert.equal(state.personalCombat.playerStance, 'defensive');
  assert.equal(state.personalCombat.playerAP, 5);
  for (let i = 0; i < 30 && state.personalCombat && !state.personalCombat.resolved; i++) {
    const combat = state.personalCombat;
    if (combat.playerAP >= 3) personalCombatAction(state, 'slash');
    else personalCombatAction(state, 'end_turn');
  }
  assert.equal(state.player.injuries.length, 0, 'controlled drill must not create persistent injury records');
});

test('boarding transitions from grapple to personal combat and can create lasting body-part injuries', async () => {
  const state = game('injury-0');
  state.encounter = { id: 'encounter.boarding.test', phase: 'combat', otherShipId: 'ship.ash_gull', range: 'grapple', rangeYards: 25, sightingRangeNm: 0.012, identified: true, playerEscaped: false, shipsSecured: true, log: [], round: 0, elapsedMinutes: 0 };
  const { beginBoardingCombat } = await import('../public/alpha/js/game/personalCombat.js');
  const started = beginBoardingCombat(state);
  assert.equal(started.ok, true);
  assert.equal(state.encounter.range, 'boarding');
  for (let i = 0; i < 8 && state.personalCombat && !state.personalCombat.resolved && state.player.injuries.length === 0; i++) {
    personalCombatAction(state, 'end_turn');
  }
  assert.ok(state.player.injuries.length > 0, 'deterministic injury seed should create a persistent injury');
  const injury = state.player.injuries[0];
  assert.ok(['head','torso','left_arm','right_arm','left_leg','right_leg'].includes(injury.bodyPart));
  assert.equal(injury.treated, false);
  assert.ok(state.worldEvents.some((event) => event.type === 'character_injury'));
});

test('legacy Alpha 0.1 local save migrates through later schemas into current schema version 12', async () => {
  const fresh = game('legacy-migrate');
  const legacy = structuredClone(fresh);
  legacy.schemaVersion = 1;
  delete legacy.player.character.appearance;
  delete legacy.player.inventory;
  delete legacy.player.equipment;
  delete legacy.player.injuries;
  delete legacy.player.shipIntel;
  delete legacy.player.crew;
  for (const ship of Object.values(legacy.ships)) delete ship.refits;
  delete legacy.settings.audioEnabled;
  delete legacy.settings.masterVolume;

  const store = new Map([['ebbing-tides.alpha-0.1.save', JSON.stringify(legacy)]]);
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() { return store.size; }
  };
  const { loadLocal } = await import('../public/alpha/js/services/localSave.js');
  const migrated = loadLocal();
  assert.equal(migrated.schemaVersion, 12);
  assert.ok(migrated.player.inventory.length >= 4);
  assert.ok(migrated.player.crew.length >= 4);
  assert.ok(migrated.player.knownPoiIds.includes('poi.greywater_wrecks'));
  assert.equal(migrated.settings.audioEnabled, true);
  assert.equal(typeof migrated.settings.masterVolume, 'number');
});
