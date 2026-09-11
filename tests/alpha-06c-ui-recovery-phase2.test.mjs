import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ART_LAYOUT_REGISTRY } from '../public/alpha/js/artLayouts/registry.js';
import { ASSET_BY_ID, ASSET_REGISTRY } from '../public/alpha/js/data/seed/assets.js';
import { SCREEN_ARCHITECTURE_BY_ID } from '../public/alpha/js/ui/screenArchitecture.js';

const root=fileURLToPath(new URL('..',import.meta.url));
const source=(rel)=>readFileSync(join(root,rel),'utf8');

function pngSize(rel){
  const b=readFileSync(join(root,rel));
  assert.equal(b.toString('ascii',1,4),'PNG');
  return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
}

test('Phase 2 production architecture classifies all major player-facing screens before implementation',()=>{
  const required=['main_menu','character_creator','character_sheet','inventory_equipment','crew_roster','ship_management','port_work_shipyard','cargo','market','navigation','port','npc_dialogue','journal_intelligence','naval_combat','personal_combat','boarding','history','genealogy_dynasties','codex','event_popup','settings','save_load'];
  for(const id of required){
    const def=SCREEN_ARCHITECTURE_BY_ID[id];
    assert.ok(def,`missing screen architecture: ${id}`);
    assert.ok(['art_anchored','art_skinned_dynamic','environment','hybrid','utility'].includes(def.architecture));
    assert.ok(['none','region_only','page'].includes(def.scrollPolicy));
    assert.ok(def.logicalDesignSize.width>0&&def.logicalDesignSize.height>0);
  }
});

test('Inventory and Market are the only Phase 2 gold-standard migrations',()=>{
  const gold=Object.values(SCREEN_ARCHITECTURE_BY_ID).filter((screen)=>screen.migrationPriority==='gold_standard').map((screen)=>screen.screenId).sort();
  assert.deepEqual(gold,['inventory_equipment','market']);
  assert.equal(SCREEN_ARCHITECTURE_BY_ID.inventory_equipment.architecture,'hybrid');
  assert.equal(SCREEN_ARCHITECTURE_BY_ID.market.architecture,'art_skinned_dynamic');
});

test('gold-standard visual structures have one declared geometry owner',()=>{
  const inventory=SCREEN_ARCHITECTURE_BY_ID.inventory_equipment.geometryOwners;
  const market=SCREEN_ARCHITECTURE_BY_ID.market.geometryOwners;
  assert.equal(inventory['equipment slot frames'],'art');
  for(const key of ['equipment hitboxes','equipped item icons','inventory grid','inventory item icons','filters','item detail','character summary values']) assert.equal(inventory[key],'code');
  assert.equal(market['environment backdrop'],'art');
  for(const key of ['ledger frame','table','rows','columns','trade buttons','pagination','summary panel']) assert.equal(market[key],'code');
});

test('reference art is explicitly separated from runtime art usage',()=>{
  const valid=new Set(['reference','runtime_base','runtime_component','runtime_overlay','content_art','environment','provisional',undefined]);
  for(const asset of ASSET_REGISTRY) assert.ok(valid.has(asset.artUsage),`invalid artUsage ${asset.assetId}: ${asset.artUsage}`);
  for(const layout of Object.values(ART_LAYOUT_REGISTRY)){
    const asset=ASSET_BY_ID[layout.runtimeBaseAssetId??layout.assetId];
    assert.ok(asset,`missing runtime asset ${layout.layoutId}`);
    assert.notEqual(asset.artUsage,'reference',`${layout.layoutId} illegally renders reference art`);
  }
});

test('equipment runtime bases are clean high-resolution production derivatives and not legacy empty files',()=>{
  const male=ASSET_BY_ID['ui.character.equipment.male.runtime'];
  const female=ASSET_BY_ID['ui.character.equipment.female.runtime'];
  assert.equal(male.artUsage,'runtime_base');
  assert.equal(female.artUsage,'runtime_base');
  assert.match(male.path,/equipment_male_runtime_v2\.png$/);
  assert.match(female.path,/equipment_female_runtime_v2\.png$/);
  for(const asset of [male,female]){
    const size=pngSize(`public${asset.path}`);
    assert.ok(size.width>=1600,`${asset.assetId} is not desktop-production width`);
    assert.ok(size.height>=760,`${asset.assetId} is not desktop-production height`);
  }
  assert.equal(existsSync(join(root,'public/art/ui/runtime/equipment_male_empty.png')),false);
  assert.equal(existsSync(join(root,'public/art/ui/runtime/equipment_female_empty.png')),false);
});

