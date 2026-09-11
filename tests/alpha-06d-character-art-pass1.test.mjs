import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');

test('rejected background-skin Character Art Pass 1 is superseded by frame-around-code v2',()=>{
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/data-character-art="culture-religion-v2"/);
  assert.doesNotMatch(main,/data-character-art="culture-religion-v1"/);
  assert.match(css,/Character Creator \+ Captain Purpose-Painted Lock Pass 1A/);
  assert.doesNotMatch(css,/Character \/ Captain Purpose-Painted Art Pass 1\n/);
});

test('screen architecture records code-owned attachment geometry and art-owned frame materials',()=>{
  const architecture=read('src/ui/screenArchitecture.ts');
  assert.match(architecture,/screenId:"character_creator"[\s\S]*?"culture frame attachment geometry":"code"[\s\S]*?"culture frame\/material art":"art"/);
  assert.match(architecture,/screenId:"character_sheet"[\s\S]*?"religion accent socket geometry":"code"[\s\S]*?"religion accent art":"art"/);
});

test('presentation-only correction does not change R2 package or save schema',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.equal(pkg.version,'0.6.0-alpha.d.r2');
  const create=read('src/game/createGame.ts');
  assert.match(create,/schemaVersion:\s*12/);
});
