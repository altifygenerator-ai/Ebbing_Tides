import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { PORTRAIT_CHOICES } from '../public/alpha/js/data/seed/portraits.js';
import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';
import { REGIONAL_MAP_LAYERS } from '../public/alpha/js/data/seed/worldMap.js';

const here=dirname(fileURLToPath(import.meta.url));
const root=join(here,'..');

function game(seed='alpha05c',patch={}){
  return createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'Update C Captain',...patch},seed);
}

test('0.5C corrective ships a dedicated waist-up Skeldran player pool and excludes general reference art',()=>{
  assert.ok(PORTRAIT_CHOICES.length>=8);
  assert.ok(PORTRAIT_CHOICES.filter(row=>row.sex==='female').length>=3);
  assert.ok(PORTRAIT_CHOICES.filter(row=>row.sex==='male').length>=4);
  assert.deepEqual(new Set(PORTRAIT_CHOICES.map(row=>row.ageBand)),new Set(['young_adult','adult','mature']));
  const poses=new Set(PORTRAIT_CHOICES.flatMap(row=>row.poseTags??[]));
  const environments=new Set(PORTRAIT_CHOICES.flatMap(row=>row.environmentTags??[]));
  const presentations=new Set(PORTRAIT_CHOICES.flatMap(row=>row.presentationTags??[]));
  const professions=new Set(PORTRAIT_CHOICES.flatMap(row=>row.professionTags));
  assert.ok(poses.size>=8,`expected broad pose variety, got ${poses.size}`);
  assert.ok(environments.size>=8,`expected broad environment variety, got ${environments.size}`);
  assert.ok(presentations.size>=8,`expected broad presentation variety, got ${presentations.size}`);
  for(const role of ['sailor','navigator','merchant_clerk','apprentice_engineer','shipwright','scholar','priest','gunner']) assert.ok(professions.has(role),`${role} should be represented`);
  const ports=new Set(PORTRAIT_CHOICES.flatMap(row=>row.homeSettlementTags??[]));
  for(const id of ['port.veyrholm','port.ironhaven','port.stormvik','port.thorenfjord']) assert.ok(ports.has(id),`${id} should be represented`);
  const referenceOnly=[
    'portrait.skeldra.male.naval_captain.anchor',
    'portrait.skeldra.female.shipowner_studio.01',
    'portrait.skeldra.male.naval_officer_studio.01',
    'portrait.skeldra.male.old_gods_priest.01'
  ];
  for(const id of referenceOnly) assert.equal(PORTRAIT_CHOICES.some(row=>row.portraitId===id),false,`${id} should remain reference art, not a selectable player portrait`);
});

