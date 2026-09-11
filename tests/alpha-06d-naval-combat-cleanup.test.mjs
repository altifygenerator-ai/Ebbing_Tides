import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { combatAction, navalCombatActionChance, navalCombatSpecializationFor } from '../public/alpha/js/game/combat.js';
import { ensureCrewCommunity } from '../public/alpha/js/game/crewState.js';
import { rangeBandFromYards } from '../public/alpha/js/game/physicalDistance.js';
import { shipConditionSpeedFactor } from '../public/alpha/js/game/shipSpeed.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
function game(seed='naval-cleanup') { return createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'Naval QA'},seed); }
function setEncounter(state,rangeYards=700){
  state.encounter={id:'encounter.naval.qa',phase:'combat',otherShipId:'ship.ash_gull',range:rangeBandFromYards(rangeYards),rangeYards,elapsedMinutes:0,identified:true,playerEscaped:false,log:['Oldest report','Middle report','Newest report'],round:0};
  return state.encounter;
}

test('naval combat render is dynamic hybrid markup and battle report is newest-first',()=>{
  const main=fs.readFileSync(path.join(root,'src/alpha/main.ts'),'utf8');
  assert.match(main,/class="naval-stage-shell"/);
  assert.match(main,/ui\.combat\.skeldra_tactical_sea/);
  assert.match(main,/const newestLog=\[\.\.\.e\.log\]\.reverse\(\)/);
  assert.match(main,/data-order="newest-first"/);
  const renderEncounter=main.slice(main.indexOf('function renderEncounter'),main.indexOf('function renderPersonalCombat'));
  assert.doesNotMatch(renderEncounter,/renderMappedArtScreen\("ui\.combat\.naval_encounter"/,'combat must no longer scale the 492x289 ArtDirectedCanvas runtime base');
});

test('responsive naval combat CSS keeps desktop controls readable instead of art-scale shrinking',()=>{
  const css=fs.readFileSync(path.join(root,'public/alpha/styles.css'),'utf8');
  assert.match(css,/\.naval-action\{[^}]*min-height:50px/s);
  assert.match(css,/\.naval-stage-shell\{[^}]*grid-template-columns/s);
  assert.match(css,/\.naval-combat-screen\{[^}]*overflow-y:auto/s);
  assert.doesNotMatch(css.slice(css.lastIndexOf('Alpha 0.6D — Naval Combat'),undefined),/var\(--art-scale/);
});

test('runtime tactical sea art is a large ship-free environment asset with no functional UI text',()=>{
  const assetPath=path.join(root,'public/art/ui/combat/skeldra_tactical_sea_stage.svg');
  const svg=fs.readFileSync(assetPath,'utf8');
  assert.match(svg,/viewBox="0 0 1920 900"/);
  assert.doesNotMatch(svg,/<text\b/i);
  assert.doesNotMatch(svg,/Tideworn|Ash Gull|Fire Hull|Round \d|Hull \d/i);
});

test('naval actions opt into relevant specializations and Long-Range gunnery actually changes chance',()=>{
  assert.equal(navalCombatSpecializationFor('fire_hull',700),'Long-Range');
  assert.equal(navalCombatSpecializationFor('fire_hull',250),undefined);
  assert.equal(navalCombatSpecializationFor('repair',700),'Naval Machinery');
  assert.equal(navalCombatSpecializationFor('demand_surrender',700),'Naval Discipline');
  assert.equal(navalCombatSpecializationFor('close',700),'Heavy Weather');

  const base=game('naval-spec'); setEncounter(base,700);
  const gunner=base.npcs['character.ulf_brenn'];
  gunner.specializations=[];
  const without=navalCombatActionChance(base,'fire_hull');
  gunner.specializations=[{id:'spec.test.long_range',skillId:'gunnery',name:'Long-Range',rating:8,source:'QA',learnedAtHour:0}];
  const withSpec=navalCombatActionChance(base,'fire_hull');
  assert.equal(withSpec-without,8);
});

test('naval action probabilities remain clamped to d100 2-98 bounds',()=>{
  const high=game('naval-high'); setEncounter(high,500);
  const gunnerHigh=high.npcs['character.ulf_brenn'];
  gunnerHigh.skills.gunnery=100; gunnerHigh.attributes.perception=10;
  high.ships[high.player.shipId].firepower=80;
  high.ships['ship.ash_gull'].maneuverability=0;
  ensureCrewCommunity(high.ships[high.player.shipId]).gunnery=100;
  assert.equal(navalCombatActionChance(high,'fire_hull'),98);

  const low=game('naval-low'); setEncounter(low,1400);
  const gunnerLow=low.npcs['character.ulf_brenn'];
  gunnerLow.skills.gunnery=0; gunnerLow.attributes.perception=1; gunnerLow.specializations=[];
  low.ships[low.player.shipId].firepower=0;
  low.ships['ship.ash_gull'].maneuverability=40;
  Object.assign(ensureCrewCommunity(low.ships[low.player.shipId]),{gunnery:0,discipline:0,experience:0,fatigue:100});
  low.ships[low.player.shipId].systems.morale=0;
  assert.equal(navalCombatActionChance(low,'fire_hull'),2);
});

test('exact yard distance stays authoritative and the displayed band stays synchronized after maneuvers',()=>{
  const state=game('naval-range-sync');
  const encounter=setEncounter(state,620);
  const before=encounter.rangeYards;
  combatAction(state,'close');
  assert.equal(encounter.range,rangeBandFromYards(encounter.rangeYards,encounter.range==='boarding'));
  assert.ok(Number.isFinite(encounter.rangeYards));
  assert.ok(encounter.rangeYards>=0);
  // Whether the deterministic check succeeds or fails, movement is physical and never a band teleport.
  assert.ok(Math.abs(encounter.rangeYards-before)<700);
});

test('sails and rigging damage materially reduce combat handling speed factor',()=>{
  const state=game('naval-handling-damage');
  const ship=state.ships[state.player.shipId];
  const healthy=shipConditionSpeedFactor(ship);
  ship.systems.sails=Math.round(ship.systems.sailsMax*.35);
  ship.systems.rigging=Math.round(ship.systems.riggingMax*.35);
  const damaged=shipConditionSpeedFactor(ship);
  assert.ok(damaged<healthy);
});
