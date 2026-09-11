import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const css=readFileSync(join(root,'public/alpha/styles.css'),'utf8');
const main=readFileSync(join(root,'src/alpha/main.ts'),'utf8');

test('structural reset establishes explicit creator, captain, crew and journal geometry before art',()=>{
  assert.match(css,/CHARACTER PRESENTATION STRUCTURAL RESET/);
  assert.match(css,/\.character-structure-grid[\s\S]*grid-template-columns:190px minmax\(0,1fr\) 300px/);
  assert.match(css,/\.character-structure-layout[\s\S]*grid-template-columns:300px minmax\(0,1fr\)/);
  assert.match(css,/\.character-structure-ledger[\s\S]*width:min\(1380px,100%\)/);
  assert.match(css,/\.character-structure-journal[\s\S]*width:min\(1480px,100%\)/);
});

test('structural reset does not return these screens to ArtDirectedCanvas geometry',()=>{
  assert.doesNotMatch(main,/ArtDirectedCanvas[^\n]*(character|journal|crew)/i);
});
