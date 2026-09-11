import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';
import {
  activeWarrants,
  compactLegalReports,
  factionStanding,
  legalStateForShip,
  pardonActiveWarrant,
  portStanding,
  processDueLegalReports,
  recordIndependentCrimeEvidence,
  recordNavalAggressionCrime,
  reportCrimeToLocalAuthority,
  reportEncounterCrimes,
  satisfyActiveWarrant,
  submitCrimeEvidenceToAuthority,
  unresolvedReportedCrimes,
  vesselPostureTowardPlayer
} from '../public/alpha/js/game/reputationLaw.js';

function game(seed='a02d') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'A0.2D QA' }, seed);
}

function encounterFor(state, shipId, id='encounter.a02d', identified=true) {
  return {
    id, phase:'sighting', otherShipId:shipId, range:'long', rangeYards:2800, sightingRangeNm:8,
    shipsSecured:false, elapsedMinutes:0, identified:true, playerIdentityKnown:identified,
    authorityDemanded:false, playerEscaped:false, log:[], round:0
  };
}

function dispatchAtSeaCrime(state, shipId='ship.stormcrow', id='encounter.a02d.dispatch') {
  const target=state.ships[shipId];
  const encounter=encounterFor(state,target.id,id,true);
  state.encounter=encounter;
  const crime=recordNavalAggressionCrime(state,target,encounter);
  assert.ok(crime);
  assert.equal(reportEncounterCrimes(state,encounter,target,'survivors retained identifying evidence'),1);
  const report=state.player.legalReports.find(row=>row.crimeId===crime.id&&row.status==='in_transit');
  assert.ok(report);
  return {target,encounter,crime,report};
}

function deliver(state, report) {
  if(report.deliveryAtHour>state.absoluteHour)advanceWorld(state,report.deliveryAtHour-state.absoluteHour);
  else processDueLegalReports(state);
}

