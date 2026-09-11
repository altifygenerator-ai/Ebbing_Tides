import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { ALL_SKILLS, ATTRIBUTE_IDS } from '../public/alpha/js/game/skills.js';
import { effectiveSpecialist } from '../public/alpha/js/game/delegation.js';
import { resolveCheck } from '../public/alpha/js/game/checks.js';
import { recordMeaningfulPractice, learnAbilityFromSource } from '../public/alpha/js/game/progression.js';
import { calculateInterference } from '../public/alpha/js/game/attunement.js';
import { usePlayerAbility } from '../public/alpha/js/game/abilitiesRuntime.js';
import { advanceWorld } from '../public/alpha/js/game/worldSimulation.js';
import { beginNavigation } from '../public/alpha/js/game/travel.js';
import { navigationTargetForPort } from '../public/alpha/js/game/navigation.js';
import { GLOBAL_ATLAS, NAVIGATION_ZOOMS, NAVIGATION_VIEW, REGIONAL_MAP_LAYERS, mapLayersForViewport } from '../public/alpha/js/data/seed/worldMap.js';
import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';
import { PORTS } from '../public/alpha/js/data/seed/ports.js';
import { POINTS_OF_INTEREST } from '../public/alpha/js/data/seed/pois.js';

function game(seed='alpha05a', patch={}) {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Update A Captain', ...patch }, seed);
}

test('0.5A uses the Character System Bible six attributes and 18 canonical skills for player and named NPCs', () => {
  const state=game('shared-character');
  assert.deepEqual(Object.keys(state.player.character.attributes), ATTRIBUTE_IDS);
  assert.equal(ALL_SKILLS.length,18);
  assert.deepEqual(Object.keys(state.player.character.skills),ALL_SKILLS);
  const npc=state.npcs['character.mira_holst'];
  assert.deepEqual(Object.keys(npc.attributes),ATTRIBUTE_IDS);
  assert.deepEqual(Object.keys(npc.skills),ALL_SKILLS);
  assert.ok(Array.isArray(npc.specializations));
  assert.ok(npc.attunement && npc.condition && npc.brain);
});

test('identity keeps ancestry, homeland, culture and religion separate while portrait is backed by Visual DNA', () => {
  const state=game('identity-separation',{ ancestry:'serathi', culture:'skeldran', religion:'old_gods', portraitId:'portrait.pending.skeldra' });
  const c=state.player.character;
  assert.equal(c.ancestry,'serathi');
  assert.equal(c.homelandRegion,'skeldra');
  assert.equal(c.culture,'skeldran');
  assert.equal(c.religion,'old_gods');
  assert.equal(c.visualDna.ancestryPrimary,'serathi');
  assert.equal(c.visualDna.clothingCulture,'skeldran');
  assert.equal(c.visualDna.religionPresentation,'old_gods');
  assert.equal('appearance' in c,false,'old global feature-selector payload should not remain canonical');
});

test('shared check resolver is deterministic, graded, and logs specialist identity without granting omniscience', () => {
  const state=game('checks');
  const specialist=effectiveSpecialist(state,'navigation');
  assert.equal(specialist.name,'Nils Orr');
  assert.ok(specialist.rating > state.player.character.skills.navigation);
  const request={worldSeed:state.worldSeed,checkId:'test.navigation',skillId:'navigation',skillRating:specialist.rating,attributeId:'perception',attributeRating:state.npcs[specialist.characterId].attributes.perception,difficulty:18,specialistCharacterId:specialist.characterId};
  const a=resolveCheck(request), b=resolveCheck(request);
  assert.deepEqual(a,b);
  assert.ok(['exceptional_success','clean_success','costly_success','failure','severe_failure'].includes(a.outcome));
  assert.equal(a.specialistCharacterId,specialist.characterId);
  state.player.knownPortIds=state.player.knownPortIds.filter(id=>id!=='port.ironhaven');
  assert.equal(beginNavigation(state,navigationTargetForPort('port.ironhaven')).ok,false,'skill cannot reveal an unknown route');
});