test('equipment uses ArtDirectedCanvas only for anchored regions while code owns the dynamic grid',()=>{
  const main=source('src/alpha/main.ts');
  const css=source('public/alpha/styles.css');
  assert.match(main,/renderArtFirstEquipmentScreen/);
  assert.match(main,/equipment-grid-inside-art/);
  assert.match(main,/renderEquipmentSlotLayers/);
  assert.match(css,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(css,/\.equipment-slot-hit\{border:0!important;background:transparent!important/);
});

test('Market is semantic Art-Skinned Dynamic UI and does not render the legacy painted table base',()=>{
  assert.equal(ART_LAYOUT_REGISTRY['ui.market.ledger'],undefined);
  const main=source('src/alpha/main.ts');
  assert.match(main,/market-production-screen/);
  assert.match(main,/market-production-table/);
  assert.match(main,/renderReferenceGhost\(referencePath/);
  assert.doesNotMatch(main,/renderMappedArtScreen\("ui\.market\.ledger"/);
  assert.doesNotMatch(main,/PRESENTATION_BASE_ART\.market/);
  assert.equal(existsSync(join(root,'src/artLayouts/market/market.ts')),false);
});

test('logical UI scale is independent from native PNG pixel dimensions',()=>{
  const host=source('src/artLayouts/ArtScreenHost.ts');
  const viewport=source('src/ui/GameViewport.ts');
  assert.match(host,/const logicalWidth = manifest\.logicalWidth/);
  assert.match(host,/const scale = renderWidth \/ logicalWidth/);
  assert.doesNotMatch(host,/const scale = renderWidth \/ nativeWidth/);
  assert.match(viewport,/LOGICAL_GAME_VIEWPORT = \{ width: 1600, height: 900 \}/);
  assert.match(viewport,/ResizeObserver/);
});

test('ArtScreenHost fits coordinate-authoritative art by both available width and height with no min-width hack',()=>{
  const host=source('src/artLayouts/ArtScreenHost.ts');
  const css=source('public/alpha/styles.css');
  assert.match(host,/Math\.min\(hostWidth, hostHeight \* ratio\)/);
  assert.match(host,/const renderHeight = renderWidth \/ ratio/);
  assert.doesNotMatch(css,/\.art-screen-host[^}]*min-width\s*:\s*(?:900|980|1100)px/s);
});

test('Reference Ghost Mode provides opacity, live/reference/both and blink comparison',()=>{
  const ghost=source('src/artLayouts/ReferenceGhost.ts');
  assert.match(ghost,/data-reference-opacity/);
  assert.match(ghost,/data-reference-mode="live"/);
  assert.match(ghost,/data-reference-mode="both"/);
  assert.match(ghost,/data-reference-mode="reference"/);
  assert.match(ghost,/data-reference-blink/);
  assert.match(ghost,/event\.altKey && event\.shiftKey && event\.code === "KeyG"/);
});

test('fixed gold-standard screens declare no page scroll and source contains no width-forcing production hack',()=>{
  assert.equal(SCREEN_ARCHITECTURE_BY_ID.inventory_equipment.scrollPolicy,'none');
  assert.equal(SCREEN_ARCHITECTURE_BY_ID.market.scrollPolicy,'none');
  const css=source('public/alpha/styles.css');
  assert.match(css,/html,body,#app\{[^}]*overflow:hidden/s);
  assert.match(css,/\.market-production-screen\{[^}]*overflow:hidden/s);
});

test('Equipment gold standard wires its approved content reference into Reference Ghost Mode',()=>{
  const main=source('src/alpha/main.ts');
  assert.match(main,/manifest\.referenceAssetId \? ASSET_BY_ID\[manifest\.referenceAssetId\]\?\.path/);
  assert.match(main,/referenceArtPath/);
  assert.match(main,/approved equipment reference/);
});
