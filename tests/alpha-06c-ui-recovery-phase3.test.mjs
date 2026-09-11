import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ART_LAYOUT_REGISTRY } from '../public/alpha/js/artLayouts/registry.js';
import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';
import { SCREEN_ARCHITECTURE_BY_ID } from '../public/alpha/js/ui/screenArchitecture.js';

const root=fileURLToPath(new URL('..',import.meta.url));
const source=(rel)=>readFileSync(join(root,rel),'utf8');

test('Phase 3 migrates Crew, Journal and Character Creator to Art-Skinned Dynamic UI',()=>{
  for(const id of ['crew_roster','journal_intelligence','character_creator']) assert.equal(SCREEN_ARCHITECTURE_BY_ID[id].architecture,'art_skinned_dynamic');
  const main=source('src/alpha/main.ts');
  for(const token of ['crew-production-screen','journal-production-screen','creator-production-screen']) assert.match(main,new RegExp(token));
  for(const id of ['ui.crew.roster','ui.journal.intelligence','ui.character.creator']) assert.equal(ART_LAYOUT_REGISTRY[id],undefined);
});

test('Phase 3 Ship Management is hybrid without painted duplicate cargo/refit geometry',()=>{
  const def=SCREEN_ARCHITECTURE_BY_ID.ship_management;
  assert.equal(def.architecture,'hybrid');
  assert.equal(def.geometryOwners['ship illustration'],'art');
  for(const key of ['ship frame','ship particulars','status groups','cargo grid','refit grid','refit icon slots','action controls']) assert.equal(def.geometryOwners[key],'code');
  assert.equal(def.geometryOwners['refit icon art'],'art');
  const main=source('src/alpha/main.ts');
  assert.match(main,/ship-production-screen/);
  assert.match(main,/ship-production-cargo-grid/);
  assert.match(main,/ship-production-refit-grid/);
  assert.doesNotMatch(main,/renderMappedArtScreen\("ui\.ship\.management"/);
  assert.equal(ART_LAYOUT_REGISTRY['ui.ship.management'],undefined);
});

test('Phase 3 dynamic screens use reference art only as Reference Ghost evidence',()=>{
  for(const id of ['ui.reference.crew_roster','ui.reference.journal','ui.reference.character_creator','ui.reference.ship_management']){
    assert.equal(ASSET_BY_ID[id].artUsage,'reference',id);
  }
  const main=source('src/alpha/main.ts');
  for(const id of ['ui.reference.crew_roster','ui.reference.journal','ui.reference.character_creator','ui.reference.ship_management']) assert.match(main,new RegExp(id.replaceAll('.','\\.')));
});

test('Phase 3 one-geometry-owner rules are declared for dynamic migrations',()=>{
  const crew=SCREEN_ARCHITECTURE_BY_ID.crew_roster.geometryOwners;
  for(const key of ['ledger frame','columns','crew rows','pagination','controls']) assert.equal(crew[key],'code');
  const journal=SCREEN_ARCHITECTURE_BY_ID.journal_intelligence.geometryOwners;
  for(const key of ['book/page geometry','tabs','entries','paging']) assert.equal(journal[key],'code');
  const creator=SCREEN_ARCHITECTURE_BY_ID.character_creator.geometryOwners;
  for(const key of ['step rail','form layout','fields','portrait frame','footer controls']) assert.equal(creator[key],'code');
});

test('Naval Encounter has migrated to runtime-safe Hybrid combat presentation',()=>{
  const naval=SCREEN_ARCHITECTURE_BY_ID.naval_combat;
  assert.equal(naval.architecture,'hybrid');
  assert.equal(naval.artBlocker,undefined);
  assert.equal(naval.scrollPolicy,'page');
  assert.equal(naval.status,'production');
  assert.equal(naval.geometryOwners['tactical sea environment'],'art');
  for(const key of ['combat layout','ship panels','range readout','damage stats','actions','combat log']) assert.equal(naval.geometryOwners[key],'code');
  assert.equal(naval.geometryOwners['ship illustrations'],'art');
  assert.equal(ART_LAYOUT_REGISTRY['ui.combat.naval_encounter'],undefined);
  assert.equal(ASSET_BY_ID['ui.combat.naval_encounter.runtime'].artUsage,'reference');
  assert.equal(ASSET_BY_ID['ui.combat.skeldra_tactical_sea'].artUsage,'environment');
});

test('obsolete Phase 3 whole-screen anchored layout source files are removed',()=>{
  for(const rel of ['src/artLayouts/crew/roster.ts','src/artLayouts/journal/journal.ts','src/artLayouts/character/creator.ts','src/artLayouts/ship/management.ts']) assert.equal(existsSync(join(root,rel)),false,rel);
});

test('Phase 3 cleanup keeps creator training readable and journal history human-readable',()=>{
  const main=source('src/alpha/main.ts');
  const css=source('public/alpha/styles.css');
  assert.match(css,/\.creator-production-form \.creator-skill-checks \.check\{[^}]*color:#3b2b18/);
  assert.match(main,/history\.map\(e=>`<article class="journal-production-entry"><div><b>\$\{esc\(e\.summary\)\}<\/b><small>\$\{esc\(formatClock\(clockFromAbsoluteHour\(e\.atHour\)\)\)\}<\/small>/);
  assert.doesNotMatch(main,/history\.map\(e=>[^\n]*<b>H\$\{e\.atHour\}/);
});
