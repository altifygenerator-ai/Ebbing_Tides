import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { ALL_SKILLS } from '../public/alpha/js/game/skills.js';
import { portReadLens } from '../public/alpha/js/game/playerFacing.js';
import { LEARNING_SOURCES } from '../public/alpha/js/data/seed/learningSources.js';
import {
  ANCESTRY_GAMEPLAY_POLICY,
  birthOmenInterpretation,
  learningSourcesAtCurrentContext,
  participateInReligiousLife,
  portBuildInsights,
  quoteLearningSource,
  studyLearningSource
} from '../public/alpha/js/game/characterConsequences.js';
import { deterministicCharacterMindReply } from '../public/alpha/js/game/characterMind.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';

function game(overrides={},seed='a0-3b') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Build Consequence Captain', ...overrides }, seed);
}

function atPoi(state,poiId='poi.old_veyr_beacon') {
  state.player.currentPortId=undefined;
  state.player.currentPoiId=poiId;
  const ship=state.ships[state.player.shipId];
  ship.dockedAtPortId=undefined;
  return state;
}

test('A0.3B advances package, keeps schema v12, and registers real world learning-source categories', () => {
  const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.a0-3(?:b(?:1|2|3)?|c)|0\.6\.0-alpha\.d\.r2)$/);
  assert.equal(game({},'schema').schemaVersion,12);
  assert.deepEqual(new Set(LEARNING_SOURCES.map(row=>row.kind)),new Set(['teacher','book','officer','institution','discovery']));
  assert.equal(ANCESTRY_GAMEPLAY_POLICY,'identity_and_context_not_stat_package');
  assert.equal(ALL_SKILLS.length,18,'classless canonical skill list remains unchanged');
});

test('ancestry remains identity/context rather than an arbitrary starting stat package', () => {
  const skeldran=game({ancestry:'skeldran'},'ancestry-skeldran');
  const asterian=game({ancestry:'asterian'},'ancestry-asterian');
  assert.deepEqual(asterian.player.character.skills,skeldran.player.character.skills);
  assert.deepEqual(asterian.player.character.specializations,skeldran.player.character.specializations);
  assert.deepEqual(asterian.player.character.abilities,skeldran.player.character.abilities);
});

test('background and profession still choose an information lens while culture and ship history alter what stands out', () => {
  const local=game({recentProfession:'navigator',shipOrigin:'naval_surplus',culture:'skeldran',homelandRegion:'skeldra'},'insight-local');
  assert.equal(portReadLens(local).id,'maritime');
  const localText=portBuildInsights(local,'port.veyrholm','maritime').join(' ');
  assert.match(localText,/familiarity/i);
  assert.match(localText,/naval-surplus|Admiralty/i);

  const foreign=game({recentProfession:'navigator',culture:'asterian',homelandRegion:'asteria',homeSettlementId:'settlement.asterra'},'insight-foreign');
  const foreignText=portBuildInsights(foreign,'port.veyrholm','maritime').join(' ');
  assert.match(foreignText,/outside skeldra|learned context/i);
  assert.notEqual(foreignText,localText);
});

test('Superstitious and Birth Omen change interpretation without declaring a hidden objective omen bonus', () => {
  const plain=birthOmenInterpretation('old_gods','great_storm',false);
  const superstitious=birthOmenInterpretation('old_gods','great_storm',true);
  assert.notEqual(superstitious,plain);
  assert.match(superstitious,/superstitious habits/i);
  assert.match(superstitious,/disagree|settled truth/i);
  const skillsSource=readFileSync(new URL('../src/game/skills.ts',import.meta.url),'utf8');
  assert.doesNotMatch(skillsSource,/choices\.trait === "superstitious"\) add\(/,'Superstitious must not be converted into an arbitrary flat skill package');
});

test('Bookworm changes the time cost of a real written source instead of instantly granting expertise', () => {
  const ordinary=game({trait:'sea_legs'},'book-ordinary');
  const bookworm=game({trait:'bookworm'},'book-bookworm');
  const ordinaryQuote=quoteLearningSource(ordinary,'learning.book.veyrholm_sailing_directions');
  const bookwormQuote=quoteLearningSource(bookworm,'learning.book.veyrholm_sailing_directions');
  assert.equal(ordinaryQuote.available,true);
  assert.equal(bookwormQuote.available,true);
  assert.equal(ordinaryQuote.hours,6);
  assert.equal(bookwormQuote.hours,4);
  assert.equal(bookworm.player.character.specializations.some(row=>row.name==='Open Sea'),false,'trait itself does not teach the specialization');
});

