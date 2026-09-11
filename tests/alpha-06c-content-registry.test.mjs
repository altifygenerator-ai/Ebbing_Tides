import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';
import { CANON_SETTLEMENTS } from '../public/alpha/js/data/seed/settlementCanon.js';
import { ITEM_DEFINITIONS, availableItemDefinitionsAtSettlement } from '../public/alpha/js/data/seed/items.js';
import { COMMODITIES } from '../public/alpha/js/data/seed/commodities.js';
import {
  CONTENT_DEFINITIONS,
  CONTENT_BY_ID,
  LEGACY_SHIP_CLASS_ALIASES,
  SHIP_CLASS_BY_ID,
  SHIP_CLASS_DEFINITIONS,
  resolveShipClassId
} from '../public/alpha/js/data/seed/contentRegistry.js';
import {
  REGIONAL_AVAILABILITY,
  REGIONAL_IDENTITY_SAMPLE_SETTLEMENTS,
  SETTLEMENT_AVAILABILITY,
  SETTLEMENT_ECONOMIC_PROFILE_BY_ID,
  SETTLEMENT_ECONOMIC_PROFILES,
  marketInventoryForSettlement,
  shipyardClassesForSettlement
} from '../public/alpha/js/data/seed/regionalAvailability.js';
import { DEFAULT_CHARACTER_CHOICES, createGame } from '../public/alpha/js/game/createGame.js';
import { buildInitialPortMarkets } from '../public/alpha/js/game/marketGeneration.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';

function choices() {
  return { ...structuredClone(DEFAULT_CHARACTER_CHOICES), name: 'Registry Test Captain' };
}

test('0.6C canonical ship-class registry contains all 33 Asset Bible families with unique IDs', () => {
  assert.equal(SHIP_CLASS_DEFINITIONS.length, 33);
  assert.equal(new Set(SHIP_CLASS_DEFINITIONS.map((row) => row.id)).size, 33);
  for (const row of SHIP_CLASS_DEFINITIONS) assert.equal(SHIP_CLASS_BY_ID[row.id], row);
  for (const required of [
    'ship_class.skeldra.fjord_cutter',
    'ship_class.skeldra.skeldran_frigate',
    'ship_class.asteria.wardship',
    'ship_class.serath.corsair_xebec_type',
    'ship_class.kaishin.compartmented_ocean_trader',
    'ship_class.crossroads.golden_strait_merchantman',
    'ship_class.outer_isles.privateer_sloop',
    'ship_class.explorer.western_passage_survey_ship'
  ]) assert.ok(SHIP_CLASS_BY_ID[required], `missing canonical class ${required}`);
});

test('0.6C physical-content registry is machine-readable, unique, broad, and definition-based', () => {
  assert.ok(CONTENT_DEFINITIONS.length >= 500);
  assert.equal(new Set(CONTENT_DEFINITIONS.map((row) => row.id)).size, CONTENT_DEFINITIONS.length);
  const requiredCategories = [
    'weapon','firearm','armor','clothing','tool','arcane_equipment','industrial_equipment','religious_object',
    'ship_module','consumable','commodity','document','valuable','relic','utility'
  ];
  for (const category of requiredCategories) {
    assert.ok(CONTENT_DEFINITIONS.some((row) => row.category === category), `missing ${category}`);
  }
  assert.equal(CONTENT_DEFINITIONS.filter((row) => row.category === 'relic').length, 20);
  assert.equal(CONTENT_DEFINITIONS.filter((row) => row.category === 'commodity').length, 70);
});

test('all logical art references resolve; missing final art remains an explicit registry state', () => {
  for (const row of CONTENT_DEFINITIONS) {
    for (const key of ['iconAssetId','inspectionAssetId','wornReferenceAssetId']) {
      if (row[key]) assert.ok(ASSET_BY_ID[row[key]], `${row.id} references missing ${key} ${row[key]}`);
    }
    assert.ok(['canonical','approved','provisional','placeholder','missing','deprecated'].includes(row.artStatus));
  }
  for (const row of SHIP_CLASS_DEFINITIONS) {
    if (row.tokenAssetId) assert.ok(ASSET_BY_ID[row.tokenAssetId]);
    if (row.inspectionAssetId) assert.ok(ASSET_BY_ID[row.inspectionAssetId]);
  }
  assert.ok(CONTENT_DEFINITIONS.some((row) => row.artStatus === 'missing'), 'logical content should not require finished art');
});

