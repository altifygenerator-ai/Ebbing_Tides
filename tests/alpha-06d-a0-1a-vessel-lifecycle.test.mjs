import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { combatAction } from '../public/alpha/js/game/combat.js';
import { beginBoardingCombat } from '../public/alpha/js/game/personalCombat.js';
import { ensureCrewCommunity } from '../public/alpha/js/game/crewState.js';
import { immediatePrizeValue, isShipOperational, resolvePlayerPrize } from '../public/alpha/js/game/vesselLifecycle.js';
import { learnAbilityFromSource } from '../public/alpha/js/game/progression.js';
import { usePlayerAbility } from '../public/alpha/js/game/abilitiesRuntime.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';
import { searchWaters } from '../public/alpha/js/game/travel.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
function game(seed='a0-1a'){ return createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'Lifecycle QA'},seed); }
function encounter(state,id='encounter.a01a',shipId='ship.ash_gull'){
  state.encounter={id,phase:'combat',otherShipId:shipId,range:'medium',rangeYards:700,sightingRangeNm:.35,shipsSecured:false,elapsedMinutes:0,identified:true,playerIdentityKnown:true,authorityDemanded:false,playerEscaped:false,log:[],round:0};
  return state.encounter;
}

test('new campaign ships have an explicit active lifecycle while legacy absence still reads active',()=>{
  const state=game('a01a-active');
  const ship=state.ships['ship.ash_gull'];
  assert.equal(ship.lifecycle?.status,'active');
  delete ship.lifecycle;
  assert.equal(isShipOperational(ship),true);
});

test('naval defeat resolves a vessel exactly once and a reconstructed second encounter cannot pay a second prize',()=>{
  const state=game('a01a-repeat-prize');
  const enemy=state.ships['ship.ash_gull'];
  const company=ensureCrewCommunity(state.ships[state.player.shipId]);
  encounter(state,'encounter.a01a.first');
  enemy.systems.hull=0;
  const before=state.player.character.crowns;
  const expected=immediatePrizeValue(enemy);
  const first=combatAction(state,'demand_surrender');
  assert.equal(first.ok,true);
  assert.equal(enemy.lifecycle?.status,'disabled');
  assert.equal(enemy.lifecycle?.prizeClaimed,true);
  assert.equal(state.player.character.crowns,before+expected);
  assert.equal(company.outstandingPrizeShare,Math.max(8,Math.round(expected*.2)));
  assert.equal(isShipOperational(enemy),false);

  const afterFirst=state.player.character.crowns;
  encounter(state,'encounter.a01a.second');
  const second=combatAction(state,'fire_hull');
  assert.equal(second.ok,false);
  assert.equal(state.player.character.crowns,afterFirst);
  assert.equal(state.worldEvents.filter(e=>e.type==='vessel_disposition_resolved'&&e.canonicalData.enemyShipId===enemy.id).length,1);
});

test('boarding and naval prizes share the same authoritative prize resolver and boarding creates crew share',()=>{
  const state=game('a01a-boarding-prize');
  const enemy=state.ships['ship.ash_gull'];
  const e=encounter(state,'encounter.a01a.boarding');
  e.shipsSecured=true;
  e.range='boarding';
  e.rangeYards=0;
  const expected=immediatePrizeValue(enemy);
  const before=state.player.character.crowns;
  const result=resolvePlayerPrize(state,e,enemy,'boarding');
  assert.equal(result.ok,true);
  assert.equal(result.prize,expected);
  assert.equal(enemy.lifecycle?.status,'captured');
  assert.equal(state.player.character.crowns,before+expected);
  assert.equal(ensureCrewCommunity(state.ships[state.player.shipId]).outstandingPrizeShare,Math.max(8,Math.round(expected*.2)));
  assert.equal(beginBoardingCombat(state).ok,false,'captured vessel cannot be boarded again');

  const combatSource=fs.readFileSync(path.join(root,'src/game/combat.ts'),'utf8');
  const personalSource=fs.readFileSync(path.join(root,'src/game/personalCombat.ts'),'utf8');
  assert.match(combatSource,/resolvePlayerPrize\(state, encounter, enemy, "naval"\)/);
  assert.match(personalSource,/resolvePlayerPrize\(state, encounter, enemy, "boarding"\)/);
});

test('terminal NPC vessel is retired from active planning and remains immobile across later world advancement',()=>{
  const state=game('a01a-terminal-planner');
  const enemy=state.ships['ship.stormcrow'];
  const npc=state.npcs[enemy.ownerCharacterId];
  const activePlan=npc.brain.currentPlan;
  assert.ok(activePlan);
  const e=encounter(state,'encounter.a01a.retire',enemy.id);
  enemy.systems.morale=0;
  const result=resolvePlayerPrize(state,e,enemy,'naval');
  assert.equal(result.ok,true);
  assert.notEqual(enemy.lifecycle?.status,'active');
  assert.notEqual(npc.brain.currentPlan?.status,'active');
  const before={...enemy.position};
  advanceWorld(state,24*20);
  assert.deepEqual(enemy.position,before);
  assert.notEqual(npc.brain.currentPlan?.status,'active');
});

test('terminal vessels are excluded from later player sightings and Search Waters contacts',()=>{
  const state=game('a01a-no-resight');
  const player=state.ships[state.player.shipId];
  delete state.player.currentPortId;
  delete player.dockedAtPortId;
  delete state.encounter;
  for(const ship of Object.values(state.ships)){
    if(ship.id===player.id) continue;
    ship.lifecycle={status:'captured',resolvedAtHour:state.absoluteHour,prizeClaimed:true};
    delete ship.dockedAtPortId;
    ship.position={...player.position};
  }
  const result=searchWaters(state,1);
  assert.notEqual(result.kind,'ship');
  assert.equal(state.encounter,undefined);
});

test('emergency hull shoring respects the vessel actual hull maximum rather than a hard-coded 100',()=>{
  const state=game('a01a-hull-max');
  const pc=state.player.character;
  pc.skills.engineering=50;
  learnAbilityFromSource(state,pc.id,'tech.naval_engineering.emergency_hull_shoring','QA shipwright');
  const ship=state.ships[state.player.shipId];
  ship.systems.hullMax=54;
  ship.systems.hull=52;
  ship.supplies=10;
  let attempts=0;
  while(ship.systems.hull<54 && attempts++<20){
    const result=usePlayerAbility(state,'tech.naval_engineering.emergency_hull_shoring');
    assert.equal(result.ok,true);
    if(ship.systems.hull<54) advanceWorld(state,1);
  }
  assert.equal(ship.systems.hull,54);
  assert.ok(ship.systems.hull<=ship.systems.hullMax);
});
