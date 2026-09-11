import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  IDENTITY_MARKS,
  affiliationMarkForCharacter,
  governmentIdentityMarksForPort,
  primaryIdentityMark,
  religionIdentityMarksForPort,
  resolveIdentityPresentation,
  shipIdentityMarkForContext
} from '../public/alpha/js/data/seed/identitySymbols.js';
import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';
import { ART_LAYOUT_REGISTRY } from '../public/alpha/js/artLayouts/registry.js';

const root=fileURLToPath(new URL('..',import.meta.url));
const source=(rel)=>readFileSync(join(root,rel),'utf8');
const refRoot=join(root,'public/art/reference/symbols/main-identity-approved-2026-09-08');

test('main identity registry is limited to the approved four channels and 22 approved marks',()=>{
  const marks=Object.values(IDENTITY_MARKS);
  assert.equal(marks.length,22);
  assert.deepEqual([...new Set(marks.map(mark=>mark.kind))].sort(),['affiliation','ancestry','homeland','religion']);
  assert.equal(marks.some(mark=>/odal|aun|ash gull|rank|pennant|solar compass|civic hall/i.test(mark.label)),false);
});

test('ancestry religion homeland and affiliation resolve independently',()=>{
  const p=resolveIdentityPresentation({ancestry:'skeldran',culture:'skeldran',homelandRegion:'skeldra',religion:'old_gods',affiliationId:'house.vaering'});
  assert.equal(p.ancestryMark?.id,'ancestry.skeldran');
  assert.equal(p.religionMark?.id,'religion.old_gods');
  assert.equal(p.homelandMark?.id,'homeland.skeldra');
  assert.equal(p.affiliationMark?.id,'affiliation.house_vaering');
  assert.equal(primaryIdentityMark(p).id,'affiliation.house_vaering');
});

test('unaligned characters do not receive invented religion or affiliation',()=>{
  const blackhaven=resolveIdentityPresentation({ancestry:'mixed',culture:'outer_isles',homelandRegion:'outer_isles',religion:'unaffiliated'});
  assert.equal(blackhaven.ancestryMark?.id,'ancestry.outer_isles');
  assert.equal(blackhaven.homelandMark?.id,'homeland.outer_isles');
  assert.equal(blackhaven.religionMark,undefined);
  assert.equal(blackhaven.affiliationMark,undefined);
  assert.equal(primaryIdentityMark(blackhaven).id,'homeland.outer_isles');
  assert.equal(affiliationMarkForCharacter({profession:'merchant_captain',role:'Unaligned privateer from Blackhaven'}),undefined);
  assert.equal(affiliationMarkForCharacter({profession:'marine',role:'Independent marine'}),undefined);
});

test('affiliation only resolves from explicit organization evidence',()=>{
  assert.equal(affiliationMarkForCharacter({profession:'naval_captain',role:'Captain, Skeldran Royal Navy'})?.id,'affiliation.skeldran_royal_navy');
  assert.equal(affiliationMarkForCharacter({role:'Factor of the Merchant Guild'})?.id,'affiliation.merchant_guild');
  assert.equal(affiliationMarkForCharacter({role:'Officer of the Harbor Authority'})?.id,'affiliation.harbor_authority');
  assert.equal(affiliationMarkForCharacter({role:'One of the Free Captains'})?.id,'affiliation.free_captains');
  assert.equal(affiliationMarkForCharacter({role:'Merchant/privateer captain'}),undefined);
});

test('ports and religious institutions use only approved main identifiers',()=>{
  assert.deepEqual(governmentIdentityMarksForPort('port.veyrholm','skeldra').map(m=>m.id),['affiliation.house_vaering']);
  assert.deepEqual(governmentIdentityMarksForPort('port.ironhaven','skeldra').map(m=>m.id),['homeland.skeldra']);
  assert.deepEqual(religionIdentityMarksForPort('port.veyrholm').map(m=>m.id),['religion.old_gods','religion.covenant']);
  assert.deepEqual(religionIdentityMarksForPort('port.stormvik').map(m=>m.id),['religion.old_gods']);
});

