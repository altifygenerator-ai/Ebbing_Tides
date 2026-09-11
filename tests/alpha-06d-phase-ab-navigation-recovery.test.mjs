import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { navigationTargetForPort, navigationTargetForSea, plotCourse } from '../public/alpha/js/game/navigation.js';
import { beginNavigation, cancelVoyage, estimateVoyageSupplyUnits, sailUntilInterrupted, searchWaters } from '../public/alpha/js/game/travel.js';
import { applyZeroSupplyHardship, crewLeadershipProfile, ensureCrewWelfare, resetSupplyHardshipIfProvisioned } from '../public/alpha/js/game/crewHardship.js';
import { routeDistanceNm } from '../public/alpha/js/game/physicalDistance.js';
import { deriveAttunementValue, refreshDerivedAttunement, attunementBand } from '../public/alpha/js/game/attunement.js';
import { GLOBAL_ATLAS, NAVIGATION_ZOOMS, REGIONAL_MAP_LAYERS } from '../public/alpha/js/data/seed/worldMap.js';
import { PORTS } from '../public/alpha/js/data/seed/ports.js';
import { POINTS_OF_INTEREST } from '../public/alpha/js/data/seed/pois.js';
import { NAV_CAMERA, cameraForPoint, cameraForPoints, cameraViewBox, clampViewWidth, panCameraTarget, regionalLayerOpacity, zoomAroundAnchor } from '../public/alpha/js/game/navigationCamera.js';

function game(seed='06d-phase-ab') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Voyage Captain' }, seed);
}

function approx(actual, expected, tolerance=1e-6) {
  assert.ok(Math.abs(actual-expected) <= tolerance, `${actual} not within ${tolerance} of ${expected}`);
}

test('0.6D navigation defaults to an approximately 18x12 voyage view with bounded 12x8 close zoom', () => {
  assert.deepEqual([NAVIGATION_ZOOMS.navigation.width,NAVIGATION_ZOOMS.navigation.height],[18,12]);
  assert.deepEqual([NAVIGATION_ZOOMS.close.width,NAVIGATION_ZOOMS.close.height],[12,8]);
  assert.equal(game().settings.navigationZoom,'navigation');
  assert.equal(NAV_CAMERA.defaultViewWidth,18);
  assert.equal(NAV_CAMERA.minViewWidth,12);
  assert.equal(NAV_CAMERA.farViewWidth,120);
  assert.equal(NAV_CAMERA.maxViewWidth,120);
});

test('camera panning and cursor-anchored zoom stay inside the canonical 120x80 atlas', () => {
  const camera=cameraForPoint({x:32,y:25},18);
  const panned=panCameraTarget(camera,-999,-999);
  assert.ok(panned.x>=9 && panned.y>=6);
  const zoomed=zoomAroundAnchor(camera,{x:32,y:25},{x:.25,y:.75},2);
  assert.equal(zoomed.viewWidth,12,'zoom clamps to minimum');
  const box=cameraViewBox({x:zoomed.x,y:zoomed.y,viewWidth:zoomed.viewWidth});
  assert.ok(box.x>=0 && box.y>=0);
  assert.ok(box.x+box.width<=GLOBAL_ATLAS.width+1e-9);
  assert.ok(box.y+box.height<=GLOBAL_ATLAS.height+1e-9);
  assert.equal(clampViewWidth(999),NAV_CAMERA.maxViewWidth);
});

test('regional overview camera can frame every known Skeldra core port so destination choice is not hard-wired', () => {
  const state=game('known-port-overview');
  const points=PORTS.filter(port=>state.player.knownPortIds.includes(port.id)).map(port=>port.point);
  const camera=cameraForPoints(points,30,2);
  const box=cameraViewBox(camera);
  for(const point of points){
    assert.ok(point.x>=box.x && point.x<=box.x+box.width,`x ${point.x} outside overview`);
    assert.ok(point.y>=box.y && point.y<=box.y+box.height,`y ${point.y} outside overview`);
  }
});

test('regional art crossfades into the same global coordinate system rather than creating a second map', () => {
  assert.equal(regionalLayerOpacity(46),0);
  assert.equal(regionalLayerOpacity(30),1);
  assert.ok(regionalLayerOpacity(34)>0 && regionalLayerOpacity(34)<1);
  for(const layer of REGIONAL_MAP_LAYERS){
    const b=layer.globalBounds;
    assert.ok(b.x>=0 && b.y>=0 && b.width>0 && b.height>0);
    assert.ok(b.x+b.width<=GLOBAL_ATLAS.width && b.y+b.height<=GLOBAL_ATLAS.height);
  }
});

