import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { GLOBAL_ATLAS, getWorldCell } from '../public/alpha/js/data/seed/worldMap.js';
import { PORT_BY_ID } from '../public/alpha/js/data/seed/ports.js';
import { SHIP_CLASS_DEFINITIONS } from '../public/alpha/js/data/seed/contentRegistry.js';
import {
  NM_PER_CELL, YARDS_PER_NM, MAX_TACTICAL_RANGE_YARDS, TACTICAL_ROUND_MINUTES,
  straightLineDistanceNm, routeDistanceNm, nmToYards, yardsToNm,
  rangeBandFromYards, rangeChangeYards, pointAlongPathDistance
} from '../public/alpha/js/game/physicalDistance.js';
import {
  baseCruiseSpeedKnots, estimateRouteTravelHours, plannedAverageSpeedKnots
} from '../public/alpha/js/game/shipSpeed.js';
import { navigationTargetForPort, plotCourse, findSeaPath } from '../public/alpha/js/game/navigation.js';
import { beginVoyage, visibilityEnvelopeFor } from '../public/alpha/js/game/travel.js';
import { effectiveSpecialist } from '../public/alpha/js/game/delegation.js';
import { planTravel } from '../public/alpha/js/game/npcBrain.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';

function game(seed='distance-hotfix') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Distance Canon Captain' }, seed);
}

function approx(actual, expected, tolerance=1e-6) {
  assert.ok(Math.abs(actual-expected) <= tolerance, `${actual} not within ${tolerance} of ${expected}`);
}

test('0.6C distance hotfix locks the 120x80 atlas to 20 nautical miles per cell', () => {
  assert.equal(GLOBAL_ATLAS.width,120);
  assert.equal(GLOBAL_ATLAS.height,80);
  assert.equal(GLOBAL_ATLAS.cellScaleNm,20);
  assert.equal(GLOBAL_ATLAS.version,'WORLD_ATLAS_0.6D_LABELED_CANON1');
  assert.equal(NM_PER_CELL,20);
});

test('orthogonal and diagonal grid geometry resolve to canonical physical nautical miles', () => {
  approx(straightLineDistanceNm({x:0,y:0},{x:1,y:0}),20);
  approx(straightLineDistanceNm({x:0,y:0},{x:1,y:1}),20*Math.SQRT2);
  approx(routeDistanceNm([{x:0,y:0},{x:1,y:0},{x:2,y:1}]),20+20*Math.SQRT2);
});

test('route distance is geometric while pathfinding movement cost remains a separate route-choice value', () => {
  const state=game('geometry-not-cost');
  const target=navigationTargetForPort('port.ironhaven');
  const preview=plotCourse(state,target);
  assert.ok(preview.path.length>1);
  approx(preview.routeDistanceNm,routeDistanceNm(preview.path));
  const routingCost=preview.path.slice(1).reduce((sum,point,i)=>{
    const previous=preview.path[i];
    const diagonal=point.x!==previous.x && point.y!==previous.y;
    return sum+getWorldCell(point).movementCost*(diagonal?Math.SQRT2:1);
  },0);
  approx(preview.totalCost,routingCost);
  assert.notEqual(Number(preview.routeDistanceNm.toFixed(3)),Number(preview.totalCost.toFixed(3)),'physical miles must not collapse into movement cost');
});

test('existing Skeldran coordinates stay fixed and Veyrholm to Ironhaven straight-line distance is about 184 nm', () => {
  assert.deepEqual(PORT_BY_ID['port.veyrholm'].approachPoint,{x:32,y:25});
  assert.deepEqual(PORT_BY_ID['port.ironhaven'].approachPoint,{x:38,y:18});
  const distance=straightLineDistanceNm(PORT_BY_ID['port.veyrholm'].approachPoint,PORT_BY_ID['port.ironhaven'].approachPoint);
  approx(distance,Math.hypot(6,7)*20);
  assert.ok(distance>184 && distance<185);
  const path=findSeaPath(PORT_BY_ID['port.veyrholm'].approachPoint,PORT_BY_ID['port.ironhaven'].approachPoint);
  assert.ok(path.length>1);
  assert.ok(path.every(point=>getWorldCell(point).navigable));
  assert.ok(routeDistanceNm(path)>=distance);
});

