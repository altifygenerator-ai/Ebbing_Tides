import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const exists=(rel)=>fs.existsSync(path.join(ROOT,rel));

const productionAssets=[
  'public/art/ui/character-themes/culture/skeldran/production/manuscript_texture.webp',
  'public/art/ui/character-themes/culture/skeldran/production/rail_gallery_composite.png',
  'public/art/ui/character-themes/culture/skeldran/production/side_vignette_composite.png',
  'public/art/ui/character-themes/culture/skeldran/production/harbor_header_vignette.webp',
  'public/art/ui/character-themes/culture/skeldran/production/manuscript_ship_watermark.png',
  'public/art/ui/character-themes/religion/old_gods/accent_medallion.png',
  'public/art/ui/character-themes/religion/covenant/accent_medallion.png'
];

test('reference-locked production mode is mounted only on the existing creator and captain theme roots',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/data-character-production="reference-locked-v1"/);
  assert.match(main,/creator-production-screen character-structure-screen/);
  assert.match(main,/captain-sheet-screen character-structure-screen/);
  assert.equal((main.match(/data-character-structure="purpose-painted-lock-candidate"/g)??[]).length,2);
});

test('production art is split into modular safe-zone assets rather than a full-screen mockup underlay',()=>{
  for(const rel of productionAssets) assert.equal(exists(rel),true,rel);
  const css=read('public/alpha/styles.css');
  assert.match(css,/--skeldran-prod-manuscript:url\('\/art\/ui\/character-themes\/culture\/skeldran\/production\/manuscript_texture\.webp'\)/);
  assert.match(css,/--skeldran-prod-harbor-header:url\('\/art\/ui\/character-themes\/culture\/skeldran\/production\/harbor_header_vignette\.webp'\)/);
  assert.doesNotMatch(css,/parchment_voyage_character_review_interface\.png|ebbing_tides_captain_profile\.png/);
});

test('creator uses explicit decorative dead-space slots and keeps the form as the scroll owner',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/character-culture-rail-gallery/);
  assert.match(main,/character-culture-side-vignette/);
  assert.match(main,/character-culture-manuscript-watermark/);
  assert.match(main,/character-culture-review-scene/);
  assert.match(css,/character-art-cell>\.character-structure-pane\{overflow:auto!important\}/);
  assert.match(css,/character-culture-rail-gallery[\s\S]*pointer-events:none/);
  assert.match(css,/character-culture-side-vignette[\s\S]*pointer-events:none/);
});

test('review illustration is mounted in its own header-safe region and disappears before narrow layouts collide',()=>{
  const css=read('public/alpha/styles.css');
  assert.match(css,/creator-review-intro[\s\S]*padding:10px 328px 16px 0!important/);
  assert.match(css,/character-culture-review-scene[\s\S]*harbor-header/);
  assert.match(css,/@media\(max-width:1450px\)[\s\S]*character-culture-review-scene\{display:none!important\}/);
});

test('religion stays a separate accent medallion instead of owning the Skeldran surface',()=>{
  const css=read('public/alpha/styles.css');
  assert.match(css,/data-religion-pack="old_gods"[\s\S]*accent_medallion\.png/);
  assert.match(css,/data-religion-pack="covenant"[\s\S]*accent_medallion\.png/);
  assert.match(css,/character-faith-socket[\s\S]*background-image:var\(--character-faith-medallion\)/);
  assert.doesNotMatch(read('src/alpha/main.ts'),/old_gods.*rail_gallery|covenant.*rail_gallery/);
});

test('captain pages use manuscript material plus a dedicated illustrated header well without changing record content ownership',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/character-culture-profile-vignette/);
  assert.match(main,/character-culture-captain-stage/);
  assert.match(css,/character-structure-page>\.manuscript-record-header[\s\S]*var\(--skeldran-prod-harbor-header\)/);
  assert.match(css,/character-structure-page[\s\S]*var\(--skeldran-prod-manuscript\)/);
  assert.match(css,/character-structure-page>\*:not\(\.manuscript-cornerwork\)\{position:relative;z-index:2\}/);
});

test('visual QA screenshots from the real runtime are packaged as acceptance evidence',()=>{
  for(const rel of [
    'docs/visual-qa/character-art-production-1d/creator-runtime.png',
    'docs/visual-qa/character-art-production-1d/review-runtime.png',
    'docs/visual-qa/character-art-production-1d/captain-runtime.png'
  ]) assert.equal(exists(rel),true,rel);
});
