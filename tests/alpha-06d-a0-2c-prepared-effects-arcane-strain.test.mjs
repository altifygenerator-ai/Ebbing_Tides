import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { usePlayerAbility } from '../public/alpha/js/game/abilitiesRuntime.js';
import { prepareAbilityEffect, preparedAbilityBonus } from '../public/alpha/js/game/preparedEffects.js';
import { beginNavigation, advanceVoyage, navigationHazardDamageModifier } from '../public/alpha/js/game/travel.js';
import { navigationTargetForPort } from '../public/alpha/js/game/navigation.js';
import { navalCombatActionChance, combatAction } from '../public/alpha/js/game/combat.js';
import { beginDeckDrill, personalCombatAction } from '../public/alpha/js/game/personalCombat.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';
import { arcaneStrainReliabilityModifier } from '../public/alpha/js/game/attunement.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';
import { rangeBandFromYards } from '../public/alpha/js/game/physicalDistance.js';
import { SYSTEM_DESCRIPTIONS } from '../public/alpha/js/game/descriptions.js';

function game(seed='a02c', patch={}) {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'A0.2C QA', ...patch }, seed);
}

function combatEncounter(state, rangeYards=700) {
  state.encounter={id:'encounter.a02c',phase:'combat',otherShipId:'ship.ash_gull',range:rangeBandFromYards(rangeYards),rangeYards,sightingRangeNm:.35,shipsSecured:false,elapsedMinutes:0,identified:true,playerIdentityKnown:true,authorityDemanded:false,playerEscaped:false,log:[],round:0};
}

function boardingCombatState(state, source='boarding') {
  return {
    id:`personal.a02c.${source}`,
    source,
    opponentId:'character.seed_raider_captain',
    opponentName:'Sela Marr',
    opponentSkill:50,
    opponentArmor:2,
    playerHealth:40,
    playerHealthMax:40,
    opponentHealth:40,
    opponentHealthMax:40,
    playerAP:0,
    opponentAP:6,
    playerStance:'balanced',
    opponentStance:'balanced',
    pistolLoaded:false,
    round:1,
    log:[],
    resolved:false
  };
}

test('A0.2C normalized database boundary stores prepared effects separately from event history', () => {
  const sql=readFileSync(new URL('../supabase/migrations/0011_alpha_06d_a0_2c_prepared_effects.sql',import.meta.url),'utf8');
  assert.match(sql,/add column if not exists prepared_effects jsonb not null default '\[\]'::jsonb/i);
  assert.match(sql,/Historical ability-use events are not active buffs/i);
  assert.match(sql,/Authoritative Arcane\/Industrial specialization state/i);
});

