import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');

test('A0.3B2 advances the UX lock without changing save schema ownership', async()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.a0-3(?:b[23]|c)|0\.6\.0-alpha\.d\.r2)$/);
  const { createGame, DEFAULT_CHARACTER_CHOICES }=await import('../public/alpha/js/game/createGame.js');
  const state=createGame({...DEFAULT_CHARACTER_CHOICES,name:'B2 Test Captain'},'a0-3b2-schema');
  assert.equal(state.schemaVersion,12);
});

test('known NPC portrait presentation is shared by People, institutions, and conversations',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/const STRUCTURAL_NPC_PORTRAIT_PATHS/);
  assert.match(main,/function structuralNpcPortrait\(/);
  assert.match(main,/function compactNpcContextCard\(/);
  assert.match(main,/structuralNpcPortrait\(npc,"context"\)/);
  assert.match(main,/structuralNpcPortrait\(npc,"dialogue"\)/);
  assert.match(main,/dialogue-character-portrait-frame/);
});

test('known-person presence uses actual port or docked ship state and does not invent portrait art',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/function npcPresentAtPort[\s\S]*npc\.locationPortId===portId[\s\S]*ship\?\.dockedAtPortId===portId/);
  assert.match(main,/function playerKnowsNpc[\s\S]*relationshipStatus\(npc\)!=="Neutral"/);
  assert.match(main,/const people = Object\.values\(s\.npcs\)\.filter\(\(npc\) => npcPresentAtPort\(s,npc,portId\) && playerKnowsNpc\(s,npc\)\)/);
  assert.match(main,/aria-label="Portrait not yet assigned"/);
  assert.doesNotMatch(main,/character\.pastor_elias_korr"\s*:\s*"\/art\/characters\/portraits/);
});

test('government and religion surfaces show relevant known people and can hold the conversation in place',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/function npcInstitutionMatch\(/);
  assert.match(main,/const knownHere=Object\.values\(s\.npcs\)\.filter\(npc=>npcPresentAtPort\(s,npc,portId\)&&playerKnowsNpc\(s,npc\)&&npcInstitutionMatch\(npc,kind\)\)/);
  assert.match(main,/Known people here/);
  assert.match(main,/const activeHere=activeDialogueNpcId&&knownHere\.some[\s\S]*renderDialoguePanel/);
});

test('DP badge has explicit readable label contrast on the captain sheet',()=>{
  const css=read('public/alpha/styles.css');
  assert.match(css,/\.character-structure-page \.advancement-points span\{color:#d8c18b!important\}/);
  assert.match(css,/\.character-structure-page \.advancement-points b\{color:#f4d88f!important\}/);
});

test('journal labels a section once per folio and only marks later folios continued',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/const sectionHeading=journalPage===0\?labels\[journalTab\]:`\$\{labels\[journalTab\]\} · Continued`/);
  assert.match(main,/const sectionEyebrow=journalPage===0\?labels\[journalTab\]:"Continued"/);
  assert.match(main,/journal-page-heading journal-continuation-heading/);
  assert.match(main,/Captain \$\{esc\(s\.player\.character\.name\)\}/);
  assert.doesNotMatch(main,/journal-continuation-page[\s\S]{0,450}<h3>\$\{esc\(sectionHeading\)\}<\/h3>/);
});

test('creator review prioritizes the main toolbox and avoids empty ability or specialization filler',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/Strongest starting skills/);
  assert.match(main,/\.slice\(0,6\)/);
  assert.match(main,/capability\.abilities\.length\?`<div class="creator-toolbox-subhead">Starting abilities/);
  assert.match(main,/capability\.specializations\.length\?`<div class="creator-toolbox-subhead">Starting specializations/);
  assert.match(main,/Major choice effects/);
  assert.match(main,/Other contextual effects/);
  assert.doesNotMatch(main,/No starting abilities or specializations/);
});

test('creator review uses its parent scroll owner instead of clipping the toolbox',()=>{
  const css=read('public/alpha/styles.css');
  assert.match(css,/\.character-structure-pane \.creator-review-pane\{height:auto!important;min-height:100%!important;overflow:visible!important\}/);
  assert.match(css,/creator-toolbox-attributes/);
  assert.match(css,/creator-toolbox-skills/);
});
