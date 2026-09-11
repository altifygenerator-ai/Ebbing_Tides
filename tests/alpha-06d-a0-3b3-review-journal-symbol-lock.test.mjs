import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');

test('A0.3B3 advances the pre-art UX lock without changing save schema', async()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.a0-3(?:b3|c)|0\.6\.0-alpha\.d\.r2)$/);
  const { createGame, DEFAULT_CHARACTER_CHOICES }=await import('../public/alpha/js/game/createGame.js');
  const state=createGame({...DEFAULT_CHARACTER_CHOICES,name:'B3 Test Captain'},'a0-3b3-schema');
  assert.equal(state.schemaVersion,12);
});

test('creator Review owns an internal vertical scroll instead of clipping long builds',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/id="creator-review" class="creator-review creator-review-scroll"/);
  assert.doesNotMatch(main,/creator-review-note/);
  assert.match(css,/\.creator-review-pane:not\(\[hidden\]\)[\s\S]*grid-template-rows:auto minmax\(0,1fr\)/);
  assert.match(css,/\.creator-review-scroll[\s\S]*overflow-y:auto!important/);
  assert.match(css,/scrollbar-gutter:stable/);
});

test('creator Review removes duplicated at-a-glance skill prose and prioritizes unique abilities before strongest skills',()=>{
  const main=read('src/alpha/main.ts');
  const refresh=main.match(/function refreshReview\([\s\S]*?\n  };/)?.[0] ?? main;
  assert.doesNotMatch(refresh,/creatorImpactSummary\(choices\)/);
  const toolbox=main.match(/function creatorToolboxHtml\([\s\S]*?\n}/)?.[0] ?? '';
  const abilityAt=toolbox.indexOf('${abilities}${specs}${schematics}');
  const strongestAt=toolbox.indexOf('Strongest starting skills');
  assert.ok(abilityAt>=0 && strongestAt>=0 && abilityAt<strongestAt);
});

test('journal facing pages reserve one identical heading band so entry rows align across the spine',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/journal-page-heading journal-continuation-heading/);
  assert.match(main,/journal-continuation-heading"><small class="journal-folio-meta">Captain/);
  assert.doesNotMatch(main,/journal-continuation-meta"><span>Captain/);
  assert.match(css,/\.character-structure-journal \.journal-page-heading\{[\s\S]*height:calc\(76px \* var\(--ui-scale\)\)[\s\S]*min-height:calc\(76px \* var\(--ui-scale\)\)/);
  assert.match(css,/\.journal-continuation-heading\{[\s\S]*align-items:flex-end[\s\S]*justify-content:flex-end/);
});

test('journal continuation naming remains section-generic for every Journal tab',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/const sectionHeading=journalPage===0\?labels\[journalTab\]:`\$\{labels\[journalTab\]\} · Continued`/);
  assert.match(main,/const sectionEyebrow=journalPage===0\?labels\[journalTab\]:"Continued"/);
});

test('People and conversation cards keep portraits and relationship state but no longer render identity-symbol strips',()=>{
  const main=read('src/alpha/main.ts');
  const compact=main.match(/function compactNpcContextCard\([\s\S]*?\n}/)?.[0] ?? '';
  const dialogue=main.match(/function renderDialoguePanel\([\s\S]*?\n}/)?.[0] ?? '';
  assert.match(compact,/structuralNpcPortrait\(npc,"context"\)/);
  assert.match(compact,/relationshipStatus\(npc\)/);
  assert.doesNotMatch(compact,/markStripHtml|symbol-context-panel|context-overlay npc-public/);
  assert.match(dialogue,/structuralNpcPortrait\(npc,"dialogue"\)/);
  assert.match(dialogue,/relationshipStatus\(npc\)/);
  assert.doesNotMatch(dialogue,/markStripHtml|symbol-context-panel|context-overlay dialogue|const marks/);
});
