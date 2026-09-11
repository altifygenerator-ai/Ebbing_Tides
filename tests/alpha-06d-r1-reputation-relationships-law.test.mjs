import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';
import {
  adjustFactionStanding,
  adjustPortStanding,
  factionStanding,
  legalStateForShip,
  portStanding,
  recordNavalAggressionCrime,
  reportEncounterCrimes,
  satisfyActiveWarrant,
  vesselPostureTowardPlayer
} from '../public/alpha/js/game/reputationLaw.js';
import { attackEncounter, avoidEncounter } from '../public/alpha/js/game/travel.js';
import { combatAction } from '../public/alpha/js/game/combat.js';
import { expireContracts, fulfillContract } from '../public/alpha/js/game/contracts.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';

const root=process.cwd();
const main=readFileSync(join(root,'src/alpha/main.ts'),'utf8');
const combat=readFileSync(join(root,'src/game/combat.ts'),'utf8');
const personal=readFileSync(join(root,'src/game/personalCombat.ts'),'utf8');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));

function game(seed='r1-law'){
  return createGame({...DEFAULT_CHARACTER_CHOICES,name:'R1 Tester'},seed);
}

function encounterFor(state,shipId,id='encounter.r1.test'){
  return {
    id,
    phase:'sighting',
    otherShipId:shipId,
    range:'long',
    rangeYards:2800,
    sightingRangeNm:8,
    shipsSecured:false,
    elapsedMinutes:0,
    identified:true,
    playerIdentityKnown:true,
    authorityDemanded:false,
    playerEscaped:false,
    log:[],
    round:0
  };
}

