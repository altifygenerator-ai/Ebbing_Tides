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

test('S3 advances the pre-art structural baseline without a save-schema bump',()=>{
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.characterstruct3|0\.6\.0-alpha\.d\.rpg-r1(?:\.[12])?|0\.6\.0-alpha\.d\.a0-(?:1[abc]|2[abcd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  assert.match(createGame,/schemaVersion:\s*12/);
});

test('creator structural portrait drops identity symbol chips and exposes homeland culture and faith clearly',()=>{
  const creator=slice('function renderCreation','function creationFromForm');
  assert.doesNotMatch(creator,/creator-identity-preview|fullIdentityMarks\(/);
  assert.match(creator,/creator-identity-caption/);
  assert.match(creator,/<small>Homeland<\/small><b>/);
  assert.match(creator,/<small>Culture<\/small><b>/);
  assert.match(creator,/<small>Faith<\/small><b>/);
  assert.doesNotMatch(creator,/portraitPanel\.setAttribute\("style",identityStyle/);
});

test('creator training reserves attribute and skill art slots and uses one fixed help region instead of colliding floating tips',()=>{
  const creator=slice('function renderCreation','function creationFromForm');
  assert.match(creator,/structuralCharacterIconSlot\("attribute",attr\)/);
  assert.match(creator,/structuralCharacterIconSlot\("skill",skill\)/);
  assert.match(creator,/creator-training-help/);
  assert.match(creator,/data-training-description/);
  assert.match(creator,/updateTrainingHelp/);
  assert.doesNotMatch(creator,/class="check has-tooltip"[^\n]*coreSkill/);
  assert.match(css,/CHARACTER UI STRUCTURAL S3/);
  assert.match(css,/\.character-icon-slot\{[\s\S]*width:22px/);
  assert.match(css,/\.creator-training-help\{[\s\S]*grid-template-columns:130px/);
});

test('captain and officer capability rows reserve the same future icon geometry',()=>{
  const captain=slice('function renderCaptainOverview','function renderCaptainGear');
  const officer=slice('function renderCrewInspector','function renderCrew');
  assert.match(captain,/structuralCharacterIconSlot\("attribute",id\)/);
  assert.match(captain,/structuralCharacterIconSlot\("skill",id\)/);
  assert.match(officer,/structuralCharacterIconSlot\("attribute",id\)/);
  assert.match(officer,/structuralCharacterIconSlot\("skill",row\.id\)/);
  assert.match(architecture,/screenId:"character_sheet"[\s\S]*?"attribute icon slots":"code"[\s\S]*?"future attribute\/skill icon art":"art"/);
});

test('captain crew and ship structural screens no longer render the small identity-chip strips',()=>{
  const captain=slice('function renderCaptainSummary','function renderCaptainOverview');
  const officer=slice('function renderCrewInspector','function renderCrew');
  const crew=slice('function renderCrew','function renderPeople');
  const ship=slice('function renderShip','function renderMarket');
  assert.doesNotMatch(captain,/player-identity-corner|identityMarkHtml|markStripHtml/);
  assert.doesNotMatch(officer,/npc-detail|markStripHtml|symbol-context-panel/);
  assert.doesNotMatch(crew,/crew-production-mark|primaryIdentityMark\(npcIdentityPresentation\(npc\)\)/);
  assert.doesNotMatch(ship,/context-overlay ship-mark|shipIdentityMark\(s, ship\.id\)/);
});

test('ship status gives every row an icon gutter and uses available hull sails rigging morale cargo and supplies art',()=>{
  const ship=slice('function renderShip','function renderMarket');
  assert.match(ship,/Ship_Damage\/01_Hull_Damage\.png/);
  assert.match(ship,/Ship_Damage\/02_Sails_Damaged\.png/);
  assert.match(ship,/Ship_Damage\/03_Rigging_Damage\.png/);
  assert.match(ship,/Character_Conditions\/08_Morale\.png/);
  assert.match(ship,/Port_Dock\/01_cargo_crate\.png/);
  assert.match(ship,/Port_Dock\/02_barrel\.png/);
  assert.match(ship,/shipStatusIconSlot\(icon\|\|undefined,rowLabel\)/);
  assert.match(css,/\.ship-status-icon-slot\{[\s\S]*width:24px/);
  assert.match(architecture,/screenId:"ship_management"[\s\S]*?"status icon slots":"code"[\s\S]*?"status icon art":"art"/);
});

test('existing refit art is used where relevant while the refit icon slot remains stable for future fittings',()=>{
  const ship=slice('function renderShip','function renderMarket');
  assert.match(main,/SHIP_REFIT_ICON_PATHS/);
  assert.match(main,/"refit\.storm_rigging":"\/art\/ui\/ability-library\/Ship_Damage\/03_Rigging_Damage\.png"/);
  assert.match(main,/"refit\.reinforced_pumps":"\/art\/ui\/ability-library\/Ship_Damage\/04_Flooding\.png"/);
  assert.match(ship,/shipRefitIcon\(id,refit\.name\)/);
  assert.match(css,/\.ship-refit-icon-slot img\{[\s\S]*width:38px/);
});