test('an onboard officer teaches through the existing ability hook, consumes world time, and records truthful training history', () => {
  const state=game({},'officer-learning');
  const before=state.absoluteHour;
  const quote=quoteLearningSource(state,'learning.officer.nils_sextant');
  assert.equal(quote.available,true);
  const result=studyLearningSource(state,'learning.officer.nils_sextant');
  assert.equal(result.ok,true);
  assert.equal(state.absoluteHour,before+6);
  assert.equal(state.player.character.abilities.some(row=>row.abilityId==='tech.instruments.calibrated_sextant_method'),true);
  const training=state.player.character.trainingHistory.find(row=>row.subjectId==='tech.instruments.calibrated_sextant_method');
  assert.equal(training.startedAtHour,before);
  assert.equal(training.completedAtHour,before+6);
  assert.equal(training.costCrowns,0);
  const event=state.worldEvents.findLast(row=>row.type==='character_learning');
  assert.equal(event.canonicalData.sourceId,'learning.officer.nils_sextant');
});

test('a named teacher requires actual contact before hospital instruction becomes available', () => {
  const state=game({startingLocationId:'port.ironhaven'},'teacher-learning');
  state.player.character.skills.medicine=25;
  let quote=quoteLearningSource(state,'learning.teacher.korr_hospital_triage');
  assert.equal(quote.available,false);
  assert.match(quote.reasons.join(' '),/conversation|Access/i);
  deterministicCharacterMindReply(state,'character.pastor_elias_korr','Tell me about the hospital and your work.');
  quote=quoteLearningSource(state,'learning.teacher.korr_hospital_triage');
  assert.equal(quote.available,true);
  const beforeHour=state.absoluteHour;
  const beforeCrowns=state.player.character.crowns;
  const result=studyLearningSource(state,'learning.teacher.korr_hospital_triage');
  assert.equal(result.ok,true);
  assert.equal(state.absoluteHour,beforeHour+quote.hours);
  assert.equal(state.player.character.crowns,beforeCrowns-quote.costCrowns);
  assert.equal(state.player.character.specializations.some(row=>row.skillId==='medicine'&&row.name==='Harbor Triage'),true);
});

test('religious institutional access can come from lived faith or an earned scholarly/social alternative', () => {
  const devout=game({startingLocationId:'port.thorenfjord',religion:'old_gods',devotion:'devout'},'thoren-devout');
  devout.player.character.skills.arcana=25;
  const devoutQuote=quoteLearningSource(devout,'learning.institution.thoren_warding');
  assert.equal(devoutQuote.available,true);
  assert.equal(devoutQuote.hours,10);
  assert.equal(devoutQuote.costCrowns,16);

  const outsider=game({startingLocationId:'port.thorenfjord',religion:'covenant',devotion:'cultural'},'thoren-scholar');
  outsider.player.character.skills.arcana=25;
  outsider.player.character.skills.scholarship=35;
  const outsiderQuote=quoteLearningSource(outsider,'learning.institution.thoren_warding');
  assert.equal(outsiderQuote.available,true,'religion should not become an arbitrary hard lock when scholarship provides a credible path');
  assert.equal(outsiderQuote.hours,12);
  assert.equal(outsiderQuote.costCrowns,24);
});

test('technical upbringing changes institutional training access/cost without creating a second progression clock', () => {
  const technical=game({startingLocationId:'port.ironhaven',background:'engineers_apprentice',recentProfession:'apprentice_engineer'},'yard-technical');
  technical.player.character.skills.engineering=30;
  const quote=quoteLearningSource(technical,'learning.institution.ironhaven_yard_diagnostics');
  assert.equal(quote.available,true);
  assert.equal(quote.hours,8);
  assert.equal(quote.costCrowns,28);
  const before=technical.absoluteHour;
  assert.equal(studyLearningSource(technical,'learning.institution.ironhaven_yard_diagnostics').ok,true);
  assert.equal(technical.absoluteHour,before+8);
  assert.equal(technical.clock.hour,technical.absoluteHour%24,'training uses shared world time rather than a private cadence clock');
});

test('discovery learning is physically unavailable until the relevant POI has actually been investigated', () => {
  const state=atPoi(game({},'beacon-discovery'));
  state.player.character.skills.navigation=25;
  let quote=quoteLearningSource(state,'learning.discovery.old_veyr_beacon_weather_lore');
  assert.equal(quote.available,false);
  assert.match(quote.reasons.join(' '),/discovery/i);
  state.worldEvents.push({id:'event.poi.test.search',type:'poi_action',atHour:state.absoluteHour,locationId:'poi.old_veyr_beacon',participants:[state.player.character.id],summary:'Searched the Old Veyr Beacon.',canonicalData:{poiId:'poi.old_veyr_beacon',action:'search'},importance:0});
  quote=quoteLearningSource(state,'learning.discovery.old_veyr_beacon_weather_lore');
  assert.equal(quote.available,true);
  assert.equal(studyLearningSource(state,'learning.discovery.old_veyr_beacon_weather_lore').ok,true);
  assert.equal(state.player.character.specializations.some(row=>row.name==='Beacon Weather-Lore'),true);
});

