import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { COMMODITY_BY_ID } from '../public/alpha/js/data/seed/commodities.js';
import { SETTLEMENT_ECONOMIC_PROFILE_BY_ID } from '../public/alpha/js/data/seed/regionalAvailability.js';
import { availableItemDefinitionsAtSettlement } from '../public/alpha/js/data/seed/items.js';
import { quoteShipSupplies } from '../public/alpha/js/game/economySimulation.js';
import { quoteMedicalTreatment, quoteShipRepair } from '../public/alpha/js/game/portServices.js';
import { buySupplies, installRefit, quoteRefitAtPort, repairShip } from '../public/alpha/js/game/shipyard.js';
import { treatInjuries } from '../public/alpha/js/game/personalCombat.js';

function game(portId='port.veyrholm', seed='a0-3a') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Port Service Captain', startingLocationId:portId }, `${seed}:${portId}`);
}

function damageShip(state, hull=20, sails=25, rigging=20) {
  const ship=state.ships[state.player.shipId];
  ship.systems.hull=Math.min(hull,ship.systems.hullMax);
  ship.systems.sails=Math.min(sails,ship.systems.sailsMax);
  ship.systems.rigging=Math.min(rigging,ship.systems.riggingMax);
  return ship;
}

function zeroCategories(state, portId, categories) {
  const wanted=new Set(categories);
  for (const row of Object.values(state.markets[portId].goods)) {
    if (wanted.has(COMMODITY_BY_ID[row.commodityId]?.category)) row.stock=0;
  }
}

function injury(id,severity) {
  return { id, bodyPart:severity===3?'head':'left_arm', type:severity===3?'fracture':'cut', severity, acquiredAtHour:0, source:'A0.3A test', treated:false };
}

test('A0.3A port profiles expose distinct yard and medical capabilities while save schema remains v12', () => {
  const state=game();
  assert.equal(state.schemaVersion,12);
  assert.deepEqual(
    ['port.veyrholm','port.ironhaven','port.stormvik','port.thorenfjord'].map(id=>[
      id,
      SETTLEMENT_ECONOMIC_PROFILE_BY_ID[id].shipyard.repairs,
      SETTLEMENT_ECONOMIC_PROFILE_BY_ID[id].shipyard.refits,
      SETTLEMENT_ECONOMIC_PROFILE_BY_ID[id].medicalCapability
    ]),
    [
      ['port.veyrholm',4,4,3],
      ['port.ironhaven',4,4,4],
      ['port.stormvik',3,3,2],
      ['port.thorenfjord',2,1,2]
    ]
  );
});

test('severe ship damage gets full major-yard restoration but only bounded repair at a smaller harbor', () => {
  const major=game('port.veyrholm','repair-major');
  damageShip(major,15,18,16);
  const majorQuote=quoteShipRepair(major,'port.veyrholm');
  assert.equal(majorQuote.ok,true);
  assert.equal(majorQuote.fullRestoration,true);

  const small=game('port.thorenfjord','repair-small');
  const smallShip=damageShip(small,15,18,16);
  const smallQuote=quoteShipRepair(small,'port.thorenfjord');
  assert.equal(smallQuote.ok,true);
  assert.equal(smallQuote.fullRestoration,false);
  assert.ok(smallQuote.targetHull < smallShip.systems.hullMax);
  assert.ok(smallQuote.targetHull > smallShip.systems.hull);
});

