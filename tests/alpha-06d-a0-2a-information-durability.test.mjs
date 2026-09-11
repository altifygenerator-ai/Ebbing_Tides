import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';
import { assessPort, gatherRumor, rumorCandidatesForPort } from '../public/alpha/js/game/portActions.js';
import {
  eventInformationCanReachPort,
  informationTravelHours,
  knowledgeFreshnessAtHour,
  knowledgeSupportsRecognition,
  publicEventInformationProfile,
  upsertPlayerKnowledge
} from '../public/alpha/js/game/information.js';
import { deterministicCharacterMindReply } from '../public/alpha/js/game/characterMind.js';
import { PORTS } from '../public/alpha/js/data/seed/ports.js';

function game(seed='a0-2a') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Information QA' }, seed);
}

function knowledgeByClaim(state, claimKey) {
  return state.player.knowledge.find(row => (row.claimKey ?? row.id) === claimKey && row.informationState !== 'superseded');
}

test('PlayerState.knowledge is the single mutable campaign knowledge ledger in a new game', () => {
  const state = game('a02a-owner-new');
  assert.equal(state.schemaVersion, 12);
  assert.equal(state.player.character.knowledgeEntries.length, 0);
  assert.ok(state.player.knowledge.length > 0);
  assert.ok(state.player.knowledge.some(row => row.id.startsWith('knowledge.home.')));
  assert.ok(state.player.knowledge.some(row => row.category === 'religious'));
  const keys = state.player.knowledge.map(row => row.claimKey ?? row.id);
  assert.equal(new Set(keys).size, keys.length, 'current campaign knowledge should have one owner per stable claim');
});

test('v12 legacy character knowledge is imported once into campaign knowledge and cleared without a schema bump', () => {
  const state = game('a02a-owner-migrate');
  state.player.character.knowledgeEntries.push({
    id:'legacy.qa.ship',
    domain:'rumor',
    claim:'A cutter called QA Gull was reported near the harbor.',
    source:'Old save rumor',
    learnedAtHour:2,
    confidence:61,
    status:'rumor',
    subjectId:'ship.qa_gull'
  });
  const before = state.player.knowledge.length;
  const migrated = migrateSaveData(structuredClone(state));
  assert.equal(migrated.schemaVersion, 12);
  assert.equal(migrated.player.character.knowledgeEntries.length, 0);
  assert.equal(migrated.player.knowledge.length, before + 1);
  assert.ok(migrated.player.knowledge.some(row => (row.claimKey ?? row.id) === 'legacy.qa.ship'));
  const migratedAgain = migrateSaveData(structuredClone(migrated));
  assert.equal(migratedAgain.player.knowledge.length, migrated.player.knowledge.length, 'reloading must not duplicate imported legacy knowledge');
});


test('legacy duplicate direct observations compact to one stable claim during normalization', () => {
  const state = game('a02a-owner-compact');
  state.player.knowledge.push(
    { id:'knowledge.old.direct.1', category:'maritime', subjectId:'ship.qa_compact', text:'QA Compact identified.', source:'Direct observation', learnedAtHour:10, confidence:95, truthStatus:'confirmed', hardRumor:false },
    { id:'knowledge.old.direct.2', category:'maritime', subjectId:'ship.qa_compact', text:'QA Compact identified again.', source:'Direct observation', learnedAtHour:20, confidence:100, truthStatus:'confirmed', hardRumor:false }
  );
  const migrated = migrateSaveData(structuredClone(state));
  const matches = migrated.player.knowledge.filter(row => (row.claimKey ?? row.id) === 'ship.identity.ship.qa_compact');
  assert.equal(matches.length, 1);
  assert.equal(matches[0].text, 'QA Compact identified again.');
  assert.equal(matches[0].learnedAtHour, 10, 'compaction preserves the first-known time while keeping the newest observation');
});

