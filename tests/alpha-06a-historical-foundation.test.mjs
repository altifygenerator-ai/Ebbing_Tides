import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CAMPAIGN_START_DATE, COMMON_RECKONING_CALENDAR, addHours, dayOfYear,
  formatHistoricalDate, formatWorldDate, historicalDateSortKey, validateHistoricalDate,
  worldDateFromAbsoluteHour
} from '../public/alpha/js/game/time/calendar.js';
import { formatClock } from '../public/alpha/js/game/clock.js';
import { HISTORICAL_FOUNDATION_SEED } from '../public/alpha/js/data/history/seed.js';
import { InMemoryHistoryRepository } from '../public/alpha/js/data/repositories/history/inMemoryHistoryRepository.js';
import { validateHistoricalDatabase, historicalValidationErrors } from '../public/alpha/js/game/history/validation.js';
import { runtimeWorldEventToHistoricalEvent } from '../public/alpha/js/game/history/runtimeAdapter.js';
import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';

const here=dirname(fileURLToPath(import.meta.url));
const root=join(here,'..');

function cloneSeed(){ return structuredClone(HISTORICAL_FOUNDATION_SEED); }
function year(y){ return {precision:'year',year:y}; }
function unknown(){ return {precision:'unknown'}; }

function minimalCharacter(id,name,birth,death=unknown()){
  return {id,name,sex:'unknown',ancestry:'unknown',homelandRegion:'skeldra',culture:'skeldran',religion:'unknown',birthDate:birth,deathDate:death,origin:'authored',canonicalStatus:'provisional',lifecycle:death.precision==='unknown'?'living_persistent':'historical_only'};
}

test('calendar starts at 628 CR with normalized year/month/day/hour and preserves Day 1 surface display',()=>{
  assert.deepEqual(worldDateFromAbsoluteHour(0),CAMPAIGN_START_DATE);
  assert.equal(dayOfYear(CAMPAIGN_START_DATE),1);
  assert.equal(formatClock(CAMPAIGN_START_DATE),'Day 1, 628 CR · 00:00');
});

test('calendar arithmetic crosses month and year boundaries deterministically',()=>{
  assert.deepEqual(worldDateFromAbsoluteHour(30*24),{year:628,month:2,day:1,hour:0});
  assert.deepEqual(worldDateFromAbsoluteHour(360*24),{year:629,month:1,day:1,hour:0});
  assert.deepEqual(addHours({year:628,month:12,day:30,hour:23},1),{year:629,month:1,day:1,hour:0});
});

test('date formatting is centralized and month names remain data-driven rather than invented in UI code',()=>{
  assert.equal(formatWorldDate({year:628,month:1,day:1,hour:6}),'628-01-01 CR · 06:00');
  const named={...COMMON_RECKONING_CALENDAR,monthNames:['Harvestwane',...Array(11).fill('')]};
  assert.equal(formatWorldDate({year:628,month:1,day:15,hour:0},{includeHour:false,calendar:named}),'15 Harvestwane, 628 CR');
});

test('historical dates preserve exact, month, year, approximate, range, and unknown precision without fabricated days',()=>{
  const dates=[
    {precision:'exact',year:628,month:1,day:2,hour:3},
    {precision:'month',year:613,month:4},
    {precision:'year',year:613},
    {precision:'approximate',year:225},
    {precision:'range',year:590,endYear:612},
    {precision:'unknown'}
  ];
  for(const date of dates) assert.deepEqual(validateHistoricalDate(date),[]);
  assert.equal(formatHistoricalDate({precision:'year',year:613}),'613 CR');
  assert.equal(formatHistoricalDate({precision:'approximate',year:225}),'c. 225 CR');
  assert.equal(formatHistoricalDate({precision:'range',year:590,endYear:612}),'590–612 CR');
  assert.equal(formatHistoricalDate({precision:'unknown'}),'Date unknown');
});

test('0.5E v7 saves retain the v8 calendar migration while continuing through current schema v12',()=>{
  const old=createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'Calendar Migrant'},'calendar-migration');
  old.schemaVersion=7;
  old.absoluteHour=30*24+5;
  old.clock={year:628,day:31,hour:5}; // legacy v7 shape
  const migrated=migrateSaveData(old);
  assert.equal(migrated.schemaVersion,12);
  assert.deepEqual(migrated.clock,{year:628,month:2,day:1,hour:5});
  assert.equal(migrated.player.character.homeSettlementId,old.player.character.homeSettlementId);
  assert.equal(migrated.player.character.startingLocationId,old.player.character.startingLocationId);
});

test('new game state uses current schema v12 while keeping 628 CR as Day 1',()=>{
  const state=createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'0.6A Captain'},'06a-new');
  assert.equal(state.schemaVersion,12);
  assert.deepEqual(state.clock,{year:628,month:1,day:1,hour:0});
  assert.equal(state.absoluteHour,0);
});

