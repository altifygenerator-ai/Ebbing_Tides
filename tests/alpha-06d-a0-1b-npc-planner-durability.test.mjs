import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';
import { ensureNpcPlan } from '../public/alpha/js/game/npcBrain.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';
import { isShipOperational } from '../public/alpha/js/game/vesselLifecycle.js';

function game(seed='a0-1b'){ return createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'Planner QA'},seed); }
function shipNpcs(state){ return Object.values(state.npcs).filter(npc=>npc.shipId && isShipOperational(state.ships[npc.shipId])); }

test('NPC port/sea location truth stays aligned with physical voyage state',()=>{
  const state=game('a01b-location-truth');
  const npc=state.npcs['character.ingrid_skar'];
  const ship=state.ships[npc.shipId];
  let guard=200;
  while(!ship.dockedAtPortId && guard-- > 0) advanceWorld(state,6);
  assert.ok(guard>0,'NPC should reach a port');
  assert.equal(npc.locationPortId,ship.dockedAtPortId);
  advanceWorld(state,8); // finish port duties and depart
  assert.equal(npc.brain.currentPlan?.type,'travel');
  assert.equal(npc.brain.currentPlan?.status,'active');
  assert.equal(ship.dockedAtPortId,undefined);
  assert.equal(npc.locationPortId,undefined,'an NPC physically at sea must not remain logically located in the previous port');
});

test('an at-sea survival shortfall produces one emergency return that can actually reach port and recover',()=>{
  const state=game('a01b-survival-recovery');
  const npc=state.npcs['character.ingrid_skar'];
  const ship=state.ships[npc.shipId];
  advanceWorld(state,2);
  const positionBefore={...ship.position};
  npc.brain.needs.foodDays=.1;
  npc.brain.needs.waterDays=.1;
  advanceWorld(state,1);
  const recovery=npc.brain.currentPlan;
  assert.equal(recovery?.type,'travel');
  assert.equal(recovery?.status,'active');
  assert.equal(recovery?.survivalRecovery,true);
  assert.equal(ship.dockedAtPortId,undefined);
  assert.equal(npc.locationPortId,undefined);
  assert.ok(Math.hypot((recovery.path?.[0]?.x??999)-positionBefore.x,(recovery.path?.[0]?.y??999)-positionBefore.y)<2,'recovery route should originate from the actual at-sea position, not the last port');

  let guard=200;
  while(!ship.dockedAtPortId && guard-- > 0) advanceWorld(state,6);
  assert.ok(guard>0,'emergency return must terminate at a reachable port');
  assert.equal(npc.brain.currentPlan?.type,'port_duties');
  assert.equal(npc.locationPortId,ship.dockedAtPortId);
  advanceWorld(state,8);
  assert.ok(npc.brain.needs.foodDays>=12);
  assert.ok(npc.brain.needs.waterDays>=12);
  assert.equal(npc.brain.currentPlan?.type,'travel');
  assert.equal(npc.brain.currentPlan?.status,'active');
  assert.equal(state.worldEvents.filter(e=>e.type==='npc_plan_interrupted'&&e.participants.includes(npc.id)).length,1,'one shortage should not create an endless interruption history');
});

test('a docked NPC with insufficient voyage reserves services the ship before departing',()=>{
  const state=game('a01b-docked-service');
  const npc=state.npcs['character.odel_braegson'];
  const ship=state.ships[npc.shipId];
  npc.brain.currentPlan=undefined;
  ship.dockedAtPortId='port.ironhaven';
  npc.locationPortId='port.ironhaven';
  ship.position={...state.ships[state.player.shipId].position};
  npc.brain.needs.foodDays=.25;
  npc.brain.needs.waterDays=.25;
  ensureNpcPlan(state,npc);
  assert.equal(npc.brain.currentPlan?.type,'port_duties');
  assert.equal(ship.dockedAtPortId,'port.ironhaven');
  assert.equal(npc.locationPortId,'port.ironhaven');
  advanceWorld(state,8);
  assert.ok(npc.brain.needs.foodDays>=12);
  assert.ok(npc.brain.needs.waterDays>=12);
  assert.equal(npc.brain.currentPlan?.type,'travel');
});

test('v12 load compacts retired scheduler rows and rebuilds only live plan checkpoints',()=>{
  const state=game('a01b-queue-migration');
  const npc=state.npcs['character.ingrid_skar'];
  const validPlanId=npc.brain.currentPlan.id;
  state.simulationEvents.push(
    {id:'junk.processed',scheduledAtHour:1,eventType:'npc_plan_checkpoint',entityId:npc.id,priority:1,payload:{planId:'old.plan'},status:'processed'},
    {id:'junk.cancelled',scheduledAtHour:1,eventType:'npc_plan_checkpoint',entityId:npc.id,priority:1,payload:{planId:'old.plan.2'},status:'cancelled'},
    {id:'junk.stale-scheduled',scheduledAtHour:999,eventType:'npc_plan_checkpoint',entityId:npc.id,priority:1,payload:{planId:'not.current'},status:'scheduled'}
  );
  // Remove the valid row to prove active-plan wakeups are reconstructed on load.
  state.simulationEvents=state.simulationEvents.filter(event=>String(event.payload.planId??'')!==validPlanId);
  const loaded=migrateSaveData(structuredClone(state));
  assert.ok(loaded.simulationEvents.length>0);
  assert.ok(loaded.simulationEvents.every(event=>event.status==='scheduled'));
  assert.ok(loaded.simulationEvents.every(event=>{
    if(event.eventType!=='npc_plan_checkpoint') return true;
    return loaded.npcs[event.entityId]?.brain.currentPlan?.id===event.payload.planId;
  }));
  assert.ok(loaded.simulationEvents.some(event=>event.payload.planId===validPlanId),'active NPC plan checkpoint should be restored');
  assert.ok(!loaded.simulationEvents.some(event=>event.id.startsWith('junk.')));
});

test('1000-day passive simulation keeps NPC traffic productive and operational scheduler state bounded',()=>{
  const state=game('a01b-1000-day');
  const freshBytes=JSON.stringify(state).length;
  for(let day=0;day<1000;day++) advanceWorld(state,24);
  const active=shipNpcs(state);
  assert.ok(active.length>=6);
  for(const npc of active){
    assert.equal(npc.brain.currentPlan?.status,'active',`${npc.id} should still have a productive active plan`);
    assert.ok(['travel','port_duties'].includes(npc.brain.currentPlan?.type),`${npc.id} should remain in the travel/port loop`);
    const arrivals=state.worldEvents.filter(e=>e.type==='npc_arrival'&&e.canonicalData.npcId===npc.id).length;
    assert.ok(arrivals>100,`${npc.id} should continue completing voyages across the long simulation`);
  }
  assert.ok(state.simulationEvents.every(event=>event.status==='scheduled'));
  assert.ok(state.simulationEvents.length<=active.length+2,'operational wake-up queue should remain near one live checkpoint per ship NPC');
  assert.equal(state.worldEvents.filter(e=>e.type==='npc_plan_interrupted').length,0,'normal long-run traffic should not fall into survival-replan spam');
  const finalBytes=JSON.stringify(state).length;
  assert.ok(finalBytes/freshBytes<10,`1000-day save growth should be bounded; got ${(finalBytes/freshBytes).toFixed(2)}x`);
  assert.ok(finalBytes<750_000,`current proving-ground state should remain comfortably below 750 KB after 1000 passive days; got ${finalBytes}`);
});
