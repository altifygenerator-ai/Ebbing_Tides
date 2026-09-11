import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const main=readFileSync(join(root,'src/alpha/main.ts'),'utf8');
const architecture=readFileSync(join(root,'src/ui/screenArchitecture.ts'),'utf8');

test('experimental manuscript art remains history/reference while Creator uses its dedicated culture frame pack',()=>{
  for(const file of ['manuscript_page_ornate.webp','manuscript_page_ledger.webp','manuscript_journal_spread.webp']){
    assert.ok(existsSync(join(root,'public/art/ui/manuscript',file)),file);
  }
  assert.match(architecture,/screenId:"journal_intelligence"[\s\S]*?runtimeArtRequired:\[\]/);
  assert.match(architecture,/screenId:"character_creator"[\s\S]*?runtimeArtRequired:\["portrait content art","character culture frame pack","religion accent pack when applicable"\]/);
});

test('live markup keeps structural roots; Creator/Captain can add frame art without returning to manuscript runtime roots',()=>{
  for(const token of ['creator-production-screen character-structure-screen','captain-sheet-screen character-structure-screen','crew-production-screen character-structure-screen','journal-production-screen character-structure-screen']) assert.match(main,new RegExp(token));
  assert.match(main,/data-character-structure="pre-art"/);
  assert.match(main,/data-character-structure="purpose-painted-lock-candidate"/);
  assert.doesNotMatch(main,/creator-production-screen manuscript-screen/);
  assert.doesNotMatch(main,/captain-sheet-screen manuscript-screen/);
});
