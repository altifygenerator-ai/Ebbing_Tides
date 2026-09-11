import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const css=readFileSync(join(root,'public/alpha/styles.css'),'utf8');
const architecture=readFileSync(join(root,'src/ui/screenArchitecture.ts'),'utf8');

test('painted experiment assets are preserved but structural roots actively suppress manuscript ornament',()=>{
  for(const file of ['manuscript_page_painted_safe.webp','manuscript_page_ledger_painted.webp','manuscript_journal_spread.webp']) assert.ok(existsSync(join(root,'public/art/ui/manuscript',file)),file);
  assert.match(css,/\.character-structure-screen \.manuscript-cornerwork,[\s\S]*display:none!important/);
  assert.match(css,/\.character-structure-pane[\s\S]*background-image:none!important/);
  assert.match(css,/\.character-structure-journal[\s\S]*background-image:none!important/);
  assert.doesNotMatch(architecture,/screenId:"journal_intelligence"[^\n]*ui\.manuscript/);
});