test('every selectable portrait resolves to a dedicated 4:5 player asset while source/reference masters remain separate',()=>{
  for(const portrait of PORTRAIT_CHOICES){
    assert.match(portrait.portraitId,/^portrait\.skeldra\./);
    assert.ok(portrait.ancestryTags.includes('skeldran'));
    assert.ok(portrait.cultureTags.includes('skeldran'));
    const asset=ASSET_BY_ID[portrait.assetId];
    assert.ok(asset,`${portrait.assetId} missing from asset registry`);
    assert.equal(asset.type,'PORTRAIT');
    assert.match(asset.path,/\/portraits\/skeldra\/player_v1\/.*_player_v1\.webp$/);
    assert.ok(asset.gameplayRole?.includes('character_creation'));
    const path=join(root,'public',asset.path.replace(/^\//,''));
    assert.ok(existsSync(path),`${asset.path} missing`);
    assert.ok(statSync(path).size>75_000,`${asset.path} looks like an empty/placeholder file`);
  }
  for(const id of ['character.skeldra.player.male.naval_captain.anchor','character.skeldra.player.female.shipowner_studio.01','character.skeldra.player.male.naval_officer_studio.01','character.skeldra.player.male.old_gods_priest.01']){
    const asset=ASSET_BY_ID[id];
    assert.equal(asset.status,'CURATED_REFERENCE');
    assert.equal(asset.gameplayRole?.includes('character_creation'),false);
  }
});

test('curated portrait identity persists while culture/religion/profession remain player choices',()=>{
  const portrait=PORTRAIT_CHOICES.find(row=>row.sex==='female' && row.religionTags.includes('covenant'));
  assert.ok(portrait);
  const state=game('portrait-persist',{sex:'female',portraitId:portrait.portraitId,religion:'covenant',recentProfession:'navigator'});
  const c=state.player.character;
  assert.equal(c.portraitId,portrait.portraitId);
  assert.equal(c.visualDna.ancestryPrimary,'skeldran');
  assert.equal(c.visualDna.clothingCulture,'skeldran');
  assert.equal(c.visualDna.religionPresentation,'covenant');
  assert.equal(c.visualDna.occupationPresentation,'navigator');
});

test('later ancestries remain valid character records even before their curated art libraries exist',()=>{
  const state=game('future-library',{ancestry:'serathi',culture:'serathi',religion:'covenant',portraitId:'portrait.pending.regional'});
  assert.equal(state.player.character.ancestry,'serathi');
  assert.equal(state.player.character.visualDna.ancestryPrimary,'serathi');
  assert.equal(state.player.character.portraitId,'portrait.pending.regional');
});

test('custom portrait path stores structured Visual DNA and a stable local asset path without changing core rules',()=>{
  const request={enabled:true,ancestryPrimary:'skeldran',sex:'male',ageBand:'adult',homelandRegion:'skeldra',homeSettlementId:'port.ironhaven',startingLocationId:'port.veyrholm',culture:'skeldran',religion:'old_gods',profession:'shipwright',socialOrigin:'artisan_household',build:'broad',complexion:'fair weathered',faceCharacter:'broad',eyeColor:'gray green',hairColor:'strawberry blond',hairStyle:'short practical',facialHair:'trimmed beard',marks:['small brow scar']};
  const state=game('custom-path',{portraitId:'portrait.custom.test123',customPortrait:request,customPortraitAssetPath:'/generated/portraits/custom_test123.png',recentProfession:'shipwright'});
  const c=state.player.character;
  assert.equal(c.customPortraitAssetPath,'/generated/portraits/custom_test123.png');
  assert.equal(c.visualDna.build,'broad');
  assert.equal(c.visualDna.eyeColor,'gray green');
  assert.equal(c.visualDna.occupationPresentation,'shipwright');
  assert.deepEqual(c.visualDna.permanentMarks,['small brow scar']);
});

test('0.6D labeled world atlas is the sole active navigation painting while regional-layer architecture remains available',()=>{
  assert.equal(REGIONAL_MAP_LAYERS.length,1);
  const layer=REGIONAL_MAP_LAYERS[0];
  assert.equal(layer.id,'layer.world.labeled.v06d');
  assert.equal(layer.development,'active');
  assert.deepEqual(layer.globalBounds,{x:0,y:0,width:120,height:80});
  const asset=ASSET_BY_ID[layer.assetId];
  assert.equal(asset.assetId,'map.world_atlas.labeled_v06d');
  assert.equal(asset.status,'APPROVED_ANCHOR');
  assert.deepEqual(asset.mapRegistration?.globalBounds,layer.globalBounds);
  assert.equal(asset.mapRegistration?.nativePixelWidth,6000);
  assert.equal(asset.mapRegistration?.nativePixelHeight,4000);
  const path=join(root,'public',asset.path.replace(/^\//,''));
  assert.ok(existsSync(path));
  assert.ok(statSync(path).size>5_000_000);
  assert.equal(ASSET_BY_ID['map.skeldra.region_layer.v05c'].status,'PROVISIONAL_REFERENCE');
});

test('0.5C UI renders registered map layers and custom generation is server-side only',()=>{
  const main=readFileSync(join(root,'src/alpha/main.ts'),'utf8');
  const server=readFileSync(join(root,'scripts/serve-alpha.mjs'),'utf8');
  assert.match(main,/map-layer-art/);
  assert.match(main,/regional-map-art/);
  assert.match(main,/map-zoom-step/);
  assert.match(main,/data-direction=\"out\"/);
  assert.match(main,/data-direction=\"in\"/);
  assert.match(main,/skill-value/);
  assert.match(main,/skill-rank/);
  assert.match(main,/specialization-row/);
  assert.match(main,/creator-page-title">Portrait/);
  assert.match(main,/rankCuratedPortraits/);
  assert.match(main,/\/api\/portrait\/generate/);
  assert.match(server,/OPENAI_API_KEY/);
  assert.match(server,/gpt-image-2/);
  assert.match(server,/\/v1\/images\/generations/);
  assert.doesNotMatch(main,/process\.env\.OPENAI_API_KEY|authorization:\s*`Bearer/,'browser code must never read or transmit the secret key');
});
