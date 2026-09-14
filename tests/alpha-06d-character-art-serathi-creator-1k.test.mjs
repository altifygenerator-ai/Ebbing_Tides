import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const bytes=(rel)=>fs.readFileSync(path.join(ROOT,rel));
const exists=(rel)=>fs.existsSync(path.join(ROOT,rel));
const artRoot='public/art/ui/character-themes/culture/serathi/production1k';

test('Serathi 1K Creator remains enabled while Production 1L adds the separate Captain path',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/IMPLEMENTED_CREATOR_CULTURE_PACKS[^\n]*\["skeldran","asterian","serathi"\]/);
  assert.match(main,/IMPLEMENTED_CHARACTER_CULTURE_PACKS[^\n]*\["skeldran","asterian","serathi"\]/);
  assert.match(main,/characterThemeAttributes\(c\.culture,c\.religion,IMPLEMENTED_CREATOR_CULTURE_PACKS\)/);
});

test('Serathi uses one fitted transparent housing and no stretched viewport frame',()=>{
  const css=read('public/alpha/styles.css');
  const start=css.indexOf('Production 1K — Serathi Salt-Limestone Ledger Creator');
  const end=css.indexOf('Production 1L — Serathi Salt-Limestone Ledger Captain',start);
  assert.notEqual(start,-1);
  assert.notEqual(end,-1);
  const block=css.slice(start,end);
  assert.match(block,/\.creator-production-screen\[data-culture-pack="serathi"\] \.character-culture-outer-frame\{display:none!important\}/);
  assert.match(block,/\.creator-production-screen\[data-culture-pack="serathi"\] \.creator-manuscript-housing::before\{[\s\S]*border-image-source:var\(--serathi-creator-frame\)/);
  assert.match(block,/border-image-slice:92 76 88 74/);
  assert.doesNotMatch(block,/background-size:100% 100%/);
  assert.doesNotMatch(block,/\.captain-sheet-screen\[data-culture-pack="serathi"\]/);
});

test('Serathi production assets exist and the frame has real alpha',()=>{
  for(const asset of ['creator_frame.png','register_tab.png','manuscript_texture.webp']){
    assert.equal(exists(`${artRoot}/${asset}`),true,asset);
    assert.ok(bytes(`${artRoot}/${asset}`).length>10_000,asset);
  }
  const frame=bytes(`${artRoot}/creator_frame.png`);
  assert.equal(frame.toString('ascii',1,4),'PNG');
  assert.equal(frame[25],6,'PNG color type 6 confirms RGBA frame');
});

test('Serathi palette and regional imagery stay culturally specific and faith-neutral',()=>{
  const manifest=JSON.parse(read('public/art/ui/character-themes/culture/serathi/manifest.json'));
  assert.deepEqual(manifest.scope,['character_creator','captain_sheet']);
  assert.match(manifest.palette.dominant.join(' '),/ivory|limestone|plaster/i);
  assert.match(manifest.palette.secondary.join(' '),/terracotta|brick red|cedar/i);
  assert.match(manifest.palette.accent.join(' '),/indigo|sea blue/i);
  assert.match(manifest.identityRules.cultureMark,/none invented/i);
  assert.match(manifest.identityRules.religion,/optional|never repeated/i);
  assert.match(manifest.identityRules.visualDifferentiation,/no starbursts[\s\S]*continuous wave rails/i);
  assert.match(manifest.identityRules.visualDifferentiation,/limestone blockwork[\s\S]*cedar uprights[\s\S]*square copper joints/i);
  assert.equal(exists('public/art/location/context/serath/market.png'),true);
  assert.equal(exists('public/art/location/context/serath/arrival_port.png'),true);
});

test('Serathi frame and register are confined to existing UI regions',()=>{
  const css=read('public/alpha/styles.css');
  const block=css.slice(css.indexOf('Production 1K — Serathi Salt-Limestone Ledger Creator'));
  assert.match(block,/\.creator-manuscript-housing::before/);
  assert.match(block,/\.character-structure-portrait \.creator-preview-frame/);
  assert.match(block,/\.character-structure-rail \.creator-step-button/);
  assert.match(block,/\.character-culture-rail-gallery/);
  assert.match(block,/\.character-culture-side-vignette/);
  assert.match(block,/@media\(max-width:1180px\)[\s\S]*\.creator-manuscript-housing\{display:none!important\}/);
});