test('port assessment is recurring after information ages and refreshes one stable claim instead of growing duplicates', () => {
  const state = game('a02a-port-read');
  const portId = state.player.currentPortId;
  assert.equal(portId, 'port.veyrholm');
  const first = assessPort(state);
  assert.equal(first.ok, true);
  const claim = state.player.knowledge.find(row => row.claimKey?.startsWith(`port_read.${portId}.`));
  assert.ok(claim);
  const claimKey = claim.claimKey;
  const firstLearned = claim.learnedAtHour;
  const firstRefresh = claim.refreshedAtHour;
  const countAfterFirst = state.player.knowledge.filter(row => row.claimKey === claimKey).length;
  assert.equal(countAfterFirst, 1);
  assert.equal(assessPort(state).ok, false, 'the current read should not be farmable immediately');
  advanceWorld(state, 73);
  const refreshed = assessPort(state);
  assert.equal(refreshed.ok, true, 'an old port read should become useful again after the world has had time to change');
  const after = knowledgeByClaim(state, claimKey);
  assert.ok(after);
  assert.equal(after.learnedAtHour, firstLearned, 'refresh preserves when the captain first learned the claim');
  assert.ok(after.refreshedAtHour > firstRefresh);
  assert.equal(state.player.knowledge.filter(row => row.claimKey === claimKey).length, 1, 'refresh must update rather than append duplicate current claims');
});

test('rumor gathering can be exhausted for now, then becomes useful again as live market/news information refreshes', () => {
  const state = game('a02a-rumor-recurrence');
  let successes = 0;
  let exhausted = false;
  for (let i=0; i<20; i++) {
    const result = gatherRumor(state);
    if (!result.ok) { exhausted = true; break; }
    successes++;
  }
  assert.ok(successes > 0);
  assert.equal(exhausted, true, 'a single visit should not permit endless rumor farming');
  const beforeCount = state.player.knowledge.length;
  const knownMarketClaims = new Set(state.player.knowledge.filter(row => row.claimKey?.startsWith('market.')).map(row => row.claimKey));
  assert.ok(knownMarketClaims.size > 0, 'the live market should produce at least one refreshable report');

  advanceWorld(state, 73);
  let postWaitSuccesses = 0;
  for (let i=0; i<12; i++) {
    const result = gatherRumor(state);
    if (!result.ok) break;
    postWaitSuccesses++;
  }
  assert.ok(postWaitSuccesses > 0, 'rumor gathering must recur after time/news/market state moves on');
  assert.ok(state.player.knowledge.length < beforeCount + postWaitSuccesses + 1, 'some repeated live reports should refresh stable claims rather than duplicate every acquisition');
  assert.equal(JSON.stringify(state.player.knowledge).includes('"refreshable"'), false, 'candidate-only refresh flags must never leak into persistent player knowledge');
});

test('knowledge freshness ages, becomes stale, and a refresh makes the same claim current again', () => {
  const state = game('a02a-freshness');
  const first = upsertPlayerKnowledge(state, {
    id:'knowledge.qa.market', claimKey:'qa.market', category:'trade', text:'Grain is tight.', source:'QA merchant',
    learnedAtHour:state.absoluteHour, observedAtHour:state.absoluteHour, refreshedAtHour:state.absoluteHour,
    staleAfterHours:72, confidence:70, truthStatus:'unknown', informationState:'current', hardRumor:false
  }).record;
  assert.equal(knowledgeFreshnessAtHour(first, state.absoluteHour), 'current');
  assert.equal(knowledgeFreshnessAtHour(first, state.absoluteHour + 42), 'aging');
  assert.equal(knowledgeFreshnessAtHour(first, state.absoluteHour + 72), 'stale');
  state.absoluteHour += 80;
  const refreshed = upsertPlayerKnowledge(state, {
    ...first, text:'Grain is comfortable now.', observedAtHour:state.absoluteHour, refreshedAtHour:state.absoluteHour, informationState:'current'
  });
  assert.equal(refreshed.created, false);
  assert.equal(knowledgeFreshnessAtHour(refreshed.record, state.absoluteHour), 'current');
  assert.equal(state.player.knowledge.filter(row => row.claimKey === 'qa.market').length, 1);
});

