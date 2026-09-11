import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { ALL_SKILLS } from '../public/alpha/js/game/skills.js';
import { ATTRIBUTE_DESCRIPTIONS, SKILL_DESCRIPTIONS, SYSTEM_DESCRIPTIONS } from '../public/alpha/js/game/descriptions.js';
import { awardLifeExperience, availableGeneralPerks, canFocusSkill, experienceLevelTitle, experienceThresholdForLevel, generalPerkModifier, recordMeaningfulPractice, spendDevelopmentPointOnSkill, takeGeneralPerk } from '../public/alpha/js/game/progression.js';
import { buildCharacterMindContext, deterministicCharacterMindReply } from '../public/alpha/js/game/characterMind.js';
import { beginVoyage } from '../public/alpha/js/game/travel.js';

function game(seed='alpha05b', patch={}) {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Update B Captain', ...patch }, seed);
}

test('0.5B exposes short descriptions for every canonical attribute and skill plus key deep systems', () => {
  assert.deepEqual(Object.keys(ATTRIBUTE_DESCRIPTIONS).sort(), ['agility','intellect','might','perception','presence','will']);
  for (const id of ALL_SKILLS) assert.ok(SKILL_DESCRIPTIONS[id]?.length > 30, `${id} needs a useful tooltip`);
  assert.ok(SYSTEM_DESCRIPTIONS.attunement.includes('Arcane'));
  assert.ok(SYSTEM_DESCRIPTIONS.developmentPoints.includes('Focused'));
});

test('life-experience milestones grant development opportunities without scaling core stats', () => {
  const state=game('leveling');
  const c=state.player.character;
  assert.equal(c.advancement.level,3);
  const beforeSkills=structuredClone(c.skills);
  const beforeHealth=c.condition.healthMax;
  const needed=experienceThresholdForLevel(4)-c.advancement.lifeExperience;
  const result=awardLifeExperience(state,c.id,'major-life-test','Survived a major test event',needed+10);
  assert.equal(c.advancement.level,4);
  assert.equal(c.advancement.developmentPoints,2);
  assert.deepEqual(c.skills,beforeSkills,'overall level must not inflate all skills');
  assert.equal(c.condition.healthMax,beforeHealth,'overall level must not inflate health');
  assert.ok(result.levels.includes('Level 4'));
});

test('repeated life-experience keys damp quickly to prevent event grinding', () => {
  const state=game('life-damping'); const id=state.player.character.id;
  const first=awardLifeExperience(state,id,'same-safe-event','Repeated safe event',100);
  const second=awardLifeExperience(state,id,'same-safe-event','Repeated safe event',100);
  const third=awardLifeExperience(state,id,'same-safe-event','Repeated safe event',100);
  assert.equal(first.gained,100);
  assert.ok(second.gained < first.gained);
  assert.equal(third.gained,0);
});

test('Development Points cannot buy untouched expertise and instead accelerate grounded practice', () => {
  const state=game('dp-grounding'); const c=state.player.character;
  c.advancement.developmentPoints=2;
  const medicine=canFocusSkill(c,'medicine',state.absoluteHour);
  assert.equal(medicine.ok,false);
  recordMeaningfulPractice(state,c.id,'navigation','difficult-chart-work',35);
  assert.equal(canFocusSkill(c,'navigation',state.absoluteHour).ok,true);
  const beforeProgress=c.practice.navigation.progress;
  const spent=spendDevelopmentPointOnSkill(state,'navigation');
  assert.equal(spent.ok,true);
  assert.equal(c.advancement.developmentPoints,1);
  assert.ok(c.practice.navigation.progress > beforeProgress || c.skills.navigation > 0);
  assert.ok(c.advancement.history.some(row=>row.kind==='development_focus' && row.skillId==='navigation'));
});


