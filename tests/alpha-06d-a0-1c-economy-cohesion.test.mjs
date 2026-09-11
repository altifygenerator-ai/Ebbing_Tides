import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';
import { advanceSettlementEconomy, commodityFlowRates, loadNpcTradeCargo, provisionNpcAtPort, quoteShipSupplies, settleNpcCargoAtPort } from '../public/alpha/js/game/economySimulation.js';
import { buySupplies } from '../public/alpha/js/game/shipyard.js';
import { shipConditionSpeedFactor } from '../public/alpha/js/game/shipSpeed.js';
import { expireContracts } from '../public/alpha/js/game/contracts.js';
import { isShipOperational } from '../public/alpha/js/game/vesselLifecycle.js';
import { COMMODITY_BY_ID } from '../public/alpha/js/data/seed/commodities.js';

function game(seed='a0-1c'){ return createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'Economy QA'},seed); }
function foodStock(state,portId){
  const market=state.markets[portId];
  return Object.values(market.goods).filter(row=>COMMODITY_BY_ID[row.commodityId]?.category==='food').reduce((sum,row)=>sum+row.stock,0);
}

test('local economy changes stock from explicit production/consumption flows rather than pulling every row toward targetStock',()=>{
  const state=game('a01c-flow-causality');
  const declining=state.markets['port.thorenfjord'].goods['good.machinery'];
  const producing=state.markets['port.ironhaven'].goods['good.machinery'];
  declining.stock=5;
  producing.stock=5;
  const beforeDeclining=declining.stock;
  const beforeProducing=producing.stock;
  const beforeHour=state.absoluteHour;
  state.absoluteHour+=24;
  advanceSettlementEconomy(state,beforeHour);
  assert.ok(declining.stock<beforeDeclining,'an import-dependent row can keep declining even while below target; target stock is not a healing force');
  assert.ok(producing.stock>beforeProducing,'an authored local industry produces real stock independent of target gap');
});

test('NPC merchant cargo is loaded from source inventory and unloaded into the same destination market',()=>{
  const state=game('a01c-npc-trade');
  const npc=state.npcs['character.odel_braegson'];
  const ship=state.ships[npc.shipId];
  ship.cargo=[];
  npc.brain.needs.moneyReserve=2000;
  const source=state.markets['port.ironhaven'].goods['good.machinery'];
  const dest=state.markets['port.veyrholm'].goods['good.machinery'];
  source.stock=source.targetStock*1.5;
  dest.stock=dest.targetStock*0.3;
  const sourceBefore=source.stock;
  const destBefore=dest.stock;
  const loaded=loadNpcTradeCargo(state,npc,'port.ironhaven','port.veyrholm');
  assert.ok(loaded.units>0);
  assert.ok(source.stock<sourceBefore);
  assert.ok(ship.cargo.length>0);
  // Move only cargo that the destination market can accept; this is the same canonical stock the player sees.
  const cargoBefore=ship.cargo.reduce((sum,row)=>sum+row.quantity,0);
  const revenue=settleNpcCargoAtPort(state,npc,'port.veyrholm');
  assert.ok(revenue>0);
  assert.ok(dest.stock>destBefore);
  assert.ok(ship.cargo.reduce((sum,row)=>sum+row.quantity,0)<cargoBefore);
});

test('NPC port provisioning consumes actual staple stock and does not create a second invisible food source',()=>{
  const state=game('a01c-npc-provision');
  const npc=state.npcs['character.ingrid_skar'];
  npc.brain.needs.foodDays=2;
  npc.brain.needs.waterDays=2;
  const before=foodStock(state,'port.veyrholm');
  const moneyBefore=npc.brain.needs.moneyReserve;
  const result=provisionNpcAtPort(state,npc,'port.veyrholm',18);
  assert.ok(result.foodDaysAdded>0);
  assert.ok(foodStock(state,'port.veyrholm')<before);
  assert.ok(npc.brain.needs.foodDays>2);
  assert.equal(npc.brain.needs.moneyReserve,moneyBefore,'naval/basic institutional provisioning consumes goods without pretending the captain personally pays the state bill');
});

