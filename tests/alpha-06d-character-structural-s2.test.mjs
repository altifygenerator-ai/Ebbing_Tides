import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const main=readFileSync(join(root,'src/alpha/main.ts'),'utf8');
const css=readFileSync(join(root,'public/alpha/styles.css'),'utf8');
const architecture=readFileSync(join(root,'src/ui/screenArchitecture.ts'),'utf8');
const createGame=readFileSync(join(root,'src/game/createGame.ts'),'utf8');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));

function slice(startMarker,endMarker){
  const start=main.indexOf(startMarker); assert.notEqual(start,-1,`missing ${startMarker}`);
  const end=main.indexOf(endMarker,start+startMarker.length); assert.notEqual(end,-1,`missing ${endMarker}`);
  return main.slice(start,end);
}

test('S2 advances the structural baseline without changing save schema',()=>{
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.characterstruct(?:2|3)|0\.6\.0-alpha\.d\.rpg-r1(?:\.[12])?|0\.6\.0-alpha\.d\.a0-(?:1[abc]|2[abcd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  assert.match(createGame,/schemaVersion:\s*12/);
});

test('creator review retains the structural S2 surface while the later UX lock gives training a fuller toolbox breakdown',()=>{
  const creator=slice('function renderCreation','function creationFromForm');
  assert.match(creator,/creator-review-pane/);
  assert.match(creator,/creator-review-columns/);
  assert.match(creator,/creatorToolboxHtml/);
  assert.match(creator,/Major choice effects/);
  assert.match(css,/CHARACTER UI STRUCTURAL S2/);
  assert.match(css,/\.creator-review-pane[\s\S]*max-width:1180px/);
  assert.match(css,/\.creator-review-columns[\s\S]*grid-template-columns/);
  assert.match(css,/\.creator-toolbox-panel/);
});

test('captain relationship and capability text is explicitly readable on parchment',()=>{
  assert.match(css,/\.character-structure-page \.relationship-badge[\s\S]*color:#3f2f1f/);
  assert.match(css,/\.character-structure-page \.specialization-row small[\s\S]*color:#645b4e/);
  assert.match(css,/\.character-condition-page>\.manuscript-empty[\s\S]*margin:18px 30px 0/);
  assert.match(main,/Personal Relationships[\s\S]*People Who Know You/);
});

test('crew separates ordinary company sentiment from named officer relationships',()=>{
  const crew=slice('function renderCrew','function renderPeople');
  assert.match(main,/function companyFeelingTowardCaptain/);
  assert.match(crew,/Ordinary company/);
  assert.match(crew,/Feeling toward captain/);
  assert.match(crew,/Officers & Specialists/);
  assert.match(crew,/Toward Captain/);
  assert.match(crew,/relationshipStatus\(npc\)/);
  assert.match(crew,/structuralCrewPortrait\(npc\)/);
  assert.doesNotMatch(crew,/relationshipToPlayer\.(trust|respect|fear|affection|suspicion|hatred|obligation)/);
  assert.match(css,/\.crew-production-portrait[\s\S]*width:62px/);
});

test('ship status is grouped and the hero exposes compact particulars plus refit icon slots',()=>{
  const ship=slice('function renderShip','function renderMarket');
  assert.match(ship,/renderStatusGroup\("Vessel"/);
  assert.match(ship,/renderStatusGroup\("Company"/);
  assert.match(ship,/renderStatusGroup\("Stores"/);
  assert.match(ship,/ship-production-particulars/);
  assert.match(ship,/Cruise/);
  assert.match(ship,/Maneuver/);
  assert.match(ship,/Seaworthiness/);
  assert.match(ship,/ship-refit-icon-slot/);
  assert.match(ship,/refit\.description/);
});

test('port outfitter uses real item art and inventory-family item rows',()=>{
  const captain=slice('function renderCaptain','function renderCrewInspector');
  assert.match(captain,/outfitter-structural-shell/);
  assert.match(captain,/outfitter-stock-item/);
  assert.match(captain,/ASSET_BY_ID\[def\.artAssetId\?\?def\.id\]/);
  assert.match(captain,/outfitter-item-icon/);
  assert.match(css,/\.outfitter-stock-grid[\s\S]*repeat\(2,minmax\(0,1fr\)\)/);
});

test('screen architecture records S2 code/art ownership explicitly',()=>{
  assert.match(architecture,/screenId:"crew_roster"[\s\S]*?"ordinary company block":"code"[\s\S]*?"portrait slots":"code"[\s\S]*?"portrait images":"art"[\s\S]*?"named relationship labels":"code"/);
  assert.match(architecture,/screenId:"ship_management"[\s\S]*?"ship particulars":"code"[\s\S]*?"status groups":"code"[\s\S]*?"refit icon slots":"code"[\s\S]*?"refit icon art":"art"/);
});
