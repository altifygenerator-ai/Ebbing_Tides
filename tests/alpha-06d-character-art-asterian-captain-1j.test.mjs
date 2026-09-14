import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');

test('Asterian Captain resolves through the real Captain culture-pack path',()=>{
  const main=read('src/alpha/main.ts');
  assert.match(main,/IMPLEMENTED_CHARACTER_CULTURE_PACKS[^\n]*\["skeldran","asterian","serathi"\]/);
  assert.match(main,/characterThemeAttributes\(s\.player\.character\.culture,s\.player\.character\.religion\)/);
});

test('Asterian Captain keeps sticky dossier and chapter scroll geometry code-owned',()=>{
  const css=read('public/alpha/styles.css');
  const block=css.slice(css.indexOf('Production 1J — Asterian Civic-Maritime Captain'));
  assert.match(block,/\.character-structure-sidebar\{position:sticky!important/);
  assert.match(block,/\.character-structure-scroll\{[\s\S]*overflow:auto!important/);
  assert.match(block,/\.captain-manuscript-housing::before[\s\S]*border-image-source:var\(--asterian-captain-frame\)/);
  assert.match(block,/\.captain-manuscript-housing \.manuscript-edge,[\s\S]*\.manuscript-corner\{display:none!important\}/);
  assert.doesNotMatch(block,/background-size:100% 100%/,'Captain must not stretch one frame across variable chapter geometry');
});

test('Asterian Captain frames each page independently and uses distinct contextual headers',()=>{
  const css=read('public/alpha/styles.css');
  const block=css.slice(css.indexOf('Production 1J — Asterian Civic-Maritime Captain'));
  assert.match(block,/\.captain-page-history>\.manuscript-record-header[\s\S]*var\(--asterian-captain-history\)/);
  assert.match(block,/\.captain-page-capabilities>\.manuscript-record-header[\s\S]*var\(--asterian-captain-capabilities\)/);
  assert.match(block,/\.captain-page-condition>\.manuscript-record-header[\s\S]*var\(--asterian-captain-condition\)/);
  assert.match(block,/\.character-structure-main\{[\s\S]*gap:34px!important/);
});

test('Asterian Captain reuses the accepted palette and fitted register leaf without changing Creator selectors',()=>{
  const css=read('public/alpha/styles.css');
  const start=css.indexOf('Production 1J — Asterian Civic-Maritime Captain');
  const next=css.indexOf('Production 1K — Serathi Salt-Limestone Ledger Creator',start);
  const block=css.slice(start,next);
  assert.match(block,/--asterian-red:#741f1d/);
  assert.match(block,/--asterian-bronze:#a9753d/);
  assert.match(block,/border-image-source:var\(--asterian-register-tab\)/);
  assert.match(block,/border-image-slice:30 32 42 32 fill/);
  assert.doesNotMatch(block,/\.creator-production-screen/);
});
