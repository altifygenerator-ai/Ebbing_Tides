import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { awardLifeExperience, recordMeaningfulPractice, LIFE_EXPERIENCE_REPEAT_WINDOW_HOURS, SKILL_PRACTICE_REPEAT_WINDOW_HOURS } from '../public/alpha/js/game/progression.js';
import { beginDeckDrill, personalCombatAction } from '../public/alpha/js/game/personalCombat.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';

function game(seed='a02b') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Cadence Captain' }, seed);
}

function finishWinningDrill(state) {
  assert.ok(state.personalCombat && !state.personalCombat.resolved);
  state.personalCombat.opponentHealth = 0;
  return personalCombatAction(state,'end_turn');
}

test('A0.2B advances package only and preserves save schema v12', () => {
  const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.a0-(?:2[bcd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  assert.equal(game('schema').schemaVersion,12);
});

test('life experience repetition cannot be reset by rotating unrelated keys at the same world hour', () => {
  const state=game('xp-rotation'); const id=state.player.character.id;
  const first=awardLifeExperience(state,id,'same-event','Same recurring experience',100);
  for(let i=0;i<40;i++) awardLifeExperience(state,id,`other-${i}`,'Other legitimate event',1);
  const second=awardLifeExperience(state,id,'same-event','Same recurring experience',100);
  const third=awardLifeExperience(state,id,'same-event','Same recurring experience',100);
  assert.equal(first.gained,100);
  assert.equal(second.gained,35);
  assert.equal(third.gained,0);
});

test('life experience cadence recovers through elapsed world time rather than queue eviction', () => {
  const state=game('xp-time'); const id=state.player.character.id;
  awardLifeExperience(state,id,'repeatable-voyage','Repeated route',100);
  awardLifeExperience(state,id,'repeatable-voyage','Repeated route',100);
  advanceWorld(state,LIFE_EXPERIENCE_REPEAT_WINDOW_HOURS);
  const later=awardLifeExperience(state,id,'repeatable-voyage','Repeated route after meaningful time',100);
  assert.equal(later.gained,100);
});

test('skill-practice repetition cannot be reset by rotating other practice keys', () => {
  const state=game('practice-rotation'); const id=state.player.character.id;
  const first=recordMeaningfulPractice(state,id,'navigation','same-chart-problem',25);
  for(let i=0;i<30;i++) recordMeaningfulPractice(state,id,'navigation',`other-chart-${i}`,25);
  const second=recordMeaningfulPractice(state,id,'navigation','same-chart-problem',25);
  const third=recordMeaningfulPractice(state,id,'navigation','same-chart-problem',25);
  const fourth=recordMeaningfulPractice(state,id,'navigation','same-chart-problem',25);
  assert.ok(first.gained>second.gained);
  assert.ok(second.gained>third.gained);
  assert.equal(fourth.gained,0);
});

test('skill practice becomes meaningful again after its world-time cadence window', () => {
  const state=game('practice-time'); const id=state.player.character.id;
  const first=recordMeaningfulPractice(state,id,'navigation','recurring-route-work',25);
  recordMeaningfulPractice(state,id,'navigation','recurring-route-work',25);
  advanceWorld(state,SKILL_PRACTICE_REPEAT_WINDOW_HOURS);
  const later=recordMeaningfulPractice(state,id,'navigation','recurring-route-work',25);
  assert.equal(later.gained,first.gained);
});

test('deck drill consumes real world time and uses the currently assigned First Mate', () => {
  const state=game('drill-time');
  const mate=state.npcs[state.player.firstMateId];
  mate.name='Astrid Test-Mate';
  mate.skills.blades=67;
  const beforeHour=state.absoluteHour;
  const beforeMarketHour=state.markets[state.player.currentPortId].lastUpdatedHour;
  const started=beginDeckDrill(state);
  assert.equal(started.ok,true);
  assert.equal(state.absoluteHour,beforeHour+2);
  assert.equal(state.markets[state.player.currentPortId].lastUpdatedHour,state.absoluteHour,'training time must advance the same world/economy clock');
  assert.notEqual(state.markets[state.player.currentPortId].lastUpdatedHour,beforeMarketHour);
  assert.equal(state.personalCombat.opponentName,'Astrid Test-Mate');
  assert.equal(state.personalCombat.opponentSkill,67);
  assert.match(state.personalCombat.log[0],/Astrid Test-Mate/);
  assert.doesNotMatch(state.personalCombat.log[0],/Mira/);
});

test('deck drills cannot manufacture unlimited First Mate respect', () => {
  const state=game('drill-respect');
  const mate=state.npcs[state.player.firstMateId];
  mate.relationshipToPlayer.respect=42;

  beginDeckDrill(state); finishWinningDrill(state);
  assert.equal(mate.relationshipToPlayer.respect,43);
  const firstEvent=state.worldEvents.findLast(e=>e.type==='deck_drill_completed');
  assert.equal(firstEvent.canonicalData.respectAwarded,true);

  beginDeckDrill(state); finishWinningDrill(state);
  assert.equal(mate.relationshipToPlayer.respect,43,'another drill a few hours later must not grant another relationship point');
  const secondEvent=state.worldEvents.findLast(e=>e.type==='deck_drill_completed');
  assert.equal(secondEvent.canonicalData.respectAwarded,false);

  advanceWorld(state,72);
  beginDeckDrill(state); finishWinningDrill(state);
  assert.equal(mate.relationshipToPlayer.respect,44,'professional respect may grow again after real elapsed campaign time');

  mate.relationshipToPlayer.respect=60;
  advanceWorld(state,72);
  beginDeckDrill(state); finishWinningDrill(state);
  assert.equal(mate.relationshipToPlayer.respect,60,'routine training cannot push respect into deeper relationship tiers');
});

test('real combat practice is scoped to the combat instance while drill practice shares a training cadence', () => {
  const source=readFileSync(new URL('../src/game/personalCombat.ts',import.meta.url),'utf8');
  assert.match(source,/combat\.source === "deck_drill"/);
  assert.match(source,/`deck_drill:\$\{combat\.opponentId\}:\$\{kind\}`/);
  assert.match(source,/`personal_combat:\$\{combat\.id\}:\$\{kind\}`/);
});
