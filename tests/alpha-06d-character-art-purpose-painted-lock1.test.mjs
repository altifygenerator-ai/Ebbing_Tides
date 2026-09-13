import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const exists=(rel)=>fs.existsSync(path.join(ROOT,rel));

test('character art lock is scoped to Character Creator and Captain and selects culture/religion at runtime',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/data-character-art="culture-religion-v2"/);
  assert.match(main,/IMPLEMENTED_CHARACTER_CULTURE_PACKS[^\n]*\["skeldran"\]/);
  assert.match(main,/IMPLEMENTED_CREATOR_CULTURE_PACKS[^\n]*\["skeldran","asterian"\]/);
  assert.match(main,/IMPLEMENTED_CHARACTER_RELIGION_PACKS[^\n]*\["old_gods","covenant"\]/);
  assert.match(main,/syncCreatorCharacterTheme\(form\)/);
  assert.match(main,/characterThemeAttributes\(s\.player\.character\.culture,s\.player\.character\.religion\)/);
  assert.equal((main.match(/data-character-structure="purpose-painted-lock-candidate"/g)??[]).length,2);
});

test('Skeldran pack uses transparent frame assets rather than full-panel painted backgrounds',()=>{
  const css=read('public/alpha/styles.css');
  for(const asset of ['outer_frame.png','dark_panel_frame.png','paper_panel_frame.png','portrait_frame.png','header_ornament.png','faith_socket.png']){
    assert.equal(exists(`public/art/ui/character-themes/culture/skeldran/${asset}`),true,asset);
  }
  assert.match(css,/border-image-source:var\(--character-culture-outer-frame\)/);
  assert.match(css,/border-image-source:var\(--character-culture-dark-frame\)/);
  assert.match(css,/border-image-source:var\(--character-culture-paper-frame\)/);
  assert.match(css,/border-image-source:var\(--character-culture-portrait-frame\)/);
  assert.match(css,/character-structure-pane\{[\s\S]*background-image:none!important/);
  assert.match(css,/character-structure-page\{[\s\S]*background-image:none!important/);
  const paneRule=css.match(/\.creator-production-screen\[data-culture-pack=\"skeldran\"\] \.character-structure-pane\{[\s\S]*?\n\}/)?.[0]??'';
  const pageRule=css.match(/\.captain-sheet-screen\[data-culture-pack=\"skeldran\"\] \.character-structure-page\{[\s\S]*?\n\}/)?.[0]??'';
  assert.doesNotMatch(paneRule,/character-culture/i);
  assert.doesNotMatch(pageRule,/character-culture/i);
});

test('creator art frames wrap the locked grid cells instead of becoming the scroll/content owner',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/character-art-cell character-art-rail/);
  assert.match(main,/character-art-cell character-art-pane/);
  assert.match(main,/character-art-cell character-art-side/);
  assert.match(main,/character-culture-frame/);
  assert.match(css,/character-art-cell>\.character-structure-pane\{overflow:auto!important\}/);
  assert.match(css,/character-culture-frame[\s\S]*pointer-events:none/);
});

test('religion remains a small accent mounted in a culture-built socket',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/character-faith-socket/);
  assert.equal(exists('public/art/ui/character-themes/religion/old_gods/accent_mark.png'),true);
  assert.equal(exists('public/art/ui/character-themes/religion/covenant/accent_mark.png'),true);
  assert.match(css,/background-image:var\(--character-faith-mark\),var\(--character-culture-faith-socket\)/);
  assert.match(css,/\[data-religion-pack="none"\] \.character-faith-socket\{display:none\}/);
});

test('unimplemented cultures stay neutral and Asterian remains creator-only until Captain is fitted',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/const culturePack=culturePacks\.has\(culture\)\?culture:"neutral"/);
  assert.match(main,/characterThemeAttributes\(c\.culture,c\.religion,IMPLEMENTED_CREATOR_CULTURE_PACKS\)/);
  assert.match(main,/characterThemeAttributes\(s\.player\.character\.culture,s\.player\.character\.religion\)/);
  assert.match(css,/\[data-culture-pack="neutral"\][\s\S]*character-culture-frame[\s\S]*display:none!important/);
});

test('theme manifest records frame-around-code architecture',()=>{
  const manifest=JSON.parse(read('public/art/ui/character-themes/CHARACTER_THEME_PACK_MANIFEST.json'));
  assert.equal(manifest.version,2);
  assert.deepEqual(manifest.scope,['character_creator','captain_sheet']);
  assert.match(manifest.integration,/frame assets wrap locked UI cells/i);
  const skeldran=JSON.parse(read('public/art/ui/character-themes/culture/skeldran/manifest.json'));
  assert.equal(skeldran.role,'primary_culture_frame_pack');
  assert.equal(skeldran.geometryOwner,'code');
});
