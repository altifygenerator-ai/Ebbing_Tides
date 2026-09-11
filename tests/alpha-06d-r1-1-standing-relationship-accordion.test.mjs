import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const main=readFileSync(join(root,'src/alpha/main.ts'),'utf8');
const css=readFileSync(join(root,'public/alpha/styles.css'),'utf8');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));

function slice(startMarker,endMarker){
  const start=main.indexOf(startMarker); assert.notEqual(start,-1,`missing ${startMarker}`);
  const end=main.indexOf(endMarker,start+startMarker.length); assert.notEqual(end,-1,`missing ${endMarker}`);
  return main.slice(start,end);
}

test('R1.1 advances presentation only and keeps persistent law schema at v12',()=>{
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.rpg-r1(?:\.[12])?|0\.6\.0-alpha\.d\.a0-(?:1[abc]|2[abcd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  const createGame=readFileSync(join(root,'src/game/createGame.ts'),'utf8');
  assert.match(createGame,/schemaVersion:\s*12/);
});

test('captain standing relationships and local standing use scalable native accordions',()=>{
  const captain=slice('function renderCaptainOverview','function renderCaptainGear');
  assert.match(captain,/record-accordion/);
  assert.match(captain,/accordion\("Standing & Law","Known Powers"/);
  assert.match(captain,/accordion\("Personal Relationships","People Who Know You"/);
  assert.match(captain,/accordion\("Ports","Local Standing"/);
  assert.match(captain,/<details class="record-accordion/);
  assert.match(captain,/<summary class="record-accordion-summary">/);
});

test('collapsed summaries retain counts priority relationship and urgent legal state',()=>{
  const captain=slice('function renderCaptainOverview','function renderCaptainGear');
  assert.match(captain,/activeWarrantCount/);
  assert.match(captain,/urgentFactionId/);
  assert.match(captain,/standingSummarySecondary=.*legalStatusLabel/);
  assert.match(captain,/relationshipSummaryPrimary/);
  assert.match(captain,/relationshipLead/);
  assert.match(captain,/localSummarySecondary=currentKnownPort/);
});

test('large lists default closed while small or urgent sections remain immediately readable',()=>{
  const captain=slice('function renderCaptainOverview','function renderCaptainGear');
  assert.match(captain,/standingOpen=knownFactionIds\.length<=3\|\|Boolean\(urgentFactionId\)/);
  assert.match(captain,/relationshipsOpen=knownRelationships\.length<=4/);
  assert.match(captain,/localOpen=knownPorts\.length<=4/);
});

test('personal relationship expansion is no longer capped at six entries',()=>{
  const relationships=slice('function knownRelationshipCharacters','function companyFeelingTowardCaptain');
  assert.match(relationships,/function knownRelationshipRows\(s:GameState,limit\?:number\)/);
  assert.doesNotMatch(relationships,/limit=6/);
  assert.match(relationships,/typeof limit==="number"\?all\.slice/);
});

test('accordion geometry is fixed in code and art-safe for later painted headers',()=>{
  assert.match(css,/RPG R1\.1 — scalable Standing \/ Relationships \/ Local Standing accordions/);
  assert.match(css,/\.record-accordion-summary\{[\s\S]*min-height:68px/);
  assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(150px,auto\) 20px/);
  assert.match(css,/\.record-accordion-body\{[\s\S]*padding:12px 0 2px/);
  assert.match(css,/\.record-accordion\[open\]>\.record-accordion-summary::after/);
});