test('ship classes carry physical cruise speeds and ETA responds to knots rather than abstract path cost', () => {
  assert.equal(SHIP_CLASS_DEFINITIONS.length,33);
  assert.ok(SHIP_CLASS_DEFINITIONS.every(row=>Number.isFinite(row.cruiseSpeedKnots) && row.cruiseSpeedKnots>0));
  const state=game('speed-eta');
  const ship=state.ships[state.player.shipId];
  const target=navigationTargetForPort('port.ironhaven');
  const preview=plotCourse(state,target);
  const seamanship=effectiveSpecialist(state,'seamanship').rating;
  const original=ship.cruiseSpeedKnots;
  ship.cruiseSpeedKnots=4;
  const slow=estimateRouteTravelHours(preview.path,ship,seamanship);
  ship.cruiseSpeedKnots=8;
  const fast=estimateRouteTravelHours(preview.path,ship,seamanship);
  assert.ok(fast<slow);
  assert.ok(slow/fast>1.8 && slow/fast<2.2);
  ship.cruiseSpeedKnots=original;
  assert.ok(baseCruiseSpeedKnots(ship)>0);
});

test('player and NPC route plans use the same physical distance and ETA utilities', () => {
  const state=game('shared-travel-math');
  const target=navigationTargetForPort('port.ironhaven');
  const playerPreview=plotCourse(state,target);
  const playerShip=state.ships[state.player.shipId];
  const playerSeamanship=effectiveSpecialist(state,'seamanship').rating;
  assert.equal(playerPreview.estimatedHours,Math.max(1,Math.ceil(estimateRouteTravelHours(playerPreview.path,playerShip,playerSeamanship))));
  approx(playerPreview.plannedAverageSpeedKnots,plannedAverageSpeedKnots(playerPreview.path,playerShip,playerSeamanship));

  const npc=state.npcs['character.ingrid_skar'];
  const plan=planTravel(state,npc,'port.veyrholm','port.ironhaven','Physical-distance test voyage');
  assert.ok(plan?.path?.length>1);
  const npcShip=state.ships[npc.shipId];
  approx(plan.routeDistanceNm,routeDistanceNm(plan.path));
  const exactNpcHours=estimateRouteTravelHours(plan.path,npcShip,npc.skills.seamanship);
  assert.equal(plan.expectedCompletionHour-state.absoluteHour,Math.max(1,Math.ceil(exactNpcHours)));
  approx(plan.plannedAverageSpeedKnots,plannedAverageSpeedKnots(plan.path,npcShip,npc.skills.seamanship));
});

test('same visible cell can contain ships that are still miles apart and outside ordinary clear-day sighting range', () => {
  const a={x:31.05,y:25.05};
  const b={x:31.45,y:25.45};
  assert.equal(Math.floor(a.x),Math.floor(b.x));
  assert.equal(Math.floor(a.y),Math.floor(b.y));
  const separation=straightLineDistanceNm(a,b);
  assert.ok(separation>10);
  assert.ok(separation<12);
});

test('visibility envelopes are expressed in nautical miles within the locked initial bands', () => {
  for(let i=0;i<50;i++){
    const state=game(`visibility-${i}`);
    state.absoluteHour=i*4;
    state.clock.hour=(i*4)%24;
    const view=visibilityEnvelopeFor(state);
    assert.ok(['clear_daylight','excellent','haze_rain','fog','night'].includes(view.condition));
    if(view.condition==='clear_daylight') assert.ok(view.rangeNm>=6 && view.rangeNm<=10);
    if(view.condition==='excellent') assert.ok(view.rangeNm>=10 && view.rangeNm<=15);
    if(view.condition==='haze_rain') assert.ok(view.rangeNm>=2 && view.rangeNm<=5);
    if(view.condition==='fog') assert.ok(view.rangeNm>=0.25 && view.rangeNm<=1.5);
    if(view.condition==='night') assert.ok(view.rangeNm>=0.5 && view.rangeNm<=3);
  }
  const travelSource=readFileSync('src/game/travel.ts','utf8');
  assert.match(travelSource,/straightLineDistanceNm\(playerShip\.position, ship\.position\)/);
  assert.doesNotMatch(travelSource,/<=\s*1\.35/);
});