test('R1 advances the campaign to persistent law schema v12',()=>{
  const state=game();
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.rpg-r1(?:\.[12])?|0\.6\.0-alpha\.d\.a0-(?:1[abc]|2[abcd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  assert.equal(state.schemaVersion,12);
  assert.deepEqual(state.player.legal,{});
  assert.deepEqual(state.player.crimes,[]);
  assert.deepEqual(state.player.warrants,[]);
  assert.equal(typeof state.player.portStanding['port.veyrholm'],'number');
});

test('v11 saves migrate lawfully without discarding the existing campaign',()=>{
  const state=game('migration');
  const legacy=structuredClone(state);
  legacy.schemaVersion=11;
  delete legacy.player.portStanding;
  delete legacy.player.legal;
  delete legacy.player.crimes;
  delete legacy.player.warrants;
  legacy.encounter=encounterFor(legacy,'ship.iron_finch','encounter.legacy');
  delete legacy.encounter.playerIdentityKnown;
  delete legacy.encounter.authorityDemanded;
  const migrated=migrateSaveData(legacy);
  assert.equal(migrated.schemaVersion,12);
  assert.equal(migrated.player.character.name,'R1 Tester');
  assert.equal(migrated.player.portStanding['port.veyrholm'],0);
  assert.deepEqual(migrated.player.legal,{});
  assert.deepEqual(migrated.player.crimes,[]);
  assert.deepEqual(migrated.player.warrants,[]);
  assert.equal(migrated.encounter.playerIdentityKnown,false);
  assert.equal(migrated.encounter.authorityDemanded,false);
});

test('regional standing and local port standing are separate values',()=>{
  const state=game('standing');
  adjustFactionStanding(state,'faction.skeldra',15);
  adjustPortStanding(state,'port.veyrholm',-12);
  assert.equal(factionStanding(state,'faction.skeldra'),15);
  assert.equal(portStanding(state,'port.veyrholm'),-12);
  assert.equal(portStanding(state,'port.stormvik'),0);
});

test('lawful vessels do not behave like generic enemies while pirates remain predatory',()=>{
  const state=game('posture');
  assert.equal(vesselPostureTowardPlayer(state,state.ships['ship.stormcrow']).kind,'neutral');
  assert.equal(vesselPostureTowardPlayer(state,state.ships['ship.iron_finch']).kind,'neutral');
  assert.equal(vesselPostureTowardPlayer(state,state.ships['ship.providence']).kind,'neutral');
  assert.equal(vesselPostureTowardPlayer(state,state.ships['ship.ash_gull']).kind,'predatory');
  state.player.character.reputation['faction.skeldra']=-55;
  assert.equal(vesselPostureTowardPlayer(state,state.ships['ship.stormcrow']).kind,'hostile');
  assert.equal(vesselPostureTowardPlayer(state,state.ships['ship.providence']).kind,'hostile');
  assert.equal(vesselPostureTowardPlayer(state,state.ships['ship.iron_finch']).kind,'avoid');
});

test('unlawful naval aggression is ground truth before it becomes reported reputation',()=>{
  const state=game('witness');
  const target=state.ships['ship.stormcrow'];
  const npc=state.npcs[target.ownerCharacterId];
  const trustBefore=npc.relationshipToPlayer.trust;
  const encounter=encounterFor(state,target.id);
  state.encounter=encounter;
  const crime=recordNavalAggressionCrime(state,target,encounter);
  assert.ok(crime);
  assert.equal(crime.type,'attack_government_vessel');
  assert.equal(crime.reported,false);
  assert.equal(state.player.warrants.length,0);
  assert.equal(factionStanding(state,'faction.skeldra'),0);
  assert.ok(npc.relationshipToPlayer.trust<trustBefore);
  assert.ok(npc.brain.memories.some(id=>id.includes(crime.id)));

  assert.equal(reportEncounterCrimes(state,encounter,target,'survivors reached port'),1);
  assert.equal(crime.reported,false);
  assert.equal(state.player.warrants.length,0);
  const report=state.player.legalReports.find(row=>row.crimeId===crime.id);
  assert.ok(report&&report.deliveryAtHour>state.absoluteHour);
  advanceWorld(state,report.deliveryAtHour-state.absoluteHour);
  assert.equal(crime.reported,true);
  assert.equal(state.player.warrants.length,1);
  assert.equal(legalStateForShip(state,target).status,'wanted');
  assert.ok(factionStanding(state,'faction.skeldra')<0);
  assert.ok(Object.values(state.player.portStanding).some(value=>value<0));
});

test('a crime with no surviving identifiable witness does not magically create a warrant',()=>{
  const state=game('no-witness');
  const target=state.ships['ship.iron_finch'];
  const encounter=encounterFor(state,target.id,'encounter.no-witness');
  encounter.playerIdentityKnown=false;
  state.encounter=encounter;
  const crime=recordNavalAggressionCrime(state,target,encounter);
  target.systems.crew=0;
  assert.equal(reportEncounterCrimes(state,encounter,target,'nobody survived to identify the attacker'),0);
  assert.equal(crime.reported,false);
  assert.equal(state.player.warrants.length,0);
  assert.equal(factionStanding(state,'faction.skeldra'),0);
});

test('attacking through the normal encounter action records the lawful-vessel offense',()=>{
  const state=game('attack-hook');
  const target=state.ships['ship.iron_finch'];
  state.encounter={...encounterFor(state,target.id,'encounter.attack-hook'),rangeYards:1200,range:'long',playerIdentityKnown:false};
  const result=attackEncounter(state);
  assert.equal(result.ok,true);
  assert.equal(state.encounter.phase,'combat');
  assert.equal(state.encounter.playerIdentityKnown,true);
  assert.ok(state.player.crimes.some(crime=>crime.encounterId===state.encounter.id&&crime.type==='unlawful_attack'));
  assert.equal(state.player.warrants.length,0,'the offense is not globally known until a witness can report it');
});

test('an active warrant changes a Skeldran navy encounter into detention and can be satisfied',()=>{
  const state=game('warrant');
  const navy=state.ships['ship.stormcrow'];
  const first=encounterFor(state,navy.id,'encounter.make-warrant');
  state.encounter=first;
  recordNavalAggressionCrime(state,navy,first);
  reportEncounterCrimes(state,first,navy,'survivors identified Tideworn');
  const report=state.player.legalReports.find(row=>row.crimeId===state.player.crimes[0].id);
  advanceWorld(state,report.deliveryAtHour-state.absoluteHour);
  assert.equal(vesselPostureTowardPlayer(state,navy).kind,'detain');
  const bounty=legalStateForShip(state,navy).bounty;
  state.player.character.crowns=bounty+100;
  const paid=satisfyActiveWarrant(state,'jurisdiction.skeldra');
  assert.equal(paid.ok,true);
  assert.equal(paid.paid,bounty);
  assert.equal(legalStateForShip(state,navy).status,'clear');
  assert.equal(state.player.character.crowns,100);
});

test('avoiding a patrol after a warrant demand records resistance rather than a free escape',()=>{
  const state=game('resist');
  const navy=state.ships['ship.stormcrow'];
  const prior=encounterFor(state,navy.id,'encounter.prior');
  state.encounter=prior;
  recordNavalAggressionCrime(state,navy,prior);
  reportEncounterCrimes(state,prior,navy,'prior report');
  const priorReport=state.player.legalReports.find(row=>row.crimeId===state.player.crimes[0].id);
  advanceWorld(state,priorReport.deliveryAtHour-state.absoluteHour);
  state.encounter={...encounterFor(state,navy.id,'encounter.detain'),playerIdentityKnown:false,authorityDemanded:false};
  avoidEncounter(state);
  assert.equal(state.encounter.authorityDemanded,true);
  assert.ok(state.player.crimes.some(crime=>crime.encounterId==='encounter.detain'&&crime.type==='resisting_authority'&&crime.reported));
});


test('legitimate completed and broken obligations move local standing in opposite directions',()=>{
  const state=game('contracts-standing');
  const contract={id:'contract.r1.good',type:'delivery',issuerName:'Veyrholm factor',sourcePortId:'port.veyrholm',destinationPortId:'port.ironhaven',commodityId:'good.grain',quantity:2,reward:50,deadlineHour:48,reason:'test obligation',status:'accepted',createdAtHour:0};
  state.contracts=[contract];
  state.player.acceptedContractIds=[contract.id];
  state.player.currentPortId='port.ironhaven';
  state.ships[state.player.shipId].cargo.push({commodityId:'good.grain',quantity:2});
  const beforeFaction=factionStanding(state,'faction.skeldra');
  assert.equal(fulfillContract(state,contract.id).ok,true);
  assert.equal(portStanding(state,'port.ironhaven'),6);
  assert.equal(factionStanding(state,'faction.skeldra'),beforeFaction+2);

  const broken={...contract,id:'contract.r1.broken',status:'accepted',deadlineHour:1,destinationPortId:'port.stormvik'};
  state.contracts.push(broken);
  state.player.acceptedContractIds.push(broken.id);
  state.absoluteHour=2;
  expireContracts(state);
  assert.equal(broken.status,'expired');
  assert.equal(portStanding(state,'port.stormvik'),-4);
});

test('fighting a patrol after refusing its warrant records the government-vessel attack',()=>{
  const state=game('detention-fight');
  const navy=state.ships['ship.stormcrow'];
  const prior=encounterFor(state,navy.id,'encounter.detention-prior');
  state.encounter=prior;
  recordNavalAggressionCrime(state,navy,prior);
  reportEncounterCrimes(state,prior,navy,'prior surviving report');
  const priorReport=state.player.legalReports.find(row=>row.crimeId===state.player.crimes[0].id);
  advanceWorld(state,priorReport.deliveryAtHour-state.absoluteHour);
  state.encounter={...encounterFor(state,navy.id,'encounter.detention-fight'),phase:'combat',range:'medium',rangeYards:700,authorityDemanded:true,playerIdentityKnown:true};
  combatAction(state,'fire_hull');
  assert.ok(state.player.crimes.some(crime=>crime.encounterId==='encounter.detention-fight'&&crime.type==='attack_government_vessel'));
});

test('R1 player-facing surfaces keep political law local standing and personal relationships distinct',()=>{
  assert.match(main,/type JournalTab = "knowledge" \| "contacts" \| "obligations" \| "law" \| "history"/);
  assert.match(main,/Standing & Law/);
  assert.match(main,/Local Standing/);
  assert.match(main,/Personal Relationships/);
  assert.match(main,/data-action="submit-authority"/);
  assert.match(main,/Answer Warrant/);
  assert.match(main,/data-action="settle-local-warrant"/);
  const lifecycle=readFileSync(join(root,'src/game/vesselLifecycle.ts'),'utf8');
  assert.match(combat,/resolvePlayerPrize/);
  assert.match(personal,/resolvePlayerPrize/);
  assert.match(lifecycle,/recordPiracyPrizeCrime/);
  assert.match(lifecycle,/reportEncounterCrimes/);
});