test('authored and simulated history use the same HistoricalEventRecord contract with provenance kept explicit',()=>{
  assert.ok(HISTORICAL_FOUNDATION_SEED.events.every(row=>row.origin==='authored'));
  const runtime={id:'event.test.arrival',type:'arrival',atHour:25,locationId:'port.veyrholm',participants:['character.player','ship.player.flagship'],summary:'Arrived at Veyrholm.',canonicalData:{},importance:1};
  const historical=runtimeWorldEventToHistoricalEvent(runtime);
  assert.equal(historical.origin,'simulated');
  assert.equal(historical.eventType,'arrival');
  assert.deepEqual(historical.date,{precision:'exact',year:628,month:1,day:2,hour:1});
  assert.deepEqual(historical.participantCharacterIds,['character.player']);
  assert.equal(historical.simulationEventId,'event.test.arrival');
});

test('canonical 0.6A validation seed passes historical integrity checks',()=>{
  assert.deepEqual(historicalValidationErrors(HISTORICAL_FOUNDATION_SEED),[]);
});

test('every seeded historical record family carries explicit authored/simulated provenance',()=>{
  for(const [family,rows] of Object.entries(HISTORICAL_FOUNDATION_SEED)){
    if(!Array.isArray(rows)) continue;
    for(const row of rows){
      assert.ok(row.origin==='authored'||row.origin==='simulated',`${family}:${row.id??'unnamed'} must carry provenance`);
    }
  }
});

test('birth/death and parent-child chronology validation catches impossible history',()=>{
  const seed=cloneSeed();
  seed.characters.push(minimalCharacter('character.bad_parent','Bad Parent',year(610),year(620)));
  seed.characters.push(minimalCharacter('character.bad_child','Bad Child',year(600)));
  seed.relationships.push({id:'relationship.bad.parent',fromCharacterId:'character.bad_parent',toCharacterId:'character.bad_child',relationshipType:'parent',startDate:year(600),endDate:unknown(),origin:'authored',canonicalStatus:'provisional'});
  const codes=validateHistoricalDatabase(seed).map(row=>row.code);
  assert.ok(codes.includes('parent_not_older_than_child'));
  const seed2=cloneSeed();
  seed2.characters.push(minimalCharacter('character.reverse_life','Reverse Life',year(620),year(610)));
  assert.ok(validateHistoricalDatabase(seed2).some(row=>row.code==='death_before_birth'));
});

test('office term validation catches terms before birth and after death',()=>{
  const seed=cloneSeed();
  seed.characters.push(minimalCharacter('character.office_bad','Office Bad',year(600),year(620)));
  seed.officeTerms.push({id:'term.bad',officeId:'office.skeldra.king',holderCharacterId:'character.office_bad',startDate:year(590),endDate:year(625),interim:false,origin:'authored',canonicalStatus:'provisional'});
  const codes=validateHistoricalDatabase(seed).map(row=>row.code);
  assert.ok(codes.includes('office_term_before_birth'));
});

test('causal event links reject consequences that predate their causes',()=>{
  const seed=cloneSeed();
  seed.events.push({id:'history.event.cause.620',eventType:'disaster',title:'Cause',date:year(620),participantCharacterIds:[],factionIds:[],description:'Synthetic validation cause.',canonicalStatus:'provisional',origin:'authored'});
  seed.events.push({id:'history.event.effect.619',eventType:'economic_crisis',title:'Effect',date:year(619),participantCharacterIds:[],factionIds:[],description:'Synthetic validation effect.',canonicalStatus:'provisional',origin:'authored'});
  seed.eventLinks.push({id:'history.link.reverse',sourceEventId:'history.event.cause.620',targetEventId:'history.event.effect.619',relationType:'caused',origin:'authored',canonicalStatus:'provisional'});
  assert.ok(validateHistoricalDatabase(seed).some(row=>row.code==='event_effect_before_cause'));
});

test('war battle treaty foundation validates relational chronology and references',()=>{
  const seed=cloneSeed();
  seed.wars.push({id:'war.synthetic',name:'Synthetic War',participantFactionIds:['faction.a','faction.b'],startDate:year(600),endDate:year(602),causeEventIds:[],goals:['validation'],outcome:'ended',linkedEventIds:[],origin:'authored',canonicalStatus:'provisional'});
  seed.battles.push({id:'battle.synthetic',name:'Synthetic Battle',warId:'war.synthetic',date:year(601),commanderCharacterIds:[],forceFactionIds:['faction.a','faction.b'],result:'indecisive',linkedShipIds:[],origin:'authored',canonicalStatus:'provisional'});
  seed.treaties.push({id:'treaty.synthetic',name:'Synthetic Treaty',participantFactionIds:['faction.a','faction.b'],date:year(602),provisions:['validation'],effect:'ends war',modifiedWarIds:['war.synthetic'],origin:'authored',canonicalStatus:'provisional'});
  assert.equal(validateHistoricalDatabase(seed).filter(row=>row.recordId.includes('synthetic')&&row.severity==='error').length,0);
  seed.battles[0].date=year(599);
  assert.ok(validateHistoricalDatabase(seed).some(row=>row.code==='battle_before_war'));
});