test('A0.2C advances package only and preserves save schema v12', () => {
  const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.a0-(?:2[cd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  assert.equal(game('schema').schemaVersion,12);
});

test('successful navigation preparations become explicit state and are consumed by exactly the next departure check', () => {
  const choices=structuredClone(DEFAULT_CHARACTER_CHOICES);
  choices.name='Prepared Navigator';
  choices.coreSkills=['arcana','navigation','seamanship','blades','survival'];
  choices.recentProfession='navigator';
  const state=createGame(choices,'navprep0');
  state.player.character.skills.arcana=100;
  state.player.character.skills.navigation=100;

  assert.equal(usePlayerAbility(state,'arcane.wind_weather.read_wind').ok,true);
  assert.equal(usePlayerAbility(state,'tech.instruments.calibrated_sextant_method').ok,true);
  assert.equal(preparedAbilityBonus(state,'arcane.wind_weather.read_wind','navigation_departure',state.player.shipId),6);
  assert.equal(preparedAbilityBonus(state,'tech.instruments.calibrated_sextant_method','navigation_departure',state.player.shipId),8);

  const begun=beginNavigation(state,navigationTargetForPort('port.ironhaven'));
  assert.equal(begun.ok,true);
  assert.equal(state.voyage.navigationQuality.preparationBonus,14);
  assert.equal(state.voyage.navigationQuality.hazardDamageModifier,navigationHazardDamageModifier(state.voyage.navigationQuality.outcome));
  assert.equal(preparedAbilityBonus(state,'arcane.wind_weather.read_wind','navigation_departure',state.player.shipId),0);
  assert.equal(preparedAbilityBonus(state,'tech.instruments.calibrated_sextant_method','navigation_departure',state.player.shipId),0);
  const departure=state.worldEvents.findLast(e=>e.type==='departure');
  assert.equal(departure.canonicalData.preparationBonus,14);
});

test('naval probability preview does not consume bore sighting but the first valid firing check does', () => {
  const state=game('precision-once');
  combatEncounter(state);
  prepareAbilityEffect(state,'tech.precision_weapons.precision_bore_sighting');
  const shipId=state.player.shipId;
  assert.equal(preparedAbilityBonus(state,'tech.precision_weapons.precision_bore_sighting','naval_fire',shipId),8);
  const firstPreview=navalCombatActionChance(state,'fire_hull');
  const secondPreview=navalCombatActionChance(state,'fire_hull');
  assert.equal(firstPreview,secondPreview);
  assert.equal(preparedAbilityBonus(state,'tech.precision_weapons.precision_bore_sighting','naval_fire',shipId),8,'read-only previews must not spend preparation');
  assert.equal(combatAction(state,'fire_hull').ok,true);
  assert.equal(preparedAbilityBonus(state,'tech.precision_weapons.precision_bore_sighting','naval_fire',shipId),0,'first actual fire order consumes the one-shot preparation');
});

test('Personal Ward ignores a non-dangerous exchange, is consumed by the next dangerous one, and still obeys its timer', () => {
  const state=game('ward-danger');
  prepareAbilityEffect(state,'arcane.warding.personal_ward');
  const charId=state.player.character.id;
  assert.equal(preparedAbilityBonus(state,'arcane.warding.personal_ward','personal_defense',charId),10);

  // Exercise the combat resolver without using beginDeckDrill here: A0.2B correctly makes a full
  // deck drill cost two hours, which is also the ward's full lifetime. The point of this branch
  // is that a safe exchange does not consume the one-shot before its timer expires.
  state.personalCombat=boardingCombatState(state,'deck_drill');
  personalCombatAction(state,'end_turn');
  assert.equal(preparedAbilityBonus(state,'arcane.warding.personal_ward','personal_defense',charId),10,'non-dangerous training exchange must not spend a protective ward');

  state.personalCombat=boardingCombatState(state,'boarding');
  personalCombatAction(state,'end_turn');
  assert.equal(preparedAbilityBonus(state,'arcane.warding.personal_ward','personal_defense',charId),0,'first dangerous exchange consumes the ward exactly once');

  prepareAbilityEffect(state,'arcane.warding.personal_ward');
  advanceWorld(state,2);
  assert.equal(preparedAbilityBonus(state,'arcane.warding.personal_ward','personal_defense',charId),0,'a two-hour ward expires at the end of its two-hour lifetime');
});

test('prepared effects are context-bound, expire through world time, and never stack repeated uses', () => {
  const state=game('prepared-context');
  const playerShip=state.player.shipId;
  prepareAbilityEffect(state,'tech.precision_weapons.precision_bore_sighting');
  prepareAbilityEffect(state,'tech.precision_weapons.precision_bore_sighting');
  assert.equal(state.player.character.preparedEffects.filter(e=>e.abilityId==='tech.precision_weapons.precision_bore_sighting').length,1);
  assert.equal(preparedAbilityBonus(state,'tech.precision_weapons.precision_bore_sighting','naval_fire',playerShip),8);
  assert.equal(preparedAbilityBonus(state,'tech.precision_weapons.precision_bore_sighting','naval_fire','ship.ash_gull'),0,'ship-bound preparation must not follow onto another vessel');
  advanceWorld(state,9);
  assert.equal(preparedAbilityBonus(state,'tech.precision_weapons.precision_bore_sighting','naval_fire',playerShip),0);
});

test('departure navigation quality changes hazard consequences without changing whether the weather exists', () => {
  assert.equal(navigationHazardDamageModifier('exceptional_success'),-2);
  assert.equal(navigationHazardDamageModifier('clean_success'),-1);
  assert.equal(navigationHazardDamageModifier('costly_success'),0);
  assert.equal(navigationHazardDamageModifier('failure'),1);
  assert.equal(navigationHazardDamageModifier('severe_failure'),2);

  const state=game('weatherfind0');
  assert.equal(beginNavigation(state,navigationTargetForPort('port.thorenfjord')).ok,true);
  state.voyage.navigationQuality.hazardDamageModifier=-2;
  let weatherEvent;
  for(let i=0;i<60 && state.voyage;i++) {
    const beforeSails=state.ships[state.player.shipId].systems.sails;
    const result=advanceVoyage(state,2);
    if(result.encounter) delete state.encounter;
    if(result.weather) {
      weatherEvent=state.worldEvents.findLast(e=>e.type==='weather_squall');
      assert.equal(weatherEvent.canonicalData.sailDamage,0);
      assert.equal(state.ships[state.player.shipId].systems.sails,beforeSails);
      break;
    }
  }
  assert.ok(weatherEvent,'fixture should encounter a real deterministic squall during the voyage');
  assert.equal(weatherEvent.roll.threshold,0.12,'navigation quality must mitigate consequences, not rewrite the weather trigger');
});

test('Arcane Strain now has a bounded reliability consequence and world-time recovery that is chunk independent', () => {
  assert.equal(arcaneStrainReliabilityModifier(0),0);
  assert.equal(arcaneStrainReliabilityModifier(30),-2);
  assert.equal(arcaneStrainReliabilityModifier(60),-5);
  assert.equal(arcaneStrainReliabilityModifier(90),-9);

  const choices=structuredClone(DEFAULT_CHARACTER_CHOICES);
  choices.name='Strain Captain';
  choices.coreSkills=['arcana','navigation','seamanship','blades','survival'];
  const low=createGame(choices,'straincmp');
  const high=createGame(choices,'straincmp');
  low.player.character.skills.arcana=30;
  high.player.character.skills.arcana=30;
  high.player.character.attunement.arcaneStrain=80;
  high.player.character.condition.arcaneStrain=80;
  usePlayerAbility(low,'arcane.wind_weather.read_wind');
  usePlayerAbility(high,'arcane.wind_weather.read_wind');
  const lowEvent=low.worldEvents.findLast(e=>e.type==='character_ability_use');
  const highEvent=high.worldEvents.findLast(e=>e.type==='character_ability_use');
  assert.equal(lowEvent.roll.value,highEvent.roll.value,'same world seed/check identity should preserve the same d100 roll');
  assert.equal(lowEvent.canonicalData.chance-highEvent.canonicalData.chance,9);

  const oneStep=game('strain-recovery');
  const chunks=game('strain-recovery');
  for(const s of [oneStep,chunks]) { s.player.character.attunement.arcaneStrain=12; s.player.character.condition.arcaneStrain=99; }
  advanceWorld(oneStep,12);
  advanceWorld(chunks,6);
  advanceWorld(chunks,6);
  assert.equal(oneStep.player.character.attunement.arcaneStrain,10);
  assert.equal(chunks.player.character.attunement.arcaneStrain,10);
  assert.equal(oneStep.player.character.condition.arcaneStrain,10,'condition field is a synchronized mirror, not a second strain owner');
});


test('A0.2B lived-time actions feed A0.2C strain recovery through the same world clock', () => {
  const state=game('strain-deck-clock');
  advanceWorld(state,5);
  state.player.character.attunement.arcaneStrain=10;
  state.player.character.condition.arcaneStrain=10;
  const before=state.absoluteHour;
  assert.equal(beginDeckDrill(state).ok,true);
  assert.equal(state.absoluteHour,before+2);
  assert.equal(state.player.character.attunement.arcaneStrain,9,'crossing the six-hour recovery boundary through deck-drill world time should recover exactly one strain');
  assert.equal(state.player.character.condition.arcaneStrain,9);
});

test('Arcane Strain player-facing description only promises implemented reliability and recovery behavior', () => {
  assert.match(SYSTEM_DESCRIPTIONS.arcaneStrain,/reduces Arcane reliability/i);
  assert.match(SYSTEM_DESCRIPTIONS.arcaneStrain,/world time/i);
  assert.doesNotMatch(SYSTEM_DESCRIPTIONS.arcaneStrain,/hallucination|pain|backlash/i);
});

test('legacy v12 saves normalize strain ownership and convert a still-recent prepared ability event once', () => {
  const state=game('legacy-a02c');
  delete state.player.character.preparedEffects;
  state.player.character.attunement.arcaneStrain=34;
  state.player.character.condition.arcaneStrain=2;
  state.worldEvents.push({id:'event.legacy.precision',type:'character_ability_use',atHour:state.absoluteHour,participants:[state.player.character.id,state.player.shipId],summary:'Legacy successful bore sighting.',canonicalData:{abilityId:'tech.precision_weapons.precision_bore_sighting',outcome:'clean_success'},importance:1});
  const migrated=migrateSaveData(JSON.parse(JSON.stringify(state)));
  assert.equal(migrated.schemaVersion,12);
  assert.equal(migrated.player.character.attunement.arcaneStrain,34);
  assert.equal(migrated.player.character.condition.arcaneStrain,34);
  assert.equal(preparedAbilityBonus(migrated,'tech.precision_weapons.precision_bore_sighting','naval_fire',migrated.player.shipId),8);
  assert.equal(migrated.player.character.preparedEffects.filter(e=>e.abilityId==='tech.precision_weapons.precision_bore_sighting').length,1);
});
