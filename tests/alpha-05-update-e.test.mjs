import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { PORT_BY_ID } from '../public/alpha/js/data/seed/ports.js';
import { ORIGIN_SETTLEMENT_BY_ID } from '../public/alpha/js/data/seed/origins.js';
import { rankCuratedPortraits, PORTRAIT_MATCH_WEIGHTS } from '../public/alpha/js/game/portraits.js';
import { migrateSaveData, saveLocal, loadLocal } from '../public/alpha/js/services/localSave.js';
import { loadGameFromSupabase } from '../public/alpha/js/services/cloudSave.js';

const here=dirname(fileURLToPath(import.meta.url));
const root=join(here,'..');

function choices(patch={}){
  return {...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'Alpha 0.5E Captain',...patch};
}

function memoryStorage(){
  const store=new Map();
  return {
    store,
    api:{
      getItem:key=>store.get(key)??null,
      setItem:(key,value)=>store.set(key,String(value)),
      removeItem:key=>store.delete(key),
      clear:()=>store.clear(),
      key:index=>[...store.keys()][index]??null,
      get length(){return store.size;}
    }
  };
}

test('existing creator defaults remain the familiar Skeldran Veyrholm start while storing origin and spawn separately',()=>{
  assert.equal(DEFAULT_CHARACTER_CHOICES.homelandRegion,'skeldra');
  assert.equal(DEFAULT_CHARACTER_CHOICES.homeSettlementId,'port.veyrholm');
  assert.equal(DEFAULT_CHARACTER_CHOICES.startingLocationId,'port.veyrholm');
  assert.equal(DEFAULT_CHARACTER_CHOICES.culture,'skeldran');
  assert.equal(DEFAULT_CHARACTER_CHOICES.religion,'old_gods');
});

test('homeland and home settlement are independent from the playable campaign starting location',()=>{
  const state=createGame(choices({
    ancestry:'asterian', homelandRegion:'asteria', homeSettlementId:'settlement.asterra',
    culture:'asterian', religion:'pantheon', startingLocationId:'port.veyrholm', portraitId:'portrait.pending.regional'
  }),'origin-vs-spawn');
  const captain=state.player.character;
  const ship=state.ships[state.player.shipId];
  assert.equal(captain.homelandRegion,'asteria');
  assert.equal(captain.homeSettlementId,'settlement.asterra');
  assert.equal(ORIGIN_SETTLEMENT_BY_ID[captain.homeSettlementId].name,'Asterra');
  assert.equal(captain.startingLocationId,'port.veyrholm');
  assert.equal(state.player.currentPortId,'port.veyrholm');
  assert.equal(ship.dockedAtPortId,'port.veyrholm');
  assert.deepEqual(ship.position,PORT_BY_ID['port.veyrholm'].approachPoint);
  assert.ok(captain.historyTags.includes('origin:settlement.asterra'));
  assert.ok(captain.historyTags.includes('campaign_start:port.veyrholm'));
  assert.equal(captain.knowledgeEntries.length,0,'A0.2A imports legacy capability knowledge into the one player campaign-knowledge ledger');
  assert.ok(state.player.knowledge.some(row=>row.subjectId==='settlement.asterra' && /Asterra/i.test(row.text)));
  assert.ok(state.player.knowledge.some(row=>row.subjectId==='port.veyrholm' && /campaign begins at Veyrholm/i.test(row.text)));
  const begin=state.worldEvents.find(row=>row.id==='event.campaign.begin');
  assert.match(begin.summary,/from Asterra.*begins the campaign at Veyrholm/i);
  assert.equal(begin.locationId,'port.veyrholm');
  assert.equal(begin.canonicalData.homeSettlementId,'settlement.asterra');
  assert.equal(begin.canonicalData.startingLocationId,'port.veyrholm');
});

test('home settlement must belong to homeland while starting location may legally differ',()=>{
  assert.throws(()=>createGame(choices({homelandRegion:'asteria',homeSettlementId:'port.veyrholm',startingLocationId:'port.veyrholm'}),'bad-origin'),/Home settlement must belong/);
  assert.doesNotThrow(()=>createGame(choices({homelandRegion:'asteria',homeSettlementId:'settlement.asterra',startingLocationId:'port.ironhaven',portraitId:'portrait.pending.regional'}),'legal-different-start'));
});

test('schema v6 migrates old homePortId to both homeSettlementId and startingLocationId exactly',()=>{
  const old=createGame(choices(),'v6-source');
  old.schemaVersion=6;
  old.player.currentPortId='port.veyrholm';
  old.player.character.homePortId='port.ironhaven';
  delete old.player.character.homeSettlementId;
  delete old.player.character.startingLocationId;
  old.player.character.customPortrait={enabled:true,ancestryPrimary:'skeldran',sex:'male',ageBand:'adult',homelandRegion:'skeldra',homePortId:'port.ironhaven',culture:'skeldran',religion:'old_gods',profession:'sailor',socialOrigin:'dockside_poor',build:'average',complexion:'fair',faceCharacter:'weathered',eyeColor:'gray',hairColor:'blond',hairStyle:'short',facialHair:'beard',marks:[]};
  const migrated=migrateSaveData(old);
  assert.equal(migrated.schemaVersion,12);
  assert.equal(migrated.player.character.homeSettlementId,'port.ironhaven');
  assert.equal(migrated.player.character.startingLocationId,'port.ironhaven');
  assert.equal('homePortId' in migrated.player.character,false);
  assert.equal(migrated.player.character.customPortrait.homeSettlementId,'port.ironhaven');
  assert.equal(migrated.player.character.customPortrait.startingLocationId,'port.ironhaven');
  assert.equal('homePortId' in migrated.player.character.customPortrait,false);
});

