import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { assessPort } from '../public/alpha/js/game/portActions.js';
import { acceptContract, fulfillContract } from '../public/alpha/js/game/contracts.js';
import { transact } from '../public/alpha/js/game/economy.js';
import { navigationTargetForPort } from '../public/alpha/js/game/navigation.js';
import { beginNavigation, cancelVoyage, sailUntilInterrupted, searchWaters } from '../public/alpha/js/game/travel.js';
import { deterministicCharacterMindReply } from '../public/alpha/js/game/characterMind.js';

function benchmarkGame(seed='06d-benchmark') {
  return createGame({
    ...structuredClone(DEFAULT_CHARACTER_CHOICES),
    name:'Benchmark Captain',
    socialOrigin:'merchant_family',
    recentProfession:'merchant_clerk',
    startingLocationId:'port.veyrholm',
    homeSettlementId:'port.veyrholm'
  }, seed);
}

test('0.6D Skeldra benchmark supports opportunity -> preparation -> voyage -> search -> arrival -> consequence', () => {
  const state=benchmarkGame();
  const playerShip=state.ships[state.player.shipId];
  assert.equal(state.player.currentPortId,'port.veyrholm');

  // Build matters immediately in port.
  const read=assessPort(state);
  assert.equal(read.ok,true);
  assert.ok(state.player.knowledge.some(k=>k.source==='Merchant experience'));

  // A state-derived opportunity becomes a real obligation.
  const contract=state.contracts.find(c=>c.status==='available' && c.sourcePortId==='port.veyrholm' && c.destinationPortId==='port.ironhaven');
  assert.ok(contract,'expected a Veyrholm -> Ironhaven opportunity');
  assert.equal(acceptContract(state,contract.id).ok,true);
  assert.equal(transact(state,contract.commodityId,contract.quantity,'buy').ok,true);

  // Keep the benchmark focused on the core loop rather than forcing a combat outcome.
  for(const ship of Object.values(state.ships)) if(ship.id!==playerShip.id) ship.dockedAtPortId='port.veyrholm';
  playerShip.supplies=200;

  // Leave harbor, stop deliberately, and prove Search Waters is a real sea action.
  assert.equal(beginNavigation(state,navigationTargetForPort('port.ironhaven')).ok,true);
  const underway=sailUntilInterrupted(state,1,1);
  assert.equal(underway.stopReason,'guard');
  assert.equal(cancelVoyage(state).ok,true);
  assert.equal(state.player.currentPortId,undefined);
  const search=searchWaters(state,3);
  assert.equal(search.ok,true);
  assert.ok(['ship','discovery','wreckage','smoke','traffic','nothing'].includes(search.kind));

  // One Sail operation then carries the voyage to the destination.
  assert.equal(beginNavigation(state,navigationTargetForPort('port.ironhaven')).ok,true);
  let result=sailUntilInterrupted(state);
  if(result.stopReason==='encounter'){
    delete state.encounter;
    result=sailUntilInterrupted(state);
  }
  assert.equal(result.stopReason,'arrival');
  assert.equal(state.player.currentPortId,'port.ironhaven');
  assert.ok(result.voyageReport?.distanceTravelledNm>0);

  // Arrival creates a concrete consequence: the accepted obligation can be completed.
  const beforeCrowns=state.player.character.crowns;
  const completed=fulfillContract(state,contract.id);
  assert.equal(completed.ok,true);
  assert.ok(state.player.character.crowns>beforeCrowns);
  assert.equal(contract.status,'completed');
  assert.ok(state.worldEvents.some(e=>e.type==='contract_completed'));

  // A named NPC interaction responds to the build rather than returning generic dashboard text.
  const reply=deterministicCharacterMindReply(state,'character.pastor_elias_korr','Is there work?');
  assert.match(reply.text,/manifest|grain/i);
});