test('ships use explicit affiliation or owner homeland; named ship marks and disposition do not create identity',()=>{
  const outer=resolveIdentityPresentation({ancestry:'mixed',culture:'outer_isles',homelandRegion:'outer_isles',religion:'unaffiliated'});
  assert.equal(shipIdentityMarkForContext({ownerPresentation:outer,ownerProfession:'pirate_captain',ownerRole:'Captain of Ash Gull',fallbackRegion:'outer_isles'}).id,'homeland.outer_isles');
  assert.equal(shipIdentityMarkForContext({ownerPresentation:outer,ownerProfession:'merchant_captain',ownerRole:'Privateer',fallbackRegion:'outer_isles'}).id,'homeland.outer_isles');
  const skeldra=resolveIdentityPresentation({ancestry:'skeldran',culture:'skeldran',homelandRegion:'skeldra',religion:'covenant'});
  assert.equal(shipIdentityMarkForContext({ownerPresentation:skeldra,ownerProfession:'naval_captain',ownerRole:'Captain, Royal Navy',fallbackRegion:'skeldra'}).id,'affiliation.skeldran_royal_navy');
});

test('only the approved main identity package and replacement runtime assets remain live',()=>{
  assert.ok(existsSync(join(refRoot,'SYMBOL_MANIFEST.json')));
  assert.equal(existsSync(join(root,'public/art/reference/symbols/approved-2026-09-07')),false);
  const runtimeDir=join(root,'public/art/ui/symbols/runtime');
  const runtimeFiles=readdirSync(runtimeDir).filter(name=>name.endsWith('.png'));
  assert.equal(runtimeFiles.length,22);
  assert.equal(runtimeFiles.every(name=>name.startsWith('identity_')),true);
  for(const mark of Object.values(IDENTITY_MARKS)){
    const runtimePath=join(root,'public',mark.path);
    assert.ok(existsSync(runtimePath),mark.path);
    const png=readFileSync(runtimePath);
    assert.equal(png.toString('ascii',1,4),'PNG');
    assert.equal(png[25],6,`${mark.id} runtime symbol should be RGBA`);
    assert.ok(existsSync(join(refRoot,mark.sourceReference)),mark.sourceReference);
  }
});

test('asset registry exposes only new main-identity runtime symbol ids',()=>{
  const assets=Object.values(ASSET_BY_ID).filter(asset=>asset.category==='identity_symbol');
  assert.equal(assets.length,22);
  assert.equal(assets.every(asset=>asset.artStyleVersion==='EBBING_MAIN_IDENTITY_2026-09-08'),true);
  assert.equal(assets.every(asset=>asset.path?.startsWith('/art/ui/symbols/runtime/identity_')),true);
  assert.equal(Object.keys(ASSET_BY_ID).some(id=>id.startsWith('ui.symbol.')),false);
});

test('UI integration keeps approved identity data while structural character screens defer decorative symbols to the later art phase',()=>{
  const main=source('src/alpha/main.ts');
  const css=source('public/alpha/styles.css');
  const identitySource=source('src/data/seed/identitySymbols.ts');
  assert.match(main,/const mark = presentation\.homelandMark/);
  assert.match(main,/governmentIdentityMarksForPort/);
  assert.match(main,/religionIdentityMarksForPort/);
  assert.match(main,/otherMark=e\.identified\?shipIdentityMark\(s,other\.id\):undefined/);
  assert.match(main,/contactMark=intel\.identified\?shipIdentityMark\(s,intel\.shipId\):undefined/);
  assert.doesNotMatch(main,/creator-identity-preview|player-identity-corner|crew-production-mark|context-overlay ship-mark/);
  assert.match(main,/creator-identity-caption/);
  assert.doesNotMatch(identitySource,/skeldraOdal|skeldraAun|outerIslesAshGull|skeldraRankCaptain|skeldraNavalUnitPennant/);
  assert.doesNotMatch(css,/\.identity-mark-chip\.compact\.naval|\.identity-mark-chip\.compact\.ship|\.identity-mark-chip\.faith/);
  for(const layout of [ART_LAYOUT_REGISTRY['ui.character.equipment.male'],ART_LAYOUT_REGISTRY['ui.character.equipment.female']]){
    assert.ok(layout.regions.identityBanner);
    assert.ok(layout.regions.inventoryGrid);
    assert.ok(layout.regions.itemDetail);
  }
});

test('cleanup does not alter save schema or recovered screen architecture',()=>{
  const createGame=source('src/game/createGame.ts');
  const architecture=source('src/ui/screenArchitecture.ts');
  assert.match(createGame,/schemaVersion: 12/);
  assert.match(architecture,/screenId:"inventory_equipment"[\s\S]*architecture:"hybrid"/);
  assert.match(architecture,/screenId:"market"[\s\S]*architecture:"art_skinned_dynamic"/);
  assert.match(architecture,/screenId:"crew_roster"[\s\S]*geometryOwners/);
  assert.match(architecture,/screenId:"journal_intelligence"[\s\S]*geometryOwners/);
});