test('meaningful-use progression damps repeated trivial practice and supports in-world learning sources', () => {
  const state=game('progression');
  const id=state.player.character.id;
  const first=recordMeaningfulPractice(state,id,'navigation','same-trivial-practice',8);
  recordMeaningfulPractice(state,id,'navigation','same-trivial-practice',8);
  recordMeaningfulPractice(state,id,'navigation','same-trivial-practice',8);
  const fourth=recordMeaningfulPractice(state,id,'navigation','same-trivial-practice',8);
  assert.ok(first.gained > fourth.gained);
  assert.equal(fourth.gained,0);
  state.player.character.skills.engineering=40;
  const learned=learnAbilityFromSource(state,id,'tech.naval_engineering.emergency_hull_shoring','Elsa Tarn apprenticeship lesson');
  assert.equal(learned.ok,true);
  assert.ok(state.player.character.trainingHistory.some(row=>row.subjectId==='tech.naval_engineering.emergency_hull_shoring'));
  assert.ok(state.worldEvents.some(event=>event.type==='character_learning'));
});

test('Arcane practice creates strain and canonical event while interference is visible instead of arbitrary equipment bans', () => {
  const choices=structuredClone(DEFAULT_CHARACTER_CHOICES);
  choices.name='Arcane Captain'; choices.coreSkills=['seamanship','navigation','arcana','blades','survival'];
  const state=createGame(choices,'arcane-practice');
  const before=state.player.character.attunement.arcaneStrain;
  const used=usePlayerAbility(state,'arcane.wind_weather.read_wind');
  assert.equal(used.ok,true);
  assert.ok(state.player.character.attunement.arcaneStrain > before);
  assert.ok(state.worldEvents.some(event=>event.canonicalData.abilityId==='arcane.wind_weather.read_wind'));
  const ordinary=calculateInterference({value:-80,arcaneStrain:0,arcaneExposure:0,industrialExposure:0},[{arcane:0,industrial:3,sensitivity:.25,mitigationTags:['ordinary_mechanics']}]);
  assert.notEqual(ordinary.severity,'extreme');
  const extreme=calculateInterference({value:-90,arcaneStrain:0,arcaneExposure:0,industrialExposure:0},[{arcane:0,industrial:90,sensitivity:1,mitigationTags:[]}]);
  assert.ok(['high','extreme'].includes(extreme.severity));
});

test('technical techniques require actual compatible equipment or ship systems', () => {
  const state=game('tech-requirement',{recentProfession:'navigator'});
  assert.ok(state.player.character.abilities.some(row=>row.abilityId==='tech.instruments.calibrated_sextant_method'));
  assert.equal(usePlayerAbility(state,'tech.instruments.calibrated_sextant_method').ok,true);
  state.player.inventory=state.player.inventory.filter(row=>row.definitionId!=='item.tool.calibrated_sextant');
  assert.equal(usePlayerAbility(state,'tech.instruments.calibrated_sextant_method').ok,false);
  state.player.character.skills.engineering=45;
  learnAbilityFromSource(state,state.player.character.id,'tech.naval_engineering.emergency_hull_shoring','Shipwright training');
  state.ships[state.player.shipId].systems.hull=state.ships[state.player.shipId].systems.hullMax-6;
  assert.equal(usePlayerAbility(state,'tech.naval_engineering.emergency_hull_shoring').ok,true);
  delete state.ships[state.player.shipId].systemTags;
  assert.equal(usePlayerAbility(state,'tech.naval_engineering.emergency_hull_shoring').ok,false);
});

test('NPCs follow Plan Until Interrupted and do not re-plan every arbitrary tick', () => {
  const state=game('npc-plan');
  const npc=state.npcs['character.ingrid_skar'];
  const planId=npc.brain.currentPlan?.id;
  assert.ok(planId);
  const beforeProgress=npc.brain.currentPlan.progress;
  advanceWorld(state,1);
  assert.equal(npc.brain.currentPlan?.id,planId);
  assert.ok(npc.brain.currentPlan.progress >= beforeProgress);
  npc.brain.needs.foodDays=.1;
  advanceWorld(state,1);
  assert.equal(npc.brain.currentPlan?.status,'active');
  assert.equal(npc.brain.currentPlan?.survivalRecovery,true,'a meaningful survival interrupt should immediately become a durable return-to-port recovery plan');
  assert.ok(state.worldEvents.some(event=>event.type==='npc_plan_interrupted' && event.participants.includes(npc.id)));
});