test('all authored navigation markers remain valid global coordinates', () => {
  for(const port of PORTS){
    assert.ok(port.point.x>=0 && port.point.x<GLOBAL_ATLAS.width);
    assert.ok(port.point.y>=0 && port.point.y<GLOBAL_ATLAS.height);
    assert.ok(port.approachPoint.x>=0 && port.approachPoint.x<GLOBAL_ATLAS.width);
    assert.ok(port.approachPoint.y>=0 && port.approachPoint.y<GLOBAL_ATLAS.height);
  }
  for(const poi of POINTS_OF_INTEREST){
    assert.ok(poi.point.x>=0 && poi.point.x<GLOBAL_ATLAS.width);
    assert.ok(poi.point.y>=0 && poi.point.y<GLOBAL_ATLAS.height);
  }
});

test('click-equivalent route preview reports physical routed distance rather than straight-line dashboard distance', () => {
  const state=game('route-preview');
  const preview=plotCourse(state,navigationTargetForPort('port.ironhaven'));
  assert.ok(preview.path.length>1);
  approx(preview.routeDistanceNm,routeDistanceNm(preview.path));
  assert.ok(preview.estimatedHours>0);
});


test('clicking navigable open water creates a valid free-sail destination instead of requiring a port', () => {
  const state=game('free-water-destination');
  const target=navigationTargetForSea({x:32,y:24});
  assert.ok(target,'expected authored Skeldra water to be selectable');
  const preview=plotCourse(state,target);
  assert.ok(preview.path.length>1,'open-water selection should plot a real course');
  const begin=beginNavigation(state,target);
  assert.equal(begin.ok,true);
  assert.equal(state.voyage?.destination.type,'sea');
  assert.deepEqual(state.voyage?.destination.point,{x:32,y:24});
});

test('one Sail operation can advance an adequately supplied voyage all the way to arrival', () => {
  const state=game('sail-arrival');
  // Isolate the one-action voyage contract from incidental simulated traffic.
  for (const [id, ship] of Object.entries(state.ships)) {
    if (id === state.player.shipId) continue;
    ship.dockedAtPortId = 'port.veyrholm';
    delete ship.route;
  }
  state.npcs = {};
  state.ships[state.player.shipId].supplies=999;
  const started=state.absoluteHour;
  const begin=beginNavigation(state,navigationTargetForPort('port.ironhaven'));
  assert.equal(begin.ok,true);
  const result=sailUntilInterrupted(state);
  assert.equal(result.stopReason,'arrival');
  assert.equal(state.player.currentPortId,'port.ironhaven');
  assert.equal(state.voyage,undefined);
  assert.ok(state.absoluteHour>started);
});

test('supply exhaustion is a background voyage consequence and appears in the arrival report instead of interrupting Sail', () => {
  const state=game('supply-background');
  const ship=state.ships[state.player.shipId];
  ship.supplies=3;
  for(const other of Object.values(state.ships)){ if(other.id!==ship.id) other.dockedAtPortId='port.veyrholm'; }
  const begin=beginNavigation(state,navigationTargetForPort('port.thorenfjord'));
  assert.equal(begin.ok,true);
  let result;
  for(let guard=0;guard<20;guard+=1){
    result=sailUntilInterrupted(state);
    if(result.stopReason==='encounter'){ delete state.encounter; continue; }
    break;
  }
  assert.equal(result?.stopReason,'arrival');
  assert.equal(state.player.currentPortId,'port.thorenfjord');
  assert.ok(result?.voyageReport);
  assert.equal(result.voyageReport.suppliesExhausted,true);
  assert.equal(result.voyageReport.suppliesRemaining,0);
  assert.equal(result.voyageReport.suppliesUsed,3);
  assert.ok(result.voyageReport.distanceTravelledNm>0);
  assert.ok(state.worldEvents.some(event=>event.type==='voyage_supplies_exhausted'));
});

test('Sail Until Interrupted stops immediately when a decision-requiring encounter is already active', () => {
  const state=game('sail-interrupt');
  state.ships[state.player.shipId].supplies=999;
  assert.equal(beginNavigation(state,navigationTargetForPort('port.ironhaven')).ok,true);
  const other=state.ships['ship.ash_gull'];
  state.encounter={id:'encounter.test.06d',phase:'sighting',otherShipId:other.id,range:'distant',rangeYards:9000,sightingRangeNm:6,shipsSecured:false,elapsedMinutes:0,identified:false,playerEscaped:false,log:['Sails sighted.'],round:0};
  const before=state.absoluteHour;
  const result=sailUntilInterrupted(state);
  assert.equal(result.stopReason,'encounter');
  assert.equal(state.absoluteHour,before,'automation must not run through a decision-requiring encounter');
  assert.ok(state.voyage,'route plan remains ready to resume after encounter resolution');
});