test('life talents are gated by lived competence and produce contextual rather than universal effects', () => {
  const without=game('weather-talent');
  const withTalent=game('weather-talent');
  const c=withTalent.player.character;
  c.skills.navigation=50;
  c.advancement.generalPerkPoints=1;
  assert.ok(availableGeneralPerks(c).some(perk=>perk.id==='perk.weather_eye'));
  const chosen=takeGeneralPerk(withTalent,'perk.weather_eye');
  assert.equal(chosen.ok,true);
  assert.deepEqual(generalPerkModifier(c,'weather_navigation'),{value:4,sources:['Weather Eye']});
  assert.equal(generalPerkModifier(c,'naval_gunnery').value,0,'a weather talent must not become a universal stat bonus');
  assert.match(experienceLevelTitle(c.advancement.level),/Captain/);

  // Equalize the underlying Navigation rating so the only difference is the contextual talent.
  without.player.character.skills.navigation=50;
  const a=beginVoyage(without,'port.ironhaven');
  const b=beginVoyage(withTalent,'port.ironhaven');
  assert.equal(a.ok,true); assert.equal(b.ok,true);
  const noTalentEvent=without.worldEvents.findLast(event=>event.type==='departure');
  const talentEvent=withTalent.worldEvents.findLast(event=>event.type==='departure');
  assert.equal(talentEvent.roll.threshold-noTalentEvent.roll.threshold,4,'Weather Eye should improve only the relevant route-planning check');
});

test('named crew share advancement state and Character Mind context while aboard', () => {
  const state=game('crew-mind');
  const mira=state.npcs['character.mira_holst'];
  assert.ok(mira.advancement && mira.skills && mira.attunement);
  const before=mira.advancement.lifeExperience;
  awardLifeExperience(state,mira.id,'crew-voyage-test','Served aboard Tideworn on a difficult voyage',50);
  assert.ok(mira.advancement.lifeExperience>before);
  const context=buildCharacterMindContext(state,mira.id);
  assert.ok(context.currentWorldFacts.some(fact=>fact.includes('Aboard Tideworn')));
  const reply=deterministicCharacterMindReply(state,mira.id,'What do you think about the crew morale?');
  assert.equal(reply.interpretedIntent,'ask_about_crew');
  assert.ok(reply.text.length>30);
  assert.equal(reply.proposedEffects.length,0,'conversation performance may not directly create canonical rewards');
});

test('0.6D keeps progression and crew interaction while demoting Attunement to qualitative derived specialization', () => {
  const main=readFileSync(new URL('../src/alpha/main.ts',import.meta.url),'utf8');
  const css=readFileSync(new URL('../public/alpha/styles.css',import.meta.url),'utf8');
  assert.doesNotMatch(main,/Arcane ↔ Industrial Attunement/);
  assert.doesNotMatch(main,/attunement-track/);
  assert.match(main,/Specialization/);
  assert.match(main,/Life Experience/);
  assert.match(main,/data-action="focus-skill"/);
  assert.match(main,/data-action="open-dialogue"/);
  assert.match(main,/Talk to \${esc\(npc\.name\)}/);
  assert.match(css,/\.has-tooltip\[data-tooltip\]/);
  assert.match(css,/\.specialization-status/);
});

test('schema-5 Update A campaigns migrate to current schema 12 with advancement for player and named NPCs', async () => {
  const old=game('migrate-v5');
  old.schemaVersion=5;
  delete old.player.character.advancement;
  for(const npc of Object.values(old.npcs)) delete npc.advancement;
  const store=new Map([['ebbing-tides.alpha.save',JSON.stringify(old)]]);
  globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key),clear:()=>store.clear(),key:index=>[...store.keys()][index]??null,get length(){return store.size;}};
  const {loadLocal}=await import(`../public/alpha/js/services/localSave.js?v6=${Date.now()}`);
  const migrated=loadLocal();
  assert.equal(migrated.schemaVersion,12);
  assert.ok(migrated.player.character.advancement.level>=2);
  assert.ok(migrated.npcs['character.mira_holst'].advancement.level>=2);
});
