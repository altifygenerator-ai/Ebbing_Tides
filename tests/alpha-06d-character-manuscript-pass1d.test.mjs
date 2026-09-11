import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
const css=readFileSync(join(root,'public/alpha/styles.css'),'utf8');
const model=readFileSync(join(root,'src/game/createGame.ts'),'utf8');

test('Pass 1D presentation is superseded by the structural reset without schema change',()=>{
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.characterstruct(?:1|2|3)|0\.6\.0-alpha\.d\.rpg-r1(?:\.[12])?|0\.6\.0-alpha\.d\.a0-(?:1[abc]|2[abcd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  assert.match(model,/schemaVersion:\s*12/);
});

test('structural reset removes active painted shell behavior while retaining clean containment',()=>{
  assert.match(css,/\.character-structure-screen[\s\S]*background:var\(--char-shell\)!important/);
  assert.match(css,/\.character-structure-pane[\s\S]*background-image:none!important/);
  assert.match(css,/\.character-structure-page[\s\S]*background-image:none!important/);
  assert.match(css,/\.character-structure-scroll\{overflow:auto!important/);
});
