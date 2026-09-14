import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const exists=(rel)=>fs.existsSync(path.join(ROOT,rel));

test('Serathi Captain resolves through the existing culture-pack path',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/IMPLEMENTED_CHARACTER_CULTURE_PACKS[^\n]*\["skeldran","asterian","serathi"\]/);
  assert.match(main,/characterThemeAttributes\(s\.player\.character\.culture,s\.player\.character\.religion\)/);
});

test('Serathi Captain preserves sticky dossier and independent scroll-owned chapters',()=>{
  const css=read('public/alpha/styles.css');
  const block=css.slice(css.indexOf('Production 1L — Serathi Salt-Limestone Ledger Captain'));
  assert.match(block,/\.character-structure-sidebar\{position:sticky!important;top:0!important\}/);
  assert.match(block,/\.character-structure-scroll\{[\s\S]*overflow:auto!important/);
  assert.match(block,/\.captain-manuscript-housing::before[\s\S]*border-image-source:var\(--serathi-captain-frame\)/);
  assert.match(block,/\.captain-manuscript-housing \.manuscript-edge,[\s\S]*\.manuscript-corner\{display:none!important\}/);
  assert.doesNotMatch(block,/background-size:100% 100%/);
});

test('Serathi Captain frames chapters separately and uses contextual Serathi imagery',()=>{
  const css=read('public/alpha/styles.css');
  const block=css.slice(css.indexOf('Production 1L — Serathi Salt-Limestone Ledger Captain'));
  assert.match(block,/\.captain-page-history>\.manuscript-record-header[\s\S]*var\(--serathi-captain-history\)/);
  assert.match(block,/\.captain-page-capabilities>\.manuscript-record-header[\s\S]*var\(--serathi-captain-capabilities\)/);
  assert.match(block,/\.captain-page-condition>\.manuscript-record-header[\s\S]*var\(--serathi-captain-condition\)/);
  for(const asset of ['arrival_port.png','royal_palace.png','harbor.png','temple.png']){
    assert.equal(exists(`public/art/location/context/serath/${asset}`),true,asset);
  }
});

test('Serathi Captain reuses only the corrected Serathi skins and remains distinct from Asterian',()=>{
  const css=read('public/alpha/styles.css');
  const block=css.slice(css.indexOf('Production 1L — Serathi Salt-Limestone Ledger Captain'));
  assert.match(block,/--serathi-captain-frame:url\('\/art\/ui\/character-themes\/culture\/serathi\/production1k\/creator_frame\.png'\)/);
  assert.match(block,/border-image-source:var\(--serathi-captain-register\)/);
  assert.match(block,/border-image-slice:58 80 78 80 fill/);
  assert.doesNotMatch(block,/--asterian|data-culture-pack="asterian"/);
  const manifest=JSON.parse(read('public/art/ui/character-themes/culture/serathi/manifest.json'));
  assert.deepEqual(manifest.scope,['character_creator','captain_sheet']);
  assert.match(manifest.identityRules.visualDifferentiation,/no starbursts[\s\S]*continuous wave rails/i);
});

test('Serathi Captain has a non-stretched responsive fallback',()=>{
  const css=read('public/alpha/styles.css');
  const block=css.slice(css.indexOf('Production 1L — Serathi Salt-Limestone Ledger Captain'));
  assert.match(block,/@media\(max-width:1180px\)[\s\S]*\.captain-manuscript-housing,[\s\S]*\.character-structure-profile::before\{display:none!important\}/);
  assert.match(block,/background-image:none!important/);
});