test('one-click repair consumes time, crowns and the same live market resource rows', () => {
  const state=game('port.thorenfjord','repair-exec');
  state.player.character.crowns=1000;
  const ship=damageShip(state,18,20,18);
  const quote=quoteShipRepair(state,'port.thorenfjord');
  assert.equal(quote.ok,true);
  const beforeHour=state.absoluteHour;
  const beforeCrowns=state.player.character.crowns;
  const beforeStocks=Object.fromEntries(quote.resources.lines.map(line=>[line.commodityId,state.markets['port.thorenfjord'].goods[line.commodityId].stock]));
  const result=repairShip(state);
  assert.equal(result.ok,true);
  assert.equal(state.absoluteHour,beforeHour+quote.hours);
  assert.equal(state.player.character.crowns,beforeCrowns-quote.cost);
  assert.equal(ship.systems.hull,quote.targetHull);
  assert.equal(ship.systems.hull<ship.systems.hullMax,true,'small harbor must not silently become a major yard');
  assert.ok(quote.resources.lines.some(line=>state.markets['port.thorenfjord'].goods[line.commodityId].stock < beforeStocks[line.commodityId]));
  const event=state.worldEvents.at(-1);
  assert.equal(event?.type,'ship_repair');
  assert.equal(event?.canonicalData?.fullRestoration,false);
  assert.match(String(event?.canonicalData?.sourceRows),/good\.|commodity\./);
});

test('yard skill alone is insufficient when live material stocks are exhausted', () => {
  const state=game('port.veyrholm','repair-shortage');
  damageShip(state,20,20,20);
  zeroCategories(state,'port.veyrholm',['raw','manufactured']);
  const before=structuredClone(state.ships[state.player.shipId].systems);
  const quote=quoteShipRepair(state,'port.veyrholm');
  assert.equal(quote.ok,false);
  assert.match(quote.message,/material stocks/i);
  assert.equal(repairShip(state).ok,false);
  assert.deepEqual(state.ships[state.player.shipId].systems,before);
});

test('refit availability follows yard capability and specialist data instead of a universal port button', () => {
  const veyr=game('port.veyrholm','refit-veyr');
  const storm=game('port.stormvik','refit-storm');
  const thoren=game('port.thorenfjord','refit-thoren');
  assert.equal(quoteRefitAtPort(veyr,'refit.storm_rigging').ok,true);
  assert.equal(quoteRefitAtPort(storm,'refit.storm_rigging').ok,true);
  assert.equal(quoteRefitAtPort(thoren,'refit.storm_rigging').ok,false);
  assert.equal(quoteRefitAtPort(storm,'refit.reinforced_pumps').ok,false,'commercial yard lacks major-repair specialist for pump package');
  assert.equal(quoteRefitAtPort(veyr,'refit.reinforced_pumps').ok,true);
});

test('accepted Veyrholm storm-rigging flow remains a simple 12-hour install while consuming real resources', () => {
  const state=game('port.veyrholm','refit-regression');
  state.player.character.crowns=1000;
  const quote=quoteRefitAtPort(state,'refit.storm_rigging');
  assert.equal(quote.ok,true);
  assert.equal(quote.hours,12);
  const ship=state.ships[state.player.shipId];
  const beforeMax=ship.systems.sailsMax;
  const beforeHour=state.absoluteHour;
  const result=installRefit(state,'refit.storm_rigging');
  assert.equal(result.ok,true);
  assert.equal(state.absoluteHour,beforeHour+12);
  assert.equal(ship.systems.sailsMax,beforeMax+8);
  assert.ok(state.worldEvents.at(-1)?.canonicalData?.sourceRows);
});

test('medical capability treats what the port can handle and leaves serious injuries for stronger care', () => {
  const state=game('port.stormvik','medical-partial');
  state.player.character.crowns=1000;
  state.player.injuries=[injury('injury.light',1),injury('injury.medium',2),injury('injury.serious',3)];
  const quote=quoteMedicalTreatment(state,'port.stormvik');
  assert.equal(quote.ok,true);
  assert.deepEqual(new Set(quote.treatableInjuryIds),new Set(['injury.light','injury.medium']));
  assert.deepEqual(quote.unsupportedInjuryIds,['injury.serious']);
  const beforeHour=state.absoluteHour;
  const result=treatInjuries(state);
  assert.equal(result.ok,true);
  assert.equal(state.absoluteHour,beforeHour+quote.hours);
  assert.equal(state.player.injuries.find(row=>row.id==='injury.light').treated,true);
  assert.equal(state.player.injuries.find(row=>row.id==='injury.medium').treated,true);
  assert.equal(state.player.injuries.find(row=>row.id==='injury.serious').treated,false);
});

