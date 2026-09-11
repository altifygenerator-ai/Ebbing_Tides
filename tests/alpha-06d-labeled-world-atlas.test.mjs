import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, getWorldCell } from '../public/alpha/js/data/seed/worldMap.js';
import { PORTS, PORT_BY_ID } from '../public/alpha/js/data/seed/ports.js';
import { POINTS_OF_INTEREST } from '../public/alpha/js/data/seed/pois.js';
import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';
import { findSeaPath } from '../public/alpha/js/game/navigation.js';
import { routeDistanceNm } from '../public/alpha/js/game/physicalDistance.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function calibration() {
  return JSON.parse(fs.readFileSync(path.join(root,'docs/visual-qa/map-calibration/world_atlas_labeled_v06d_water_scores.json'),'utf8'));
}

test('labeled atlas is the canonical 120x80 / 20nm navigation painting',()=>{
  assert.equal(GLOBAL_ATLAS.width,120);
  assert.equal(GLOBAL_ATLAS.height,80);
  assert.equal(GLOBAL_ATLAS.cellScaleNm,20);
  assert.equal(GLOBAL_ATLAS.version,'WORLD_ATLAS_0.6D_LABELED_CANON1');
  assert.equal(GLOBAL_ATLAS.visualAssetId,'map.world_atlas.labeled_v06d');
  assert.equal(REGIONAL_MAP_LAYERS.length,1);
  assert.equal(REGIONAL_MAP_LAYERS[0].assetId,GLOBAL_ATLAS.visualAssetId);
  const asset=ASSET_BY_ID[GLOBAL_ATLAS.visualAssetId];
  assert.equal(asset.status,'APPROVED_ANCHOR');
  assert.equal(asset.mapRegistration?.nativePixelWidth,6000);
  assert.equal(asset.mapRegistration?.nativePixelHeight,4000);
  const file=path.join(root,'public',asset.path.replace(/^\//,''));
  assert.ok(fs.existsSync(file));
  assert.ok(fs.statSync(file).size>10_000_000);
});

test('active Skeldran ports are visually registered land markers with genuinely water-like approaches',()=>{
  const c=calibration();
  for(const port of PORTS){
    const landScore=c.scores[port.point.y][port.point.x];
    const waterScore=c.scores[port.approachPoint.y][port.approachPoint.x];
    assert.ok(landScore<0.5,`${port.name} marker must sit on land-like atlas art (score ${landScore})`);
    assert.ok(waterScore>=0.5,`${port.name} approach must sit on water-like atlas art (score ${waterScore})`);
    assert.equal(getWorldCell(port.point).terrain,'land');
    assert.equal(getWorldCell(port.approachPoint).navigable,true);
  }
});

test('all active Skeldran port pairs path through navigable atlas water',()=>{
  for(let i=0;i<PORTS.length;i++){
    for(let j=i+1;j<PORTS.length;j++){
      const a=PORTS[i], b=PORTS[j];
      const route=findSeaPath(a.approachPoint,b.approachPoint);
      assert.ok(route.length>1,`${a.name} -> ${b.name} should have a sea route`);
      assert.deepEqual(route[0],a.approachPoint);
      assert.deepEqual(route.at(-1),b.approachPoint);
      for(const point of route){
        assert.equal(getWorldCell(point).navigable,true,`${a.name} -> ${b.name} crosses blocked geography at ${point.x},${point.y}`);
      }
      assert.ok(routeDistanceNm(route)>=20,`${a.name} -> ${b.name} physical route distance must be positive`);
    }
  }
});

test('current POIs remain route-valid after labeled-atlas geography recalibration',()=>{
  const start=PORT_BY_ID['port.veyrholm'].approachPoint;
  for(const poi of POINTS_OF_INTEREST){
    assert.equal(getWorldCell(poi.approachPoint).navigable,true,`${poi.name} approach must remain navigable`);
    const route=findSeaPath(start,poi.approachPoint);
    assert.ok(route.length>1,`${poi.name} should remain reachable from Veyrholm`);
    for(const point of route) assert.equal(getWorldCell(point).navigable,true);
  }
});

test('Thorenfjord was moved off the old landlocked atlas registration',()=>{
  assert.deepEqual(PORT_BY_ID['port.thorenfjord'].point,{x:34,y:5});
  assert.deepEqual(PORT_BY_ID['port.thorenfjord'].approachPoint,{x:33,y:5});
  assert.equal(getWorldCell({x:34,y:6}).navigable,false,'old approach/marker area should no longer be forced to water');
});
