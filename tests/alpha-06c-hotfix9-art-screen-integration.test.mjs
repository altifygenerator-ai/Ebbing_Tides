import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ART_LAYOUT_REGISTRY } from '../public/alpha/js/artLayouts/registry.js';
import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';

const root=fileURLToPath(new URL('..',import.meta.url));
const source=(rel)=>readFileSync(join(root,rel),'utf8');
const anchored=['ui.character.equipment.male','ui.character.equipment.female'];

test('ArtDirectedCanvas registry now contains only screens that still require exact art anchoring',()=>{
  assert.deepEqual(Object.keys(ART_LAYOUT_REGISTRY).sort(),anchored.sort());
});

test('runtime layout authority never points at reference-only art',()=>{
  for(const id of anchored){
    const layout=ART_LAYOUT_REGISTRY[id];
    const asset=ASSET_BY_ID[layout.runtimeBaseAssetId ?? layout.assetId];
    assert.ok(asset,`missing runtime asset for ${id}`);
    assert.notEqual(asset.artUsage,'reference',`${id} renders reference-only art`);
    assert.ok(['runtime_base','provisional'].includes(asset.artUsage),`${id} must be runtime-safe or explicitly provisional`);
  }
});

test('ArtScreenHost fits by available width and height and owns letterboxing',()=>{
  const host=source('src/artLayouts/ArtScreenHost.ts');
  assert.match(host,/Math\.min\(hostWidth, hostHeight \* ratio\)/);
  assert.match(host,/const renderHeight = renderWidth \/ ratio/);
  assert.match(host,/ResizeObserver/);
  assert.match(host,/--art-letterbox-x/);
  assert.match(host,/--art-letterbox-y/);
});

test('anchored fixed screens declare explicit scroll ownership',()=>{
  for(const id of anchored){
    const layout=ART_LAYOUT_REGISTRY[id];
    assert.ok(layout.screenScroll,`${id} missing screen scroll policy`);
    assert.equal(layout.screenScroll,'none');
  }
});

test('dynamic screens including naval combat are no longer forced through ArtDirectedCanvas',()=>{
  for(const id of ['ui.combat.naval_encounter','ui.crew.roster','ui.journal.intelligence','ui.character.creator','ui.ship.management']) assert.equal(ART_LAYOUT_REGISTRY[id],undefined);
  assert.equal(ASSET_BY_ID['ui.combat.naval_encounter.runtime'].artUsage,'reference');
});

test('Market and Phase 3 dynamic migrations are no longer forced through ArtDirectedCanvas',()=>{
  const main=source('src/alpha/main.ts');
  for(const [id,token] of [['ui.market.ledger','market-production-screen'],['ui.crew.roster','crew-production-screen'],['ui.journal.intelligence','journal-production-screen'],['ui.character.creator','creator-production-screen'],['ui.ship.management','ship-production-screen']]){
    assert.equal(ART_LAYOUT_REGISTRY[id],undefined);
    assert.match(main,new RegExp(token));
    assert.equal(main.includes(`renderMappedArtScreen("${id}"`),false);
  }
});

test('layout-authority art uses exact contained canvas rather than cover cropping',()=>{
  const css=source('public/alpha/styles.css');
  assert.match(css,/\.art-directed-base\{[^}]*object-fit:contain/s);
  assert.doesNotMatch(css,/\.art-directed-base\{[^}]*object-fit:cover/s);
});

test('production character UI no longer exposes implementation-demo labels',()=>{
  const main=source('src/alpha/main.ts');
  for(const phrase of ['ART-FIRST EQUIPMENT IMPLEMENTATION','The base UI art is the bottom layer','Reduced slot set','Shared NPC rules']) assert.equal(main.includes(phrase),false,`development phrase leaked into player UI: ${phrase}`);
});