test('devotion, religion, omen, and Superstitious produce a real religious-participation knowledge consequence on shared world time', () => {
  const state=game({startingLocationId:'port.thorenfjord',religion:'old_gods',devotion:'devout',trait:'superstitious',birthOmen:'first_snow'},'religious-life');
  const before=state.absoluteHour;
  const result=participateInReligiousLife(state);
  assert.equal(result.ok,true);
  assert.equal(state.absoluteHour,before+2);
  assert.match(result.message,/devout/i);
  assert.match(result.message,/first-snow|first snow/i);
  assert.match(result.message,/superstitious/i);
  const knowledge=state.player.knowledge.find(row=>row.claimKey==='religious_participation.port.thorenfjord.character.player');
  assert.ok(knowledge);
  assert.equal(knowledge.category,'religious');
  const event=state.worldEvents.findLast(row=>row.type==='religious_participation');
  assert.deepEqual({religion:event.canonicalData.religion,devotion:event.canonicalData.devotion,birthOmen:event.canonicalData.birthOmen,trait:event.canonicalData.trait},{religion:'old_gods',devotion:'devout',birthOmen:'first_snow',trait:'superstitious'});
  assert.equal(participateInReligiousLife(state).ok,false,'the same institutional visit cannot be spammed at the same campaign moment');
});

test('NPC dialogue can react to the captain birth omen without turning character belief into world truth', () => {
  const state=game({startingLocationId:'port.ironhaven',birthOmen:'great_storm',trait:'superstitious'},'omen-dialogue');
  const reply=deterministicCharacterMindReply(state,'character.pastor_elias_korr','What do you make of my birth omen?');
  assert.equal(reply.interpretedIntent,'ask_about_omen');
  assert.match(reply.text,/omen|storm-born|storm/i);
  assert.match(reply.text,/would not call|settled truth|disagree/i);
});

test('duplicate source use cannot duplicate an ability/specialization or charge a second training transaction', () => {
  const state=game({},'duplicate-learning');
  assert.equal(studyLearningSource(state,'learning.officer.nils_sextant').ok,true);
  const hour=state.absoluteHour;
  const crowns=state.player.character.crowns;
  const trainings=state.player.character.trainingHistory.length;
  const second=studyLearningSource(state,'learning.officer.nils_sextant');
  assert.equal(second.ok,false);
  assert.equal(state.absoluteHour,hour);
  assert.equal(state.player.character.crowns,crowns);
  assert.equal(state.player.character.trainingHistory.length,trainings);
  assert.equal(state.player.character.abilities.filter(row=>row.abilityId==='tech.instruments.calibrated_sextant_method').length,1);
});

test('learned world-source progression persists through schema-v12 normalization/save migration', () => {
  const state=game({trait:'bookworm'},'persist-learning');
  assert.equal(studyLearningSource(state,'learning.book.veyrholm_sailing_directions').ok,true);
  const loaded=migrateSaveData(JSON.parse(JSON.stringify(state)));
  assert.equal(loaded.schemaVersion,12);
  assert.equal(loaded.player.character.specializations.some(row=>row.skillId==='navigation'&&row.name==='Open Sea'),true);
  const training=loaded.player.character.trainingHistory.find(row=>row.subjectId==='navigation:Open Sea');
  assert.ok(training);
  assert.equal(training.costCrowns,18);
  assert.ok(training.completedAtHour>training.startedAtHour);
});

test('A0.3B adds consequence/training content inside existing UI owners and preserves creator/captain structural lock', () => {
  const main=readFileSync(new URL('../src/alpha/main.ts',import.meta.url),'utf8');
  const css=readFileSync(new URL('../public/alpha/styles.css',import.meta.url),'utf8');
  assert.match(main,/data-action="study-learning-source"/);
  assert.match(main,/data-action="participate-religion"/);
  assert.match(main,/creator-review/);
  assert.match(main,/captain-production-sheet|character-sheet|captain-sheet/i);
  assert.doesNotMatch(main,/type TabId = [^;]*learning/i,'A0.3B must not create a new management-center tab');
  assert.doesNotMatch(main,/Attunement.*range|name="startingAttunement"/i,'direct player-managed attunement slider stays absent');
  assert.doesNotMatch(css,/learning-source-card\s*\{/,'learning sources reuse existing flow/card geometry rather than adding a new CSS layout owner');
});
