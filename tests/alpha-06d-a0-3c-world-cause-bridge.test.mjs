import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';
import { advanceSettlementEconomy } from '../public/alpha/js/game/economySimulation.js';
import { calculatePrice, refreshMarketPrices } from '../public/alpha/js/game/economy.js';
import { generateContracts } from '../public/alpha/js/game/contracts.js';
import { planTravel } from '../public/alpha/js/game/npcBrain.js';
import { informationTravelHours } from '../public/alpha/js/game/information.js';
import { rumorCandidatesForPort } from '../public/alpha/js/game/portActions.js';
import {
  activeWorldCauses,
  activateWorldCause,
  compactWorldCauses,
  resolveWorldCause,
  worldCauseContractDemandForPort,
  worldCauseInfluenceForPortCommodity,
  worldCauseInfluenceForRoute,
  worldCauseLegalReportTransitForPort,
  worldCausesWithPolicyTag
} from '../public/alpha/js/game/worldCauses.js';
import {
  factionStanding,
  recordNavalAggressionCrime,
  reportEncounterCrimes
} from '../public/alpha/js/game/reputationLaw.js';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const game=(seed='a03c')=>createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'A0.3C QA'},seed);

function publicCause(overrides={}) {
  return {
    id:'cause.qa.shortage',
    kind:'famine',
    title:'Poor Harvest',
    summary:'A poor harvest is tightening food supply.',
    reason:'Regional crop yields failed after an unusually cold growing season.',
    scope:{regionIds:['skeldra']},
    effects:{categoryProductionMultipliers:{food:0.35},categoryExternalSupplyMultipliers:{food:0.4},categoryConsumptionMultipliers:{food:1.1}},
    policyTags:['food_emergency'],
    originPortId:'port.veyrholm',
    publicInformation:{category:'trade',source:'Harbor notices and merchant reports',confidence:82,staleAfterHours:168},
    ...overrides
  };
}

function encounterFor(shipId,id='encounter.a03c') {
  return {id,phase:'sighting',otherShipId:shipId,range:'long',rangeYards:2800,sightingRangeNm:8,shipsSecured:false,elapsedMinutes:0,identified:true,playerIdentityKnown:true,authorityDemanded:false,playerEscaped:false,log:[],round:0};
}

function dispatchCrime(state,shipId='ship.stormcrow',id='encounter.a03c.report') {
  const target=state.ships[shipId];
  const encounter=encounterFor(target.id,id);
  state.encounter=encounter;
  const crime=recordNavalAggressionCrime(state,target,encounter);
  assert.ok(crime);
  assert.equal(reportEncounterCrimes(state,encounter,target,'survivors retained identifying evidence'),1);
  const report=state.player.legalReports.find(row=>row.crimeId===crime.id&&row.status==='in_transit');
  assert.ok(report);
  return {crime,report,target};
}

test('A0.3C advances package, keeps save schema v12, and initializes one campaign-owned live-cause ledger',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.match(pkg.version,/^0\.6\.0-alpha\.d\.(?:a0-3c|r2)$/);
  const state=game('schema');
  assert.equal(state.schemaVersion,12);
  assert.deepEqual(state.worldCauses,[]);
});

test('activating one cause creates one authoritative live row plus one historical event without direct price, standing, heat, or warrant mutation',()=>{
  const state=game('one-cause-one-change');
  const row=state.markets['port.veyrholm'].goods['good.grain'];
  const stockBefore=row.stock;
  const priceBefore=calculatePrice(state,state.markets['port.veyrholm'],'good.grain');
  const standingBefore=factionStanding(state,'faction.skeldra');
  const heatBefore=state.player.legal['jurisdiction.skeldra']?.heat ?? 0;
  const warrantsBefore=state.player.warrants.length;
  const result=activateWorldCause(state,publicCause());
  assert.equal(result.ok,true);
  assert.equal(state.worldCauses.length,1);
  assert.equal(state.worldEvents.filter(e=>e.id==='event.world_cause.started.cause.qa.shortage').length,1);
  assert.equal(row.stock,stockBefore);
  assert.equal(calculatePrice(state,state.markets['port.veyrholm'],'good.grain'),priceBefore);
  assert.equal(factionStanding(state,'faction.skeldra'),standingBefore);
  assert.equal(state.player.legal['jurisdiction.skeldra']?.heat ?? 0,heatBefore);
  assert.equal(state.player.warrants.length,warrantsBefore);
});