test('player ship supplies use the same live food inventory and current price instead of a fixed unlimited 24-cr service',()=>{
  const state=game('a01c-player-provision');
  const portId=state.player.currentPortId;
  assert.ok(portId);
  const quote=quoteShipSupplies(state,portId,6);
  assert.equal(quote.ok,true);
  const before=foodStock(state,portId);
  const suppliesBefore=state.ships[state.player.shipId].supplies;
  const result=buySupplies(state,6);
  assert.equal(result.ok,true);
  assert.equal(state.ships[state.player.shipId].supplies,suppliesBefore+6);
  assert.ok(foodStock(state,portId)<before);
  assert.match(result.message,new RegExp(`${quote.cost} crowns`));
});

test('cargo load uses commodity cargoUnits consistently for sailing performance',()=>{
  const state=game('a01c-cargo-units');
  const base=structuredClone(state.ships[state.player.shipId]);
  const grain=structuredClone(base); grain.cargo=[{commodityId:'good.grain',quantity:10}];
  const timber=structuredClone(base); timber.cargo=[{commodityId:'good.timber',quantity:10}];
  assert.ok(shipConditionSpeedFactor(timber)<shipConditionSpeedFactor(grain),'ten 2-unit timber stacks must load the hull more than ten 1-unit grain stacks');
});

test('contract expiration clears accepted IDs and routine unaccepted opportunities do not accumulate forever',()=>{
  const state=game('a01c-contract-lifecycle');
  const accepted={id:'contract.qa.accepted',type:'delivery',issuerName:'QA',sourcePortId:'port.veyrholm',destinationPortId:'port.ironhaven',commodityId:'good.grain',quantity:2,reward:50,deadlineHour:1,reason:'QA',status:'accepted',createdAtHour:0};
  const routine={id:'contract.qa.routine',type:'delivery',issuerName:'QA',sourcePortId:'port.veyrholm',destinationPortId:'port.ironhaven',commodityId:'good.grain',quantity:2,reward:50,deadlineHour:1,reason:'QA',status:'available',createdAtHour:0};
  state.contracts.push(accepted,routine);
  state.player.acceptedContractIds.push(accepted.id);
  state.absoluteHour=2;
  expireContracts(state);
  assert.equal(state.player.acceptedContractIds.includes(accepted.id),false);
  assert.equal(state.contracts.find(c=>c.id===accepted.id)?.status,'expired');
  state.absoluteHour=24*9;
  expireContracts(state);
  assert.equal(state.contracts.some(c=>c.id===routine.id),false,'old unaccepted routine work is retired after its short journal tail');
});



test('economy flow logic accepts future canonical settlement profiles without named-port engine branches',()=>{
  const row={commodityId:'good.wool',stock:30,targetStock:40,localMultiplier:1,lastPrice:0};
  for(const settlementId of ['settlement.asterra','settlement.blackhaven','settlement.nagara']){
    const flow=commodityFlowRates(settlementId,row);
    assert.ok(flow.dailyConsumption>0,`${settlementId} should derive ordinary demand from shared economy rules`);
    assert.ok(flow.dailyProduction>=0);
    assert.ok(flow.dailyExternalSupply>=0);
    assert.match(flow.source,/settlement availability|authored settlement production|legacy settlement market profile/);
  }
});

test('1000-day integrated economy/planner run stays productive, bounded, and free of negative market inventory',()=>{
  const state=game('a01c-1000-day');
  const freshBytes=JSON.stringify(state).length;
  for(let day=0;day<1000;day++) advanceWorld(state,24);
  const active=Object.values(state.npcs).filter(npc=>npc.shipId&&isShipOperational(state.ships[npc.shipId]));
  assert.ok(active.length>=6);
  for(const npc of active){
    assert.equal(npc.brain.currentPlan?.status,'active');
    assert.ok(state.worldEvents.filter(e=>e.type==='npc_arrival'&&e.canonicalData.npcId===npc.id).length>100);
  }
  for(const market of Object.values(state.markets)) for(const row of Object.values(market.goods)) {
    assert.ok(Number.isFinite(row.stock));
    assert.ok(row.stock>=0,`${market.portId}:${row.commodityId} must never go negative`);
  }
  assert.equal(state.worldEvents.filter(e=>e.type==='npc_plan_interrupted').length,0);
  assert.ok(state.simulationEvents.length<=active.length+2);
  assert.ok(state.contracts.filter(c=>c.status==='resolved_without_you').length<20,'routine contract objects should remain a small recent tail');
  const finalBytes=JSON.stringify(state).length;
  assert.ok(finalBytes/freshBytes<10,`combined long-run state should remain under 10x fresh size; got ${(finalBytes/freshBytes).toFixed(2)}x`);
});