test('player can stop an interrupted/active voyage and remain in open water at the current physical position', () => {
  const state=game('cancel-voyage');
  state.ships[state.player.shipId].supplies=999;
  assert.equal(beginNavigation(state,navigationTargetForPort('port.ironhaven')).ok,true);
  const step=sailUntilInterrupted(state,2,1);
  assert.equal(step.stopReason,'guard');
  const before={...state.ships[state.player.shipId].position};
  const result=cancelVoyage(state);
  assert.equal(result.ok,true);
  assert.equal(state.voyage,undefined);
  assert.equal(state.player.currentPortId,undefined);
  assert.deepEqual(state.ships[state.player.shipId].position,before);
});

test('Search Waters is a deliberate at-sea action that advances world time without exposing a simulation-tick control', () => {
  const state=game('search-waters');
  const ship=state.ships[state.player.shipId];
  delete state.player.currentPortId;
  delete state.player.currentPoiId;
  delete ship.dockedAtPortId;
  ship.position={x:32,y:24};
  const before=state.absoluteHour;
  const result=searchWaters(state,3);
  assert.equal(result.ok,true);
  assert.equal(result.hours,3);
  assert.equal(state.absoluteHour,before+3);
  assert.ok(['ship','discovery','wreckage','smoke','traffic','nothing'].includes(result.kind));
});


test('navigation planning exposes the normal Sail supply estimate without making supplies a hard voyage gate', () => {
  const state=game('supply-plan-ui');
  const preview=plotCourse(state,navigationTargetForPort('port.ironhaven'));
  const estimate=estimateVoyageSupplyUnits(preview.estimatedHours);
  assert.ok(estimate>0);
  assert.equal(estimate,Math.ceil(preview.estimatedHours/2));
  const main=readFileSync('src/alpha/main.ts','utf8');
  assert.match(main,/Supplies <b>\$\{ship\.supplies\}<\/b>/,'supplies should remain visible in the persistent top status bar');
  assert.match(main,/~\$\{plannedSupplies\} supplies/,'selected destinations should show estimated supply use');
  assert.match(main,/suppliesShort/,'UI should warn when planned use exceeds current stores');
});

