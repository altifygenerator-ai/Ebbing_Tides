import { ABILITY_BY_ID } from "../data/seed/abilities.js";
import { ITEM_BY_ID } from "../data/seed/items.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { POI_BY_ID } from "../data/seed/pois.js";
import { applyArcaneStrain, arcaneStrainReliabilityModifier, calculateInterference, refreshDerivedAttunement } from "./attunement.js";
import { resolveCheck } from "./checks.js";
import { advanceWorld } from "./worldSimulation.js";
import { generalPerkModifier, recordMeaningfulPractice } from "./progression.js";
import { PREPARED_ABILITY_RULES, prepareAbilityEffect, preparedAbilityEffect } from "./preparedEffects.js";
import type { AttunementLoad, GameState } from "./types.js";

function currentLoads(state: GameState): AttunementLoad[] {
  const ship = state.ships[state.player.shipId];
  const location = state.player.currentPortId ? PORT_BY_ID[state.player.currentPortId] : state.player.currentPoiId ? POI_BY_ID[state.player.currentPoiId] : undefined;
  return [ship?.attunementLoad, location?.attunementLoad].filter((row): row is AttunementLoad => Boolean(row));
}

function known(state: GameState, abilityId: string): boolean {
  return state.player.character.abilities.some((row) => row.abilityId === abilityId && row.status === "known");
}

function hasRequiredItemTags(state: GameState, required: string[]): boolean {
  const tags = new Set(state.player.inventory.flatMap(instance => ITEM_BY_ID[instance.definitionId]?.tags ?? []));
  return required.every(tag => tags.has(tag));
}

export function usePlayerAbility(state: GameState, abilityId: string): { ok: boolean; message: string } {
  const def = ABILITY_BY_ID[abilityId]; const pc = state.player.character; const ship = state.ships[state.player.shipId];
  if (!def || !known(state, abilityId)) return { ok:false, message:"That practice or technique is not part of your character's learned history." };
  if (def.requiredSkillId && pc.skills[def.requiredSkillId] < (def.requiredSkillRating ?? 0)) return { ok:false, message:`${def.name} requires more ${def.requiredSkillId} training.` };
  if (def.requiredSystemTags?.length && (!ship || !def.requiredSystemTags.every(tag => ship.systemTags?.includes(tag)))) return { ok:false, message:`${def.name} requires a compatible real ship system or tool.` };
  if (def.requiredItemTags?.length && !hasRequiredItemTags(state, def.requiredItemTags)) return { ok:false, message:`${def.name} requires a compatible carried instrument.` };

  const interference = calculateInterference(pc.attunement, currentLoads(state));
  const isArcane = def.type === "arcane_practice";
  const strainBefore = pc.attunement.arcaneStrain;
  const strainReliability = isArcane ? arcaneStrainReliabilityModifier(strainBefore) : 0;
  const reliability = isArcane ? interference.arcaneReliabilityModifier + strainReliability : interference.industrialReliabilityModifier;
  const skillId = def.requiredSkillId ?? (isArcane ? "arcana" : "engineering");
  const attributeId = isArcane ? "will" : "intellect";
  const ritualTalent = isArcane && (def.strainCost ?? 0) >= 4 ? generalPerkModifier(pc,"arcane_ritual") : {value:0,sources:[]};
  const repairTalent = abilityId === "tech.naval_engineering.emergency_hull_shoring" ? generalPerkModifier(pc,"field_repair") : {value:0,sources:[]};
  const abilityPerk = ritualTalent.value >= repairTalent.value ? ritualTalent : repairTalent;
  const check = resolveCheck({ worldSeed:state.worldSeed, checkId:`ability:${abilityId}:${state.absoluteHour}`, skillId, skillRating:pc.skills[skillId], attributeId, attributeRating:pc.attributes[attributeId], difficulty:15, environmentModifier:reliability, perkModifier:abilityPerk.value, perkSources:abilityPerk.sources, specializations:pc.specializations });
  recordMeaningfulPractice(state,pc.id,skillId,`ability:${abilityId}`,20);
  if (isArcane) { const strain=Math.max(0,(def.strainCost ?? 1) - (ritualTalent.value>0?1:0)); applyArcaneStrain(pc.attunement, strain); pc.attunement.arcaneExposure += Math.max(1, def.strainCost ?? 1); pc.condition.arcaneStrain = pc.attunement.arcaneStrain; }
  else if (def.type === "technical_technique") pc.attunement.industrialExposure += 2;
  refreshDerivedAttunement(pc);

  let effect = "No lasting effect.";
  let prepared = false;
  if (check.outcome === "clean_success" || check.outcome === "exceptional_success" || check.outcome === "costly_success") {
    if (abilityId === "arcane.wind_weather.read_wind") { prepareAbilityEffect(state,abilityId); prepared=true; effect = "Wind/current reading recorded for the next navigation check."; }
    else if (abilityId === "arcane.sight_divination.sense_resonance") effect = `Resonance impression: ${interference.severity} local Arcane/Industrial interference; ${interference.symptoms.join("; ")}.`;
    else if (abilityId === "arcane.warding.personal_ward") { prepareAbilityEffect(state,abilityId); prepared=true; effect = "A brief personal ward is active for the next dangerous exchange."; }
    else if (abilityId === "tech.naval_engineering.emergency_hull_shoring" && ship) { if (ship.systems.hull >= ship.systems.hullMax) return {ok:false,message:"The hull does not currently need emergency shoring."}; ship.systems.hull=Math.min(ship.systems.hullMax,ship.systems.hull+6); ship.supplies=Math.max(0,ship.supplies-1); advanceWorld(state,2); effect="Damage-control materials and two hours of crew labor stabilized part of the hull."; }
    else if (abilityId === "tech.instruments.calibrated_sextant_method") { prepareAbilityEffect(state,abilityId); prepared=true; effect = "A calibrated position fix is recorded for the next route-planning check."; }
    else if (abilityId === "tech.precision_weapons.precision_bore_sighting") { prepareAbilityEffect(state,abilityId); prepared=true; effect = "The battery is bore-sighted; the next naval firing check gains preparation."; }
  } else effect = def.failureProfile;

  state.worldEvents.push({ id:`event.ability.${abilityId}.${state.absoluteHour}.${state.worldEvents.length}`, type:"character_ability_use", atHour:state.absoluteHour, ...(state.player.currentPortId?{locationId:state.player.currentPortId}:state.player.currentPoiId?{locationId:state.player.currentPoiId}:{}), participants:[pc.id,state.player.shipId], summary:`${pc.name} used ${def.name}. ${effect}`, canonicalData:{abilityId,outcome:check.outcome,roll:check.roll,chance:check.chance,interference:interference.score,arcaneStrainBefore:strainBefore,strainReliabilityModifier:strainReliability,preparedEffect:prepared}, importance:1, roll:{key:check.checkId,value:check.roll,threshold:check.chance} });
  return { ok:true, message:`${def.name}: ${effect}` };
}

/** @deprecated A0.2C: historical WorldEvent rows are not active buffs. Use preparedEffects helpers. */
export function recentAbilityEffect(state: GameState, abilityId: string, withinHours: number): boolean {
  const rule=PREPARED_ABILITY_RULES[abilityId];
  if(!rule)return false;
  const context=rule.context === "ship" ? state.player.shipId : state.player.character.id;
  const effect=preparedAbilityEffect(state,abilityId,rule.trigger,context);
  return Boolean(effect && state.absoluteHour-effect.preparedAtHour <= withinHours);
}