test('economic world causes alter real production/import/consumption inputs and price reacts only through changed live stock',()=>{
  const control=game('economic-cause');
  const affected=game('economic-cause');
  const controlRow=control.markets['port.veyrholm'].goods['good.grain'];
  const affectedRow=affected.markets['port.veyrholm'].goods['good.grain'];
  controlRow.stock=affectedRow.stock=45;
  activateWorldCause(affected,publicCause());
  for(let day=0;day<5;day++){
    const cb=control.absoluteHour, ab=affected.absoluteHour;
    control.absoluteHour+=24; affected.absoluteHour+=24;
    advanceSettlementEconomy(control,cb); advanceSettlementEconomy(affected,ab);
  }
  assert.ok(affectedRow.stock<controlRow.stock,`famine stock ${affectedRow.stock} should be below control ${controlRow.stock}`);
  const controlPrice=calculatePrice(control,control.markets['port.veyrholm'],'good.grain');
  const affectedPrice=calculatePrice(affected,affected.markets['port.veyrholm'],'good.grain');
  assert.ok(affectedPrice>=controlPrice,'scarcer live stock should produce the same economy owner\'s equal-or-higher price');
  const influence=worldCauseInfluenceForPortCommodity(affected,'port.veyrholm','food');
  assert.ok(influence.productionMultiplier<1 && influence.externalSupplyMultiplier<1 && influence.consumptionMultiplier>1);
});

test('cause scope and commodity category are data-driven rather than named-port branches',()=>{
  const state=game('scope');
  activateWorldCause(state,publicCause({scope:{portIds:['port.veyrholm']},effects:{categoryProductionMultipliers:{food:0.2}}}));
  assert.equal(worldCauseInfluenceForPortCommodity(state,'port.veyrholm','food').productionMultiplier,0.2);
  assert.equal(worldCauseInfluenceForPortCommodity(state,'port.veyrholm','raw').productionMultiplier,1);
  assert.equal(worldCauseInfluenceForPortCommodity(state,'port.ironhaven','food').productionMultiplier,1);
  const source=read('src/game/worldCauses.ts');
  assert.doesNotMatch(source,/port\.veyrholm|port\.ironhaven|port\.stormvik|port\.thorenfjord/);
});

test('public cause truth uses A0.2A physical information travel instead of becoming distant player knowledge instantly',()=>{
  const state=game('public-news');
  activateWorldCause(state,publicCause());
  const eventId='event.world_cause.started.cause.qa.shortage';
  assert.ok(rumorCandidatesForPort(state,'port.veyrholm').some(row=>row.sourceEventId===eventId));
  assert.equal(rumorCandidatesForPort(state,'port.ironhaven').some(row=>row.sourceEventId===eventId),false);
  const delay=informationTravelHours('port.veyrholm','port.ironhaven');
  assert.ok(delay && delay>0);
  state.absoluteHour+=delay;
  assert.ok(rumorCandidatesForPort(state,'port.ironhaven').some(row=>row.sourceEventId===eventId));
});

test('traffic causes are consumed by the existing NPC planner and can close routine routes without teleporting ships',()=>{
  const state=game('traffic');
  const npc=state.npcs['character.odel_braegson'];
  assert.ok(planTravel(state,npc,'port.veyrholm','port.ironhaven','ordinary merchant passage'));
  activateWorldCause(state,publicCause({id:'cause.qa.route-closure',kind:'emergency_decree',title:'Harbor Closure',summary:'Routine departures are suspended.',reason:'Emergency harbor control.',scope:{portIds:['port.ironhaven']},effects:{trafficMultiplier:0},policyTags:['route_control']}));
  const influence=worldCauseInfluenceForRoute(state,'port.veyrholm','port.ironhaven');
  assert.equal(influence.trafficMultiplier,0);
  assert.equal(planTravel(state,npc,'port.veyrholm','port.ironhaven','ordinary merchant passage'),undefined);
});

test('institutional disruption changes A0.2D legal-report transit but still cannot issue an instant warrant',()=>{
  const control=game('law-transit');
  const affected=game('law-transit');
  activateWorldCause(affected,publicCause({id:'cause.qa.institution-delay',kind:'emergency_decree',title:'Admiralty Backlog',summary:'Reports are moving slowly through naval offices.',reason:'Emergency processing load.',effects:{legalReportTransitMultiplier:2},policyTags:['institutional_delay']}));
  const base=dispatchCrime(control,'ship.stormcrow','encounter.a03c.base');
  const delayed=dispatchCrime(affected,'ship.stormcrow','encounter.a03c.delayed');
  assert.equal(worldCauseLegalReportTransitForPort(affected,delayed.report.targetPortId).multiplier,2);
  assert.ok(delayed.report.deliveryAtHour>base.report.deliveryAtHour);
  assert.equal(affected.player.warrants.length,0);
  assert.equal(delayed.crime.reported,false);
});

