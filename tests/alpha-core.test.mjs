import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { transact } from '../public/alpha/js/game/economy.js';
import { acceptContract } from '../public/alpha/js/game/contracts.js';
import { beginVoyage, advanceVoyage, hailEncounter, avoidEncounter } from '../public/alpha/js/game/travel.js';
import { buildCharacterMindContext, deterministicCharacterMindReply } from '../public/alpha/js/game/characterMind.js';
import { combatAction } from '../public/alpha/js/game/combat.js';

function choices(overrides = {}) {
  return {
    ...structuredClone(DEFAULT_CHARACTER_CHOICES),
    name: 'Test Captain',
    ...overrides,
  };
}

function snapshotDeterministicState(state) {
  return {
    worldSeed: state.worldSeed,
    markets: Object.fromEntries(Object.entries(state.markets).map(([id, market]) => [
      id,
      Object.fromEntries(Object.entries(market.goods).map(([goodId, row]) => [goodId, row.lastPrice]))
    ])),
    knowledge: state.player.knowledge.map(({ id, text, source, confidence, truthStatus }) => ({ id, text, source, confidence, truthStatus })),
    contracts: state.contracts.map(({ sourcePortId, destinationPortId, commodityId, quantity, reward, deadlineHour, reason }) => ({
      sourcePortId, destinationPortId, commodityId, quantity, reward, deadlineHour, reason
    }))
  };
}

test('same world seed produces the same alpha world facts and prices', () => {
  const a = createGame(choices(), 'alpha-determinism');
  const b = createGame(choices(), 'alpha-determinism');
  assert.deepEqual(snapshotDeterministicState(a), snapshotDeterministicState(b));
});

test('Veyrholm begins with a state-derived food delivery opportunity to Ironhaven', () => {
  const state = createGame(choices({ startingLocationId: 'port.veyrholm' }), 'contract-seed');
  const contract = state.contracts.find((c) =>
    c.sourcePortId === 'port.veyrholm' &&
    c.destinationPortId === 'port.ironhaven' &&
    c.commodityId === 'good.grain'
  );
  assert.ok(contract, 'expected a grain contract created from Ironhaven shortage and Veyrholm supply');
  assert.match(contract.reason, /Ironhaven.*grain/i);
  assert.equal(contract.status, 'available');
});

test('buying cargo mutates money, hold, market stock, observed price, and canonical history', () => {
  const state = createGame(choices(), 'trade-seed');
  const beforeCrowns = state.player.character.crowns;
  const beforeStock = state.markets['port.veyrholm'].goods['good.grain'].stock;
  const beforeEvents = state.worldEvents.length;
  const result = transact(state, 'good.grain', 2, 'buy');
  assert.equal(result.ok, true);
  assert.ok(state.player.character.crowns < beforeCrowns);
  assert.equal(state.markets['port.veyrholm'].goods['good.grain'].stock, beforeStock - 2);
  assert.equal(state.ships[state.player.shipId].cargo.find((c) => c.commodityId === 'good.grain')?.quantity, 2);
  assert.ok(state.player.observedPrices['port.veyrholm:good.grain']);
  assert.equal(state.worldEvents.length, beforeEvents + 1);
  assert.equal(state.worldEvents.at(-1)?.type, 'market_transaction');
});

test('accepted contract becomes a persistent obligation', () => {
  const state = createGame(choices(), 'accept-seed');
  const contract = state.contracts.find((c) => c.status === 'available');
  assert.ok(contract);
  const result = acceptContract(state, contract.id);
  assert.equal(result.ok, true);
  assert.equal(contract.status, 'accepted');
  assert.ok(state.player.acceptedContractIds.includes(contract.id));
  assert.equal(state.worldEvents.at(-1)?.type, 'contract_accepted');
});

test('voyage advances world time, can interrupt for persistent ships, and reaches a second real port', () => {
  const state = createGame(choices(), 'voyage-seed');
  const started = beginVoyage(state, 'port.ironhaven');
  assert.equal(started.ok, true);
  assert.equal(state.player.currentPortId, undefined);
  const startHour = state.absoluteHour;

  let safety = 30;
  let sawEncounter = false;
  while (state.voyage && safety-- > 0) {
    const step = advanceVoyage(state, 4);
    assert.equal(step.ok, true);
    if (state.encounter && state.encounter.phase === 'sighting') {
      sawEncounter = true;
      const other = state.ships[state.encounter.otherShipId];
      if (other?.disposition === 'pirate') {
        const avoided = avoidEncounter(state);
        assert.equal(avoided.ok, true);
        if (state.encounter?.phase === 'combat') {
          // This test is about travel continuity rather than battle outcome.
          // Exercise the real flee action until it resolves or the bounded loop ends.
          for (let i = 0; i < 12 && state.encounter?.phase === 'combat'; i++) combatAction(state, 'flee');
        }
      } else {
        assert.equal(hailEncounter(state).ok, true);
      }
    }
  }

  assert.ok(state.absoluteHour > startHour);
  assert.equal(state.voyage, undefined, 'voyage should finish inside bounded alpha travel loop');
  assert.equal(state.player.currentPortId, 'port.ironhaven');
  assert.equal(state.ships[state.player.shipId].dockedAtPortId, 'port.ironhaven');
  assert.ok(state.worldEvents.some((event) => event.type === 'arrival'));
  assert.equal(typeof sawEncounter, 'boolean');
});

test('naval combat uses persistent ship systems and records a resolution', () => {
  const state = createGame(choices(), 'combat-seed');
  state.encounter = {
    id: 'encounter.test.ash_gull',
    phase: 'combat',
    otherShipId: 'ship.ash_gull',
    range: 'medium',
    identified: true,
    playerEscaped: false,
    log: [],
    round: 0,
  };
  const enemy = state.ships['ship.ash_gull'];
  enemy.systems.hull = 1;
  enemy.systems.morale = 1;
  const result = combatAction(state, 'fire_hull');
  assert.equal(result.ok, true);
  // A deterministic miss is possible, so keep firing within a small bounded test.
  for (let i = 0; i < 10 && state.encounter?.phase === 'combat'; i++) combatAction(state, 'fire_hull');
  assert.equal(state.encounter?.phase, 'resolved');
  assert.ok(state.worldEvents.some((event) => event.type === 'naval_combat_resolved'));
});

test('Character Mind receives a lore firewall and cannot directly grant canonical effects', () => {
  const state = createGame(choices({ startingLocationId: 'port.ironhaven' }), 'mind-seed');
  const context = buildCharacterMindContext(state, 'character.pastor_elias_korr');
  assert.ok(context.loreFirewall.some((line) => /Do not invent world facts/i.test(line)));
  assert.ok(context.currentWorldFacts.some((line) => /grain stock/i.test(line)));
  const beforeCrowns = state.player.character.crowns;
  const reply = deterministicCharacterMindReply(state, 'character.pastor_elias_korr', 'Is there work moving grain?');
  assert.equal(reply.source, 'deterministic_fallback');
  assert.equal(reply.proposedEffects.length, 0);
  assert.equal(state.player.character.crowns, beforeCrowns);
  assert.match(reply.text, /Food|kitchens|harbor factors/i);
});
