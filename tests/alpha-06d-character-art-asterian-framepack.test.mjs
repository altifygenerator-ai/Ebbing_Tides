import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const exists=(rel)=>fs.existsSync(path.join(ROOT,rel));
const ART='public/art/ui/character-themes/culture/asterian';

test('Asterian is registered as a code-geometry culture pack',()=>{
  const main=read('src/alpha/main.ts');
  const manifest=JSON.parse(read(`${ART}/manifest.json`));
  const registry=JSON.parse(read('public/art/ui/character-themes/CHARACTER_THEME_PACK_MANIFEST.json'));
  assert.match(main,/IMPLEMENTED_CHARACTER_CULTURE_PACKS[^\n]*\["skeldran","asterian","serathi"\]/);
  assert.equal(manifest.geometryOwner,'code');
  assert.equal(registry.culturePacks.asterian,'culture/asterian/manifest.json');
  assert.equal(registry.pendingCulturePacks.includes('asterian'),false);
});

test('Asterian supplies the full modular art role set',()=>{
  const required=['outer_frame.png','dark_panel_frame.png','paper_panel_frame.png','portrait_frame.png','header_ornament.png','faith_socket.png','paper.webp','production/manuscript_texture.webp','production/rail_gallery_composite.png','production/side_vignette_composite.png','production1e/review_harbor_vignette.webp','production1e/captain_history_coast.webp','production1e/captain_capabilities_chart.webp','production1e/captain_condition_ship.webp','production1e/profile_ship_vignette.webp'];
  for(const rel of required) assert.equal(exists(`${ART}/${rel}`),true,rel);
});

test('Asterian 1F pieces preserve accepted dimensions and alpha',()=>{
  const expected={'civic_lintel.png':[1800,265],'civic_sill.png':[1800,207],'civic_stile_left.png':[130,1200],'civic_stile_right.png':[130,1200],'chapter_threshold.png':[1600,95],'register_tab.png':[900,173]};
  for(const [file,[width,height]] of Object.entries(expected)){
    const png=fs.readFileSync(path.join(ROOT,ART,'production1f',file));
    assert.equal(png.readUInt32BE(16),width,file);
    assert.equal(png.readUInt32BE(20),height,file);
    assert.ok(png[25]===4||png[25]===6,`${file} must include alpha`);
  }
});

test('neutral hides culture skins while accepted Asterian uses its fitted Creator assets',()=>{
  const css=read('public/alpha/styles.css');
  assert.match(css,/\[data-culture-pack="neutral"\][\s\S]*\.character-culture-frame[\s\S]*display:none!important/);
  assert.match(css,/\.creator-production-screen\[data-culture-pack="asterian"\]\{[\s\S]*--asterian-creator-frame:url\('\/art\/ui\/character-themes\/culture\/asterian\/production1i\/creator_frame\.png'\)/);
  assert.match(css,/\.creator-production-screen\[data-culture-pack="asterian"\] \.character-culture-outer-frame\{[\s\S]*display:none!important/);
});

test('Asterian Creator and Captain remain isolated culture selectors',()=>{
  const css=read('public/alpha/styles.css');
  assert.match(css,/\.creator-production-screen\[data-culture-pack="asterian"\]/);
  assert.match(css,/\.captain-sheet-screen\[data-culture-pack="asterian"\]/);
  const captain=css.slice(css.indexOf('Production 1J — Asterian Civic-Maritime Captain'),css.indexOf('Production 1K — Serathi Salt-Limestone Ledger Creator'));
  assert.doesNotMatch(captain,/data-culture-pack="serathi"|--serathi-/);
});