test('contract procurement consumes the same cause record as an institutional demand input',()=>{
  const state=game('contracts');
  state.contracts=[];
  const source=state.markets['port.veyrholm'].goods['good.grain'];
  const dest=state.markets['port.ironhaven'].goods['good.grain'];
  source.stock=source.targetStock*1.25;
  dest.stock=dest.targetStock*0.70;
  refreshMarketPrices(state);
  generateContracts(state);
  const before=state.contracts.filter(c=>c.commodityId==='good.grain'&&c.destinationPortId==='port.ironhaven').length;
  state.contracts=[];
  activateWorldCause(state,publicCause({id:'cause.qa.procurement',kind:'emergency_decree',title:'Emergency Grain Purchase',summary:'The crown is buying additional grain.',reason:'Emergency reserve order.',scope:{portIds:['port.ironhaven']},effects:{contractDemandMultiplier:2},policyTags:['emergency_procurement']}));
  assert.equal(worldCauseContractDemandForPort(state,'port.ironhaven').multiplier,2);
  generateContracts(state);
  const contract=state.contracts.find(c=>c.commodityId==='good.grain'&&c.destinationPortId==='port.ironhaven');
  assert.equal(before,0,'0.70 target ratio is above the ordinary 0.62 shortage threshold');
  assert.ok(contract,'cause-driven procurement should create work through the existing contract owner');
  assert.match(contract.reason,/Emergency Grain Purchase/);
});

test('scheduled causes resolve on absolute world time, stop affecting consumers, and emit one terminal historical event',()=>{
  const state=game('scheduled-end');
  activateWorldCause(state,publicCause({id:'cause.qa.timed',startedAtHour:0,scheduledEndAtHour:48,effects:{categoryProductionMultipliers:{food:0.5}},policyTags:['temporary']}));
  assert.equal(activeWorldCauses(state,24).some(c=>c.id==='cause.qa.timed'),true);
  advanceWorld(state,72);
  const cause=state.worldCauses.find(c=>c.id==='cause.qa.timed');
  assert.equal(cause.status,'resolved');
  assert.equal(cause.resolvedAtHour,48);
  assert.equal(worldCauseInfluenceForPortCommodity(state,'port.veyrholm','food').productionMultiplier,1);
  assert.equal(state.worldEvents.filter(e=>e.id==='event.world_cause.resolved.cause.qa.timed').length,1);
  advanceWorld(state,24);
  assert.equal(state.worldEvents.filter(e=>e.id==='event.world_cause.resolved.cause.qa.timed').length,1);
});

test('world-cause state survives existing schema-v12 save migration and terminal operational history remains bounded',()=>{
  const state=game('save-and-bounds');
  activateWorldCause(state,publicCause({id:'cause.qa.persist'}));
  const loaded=migrateSaveData(structuredClone(state));
  assert.equal(loaded.worldCauses.find(c=>c.id==='cause.qa.persist')?.status,'active');
  loaded.worldCauses=[];
  for(let i=0;i<140;i++)loaded.worldCauses.push({id:`cause.history.${i}`,kind:'economic_disruption',title:`Old cause ${i}`,summary:'Resolved.',reason:'QA',startedAtHour:i,status:'resolved',scope:{},effects:{},policyTags:[],resolvedAtHour:i+1});
  loaded.worldCauses.push({...publicCause({id:'cause.live'}),startedAtHour:500,status:'active'});
  compactWorldCauses(loaded);
  assert.equal(loaded.worldCauses.filter(c=>c.status==='active').length,1);
  assert.equal(loaded.worldCauses.length,97);
});

test('policy tags expose the same authoritative cause rows for later R2 rather than creating temporary customs flags',()=>{
  const state=game('r2-query');
  activateWorldCause(state,publicCause({id:'cause.qa.embargo',kind:'embargo',title:'Strategic Embargo',summary:'Strategic exports are restricted.',reason:'Diplomatic crisis.',effects:{externalSupplyMultiplier:0.65,trafficMultiplier:0.8},policyTags:['embargo','strategic_material_control']}));
  assert.deepEqual(worldCausesWithPolicyTag(state,'embargo').map(c=>c.id),['cause.qa.embargo']);
  assert.equal(worldCausesWithPolicyTag(state,'privateering_authorized').length,0);
});