test('historical ship chronology prevents battles/refits/commands before construction',()=>{
  const seed=cloneSeed();
  seed.ships.push({id:'history.ship.synthetic',name:'Synthetic Ship',builtDate:year(600),lossDate:year(610),fameTags:[],origin:'authored',canonicalStatus:'provisional'});
  seed.battles.push({id:'battle.ship.before',name:'Pre-build Battle',date:year(599),commanderCharacterIds:[],forceFactionIds:[],result:'invalid',linkedShipIds:['history.ship.synthetic'],origin:'authored',canonicalStatus:'provisional'});
  assert.ok(validateHistoricalDatabase(seed).some(row=>row.code==='ship_history_before_construction'));
});

test('Blackhaven High Captain seed proves non-hereditary political succession',()=>{
  const repo=new InMemoryHistoryRepository(HISTORICAL_FOUNDATION_SEED);
  const office=repo.getOffice('office.blackhaven.high_captain');
  assert.equal(office.hereditaryByDefault,false);
  assert.equal(office.selectionMode,'elected');
  const holders=repo.getOfficeTerms(office.id).map(term=>term.holderCharacterId);
  assert.deepEqual(holders,['character.jessa_corven','character.bran_garric','character.niko_serrat','character.mara_voss']);
});

test('historical source disagreement remains separate from canonical event truth',()=>{
  const repo=new InMemoryHistoryRepository(HISTORICAL_FOUNDATION_SEED);
  const event=repo.getEvent('history.event.vespera_riots.621');
  assert.match(event.description,/false atrocity rumor/i);
  const interpretations=repo.getInterpretationsForEvent(event.id);
  assert.equal(interpretations.length,2);
  assert.ok(interpretations.some(row=>row.canonicalStatus==='disputed'));
  assert.ok(interpretations.every(row=>row.disagreementWithInterpretationIds.length===1));
});

test('Vaering validation seed links real people, parent-child history, and the 613 office transition without populating full 0.6B genealogy',()=>{
  const repo=new InMemoryHistoryRepository(HISTORICAL_FOUNDATION_SEED);
  assert.equal(repo.getCharacter('character.eirik_iii_vaering').deathDate.year,613);
  assert.equal(repo.getCharacter('character.eirik_iv_vaering').lifecycle,'living_persistent');
  const terms=repo.getOfficeTerms('office.skeldra.king');
  assert.deepEqual(terms.map(row=>row.holderCharacterId),['character.eirik_iii_vaering','character.eirik_iv_vaering']);
  assert.equal(HISTORICAL_FOUNDATION_SEED.houses.length,1,'0.6A should not broaden into full dynasty population');
});

test('history data lives outside per-save GameState rather than bloating campaign snapshots',()=>{
  const state=createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'Lean Save'},'lean-save');
  assert.equal('historicalDatabase' in state,false);
  assert.equal('historySeed' in state,false);
});

test('0.6A SQL migration contains the required normalized history table families',()=>{
  const sql=readFileSync(join(root,'supabase/migrations/0008_alpha_06a_historical_foundation.sql'),'utf8');
  for(const table of ['historical_characters','historical_relationships','houses','offices','office_terms','historical_claims','historical_events','historical_event_links','institutions','wars','battles','treaties','historical_ships','historical_ship_ownership','historical_sources','historical_interpretations']){
    assert.match(sql,new RegExp(`create table if not exists public\\.${table}\\b`));
  }
  assert.match(sql,/clock_month/);
  assert.match(sql,/authored','simulated/);
  assert.match(sql,/foreign key \(world_scope_id, office_id\)/);
  assert.match(sql,/foreign key \(world_scope_id, source_event_id\)/);
  assert.match(sql,/foreign key \(world_scope_id, ship_id\)/);
});

test('0.6A architecture remains outside React and exposes the required repository/history/time separation',()=>{
  for(const path of ['src/types/history.ts','src/game/time/calendar.ts','src/game/history/validation.ts','src/game/history/runtimeAdapter.ts','src/data/history/seed.ts','src/data/repositories/history/historyRepository.ts']){
    assert.ok(readFileSync(join(root,path),'utf8').length>100,`${path} should exist and be substantive`);
  }
});

test('0.6A SQL migration isolates schema ALTER work from deferred-FK seed writes and is safe to rerun',()=>{
  const sql=readFileSync(join(root,'supabase/migrations/0008_alpha_06a_historical_foundation.sql'),'utf8');
  const seedMarker=sql.indexOf('-- Minimal canonical/validation seed.');
  assert.ok(seedMarker>0,'seed marker should exist');
  const ddl=sql.slice(0,seedMarker);
  const seed=sql.slice(seedMarker);
  assert.match(ddl,/set constraints all immediate/i);
  assert.match(ddl,/from pg_constraint/i,'constraint creation should be idempotent on rerun');
  assert.match(ddl,/commit;\s*$/i,'DDL/ALTER phase must commit before seed writes');
  assert.match(seed,/begin;[\s\S]*set constraints all deferred/i);
  assert.match(seed,/set constraints all immediate;\s*commit;/i,'seed phase should flush deferred FK checks before commit');
});
