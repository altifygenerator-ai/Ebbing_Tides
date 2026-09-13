import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const bytes=(rel)=>fs.readFileSync(path.join(ROOT,rel));
const exists=(rel)=>fs.existsSync(path.join(ROOT,rel));
const artRoot='public/art/ui/character-themes/culture/asterian/production1i';

test('Asterian 1I is enabled for Creator while Captain remains on its separately controlled set',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/IMPLEMENTED_CREATOR_CULTURE_PACKS[^\n]*\["skeldran","asterian"\]/);
  assert.match(main,/IMPLEMENTED_CHARACTER_CULTURE_PACKS[^\n]*\["skeldran"\]/);
  assert.match(main,/syncCreatorCharacterTheme[\s\S]*IMPLEMENTED_CREATOR_CULTURE_PACKS\.has\(culture\)/);
  assert.match(main,/characterThemeAttributes\(c\.culture,c\.religion,IMPLEMENTED_CREATOR_CULTURE_PACKS\)/);
  assert.match(main,/characterThemeAttributes\(s\.player\.character\.culture,s\.player\.character\.religion\)/);
});

test('Asterian Creator uses one transparent joined housing instead of four independent generated edges',()=>{
  const css=read('public/alpha/styles.css');
  const frame=`${artRoot}/creator_frame.png`;
  assert.equal(exists(frame),true);
  assert.equal(bytes(frame)[25],6,'creator frame PNG must use truecolor alpha');
  assert.match(css,/\.creator-production-screen\[data-culture-pack="asterian"\] \.creator-manuscript-housing::before[\s\S]*var\(--asterian-creator-frame\)/);
  const housing=css.match(/\.creator-production-screen\[data-culture-pack="asterian"\] \.creator-manuscript-housing::before\{([\s\S]*?)\n\}/)?.[1]??'';
  assert.match(housing,/border-image-source:var\(--asterian-creator-frame\)/);
  assert.match(housing,/border-image-slice:58 30 44 30/);
  assert.doesNotMatch(housing,/100% 100%/,'joined frame must not be flattened to the runtime aspect ratio');
  assert.match(css,/\.creator-production-screen\[data-culture-pack="asterian"\] \.creator-manuscript-housing \.manuscript-edge,[\s\S]*\.manuscript-corner\{display:none!important\}/);
  assert.doesNotMatch(css,/\.captain-sheet-screen\[data-culture-pack="asterian"\]/);
});

test('Asterian register leaves preserve painted corner and rail proportions',()=>{
  const css=read('public/alpha/styles.css');
  const tabs=css.match(/\.creator-production-screen\[data-culture-pack="asterian"\] \.character-structure-rail \.creator-step-button\{([\s\S]*?)\n\}/)?.[1]??'';
  assert.match(tabs,/border-image-source:var\(--asterian-register-tab\)/);
  assert.match(tabs,/border-image-slice:30 32 42 32 fill/);
  assert.doesNotMatch(tabs,/100% 100%/,'register art must not be flattened to button geometry');
});

test('Asterian leaves the responsive exterior perimeter to the code-owned screen shell',()=>{
  const css=read('public/alpha/styles.css');
  const outer=css.match(/\.creator-production-screen\[data-culture-pack="asterian"\] \.character-culture-outer-frame\{([\s\S]*?)\n\}/)?.[1]??'';
  assert.match(outer,/display:none!important/);
  assert.doesNotMatch(outer,/border-image/,'full-screen art must not be stretched across responsive viewport geometry');
  const surface=css.match(/\.creator-production-screen\[data-culture-pack="asterian"\] \.creator-production-surface\{([\s\S]*?)\n\}/)?.[1]??'';
  assert.match(surface,/inset 0 0 0 1px rgba\(198,145,82,\.58\)/);
  assert.match(surface,/inset 0 0 0 5px rgba\(71,17,19,\.62\)/);
});

test('Asterian Creator palette and assets follow the approved white red bronze hierarchy with blue as an accent',()=>{
  const css=read('public/alpha/styles.css');
  for(const asset of ['creator_frame.png','register_tab.png','manuscript_texture.webp']){
    assert.equal(exists(`${artRoot}/${asset}`),true,asset);
  }
  const manifest=JSON.parse(read('public/art/ui/character-themes/culture/asterian/manifest.json'));
  assert.deepEqual(manifest.scope,['character_creator']);
  assert.match(manifest.palette.dominant.join(' '),/ivory|white/i);
  assert.match(manifest.palette.secondary.join(' '),/wine red|oxblood/i);
  assert.match(manifest.palette.metal.join(' '),/bronze/i);
  assert.match(manifest.palette.minorAccent.join(' '),/blue/i);
  const block=css.slice(css.indexOf('Production 1I — Asterian Civic-Maritime Creator'));
  assert.match(block,/--asterian-red:#741f1d/);
  assert.match(block,/--asterian-ivory:#eadfc9/);
  assert.match(block,/--asterian-bronze:#a9753d/);
  assert.match(block,/--asterian-blue:#24556d/);
  assert.doesNotMatch(block,/--skeldran-/);
});

test('Asterian regional paintings remain confined to existing decorative dead-space wells',()=>{
  const css=read('public/alpha/styles.css');
  const block=css.slice(css.indexOf('Production 1I — Asterian Civic-Maritime Creator'));
  assert.match(block,/--asterian-harbor:url\('\/art\/location\/context\/asteria\/arrival_port\.png'\)/);
  assert.match(block,/--asterian-market:url\('\/art\/location\/context\/asteria\/market\.png'\)/);
  assert.match(block,/\.character-culture-rail-gallery[\s\S]*pointer-events:none!important/);
  assert.match(block,/\.character-culture-side-vignette[\s\S]*pointer-events:none!important/);
  assert.match(block,/@media\(max-width:1180px\)[\s\S]*\.character-culture-rail-gallery,[\s\S]*\.character-culture-side-vignette\{display:none!important\}/);
});