test('a time-bounded live cause can run through a 365-day campaign without deadlocking ordinary NPC traffic or leaving active stale cause state',()=>{
  const state=game('cause-365');
  activateWorldCause(state,publicCause({
    id:'cause.qa.90day-disruption',
    scheduledEndAtHour:24*90,
    effects:{categoryProductionMultipliers:{food:0.7},categoryExternalSupplyMultipliers:{food:0.75},trafficMultiplier:0.8,contractDemandMultiplier:1.35},
    policyTags:['temporary_food_disruption']
  }));
  for(let day=0;day<365;day++) advanceWorld(state,24);
  const cause=state.worldCauses.find(c=>c.id==='cause.qa.90day-disruption');
  assert.equal(cause?.status,'resolved');
  assert.equal(cause?.resolvedAtHour,24*90);
  const activeNpcShips=Object.values(state.npcs).filter(npc=>npc.shipId&&state.ships[npc.shipId]?.lifecycle?.status!=='captured'&&state.ships[npc.shipId]?.lifecycle?.status!=='destroyed');
  assert.ok(activeNpcShips.length>=6);
  for(const npc of activeNpcShips) assert.ok(state.worldEvents.some(e=>e.type==='npc_arrival'&&e.canonicalData.npcId===npc.id),`${npc.id} should keep moving through the campaign`);
  assert.equal(activeWorldCauses(state).some(c=>c.id===cause?.id),false);
  assert.ok(state.worldCauses.length<=97);
});

test('manual resolution closes current cause state without deleting historical truth',()=>{
  const state=game('manual-resolution');
  activateWorldCause(state,publicCause({id:'cause.qa.manual'}));
  const result=resolveWorldCause(state,'cause.qa.manual','The harvest emergency has formally ended.');
  assert.equal(result.ok,true);
  assert.equal(state.worldCauses.find(c=>c.id==='cause.qa.manual')?.status,'resolved');
  assert.equal(activeWorldCauses(state).some(c=>c.id==='cause.qa.manual'),false);
  assert.equal(state.worldEvents.filter(e=>e.canonicalData.worldCauseId==='cause.qa.manual').length,2);
});


test('all required A0.3C cause families are representable without seeding invented Day-1 canon',()=>{
  const state=game('cause-kinds');
  const kinds=['war','embargo','famine','emergency_decree','religious_policy','ruler_change','economic_disruption'];
  for(const [index,kind] of kinds.entries()){
    const result=activateWorldCause(state,publicCause({id:`cause.qa.kind.${kind}`,kind,title:`QA ${kind}`,summary:'QA live cause.',reason:'QA only.',effects:{},policyTags:[kind],originPortId:'port.veyrholm'}));
    assert.equal(result.ok,true);
  }
  assert.deepEqual(new Set(activeWorldCauses(state).map(c=>c.kind)),new Set(kinds));
});

test('contract-demand causes can also suppress institutional procurement rather than only inflate it',()=>{
  const state=game('contract-suppression');
  activateWorldCause(state,publicCause({id:'cause.qa.no-procurement',kind:'emergency_decree',title:'Procurement Freeze',summary:'Routine public purchasing is suspended.',reason:'Treasury order.',scope:{regionIds:['skeldra']},effects:{contractDemandMultiplier:0},policyTags:['procurement_freeze']}));
  assert.equal(worldCauseContractDemandForPort(state,'port.ironhaven').multiplier,0);
  state.contracts=[];
  generateContracts(state);
  assert.equal(state.contracts.length,0);
});

test('world-cause history does not bypass A0.2A knowledge ownership in the Journal',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/learnedEventIds=new Set\(s\.player\.knowledge/);
  assert.match(main,/!event\.type\.startsWith\("world_cause_"\)\|\|learnedEventIds\.has\(event\.id\)/);
});

test('player presentation surfaces physically available notices inside existing port context and adds no strategy dashboard',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/Current public notices/);
  assert.match(main,/eventInformationCanReachPort\(s,event,portId\)/);
  assert.match(main,/renderWorldCauseNotices\(s,portId,kind\)/);
  assert.doesNotMatch(main,/World Strategy|Kingdom Dashboard|Grand Strategy|data-tab="politics"/i);
});
