import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const css=readFileSync(join(root,'public/alpha/styles.css'),'utf8');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));

test('R1.2 keeps schema v12 and only advances the package patch version',()=>{
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.rpg-r1\.2|0\.6\.0-alpha\.d\.a0-(?:1[abc]|2[abcd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  const createGame=readFileSync(join(root,'src/game/createGame.ts'),'utf8');
  assert.match(createGame,/schemaVersion:\s*12/);
});

test('paired captain accordions stay symmetrical without forcing the longer relationship title onto a second line',()=>{
  assert.match(css,/RPG R1\.2 — final alignment \/ contrast cleanup before R2 discussion/);
  assert.match(css,/\.manuscript-two-up \.record-accordion-summary\{[\s\S]*min-height:72px/);
  assert.match(css,/\.manuscript-two-up \.record-accordion-heading>strong\{[\s\S]*font-size:20px!important;[\s\S]*white-space:nowrap/);
  assert.match(css,/@media\(max-width:980px\)[\s\S]*white-space:normal/);
});

test('specialization bonus and creator homeland culture faith summary use readable parchment ink contrast',()=>{
  assert.match(css,/\.specialization-row>span,[\s\S]*\.specialization-row>span strong\{[\s\S]*color:#4b3926!important;[\s\S]*opacity:1!important/);
  assert.match(css,/\.creator-identity-caption small\{[\s\S]*color:#6a563d!important;[\s\S]*opacity:1!important/);
  assert.match(css,/\.creator-identity-caption b\{[\s\S]*color:#3a2c1f!important;[\s\S]*opacity:1!important/);
});