test('all 42 canonical settlements have economic profiles and content availability', () => {
  assert.equal(CANON_SETTLEMENTS.length, 42);
  assert.equal(SETTLEMENT_ECONOMIC_PROFILES.length, 42);
  assert.equal(new Set(SETTLEMENT_ECONOMIC_PROFILES.map((row) => row.settlementId)).size, 42);
  for (const settlement of CANON_SETTLEMENTS) assert.ok(SETTLEMENT_ECONOMIC_PROFILE_BY_ID[settlement.id], `missing profile ${settlement.id}`);
  assert.equal(SETTLEMENT_AVAILABILITY.length, CANON_SETTLEMENTS.length * CONTENT_DEFINITIONS.length);
  assert.equal(REGIONAL_AVAILABILITY.length, 6 * CONTENT_DEFINITIONS.length);
  for (const row of SETTLEMENT_AVAILABILITY) assert.ok(CONTENT_BY_ID[row.contentDefinitionId], `availability references missing content ${row.contentDefinitionId}`);
});

test('Skeldran shipyards expose distinct settlement capabilities instead of universal stock', () => {
  const veyrholm = shipyardClassesForSettlement('port.veyrholm');
  const ironhaven = shipyardClassesForSettlement('port.ironhaven');
  const stormvik = shipyardClassesForSettlement('port.stormvik');
  const thorenfjord = shipyardClassesForSettlement('port.thorenfjord');
  assert.ok(veyrholm.builds.some((row) => row.id === 'ship_class.skeldra.royal_sloop'));
  assert.ok(ironhaven.builds.some((row) => row.id === 'ship_class.skeldra.steam_assisted_experimental_frigate'));
  assert.ok(stormvik.builds.some((row) => row.id === 'ship_class.skeldra.fjord_cutter'));
  assert.ok(stormvik.builds.some((row) => row.id === 'ship_class.explorer.western_passage_survey_ship'));
  assert.deepEqual(thorenfjord.builds.map((row) => row.id).sort(), ['ship_class.common.coastal_fishing_boat','ship_class.common.harbor_skiff']);
  const identities = [veyrholm,ironhaven,stormvik,thorenfjord].map((yard) => yard.builds.map((row) => row.id).sort().join('|'));
  assert.equal(new Set(identities).size, 4);
});

test('major regional market samples are distinguishable without region labels', () => {
  const samples = Object.entries(REGIONAL_IDENTITY_SAMPLE_SETTLEMENTS).map(([region,settlementId]) => {
    const ids = marketInventoryForSettlement(settlementId,'general_market',20).map((row) => row.contentDefinitionId);
    assert.ok(ids.length >= 10, `${region} sample too small`);
    return [region,ids];
  });
  assert.equal(new Set(samples.map(([,ids]) => ids.join('|'))).size, samples.length);
  const expected = {
    skeldra:'content.commodity.common.coal',
    asteria:'content.commodity.common.wine',
    serath:'content.commodity.common.dyestuffs',
    kaishin:'content.commodity.common.fine_ceramics',
    crossroads:'content.commodity.common.spices',
    outer_isles:'content.commodity.common.copper'
  };
  for (const [region,ids] of samples) assert.ok(ids.includes(expected[region]), `${region} sample lacks expected regional signal ${expected[region]}`);
});

test('ordinary markets exclude contraband, military-only stock, and unique relic multiplication', () => {
  for (const settlementId of Object.values(REGIONAL_IDENTITY_SAMPLE_SETTLEMENTS)) {
    const rows = marketInventoryForSettlement(settlementId,'general_market',200);
    for (const row of rows) {
      const def = CONTENT_BY_ID[row.contentDefinitionId];
      assert.notEqual(def.legalStatus,'contraband');
      assert.notEqual(def.legalStatus,'stolen');
      assert.notEqual(def.legalStatus,'military_only');
      assert.notEqual(def.rarity,'unique');
    }
  }
  assert.ok(CONTENT_DEFINITIONS.filter((row) => row.category === 'relic').every((row) => row.rarity === 'unique' || row.uniqueMarketStock));
});

