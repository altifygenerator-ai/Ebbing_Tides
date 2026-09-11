import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const exists=(rel)=>fs.existsSync(path.join(ROOT,rel));

const artRoot='public/art/ui/character-themes/culture/skeldran/production1e';
const production1eAssets=[
  'review_harbor_vignette.webp',
  'captain_history_coast.webp',
  'captain_capabilities_chart.webp',
  'captain_condition_ship.webp',
  'profile_ship_vignette.webp',
  'manuscript_lintel.png',
  'manuscript_sill.png',
  'manuscript_stile_left.png',
  'manuscript_stile_right.png',
  'corner_tl.png','corner_tr.png','corner_bl.png','corner_br.png',
  'section_lintel_a.png','section_lintel_b.png','section_lintel_c.png',
  'heading_cap.png'
];

test('Production 1E is a scoped refinement mounted only on creator and captain roots',()=>{
  const main=read('src/alpha/main.ts');
  assert.equal((main.match(/data-character-refinement="frame-vignette-1e"/g)??[]).length,2);
  assert.match(main,/creation creator-production-screen character-structure-screen[^"]*"[^>]*data-character-refinement="frame-vignette-1e"/);
  assert.match(main,/captain-sheet-screen character-structure-screen[^"]*"[^>]*data-character-refinement="frame-vignette-1e"/);
  assert.doesNotMatch(main,/crew[^\n]{0,180}data-character-refinement="frame-vignette-1e"/i);
  assert.doesNotMatch(main,/journal[^\n]{0,180}data-character-refinement="frame-vignette-1e"/i);
});

test('Production 1E ships separate painted manuscript construction pieces instead of one screen underlay',()=>{
  for(const asset of production1eAssets) assert.equal(exists(`${artRoot}/${asset}`),true,asset);
  const css=read('public/alpha/styles.css');
  assert.match(css,/--skeldran-1e-lintel:url\('\/art\/ui\/character-themes\/culture\/skeldran\/production1e\/manuscript_lintel\.png'\)/);
  assert.match(css,/--skeldran-1e-stile-left:url\('\/art\/ui\/character-themes\/culture\/skeldran\/production1e\/manuscript_stile_left\.png'\)/);
  assert.match(css,/--skeldran-1e-corner-br:url\('\/art\/ui\/character-themes\/culture\/skeldran\/production1e\/corner_br\.png'\)/);
  assert.doesNotMatch(css,/production1e\/(?:parchment_voyage_character_review_interface|ebbing_tides_captain_profile)/);
});

test('creator and captain use code-owned manuscript housings assembled from independent edges and corners',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/function characterManuscriptHousing\(extraClass=""\)/);
  for(const cls of ['manuscript-edge-top','manuscript-edge-bottom','manuscript-edge-left','manuscript-edge-right','manuscript-corner-tl','manuscript-corner-tr','manuscript-corner-bl','manuscript-corner-br']) assert.match(main,new RegExp(cls));
  assert.match(main,/characterManuscriptHousing\("creator-manuscript-housing"\)/);
  assert.equal((main.match(/characterManuscriptHousing\("captain-manuscript-housing"\)/g)??[]).length,3);
  assert.match(css,/\.character-manuscript-housing[\s\S]*pointer-events:none/);
  assert.match(css,/\.manuscript-edge-top[\s\S]*var\(--skeldran-1e-lintel\)/);
  assert.match(css,/\.manuscript-edge-left[\s\S]*var\(--skeldran-1e-stile-left\)/);
});

test('Production 1E retires the remaining rectangular frame treatment where the new painted housing owns structure',()=>{
  const css=read('public/alpha/styles.css');
  assert.match(css,/\.creator-production-screen\[data-character-refinement="frame-vignette-1e"\]\[data-culture-pack="skeldran"\] \.character-art-pane>\.character-culture-frame\{[\s\S]*?display:none!important/);
  assert.match(css,/\.captain-sheet-screen\[data-character-refinement="frame-vignette-1e"\]\[data-culture-pack="skeldran"\] \.character-structure-page::before,[\s\S]*?\.character-structure-page::after\{[\s\S]*?display:none!important/);
  assert.match(css,/\.creator-choice-impact,[\s\S]*\.creator-toolbox-panel,[\s\S]*\.creator-effects-panel\{[\s\S]*border:0!important/);
  assert.match(css,/\.record-accordion-summary\{[\s\S]*border:0!important/);
});

test('review and each captain page use distinct vignette subjects rather than the repeated harbor strip',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/captain-page-history/);
  assert.match(main,/captain-page-capabilities/);
  assert.match(main,/captain-page-condition/);
  for(const pair of [
    ['--skeldran-1e-review-vignette','review_harbor_vignette.webp'],
    ['--skeldran-1e-history-vignette','captain_history_coast.webp'],
    ['--skeldran-1e-capabilities-vignette','captain_capabilities_chart.webp'],
    ['--skeldran-1e-condition-vignette','captain_condition_ship.webp'],
    ['--skeldran-1e-profile-vignette','profile_ship_vignette.webp']
  ]) assert.match(css,new RegExp(`${pair[0]}:url\\('[^']*${pair[1].replace('.','\\.')}\\'\\)`));
  assert.match(css,/\.captain-page-history>\.manuscript-record-header[\s\S]*var\(--skeldran-1e-history-vignette\)/);
  assert.match(css,/\.captain-page-capabilities>\.manuscript-record-header[\s\S]*var\(--skeldran-1e-capabilities-vignette\)/);
  assert.match(css,/\.captain-page-condition>\.manuscript-record-header[\s\S]*var\(--skeldran-1e-condition-vignette\)/);
});

test('open information housings use varied painted lintels instead of repeating one boxed treatment',()=>{
  const css=read('public/alpha/styles.css');
  assert.match(css,/\.creator-toolbox-panel\{--section-lintel:var\(--skeldran-1e-section-a\)\}/);
  assert.match(css,/\.creator-effects-panel\{--section-lintel:var\(--skeldran-1e-section-b\)\}/);
  assert.match(css,/\.creator-choice-impact\{--section-lintel:var\(--skeldran-1e-section-c\)\}/);
  assert.match(css,/\.manuscript-two-up>\.record-accordion-host:nth-child\(1\)\{--section-lintel:var\(--skeldran-1e-section-a\)\}/);
  assert.match(css,/\.manuscript-two-up>\.record-accordion-host:nth-child\(2\)\{--section-lintel:var\(--skeldran-1e-section-b\)\}/);
  assert.match(css,/\.local-standing-host\{--section-lintel:var\(--skeldran-1e-section-c\)\}/);
});

test('1E preserves the code-owned scroll model and falls back before authored edges crowd narrow screens',()=>{
  const css=read('public/alpha/styles.css');
  assert.match(css,/character-art-cell>\.character-structure-pane\{overflow:auto!important\}/);
  assert.match(css,/@media\(max-width:1180px\)[\s\S]*character-manuscript-housing\{display:none!important\}/);
  assert.match(css,/@media\(max-width:1180px\)[\s\S]*character-art-pane>\.character-culture-frame\{display:block!important\}/);
});

test('actual Production 1E runtime screenshots are packaged as visual acceptance evidence',()=>{
  for(const rel of [
    'docs/visual-qa/character-art-production-1e/creator-runtime.png',
    'docs/visual-qa/character-art-production-1e/review-runtime.png',
    'docs/visual-qa/character-art-production-1e/captain-runtime.png'
  ]) assert.equal(exists(rel),true,rel);
});