test('tactical range labels derive from exact yard separation at canonical boundaries', () => {
  assert.equal(MAX_TACTICAL_RANGE_YARDS,6000);
  assert.equal(rangeBandFromYards(6000),'distant');
  assert.equal(rangeBandFromYards(1500),'long');
  assert.equal(rangeBandFromYards(800),'medium');
  assert.equal(rangeBandFromYards(300),'close');
  assert.equal(rangeBandFromYards(50),'grapple');
  assert.equal(rangeBandFromYards(0,true),'boarding');
  assert.equal(rangeBandFromYards(6001),'distant','out-of-tactical is represented by phase/separation while band remains derived UI shorthand');
});

test('strategic nautical miles convert continuously to tactical yards and five-minute maneuvering uses knots', () => {
  approx(nmToYards(1),YARDS_PER_NM);
  approx(yardsToNm(YARDS_PER_NM),1);
  assert.equal(TACTICAL_ROUND_MINUTES,5);
  approx(rangeChangeYards(2),2*(5/60)*YARDS_PER_NM);
  approx(rangeChangeYards(4),4*(5/60)*YARDS_PER_NM);
  assert.ok(rangeChangeYards(2)>337 && rangeChangeYards(2)<338);
  assert.ok(rangeChangeYards(4)>675 && rangeChangeYards(4)<676);
});

test('v8 active voyages and legacy combat ranges migrate to schema v12 without moving geographic coordinates', () => {
  const state=game('v8-distance-migration');
  const started=beginVoyage(state,'port.ironhaven');
  assert.equal(started.ok,true);
  state.voyage.progress=.35;
  state.voyage.elapsedHours=11;
  delete state.voyage.routeDistanceNm;
  delete state.voyage.distanceTravelledNm;
  delete state.voyage.plannedAverageSpeedKnots;
  const playerShip=state.ships[state.player.shipId];
  playerShip.position={x:34.25,y:22.75};
  const oldPosition=structuredClone(playerShip.position);
  for(const ship of Object.values(state.ships)) delete ship.cruiseSpeedKnots;
  state.encounter={id:'encounter.legacy.medium',phase:'combat',otherShipId:'ship.ash_gull',range:'medium',identified:true,playerEscaped:false,log:[],round:2};
  state.schemaVersion=8;

  const migrated=migrateSaveData(state);
  assert.equal(migrated.schemaVersion,12);
  assert.deepEqual(migrated.ships[migrated.player.shipId].position,oldPosition);
  assert.equal(migrated.voyage.progress,.35);
  assert.ok(migrated.voyage.routeDistanceNm>0);
  approx(migrated.voyage.distanceTravelledNm,migrated.voyage.routeDistanceNm*.35);
  assert.ok(migrated.voyage.plannedAverageSpeedKnots>0);
  assert.equal(migrated.encounter.rangeYards,550);
  assert.equal(migrated.encounter.elapsedMinutes,0);
  assert.equal(migrated.encounter.shipsSecured,false);
  assert.ok(Object.values(migrated.ships).every(ship=>ship.cruiseSpeedKnots>0));
});


test('legacy grapple and boarding bands migrate without conflating range with secured boarding state', () => {
  const grapple=game('legacy-grapple');
  grapple.schemaVersion=8;
  grapple.encounter={id:'encounter.legacy.grapple',phase:'combat',otherShipId:'ship.ash_gull',range:'grapple',identified:true,playerEscaped:false,log:[],round:1};
  const migratedGrapple=migrateSaveData(grapple);
  assert.equal(migratedGrapple.encounter.rangeYards,25);
  assert.equal(migratedGrapple.encounter.shipsSecured,false);

  const boarding=game('legacy-boarding');
  boarding.schemaVersion=8;
  boarding.encounter={id:'encounter.legacy.boarding',phase:'combat',otherShipId:'ship.ash_gull',range:'boarding',identified:true,playerEscaped:false,log:[],round:1};
  const migratedBoarding=migrateSaveData(boarding);
  assert.equal(migratedBoarding.encounter.rangeYards,0);
  assert.equal(migratedBoarding.encounter.shipsSecured,true);
});

test('navigation and encounter UI expose route distance, ETA and exact tactical yards without straight-line dashboard noise', () => {
  const main=readFileSync('src/alpha/main.ts','utf8');
  assert.match(main,/routeDistanceNm/);
  assert.match(main,/estimatedHours/);
  assert.match(main,/currentVoyageEtaHours/);
  assert.doesNotMatch(main,/straightLineDistanceNm/,'player navigation surface should use routed distance rather than expose straight-line internals');
  assert.match(main,/nm \/ cell/);
  assert.match(main,/rangeYards/);
  assert.match(main,/yd/);
});