test('A0.2D advances package while preserving save schema v12 and adds campaign-owned legal reports',()=>{
  const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.a0-(?:2d|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  const state=game('schema');
  assert.equal(state.schemaVersion,12);
  assert.deepEqual(state.player.legalReports,[]);
});

test('identified surviving witness at sea creates evidence and a physical report without teleporting consequences',()=>{
  const state=game('transit');
  const {crime,report}=dispatchAtSeaCrime(state);
  assert.equal(crime.reported,false);
  assert.equal(crime.legalMatterStatus,'report_in_transit');
  assert.ok(crime.evidence.some(row=>row.status==='submitted'&&row.playerIdentified));
  assert.equal(report.channel,'survivor_delivery');
  assert.ok(report.targetPortId?.startsWith('port.'));
  assert.ok(report.deliveryAtHour>state.absoluteHour);
  assert.equal(state.player.warrants.length,0);
  assert.equal(factionStanding(state,'faction.skeldra'),0);
});

test('the player can outrun an at-sea report and a lawful patrol stays non-detaining before authority receipt',()=>{
  const state=game('outrun');
  const {target,report}=dispatchAtSeaCrime(state);
  const wait=Math.max(0,report.deliveryAtHour-state.absoluteHour-1);
  if(wait)advanceWorld(state,wait);
  assert.equal(activeWarrants(state,'jurisdiction.skeldra').length,0);
  assert.notEqual(vesselPostureTowardPlayer(state,target).kind,'detain');
});

test('authority receipt validates exactly once and creates exactly one legal response from one crime',()=>{
  const state=game('receipt-once');
  const {crime,target,report}=dispatchAtSeaCrime(state);
  const factionBefore=factionStanding(state,'faction.skeldra');
  const portBefore=portStanding(state,report.targetPortId);
  deliver(state,report);
  assert.equal(crime.reported,true);
  assert.equal(crime.authorityReceivedAtHour,report.deliveryAtHour);
  assert.equal(crime.legalMatterStatus,'active');
  assert.equal(report.status,'validated');
  assert.equal(state.player.warrants.length,1);
  assert.equal(vesselPostureTowardPlayer(state,target).kind,'detain');
  const factionAfter=factionStanding(state,'faction.skeldra');
  const portAfter=portStanding(state,report.targetPortId);
  assert.ok(factionAfter<factionBefore);
  assert.ok(portAfter<portBefore);
  processDueLegalReports(state);
  advanceWorld(state,72);
  assert.equal(state.player.warrants.length,1);
  assert.equal(factionStanding(state,'faction.skeldra'),factionAfter);
  assert.equal(portStanding(state,report.targetPortId),portAfter);
  assert.equal(state.worldEvents.filter(row=>row.id===`event.warrant.${crime.id}`).length,1);
});

test('no surviving identifying witness and no independent evidence produces no report, warrant, heat or authority standing penalty',()=>{
  const state=game('no-proof');
  const target=state.ships['ship.iron_finch'];
  const encounter=encounterFor(state,target.id,'encounter.a02d.no-proof',false);
  state.encounter=encounter;
  const crime=recordNavalAggressionCrime(state,target,encounter);
  target.systems.crew=0;
  assert.equal(reportEncounterCrimes(state,encounter,target,'no surviving witness'),0);
  advanceWorld(state,240);
  assert.equal(crime.reported,false);
  assert.equal(state.player.legalReports.length,0);
  assert.equal(state.player.warrants.length,0);
  assert.equal(legalStateForShip(state,target).heat,0);
  assert.equal(factionStanding(state,'faction.skeldra'),0);
});

test('independent identifying evidence can support authority receipt even when witness identification failed',()=>{
  const state=game('physical-evidence');
  const target=state.ships['ship.iron_finch'];
  const encounter=encounterFor(state,target.id,'encounter.a02d.evidence',false);
  state.encounter=encounter;
  const crime=recordNavalAggressionCrime(state,target,encounter);
  target.systems.crew=0;
  reportEncounterCrimes(state,encounter,target,'witnesses lost');
  const evidence=recordIndependentCrimeEvidence(state,crime.id,'Signed cargo papers and captured markings identify Tideworn.',true);
  assert.ok(evidence);
  assert.equal(submitCrimeEvidenceToAuthority(state,crime.id,'port.veyrholm',[evidence.id],'Physical evidence was lodged with the Admiralty.'),true);
  assert.equal(crime.reported,true);
  assert.equal(crime.legalMatterStatus,'active');
  assert.equal(state.player.warrants.length,1);
});

test('competent local authority uses the same report lifecycle but may receive and validate immediately',()=>{
  const state=game('local-authority');
  const target=state.ships['ship.iron_finch'];
  const encounter=encounterFor(state,target.id,'encounter.a02d.local',true);
  const crime=recordNavalAggressionCrime(state,target,encounter);
  assert.equal(reportCrimeToLocalAuthority(state,crime.id,'port.veyrholm','The offense occurred before competent harbor authority.'),true);
  const report=state.player.legalReports.find(row=>row.crimeId===crime.id);
  assert.ok(report);
  assert.equal(report.deliveryAtHour,state.absoluteHour);
  assert.equal(report.status,'validated');
  assert.equal(crime.reported,true);
  assert.equal(state.player.warrants.length,1);
});

test('save/load during report transit preserves delivery and cannot duplicate the warrant',()=>{
  const state=game('save-transit');
  const {crime,report}=dispatchAtSeaCrime(state);
  const midpoint=Math.max(1,Math.floor((report.deliveryAtHour-state.absoluteHour)/2));
  advanceWorld(state,midpoint);
  const migrated=migrateSaveData(structuredClone(state));
  const loaded=migrated.player.legalReports.find(row=>row.crimeId===crime.id);
  assert.ok(loaded);
  assert.equal(loaded.deliveryAtHour,report.deliveryAtHour);
  assert.equal(loaded.status,'in_transit');
  deliver(migrated,loaded);
  assert.equal(migrated.player.warrants.length,1);
  processDueLegalReports(migrated);
  assert.equal(migrated.player.warrants.length,1);
});

test('satisfying a warrant closes every linked crime matter without erasing canonical crime history',()=>{
  const state=game('satisfied');
  const {crime,report}=dispatchAtSeaCrime(state);
  deliver(state,report);
  assert.equal(unresolvedReportedCrimes(state,'jurisdiction.skeldra').length,1);
  const bounty=activeWarrants(state,'jurisdiction.skeldra')[0].bounty;
  state.player.character.crowns=bounty+25;
  assert.equal(satisfyActiveWarrant(state,'jurisdiction.skeldra').ok,true);
  assert.equal(crime.legalMatterStatus,'satisfied');
  assert.equal(crime.reported,true,'canonical history remains reported');
  assert.equal(unresolvedReportedCrimes(state,'jurisdiction.skeldra').length,0);
  assert.equal(activeWarrants(state,'jurisdiction.skeldra').length,0);
});

test('pardoning a warrant closes linked legal matters coherently without deleting the crime',()=>{
  const state=game('pardoned');
  const {crime,report}=dispatchAtSeaCrime(state);
  deliver(state,report);
  assert.equal(pardonActiveWarrant(state,'jurisdiction.skeldra','Royal pardon entered in the Admiralty ledger.').ok,true);
  assert.equal(crime.legalMatterStatus,'pardoned');
  assert.equal(crime.resolutionNote,'Royal pardon entered in the Admiralty ledger.');
  assert.equal(state.player.crimes.some(row=>row.id===crime.id),true);
  assert.equal(unresolvedReportedCrimes(state,'jurisdiction.skeldra').length,0);
});

test('legal report operational state is bounded while live transmissions are retained',()=>{
  const state=game('bounded');
  state.player.legalReports=[];
  for(let i=0;i<200;i++)state.player.legalReports.push({id:`legal_report.history.${i}`,crimeId:`crime.history.${i}`,jurisdictionId:'jurisdiction.skeldra',factionId:'faction.skeldra',createdAtHour:i,deliveryAtHour:i+1,evidenceIds:[],channel:'institutional_courier',status:'validated',receivedAtHour:i+1,validatedAtHour:i+1,reason:'historical'});
  state.player.legalReports.push({id:'legal_report.live.1',crimeId:'crime.live.1',jurisdictionId:'jurisdiction.skeldra',factionId:'faction.skeldra',createdAtHour:500,deliveryAtHour:900,evidenceIds:[],channel:'survivor_delivery',status:'in_transit',reason:'live'});
  state.player.legalReports.push({id:'legal_report.live.2',crimeId:'crime.live.2',jurisdictionId:'jurisdiction.skeldra',factionId:'faction.skeldra',createdAtHour:501,deliveryAtHour:901,evidenceIds:[],channel:'survivor_delivery',status:'in_transit',reason:'live'});
  compactLegalReports(state);
  assert.equal(state.player.legalReports.filter(row=>row.status==='in_transit').length,2);
  assert.equal(state.player.legalReports.length,130);
});