test('live playable markets now use bounded regional stock and retain legacy baseline goods', () => {
  const markets = buildInitialPortMarkets();
  for (const portId of ['port.veyrholm','port.ironhaven','port.stormvik','port.thorenfjord']) {
    const ids = Object.keys(markets[portId].goods);
    assert.ok(ids.length > 8 && ids.length <= 24, `${portId} should expand beyond the old universal eight without becoming an unbounded list`);
    for (const legacy of ['good.grain','good.salted_fish','good.timber','good.coal','good.iron','good.gunpowder','good.machinery','good.medicine']) assert.ok(ids.includes(legacy));
  }
  assert.ok(COMMODITIES.some((row) => row.id === 'good.wool'));
  assert.ok(COMMODITIES.some((row) => row.id === 'good.iron_ingots'));
});

test('playable equipment purchase stock varies by settlement while legacy item IDs remain valid', () => {
  for (const item of ITEM_DEFINITIONS) assert.ok(CONTENT_BY_ID[item.id], `legacy gameplay item ${item.id} is not represented by canonical content`);
  const veyrholm = availableItemDefinitionsAtSettlement('port.veyrholm').map((row) => row.id);
  const thorenfjord = availableItemDefinitionsAtSettlement('port.thorenfjord').map((row) => row.id);
  assert.ok(veyrholm.includes('item.armor.naval_breastplate'));
  assert.ok(!thorenfjord.includes('item.armor.naval_breastplate'));
  assert.ok(!thorenfjord.includes('item.weapon.skeldran_naval_pistol'));
});

test('named Day-1 ships reference canonical classes and old v8 class IDs migrate through the v9 physical-distance hotfix', () => {
  const state = createGame(choices(),'06c-ship-registry');
  assert.equal(state.schemaVersion,12);
  for (const ship of Object.values(state.ships)) assert.ok(SHIP_CLASS_BY_ID[ship.classId], `${ship.name} has noncanonical class ${ship.classId}`);

  for (const [legacy,canonical] of Object.entries(LEGACY_SHIP_CLASS_ALIASES)) assert.equal(resolveShipClassId(legacy),canonical);
  const legacySave = structuredClone(state);
  legacySave.schemaVersion = 8;
  legacySave.ships['ship.player.flagship'].classId = 'ship_class.skeldran_coastal_sloop';
  legacySave.ships['ship.stormcrow'].classId = 'ship_class.skeldran_modern_battle_frigate';
  const legacyGrainStock = legacySave.markets['port.veyrholm'].goods['good.grain'].stock;
  legacySave.markets['port.veyrholm'].goods = Object.fromEntries(Object.entries(legacySave.markets['port.veyrholm'].goods).filter(([id]) => ['good.grain','good.salted_fish','good.timber','good.coal','good.iron','good.gunpowder','good.machinery','good.medicine'].includes(id)));
  const migrated = migrateSaveData(legacySave);
  assert.equal(migrated.schemaVersion,12);
  assert.equal(migrated.ships['ship.player.flagship'].classId,'ship_class.skeldra.fjord_cutter');
  assert.equal(migrated.ships['ship.stormcrow'].classId,'ship_class.skeldra.skeldran_frigate');
  assert.ok(migrated.ships['ship.player.flagship'].cruiseSpeedKnots > 0,'v9 migration should persist a physical cruise speed');
  assert.equal(migrated.markets['port.veyrholm'].goods['good.grain'].stock,legacyGrainStock,'legacy market stock must be preserved');
  assert.ok(Object.keys(migrated.markets['port.veyrholm'].goods).length > 8,'old v8 campaign should receive new registry-backed goods');
});

test('toast hotfix places transient voyage feedback away from lower-right action controls and cannot intercept clicks', () => {
  const css = readFileSync('public/alpha/styles.css','utf8');
  const toast = css.match(/\.toast\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(toast,/top:\s*70px/);
  assert.match(toast,/left:\s*50%/);
  assert.match(toast,/pointer-events:\s*none/);
  assert.doesNotMatch(toast,/bottom:\s*18px/);
});