test('public information travels between ports with physical delay instead of becoming instantly omniscient', () => {
  const state = game('a02a-propagation');
  const event = {
    id:'event.qa.arrival', type:'npc_arrival', atHour:state.absoluteHour, locationId:'port.ironhaven', participants:['character.qa'],
    summary:'QA Gull arrived at Ironhaven with visible storm damage.', canonicalData:{ npcId:'character.qa' }, importance:1
  };
  state.worldEvents.push(event);
  const delay = informationTravelHours('port.ironhaven','port.veyrholm');
  assert.ok(Number.isFinite(delay) && delay > 0);
  assert.equal(eventInformationCanReachPort(state,event,'port.veyrholm'), false);
  assert.equal(rumorCandidatesForPort(state,'port.veyrholm').some(row => row.claimKey === `event.${event.id}`), false);
  advanceWorld(state, delay - 1);
  assert.equal(eventInformationCanReachPort(state,event,'port.veyrholm'), false);
  advanceWorld(state, 1);
  assert.equal(eventInformationCanReachPort(state,event,'port.veyrholm'), true);
  assert.equal(rumorCandidatesForPort(state,'port.veyrholm').some(row => row.claimKey === `event.${event.id}`), true);
});

test('generic information propagation does not bypass the later law witness/report lifecycle', () => {
  const state = game('a02a-law-boundary');
  const crime = {
    id:'event.qa.crime', type:'crime_committed', atHour:state.absoluteHour, locationId:'port.ironhaven', participants:['character.player'],
    summary:'A crime occurred during QA.', canonicalData:{ crimeType:'piracy', reported:false }, importance:2
  };
  assert.equal(publicEventInformationProfile(crime), undefined, 'crime truth must not automatically become public news before A0.2D witness/evidence handling');
});

test('ordinary rumors do not grant permanent ship identification, while confirmed direct knowledge does', () => {
  const state = game('a02a-recognition');
  upsertPlayerKnowledge(state, {
    id:'knowledge.qa.rumor', claimKey:'qa.ship.rumor', category:'maritime', subjectId:'ship.qa', text:'Someone saw QA Gull.', source:'Tavern rumor',
    learnedAtHour:state.absoluteHour, refreshedAtHour:state.absoluteHour, staleAfterHours:120,
    confidence:80, truthStatus:'unknown', informationState:'current', hardRumor:false
  });
  assert.equal(knowledgeSupportsRecognition(state,'ship.qa'), false);
  upsertPlayerKnowledge(state, {
    id:'knowledge.qa.direct', claimKey:'ship.identity.ship.qa', category:'maritime', subjectId:'ship.qa', text:'You identified QA Gull directly.', source:'Direct observation',
    learnedAtHour:state.absoluteHour, observedAtHour:state.absoluteHour, refreshedAtHour:state.absoluteHour,
    confidence:100, truthStatus:'confirmed', informationState:'current', hardRumor:false
  });
  assert.equal(knowledgeSupportsRecognition(state,'ship.qa'), true);
});

test('Character Mind reads the A0.1C live economy rather than repeating a stale authored shortage', () => {
  const state = game('a02a-mind-economy');
  const grain = state.markets['port.ironhaven'].goods['good.grain'];
  grain.stock = grain.targetStock * 1.3;
  const reply = deterministicCharacterMindReply(state,'character.pastor_elias_korr','How is the food shortage?');
  assert.match(reply.text,/comfortable|holding steady|no honest reason/i);
  assert.doesNotMatch(reply.text,/genuinely short right now/i);
});

test('all currently registered ports automatically share the same physical information-delay system', () => {
  const ids = PORTS.map(port => port.id);
  assert.ok(ids.length >= 4);
  for (const from of ids) for (const to of ids) {
    const delay = informationTravelHours(from,to);
    assert.ok(Number.isFinite(delay), `${from} -> ${to} should use the generic information route model`);
    if (from === to) assert.equal(delay,0);
    else assert.ok(delay > 0);
  }
});