test('NPC simulation LOD changes with proximity while persistent history/state remains intact', () => {
  const state=game('lod');
  const npc=state.npcs['character.ingrid_skar']; const ship=state.ships[npc.shipId]; const player=state.ships[state.player.shipId];
  ship.position={...player.position}; advanceWorld(state,1); assert.equal(npc.brain.simulationLod,'detailed');
  ship.position={x:55,y:5}; advanceWorld(state,1); assert.notEqual(npc.brain.simulationLod,'detailed');
  assert.equal(npc.id,'character.ingrid_skar'); assert.ok(npc.goals.length);
});

test('map camera scale is decoupled from world coordinates and regional layers are registered for art replacement', () => {
  assert.equal(GLOBAL_ATLAS.version,'WORLD_ATLAS_0.6D_LABELED_CANON1');
  assert.deepEqual(NAVIGATION_VIEW,NAVIGATION_ZOOMS.far);
  assert.deepEqual([NAVIGATION_ZOOMS.far.width,NAVIGATION_ZOOMS.far.height],[120,80]);
  assert.deepEqual([NAVIGATION_ZOOMS.navigation.width,NAVIGATION_ZOOMS.navigation.height],[18,12]);
  assert.deepEqual([NAVIGATION_ZOOMS.close.width,NAVIGATION_ZOOMS.close.height],[12,8]);
  const layers=mapLayersForViewport({x:20,y:8},'navigation');
  assert.ok(layers.some(layer=>layer.id==='layer.world.labeled.v06d'));
  assert.equal(REGIONAL_MAP_LAYERS.length,1,'labeled atlas is the sole active painting in this baseline');
  const slot=ASSET_BY_ID[REGIONAL_MAP_LAYERS[0].assetId];
  assert.equal(slot.type,'MAP_REFERENCE');
  assert.ok(slot.mapRegistration?.globalBounds);
});

test('all current ports and POIs remain enterable destination records after the 0.5A architecture changes', () => {
  for(const port of PORTS) assert.ok(port.arrivalActions.some(action=>action.id==='town'),`${port.name} must be enterable`);
  for(const poi of POINTS_OF_INTEREST) assert.ok(poi.arrivalActions.some(action=>action.id==='enter_site'),`${poi.name} must expose site entry`);
});

test('0.4 campaign snapshots migrate into current schema 12 character/NPC/map state', async () => {
  const fresh=game('migrate-v4');
  const old=structuredClone(fresh);
  old.schemaVersion=4;
  old.player.character={...old.player.character, attributes:{strength:5,dexterity:6,perception:6,intelligence:5,willpower:5,charisma:5}, skills:{sailing:5,navigation:4,gunnery:3,ship_command:3,ship_repair:2,blades:4,pistols:3,defense:3,persuasion:2,trading:2,streetwise:1,engineering:1,religion:1,investigation:2}, aptitude:0, appearance:{presentation:'masculine',build:'average',hair:'light_brown',eyes:'gray',complexion:'weathered_fair',distinguishingMark:'none'}};
  delete old.player.character.visualDna; delete old.player.character.attunement; delete old.player.character.condition; delete old.player.character.abilities; delete old.player.character.specializations; delete old.player.character.knowledgeEntries;
  delete old.settings.navigationZoom; delete old.simulationEvents;
  const store=new Map([['ebbing-tides.alpha.save',JSON.stringify(old)]]);
  globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key),clear:()=>store.clear(),key:index=>[...store.keys()][index]??null,get length(){return store.size;}};
  const {loadLocal}=await import(`../public/alpha/js/services/localSave.js?v5=${Date.now()}`);
  const migrated=loadLocal();
  assert.equal(migrated.schemaVersion,12);
  assert.equal(migrated.settings.navigationZoom,'far');
  assert.deepEqual(Object.keys(migrated.player.character.attributes),ATTRIBUTE_IDS);
  assert.equal(migrated.player.character.visualDna.sex,'male');
  assert.ok(migrated.npcs['character.ingrid_skar'].brain.currentPlan);
  assert.ok(Array.isArray(migrated.simulationEvents));
});