test('new v7 saves serialize and reload separated origin/start fields intact',()=>{
  const state=createGame(choices({homelandRegion:'serath',homeSettlementId:'settlement.aurel',culture:'serathi',religion:'covenant',startingLocationId:'port.stormvik',portraitId:'portrait.pending.regional'}),'reload-v7');
  const mem=memoryStorage(); globalThis.localStorage=mem.api;
  saveLocal(state);
  const loaded=loadLocal();
  assert.equal(loaded.schemaVersion,12);
  assert.equal(loaded.player.character.homeSettlementId,'settlement.aurel');
  assert.equal(loaded.player.character.startingLocationId,'port.stormvik');
  assert.equal(loaded.player.currentPortId,'port.stormvik');
  assert.equal(loaded.ships[loaded.player.shipId].dockedAtPortId,'port.stormvik');
});

test('cloud snapshot reload applies the same v6 to v7 migration boundary',async()=>{
  const old=createGame(choices(),'cloud-v6');
  old.schemaVersion=6;
  old.player.character.homePortId='port.thorenfjord';
  delete old.player.character.homeSettlementId;
  delete old.player.character.startingLocationId;
  const priorFetch=globalThis.fetch;
  globalThis.fetch=async()=>({ok:true,status:200,json:async()=>[{snapshot:structuredClone(old)}]});
  try {
    const loaded=await loadGameFromSupabase('save.test',{supabaseUrl:'https://example.invalid',anonKey:'anon',accessToken:'token'});
    assert.equal(loaded.schemaVersion,12);
    assert.equal(loaded.player.character.homeSettlementId,'port.thorenfjord');
    assert.equal(loaded.player.character.startingLocationId,'port.thorenfjord');
  } finally {
    globalThis.fetch=priorFetch;
  }
});

test('portrait ranking uses expanded metadata weights and returns best matches first',()=>{
  assert.deepEqual(PORTRAIT_MATCH_WEIGHTS,{ancestry:100,sex:100,ageBand:40,culture:30,homeland:20,profession:20,religion:15,background:10});
  const ranked=rankCuratedPortraits({ancestry:'skeldran',sex:'male',age:44,homelandRegion:'skeldra',culture:'skeldran',religion:'unaffiliated',background:'engineers_apprentice',profession:'apprentice_engineer'});
  assert.ok(ranked.length>0);
  assert.equal(ranked[0].portrait.portraitId,'portrait.skeldra.male.industrial_officer.01');
  assert.ok(ranked[0].reasons.includes('profession'));
  assert.ok(ranked[0].reasons.includes('background'));
  assert.ok(ranked.every(row=>row.portrait.sex==='male'));
});

test('unbuilt ancestry/culture combinations still receive ranked same-sex options without rewriting ancestry',()=>{
  const asterian=rankCuratedPortraits({ancestry:'asterian',sex:'female',age:30,homelandRegion:'asteria',culture:'asterian',religion:'pantheon',background:'temple_educated',profession:'scholar'});
  const serathi=rankCuratedPortraits({ancestry:'serathi',sex:'male',age:26,homelandRegion:'serath',culture:'serathi',religion:'covenant',background:'raised_by_monks',profession:'healer'});
  assert.ok(asterian.length>0);
  assert.ok(serathi.length>0);
  assert.equal(asterian.some(row=>row.ancestryMatch),false);
  assert.equal(serathi.some(row=>row.ancestryMatch),false);
});

test('age, culture, religion and profession change ranking without becoming hard filters',()=>{
  const young=rankCuratedPortraits({ancestry:'skeldran',sex:'male',age:21,homelandRegion:'skeldra',culture:'skeldran',religion:'covenant',background:'former_naval_midshipman',profession:'marine'});
  assert.ok(young.length>=4);
  assert.equal(young[0].portrait.ageBand,'young_adult');
  const oddFaith=rankCuratedPortraits({ancestry:'skeldran',sex:'female',age:40,homelandRegion:'skeldra',culture:'outer_isles',religion:'turning_wheel',background:'raised_among_smugglers',profession:'smuggler'});
  assert.ok(oddFaith.length>=3,'unusual culture/religion must not zero the portrait pool');
});

test('0.5E regression package carries the current Alpha 0.6C label without reviving older labels',()=>{
  const html=readFileSync(join(root,'public/alpha/index.html'),'utf8');
  assert.match(html,/Alpha 0\.6C/);
  assert.doesNotMatch(html,/Alpha 0\.5D Hotfix 1/);
});

test('creator source clearly separates home from campaign start and keeps custom portraits optional',()=>{
  const main=readFileSync(join(root,'src/alpha/main.ts'),'utf8');
  assert.match(main,/name="homeSettlementId"/);
  assert.match(main,/name="startingLocationId"/);
  assert.match(main,/Where the campaign begins; it does not rewrite your homeland/);
  assert.match(main,/rankCuratedPortraits/);
  assert.match(main,/Generate Custom Portrait/);
  assert.doesNotMatch(main,/name="homePortId"/);
  assert.doesNotMatch(main,/const filterPortraits=/);
});