test('Search Waters remains visibly discoverable on the navigation dock even when temporarily unavailable', () => {
  const main=readFileSync('src/alpha/main.ts','utf8');
  const start=main.indexOf('function renderChart');
  const end=main.indexOf('function renderEncounter',start);
  const chart=main.slice(start,end);
  assert.match(chart,/const searchAction=`<button class="btn search-waters-action" data-action="search-waters"/);
  assert.match(chart,/Available after leaving harbor/);
  assert.match(chart,/\$\{searchAction\}<button class="btn" data-action="map-center"/,'Search Waters should occupy a stable first-class navigation action slot');
});


test('zero supplies never blocks beginning or continuing a valid voyage', () => {
  const state=game('zero-supply-sail');
  const ship=state.ships[state.player.shipId];
  ship.supplies=0;
  for(const other of Object.values(state.ships)){ if(other.id!==ship.id) other.dockedAtPortId='port.veyrholm'; }
  const begin=beginNavigation(state,navigationTargetForPort('port.ironhaven'));
  assert.equal(begin.ok,true,'lack of stores is a hardship consequence, not a navigation gate');
  const result=sailUntilInterrupted(state);
  assert.equal(result.stopReason,'arrival');
  assert.equal(state.player.currentPortId,'port.ironhaven');
  assert.ok((result.voyageReport?.zeroSupplyHours??0)>0);
});

test('zero-supply hardship is deliberately gentle at first and escalates with prolonged deprivation', () => {
  const state=game('shortage-curve');
  const ship=state.ships[state.player.shipId];
  ship.supplies=0;
  const startingMorale=ship.systems.morale;
  applyZeroSupplyHardship(state,24);
  const firstDayLoss=startingMorale-ship.systems.morale;
  assert.ok(firstDayLoss<=2,`first-day morale loss should stay friendly, got ${firstDayLoss}`);
  const healthAfterDay=ensureCrewWelfare(ship).averageHealth;
  assert.equal(healthAfterDay,100,'crew health should not be damaged during an ordinary first day without stores');
  applyZeroSupplyHardship(state,96);
  const totalLoss=startingMorale-ship.systems.morale;
  assert.ok(totalLoss>firstDayLoss+5,'five days without stores should be materially worse than the first day');
  assert.ok(ensureCrewWelfare(ship).averageHealth<100,'prolonged deprivation should eventually affect crew health');
  assert.ok(state.worldEvents.some(event=>event.type==='crew_supply_hardship' && event.canonicalData.thresholdHours===120));
});

test('respected capable captains lose less crew morale to shortage than weak distrusted captains', () => {
  const strong=game('leadership-strong');
  const weak=game('leadership-weak');
  for(const state of [strong,weak]) state.ships[state.player.shipId].supplies=0;
  strong.player.character.skills.command=100; strong.player.character.attributes.presence=10; strong.player.character.reputation['faction.skeldra']=30;
  strong.player.character.advancement.generalPerks.push('perk.commanding_presence');
  for(const member of strong.player.crew){ member.loyalty=100; if(member.npcId){ const npc=strong.npcs[member.npcId]; npc.relationshipToPlayer.respect=100; npc.relationshipToPlayer.trust=100; npc.relationshipToPlayer.suspicion=0; } }
  weak.player.character.skills.command=0; weak.player.character.attributes.presence=1; weak.player.character.reputation['faction.skeldra']=-20;
  for(const member of weak.player.crew){ member.loyalty=0; if(member.npcId){ const npc=weak.npcs[member.npcId]; npc.relationshipToPlayer.respect=-100; npc.relationshipToPlayer.trust=-100; npc.relationshipToPlayer.suspicion=100; } }
  const strongStart=strong.ships[strong.player.shipId].systems.morale;
  const weakStart=weak.ships[weak.player.shipId].systems.morale;
  applyZeroSupplyHardship(strong,120);
  applyZeroSupplyHardship(weak,120);
  const strongLoss=strongStart-strong.ships[strong.player.shipId].systems.morale;
  const weakLoss=weakStart-weak.ships[weak.player.shipId].systems.morale;
  assert.ok(crewLeadershipProfile(strong).score>crewLeadershipProfile(weak).score);
  assert.ok(strongLoss<weakLoss,`strong leadership ${strongLoss} should beat weak leadership ${weakLoss}`);
});

test('repeated shortage episodes persist as crew history and increase later hardship pressure', () => {
  const state=game('shortage-memory');
  const ship=state.ships[state.player.shipId];
  ship.supplies=0;
  applyZeroSupplyHardship(state,24);
  const firstFactor=crewLeadershipProfile(state).repeatedNeglectFactor;
  ship.supplies=6;
  resetSupplyHardshipIfProvisioned(state);
  ship.supplies=0;
  applyZeroSupplyHardship(state,24);
  const welfare=ensureCrewWelfare(ship);
  assert.equal(welfare.shortageEpisodes,2);
  assert.ok(crewLeadershipProfile(state).repeatedNeglectFactor>firstFactor);
  const named=state.player.crew.find(member=>member.npcId);
  assert.ok(named?.npcId);
  assert.ok(state.npcs[named.npcId].brain.memories.some(id=>id.includes('event.crew.shortage.24h')),'named crew should retain shortage threshold memories');
});

test('normal creation has no Attunement slider and specialization is derived from committed practices', () => {
  const main=readFileSync('src/alpha/main.ts','utf8');
  assert.doesNotMatch(main,/Starting Attunement/);
  assert.doesNotMatch(main,/attunement-track/);
  const state=game('derived-attunement');
  const c=state.player.character;
  c.attunement.arcaneExposure=0;c.attunement.industrialExposure=0;c.abilities=[];c.schematics=[];c.specializations=[];
  assert.equal(refreshDerivedAttunement(c),0);
  assert.equal(attunementBand(c.attunement.value),'Neutral');
  c.attunement.arcaneExposure=120;
  const value=deriveAttunementValue(c);
  assert.ok(value<0);
  refreshDerivedAttunement(c);
  assert.notEqual(attunementBand(c.attunement.value),'Neutral');
});

test('runtime navigation source uses drag, wheel zoom and voyage operations instead of arrow-pan or four-hour controls', () => {
  const main=readFileSync('src/alpha/main.ts','utf8');
  assert.match(main,/pointerdown/);
  assert.match(main,/pointermove/);
  assert.match(main,/data-action="select-map-cell"/);
  assert.match(main,/drag threshold is crossed/);
  const pointerDownBlock=main.slice(main.indexOf('app.addEventListener("pointerdown"'),main.indexOf('app.addEventListener("pointermove"'));
  assert.doesNotMatch(pointerDownBlock,/setPointerCapture/,'simple clicks must not be captured away from their map marker/cell target');
  assert.match(main,/data-action="map-zoom-step"/);
  assert.match(main,/addEventListener\("wheel"/);
  assert.match(main,/sailUntilInterrupted/);
  assert.match(main,/searchWaters/);
  assert.doesNotMatch(main,/data-action="map-pan"/);
  assert.doesNotMatch(main,/Advance 4 Hours/);
  assert.doesNotMatch(main,/data-action="advance-voyage"/);
  assert.doesNotMatch(main,/selectedMapTarget:\s*NavigationTarget \| undefined = navigationTargetForPort\("port\.ironhaven"\)/);
  assert.doesNotMatch(main,/Supplies are exhausted\. The voyage stops/);
});