test('major medical facility can treat severity-three injuries and consumes live medicine stock', () => {
  const state=game('port.ironhaven','medical-major');
  state.player.character.crowns=1000;
  state.player.injuries=[injury('injury.serious',3)];
  const quote=quoteMedicalTreatment(state,'port.ironhaven');
  assert.equal(quote.ok,true);
  assert.ok(quote.resources.lines.length>0);
  const line=quote.resources.lines[0];
  const beforeStock=state.markets['port.ironhaven'].goods[line.commodityId].stock;
  assert.equal(treatInjuries(state).ok,true);
  assert.equal(state.player.injuries[0].treated,true);
  assert.ok(state.markets['port.ironhaven'].goods[line.commodityId].stock<beforeStock);
});

test('medical practitioners cannot bypass exhausted medicine stocks', () => {
  const state=game('port.ironhaven','medical-shortage');
  state.player.injuries=[injury('injury.serious',3)];
  zeroCategories(state,'port.ironhaven',['medical']);
  const quote=quoteMedicalTreatment(state,'port.ironhaven');
  assert.equal(quote.ok,false);
  assert.match(quote.message,/medical stock/i);
  assert.equal(treatInjuries(state).ok,false);
  assert.equal(state.player.injuries[0].treated,false);
});

test('provisioning and outfitter remain existing data-driven consumers rather than parallel A0.3A inventories', () => {
  const veyr=game('port.veyrholm','stores');
  assert.equal(quoteShipSupplies(veyr,'port.veyrholm',6).ok,true);
  const before=veyr.ships[veyr.player.shipId].supplies;
  veyr.player.character.crowns=1000;
  assert.equal(buySupplies(veyr,6).ok,true);
  assert.equal(veyr.ships[veyr.player.shipId].supplies,before+6);

  const dry=game('port.veyrholm','stores-dry');
  zeroCategories(dry,'port.veyrholm',['food']);
  assert.equal(quoteShipSupplies(dry,'port.veyrholm',6).ok,false);

  const veyrItems=new Set(availableItemDefinitionsAtSettlement('port.veyrholm').map(row=>row.id));
  const thorenItems=new Set(availableItemDefinitionsAtSettlement('port.thorenfjord').map(row=>row.id));
  assert.equal(veyrItems.has('item.armor.naval_breastplate'),true);
  assert.equal(thorenItems.has('item.armor.naval_breastplate'),false);
});

test('port service engine is expansion-safe and UI keeps simple existing service actions', () => {
  const services=fs.readFileSync(new URL('../src/game/portServices.ts',import.meta.url),'utf8');
  const shipyard=fs.readFileSync(new URL('../src/game/shipyard.ts',import.meta.url),'utf8');
  const main=fs.readFileSync(new URL('../src/alpha/main.ts',import.meta.url),'utf8');
  assert.doesNotMatch(services,/port\.(veyrholm|ironhaven|stormvik|thorenfjord)/i,'generic engine must not branch on named ports');
  assert.match(services,/SETTLEMENT_ECONOMIC_PROFILE_BY_ID/);
  assert.match(services,/state\.markets\[portId\]/);
  assert.match(shipyard,/quoteShipRepair/);
  assert.match(shipyard,/quoteGenericRefitService/);
  assert.match(main,/data-action="repair-ship"/);
  assert.match(main,/data-action="install-refit"/);
  assert.match(main,/data-action="treat-injuries"/);
  assert.match(main,/Full Repair · \$\{repairCost\} cr/,'accepted concise repair presentation remains present');
  assert.doesNotMatch(main,/workshop management|workshop inventory/i);
});
