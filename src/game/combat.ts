import type { ActiveEncounter, GameState, ShipEntity } from "./types.js";
import { roll2d10 } from "./rng.js";
import { resolveCheck } from "./checks.js";
import { effectiveSpecialist } from "./delegation.js";
import { consumePreparedAbilityEffect, preparedAbilityBonus } from "./preparedEffects.js";
import { awardLifeExperience, generalPerkModifier, recordMeaningfulPractice } from "./progression.js";
import { MAX_TACTICAL_RANGE_YARDS, TACTICAL_ROUND_MINUTES, rangeBandFromYards, rangeChangeYards } from "./physicalDistance.js";
import { baseCruiseSpeedKnots, shipConditionSpeedFactor } from "./shipSpeed.js";
import { advanceWorld } from "./worldSimulation.js";
import { recordCrewCasualties, recordDangerousCrewOrder } from "./crewMechanics.js";
import { crewActionModifier, ordinaryCrewCount } from "./crewState.js";
import { recordNavalAggressionCrime, reportEncounterCrimes } from "./reputationLaw.js";
import { isShipOperational, resolvePlayerPrize } from "./vesselLifecycle.js";

export type CombatAction = "close" | "open" | "grapple" | "demand_surrender" | "fire_hull" | "fire_rigging" | "repair" | "flee";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function syncRange(encounter: ActiveEncounter): void {
  encounter.range = rangeBandFromYards(encounter.rangeYards, encounter.range === "boarding");
}

function rangeModifier(rangeYards: number): number {
  if (rangeYards <= 50) return 3;
  if (rangeYards <= 300) return 2;
  if (rangeYards <= 800) return 0;
  if (rangeYards <= 1500) return -2;
  return -4;
}

/**
 * Naval actions must opt into the exact specialization they conceptually use.
 * The shared check resolver deliberately does not guess from a character's list.
 */
export function navalCombatSpecializationFor(action: CombatAction, rangeYards: number): string | undefined {
  if (action === "fire_hull" || action === "fire_rigging") return rangeYards > 300 ? "Long-Range" : undefined;
  if (action === "repair") return "Naval Machinery";
  if (action === "demand_surrender") return "Naval Discipline";
  if (action === "close" || action === "open" || action === "flee" || action === "grapple") return "Heavy Weather";
  return undefined;
}

function navalCombatSpecializationRequest(action: CombatAction, rangeYards: number): { specializationName?: string } {
  const specializationName=navalCombatSpecializationFor(action,rangeYards);
  return specializationName ? { specializationName } : {};
}

function combatSpeedKnots(ship: ShipEntity): number {
  return Math.max(0.75, baseCruiseSpeedKnots(ship) * shipConditionSpeedFactor(ship));
}

function maneuverRelativeKnots(actor: ShipEntity, opponent: ShipEntity, mode: "close" | "open"): number {
  const actorSpeed = combatSpeedKnots(actor);
  const opponentSpeed = combatSpeedKnots(opponent);
  const maneuverEdge = (actor.maneuverability - opponent.maneuverability) * 0.28;
  const speedEdge = (actorSpeed - opponentSpeed) * 0.28;
  const base = mode === "close" ? 3.0 : 2.6;
  return clamp(base + maneuverEdge + speedEdge, 0.75, 7.0);
}

function changeRange(encounter: ActiveEncounter, relativeKnots: number): number {
  const delta = rangeChangeYards(relativeKnots, TACTICAL_ROUND_MINUTES);
  encounter.rangeYards = clamp(encounter.rangeYards - delta, 0, MAX_TACTICAL_RANGE_YARDS * 1.5);
  syncRange(encounter);
  return Math.abs(delta);
}

function advanceCombatTime(state: GameState, encounter: ActiveEncounter): void {
  const beforeHours = Math.floor(encounter.elapsedMinutes / 60);
  encounter.elapsedMinutes += TACTICAL_ROUND_MINUTES;
  const afterHours = Math.floor(encounter.elapsedMinutes / 60);
  if (afterHours > beforeHours) advanceWorld(state, afterHours - beforeHours);
}

function damageShip(target: ShipEntity, amount: number, targetSystem: "hull" | "sails" = "hull"): void {
  if (targetSystem === "hull") {
    target.systems.hull = clamp(target.systems.hull - amount, 0, target.systems.hullMax);
    if (amount >= 8) target.systems.flooding = clamp(target.systems.flooding + 1, 0, 4);
  } else {
    target.systems.sails = clamp(target.systems.sails - amount, 0, target.systems.sailsMax);
    target.systems.rigging = clamp(target.systems.rigging - Math.ceil(amount / 2), 0, target.systems.riggingMax);
  }
}

function resolveEnemyTurn(state: GameState): string {
  const encounter = state.encounter;
  if (!encounter || encounter.phase !== "combat") return "";
  const enemy = state.ships[encounter.otherShipId];
  const playerShip = state.ships[state.player.shipId];
  if (!enemy || !playerShip) return "";
  if (enemy.systems.hull <= 0 || enemy.systems.crew <= 0) return "";

  if (encounter.shipsSecured) {
    const clash = roll2d10(state.worldSeed, `combat:${encounter.id}:grapple:${encounter.round}`);
    const loss = clash.total >= 14 && ordinaryCrewCount(state)>0 ? 1 : 0;
    if(loss>0){
      playerShip.systems.crew = clamp(playerShip.systems.crew - loss, 0, playerShip.systems.crewMax);
      recordCrewCasualties(state,loss,"boarding action at the rail");
    } else {
      playerShip.systems.morale = clamp(playerShip.systems.morale - 1, 0, 100);
    }
    return loss ? `${enemy.name}'s boarders press the rail; one of your crew goes down.` : `${enemy.name}'s crew tests the grapples, but your people hold the rail.`;
  }

  if (encounter.rangeYards > 1500 || (encounter.rangeYards > 800 && enemy.firepower < 5)) {
    const delta = changeRange(encounter, maneuverRelativeKnots(enemy, playerShip, "close"));
    return `${enemy.name} bears down, closing about ${Math.round(delta)} yd to ${Math.round(encounter.rangeYards)} yd.`;
  }

  const owner = state.npcs[enemy.ownerCharacterId];
  const enemySkill = owner?.skills.gunnery ?? Math.min(80,30+enemy.firepower*4);
  const check = resolveCheck({worldSeed:state.worldSeed,checkId:`combat:${encounter.id}:enemy:${encounter.round}`,skillId:"gunnery",skillRating:enemySkill,attributeId:"perception",attributeRating:owner?.attributes.perception ?? 5,difficulty:18+playerShip.maneuverability*2-rangeModifier(encounter.rangeYards)*2,...navalCombatSpecializationRequest("fire_hull",encounter.rangeYards),...(owner?{specializations:owner.specializations}:{}),...(owner?{specialistCharacterId:owner.id}:{})});
  if (!["failure","severe_failure"].includes(check.outcome)) {
    const damage = Math.max(3, enemy.firepower + Math.max(0,Math.floor(check.margin/12)));
    damageShip(playerShip, damage, "hull");
    playerShip.systems.morale = clamp(playerShip.systems.morale - 3, 0, 100);
    return `${enemy.name} fires effectively at ${Math.round(encounter.rangeYards)} yd. Your hull takes ${damage} damage (${check.roll} vs ${check.chance}).`;
  }
  return `${enemy.name}'s broadside at ${Math.round(encounter.rangeYards)} yd throws spray and splinters but fails to land an effective hit.`;
}

function resolveVictory(state: GameState): string | undefined {
  const encounter = state.encounter;
  if (!encounter) return undefined;
  const enemy = state.ships[encounter.otherShipId];
  const playerShip = state.ships[state.player.shipId];
  if (!enemy || !playerShip) return undefined;

  if (enemy.systems.hull <= 0 || enemy.systems.crew <= 0 || enemy.systems.morale <= 0) {
    const resolution = resolvePlayerPrize(state, encounter, enemy, "naval");
    if (!resolution.ok) return `${enemy.name} has already been resolved as a ${resolution.status} vessel; no second prize can be claimed.`;
    const prize = resolution.prize;
    awardLifeExperience(state,state.player.character.id,`naval-victory:${encounter.id}`,`Won naval engagement against ${enemy.name}`,"major");
    for(const member of state.player.crew){if(member.npcId)awardLifeExperience(state,member.npcId,`naval-victory:${encounter.id}`,`Served in naval victory against ${enemy.name}`,50);}
    state.worldEvents.push({
      id: `event.combat.victory.${encounter.id}`,
      type: "naval_combat_resolved",
      atHour: state.absoluteHour,
      participants: [playerShip.id, enemy.id],
      summary: resolution.status === "captured"
        ? `${enemy.name} struck colors and became a captured prize. The player secured ${prize} crowns in immediate prize value.`
        : `${enemy.name} was disabled and removed from the fight. The player secured ${prize} crowns in salvage and immediate prize value.`,
      canonicalData: { result: "player_victory", prize, enemyShipId: enemy.id, vesselStatus:resolution.status, rangeYards:Math.round(encounter.rangeYards), combatElapsedMinutes:encounter.elapsedMinutes },
      importance: 4
    });
    return resolution.status === "captured"
      ? `${enemy.name} strikes colors. You secure ${prize} crowns in immediate prize value.`
      : `${enemy.name} can no longer continue the fight. You secure ${prize} crowns in salvage and immediate prize value.`;
  }

  if (playerShip.systems.hull <= 0 || playerShip.systems.crew <= 0 || playerShip.systems.morale <= 0) {
    encounter.phase = "resolved";
    reportEncounterCrimes(state, encounter, enemy, "the victorious vessel retained surviving witnesses to the engagement");
    const lostCrowns = Math.min(60, state.player.character.crowns);
    state.player.character.crowns -= lostCrowns;
    playerShip.systems.hull = Math.min(playerShip.systems.hullMax, Math.max(1, Math.round(playerShip.systems.hullMax * 0.3)));
    playerShip.systems.morale = 35;
    state.worldEvents.push({
      id: `event.combat.defeat.${encounter.id}`,
      type: "naval_combat_resolved",
      atHour: state.absoluteHour,
      participants: [playerShip.id, enemy.id],
      summary: `The player ship was forced to strike colors and later released after paying ${lostCrowns} crowns.`,
      canonicalData: { result: "player_defeat", lostCrowns, rangeYards:Math.round(encounter.rangeYards), combatElapsedMinutes:encounter.elapsedMinutes },
      importance: 4
    });
    return `Your ship is forced to strike colors. You survive, but lose ${lostCrowns} crowns and Tideworn is left badly battered.`;
  }
  return undefined;
}

/** Read-only probability audit used by tests/tuning; it does not consume a combat round. */
export function navalCombatActionChance(state: GameState, action: CombatAction): number | undefined {
  const encounter=state.encounter;
  if(!encounter || encounter.phase!=="combat")return undefined;
  const enemy=state.ships[encounter.otherShipId];
  const playerShip=state.ships[state.player.shipId];
  if(!enemy||!playerShip)return undefined;
  const checkId=`combat-preview:${encounter.id}:${action}`;
  if(action==="demand_surrender"){
    const pc=state.player.character;
    const commandTalent=generalPerkModifier(pc,"command_surrender");
    return resolveCheck({worldSeed:state.worldSeed,checkId,skillId:"command",skillRating:pc.skills.command,attributeId:"presence",attributeRating:pc.attributes.presence,difficulty:20+Math.round(enemy.systems.morale/4),assistanceModifier:Math.round(Math.max(0,40-enemy.systems.morale)/3),perkModifier:commandTalent.value,perkSources:commandTalent.sources,...navalCombatSpecializationRequest(action,encounter.rangeYards),specializations:pc.specializations,specialistCharacterId:pc.id}).chance;
  }
  if(action==="repair"){
    const specialist=effectiveSpecialist(state,"engineering"); const actor=specialist.source==="officer"?state.npcs[specialist.characterId]:state.player.character;
    const repairTalent=generalPerkModifier(actor,"field_repair"); const captainRepairTalent=actor?.id===state.player.character.id?{value:0,sources:[]}:generalPerkModifier(state.player.character,"field_repair"); const repairPerk=repairTalent.value>=captainRepairTalent.value?repairTalent:captainRepairTalent;
    return resolveCheck({worldSeed:state.worldSeed,checkId,skillId:"engineering",skillRating:specialist.rating,attributeId:"intellect",attributeRating:actor?.attributes.intellect??state.player.character.attributes.intellect,difficulty:18+playerShip.systems.flooding*5,perkModifier:repairPerk.value,perkSources:repairPerk.sources,...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId}).chance;
  }
  if(action==="fire_hull"||action==="fire_rigging"){
    const specialist=effectiveSpecialist(state,"gunnery"); const actor=specialist.source==="officer"?state.npcs[specialist.characterId]:state.player.character;
    const prepared=preparedAbilityBonus(state,"tech.precision_weapons.precision_bore_sighting","naval_fire",playerShip.id);
    const gunTalent=generalPerkModifier(actor,"naval_gunnery"); const captainGunTalent=actor?.id===state.player.character.id?{value:0,sources:[]}:generalPerkModifier(state.player.character,"naval_gunnery"); const gunneryPerk=gunTalent.value>=captainGunTalent.value?gunTalent:captainGunTalent;
    return resolveCheck({worldSeed:state.worldSeed,checkId,skillId:"gunnery",skillRating:specialist.rating,attributeId:"perception",attributeRating:actor?.attributes.perception??state.player.character.attributes.perception,difficulty:18+enemy.maneuverability*2+(action==="fire_rigging"?6:0)-rangeModifier(encounter.rangeYards)*2,assistanceModifier:playerShip.firepower*2+prepared+crewActionModifier(state,"gunnery"),perkModifier:gunneryPerk.value,perkSources:gunneryPerk.sources,...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId}).chance;
  }
  const specialist=effectiveSpecialist(state,"seamanship"); const actor=specialist.source==="officer"?state.npcs[specialist.characterId]:state.player.character;
  if(action==="grapple")return resolveCheck({worldSeed:state.worldSeed,checkId,skillId:"seamanship",skillRating:specialist.rating,attributeId:"agility",attributeRating:actor?.attributes.agility??state.player.character.attributes.agility,difficulty:18+enemy.maneuverability*2,assistanceModifier:Math.round(state.player.character.skills.command/12)+playerShip.maneuverability+crewActionModifier(state,"boarding"),...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId}).chance;
  if(action==="close"||action==="open")return resolveCheck({worldSeed:state.worldSeed,checkId,skillId:"seamanship",skillRating:specialist.rating,attributeId:"agility",attributeRating:actor?.attributes.agility??state.player.character.attributes.agility,difficulty:16+enemy.maneuverability*2,assistanceModifier:playerShip.maneuverability*2+crewActionModifier(state,"seamanship"),...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId}).chance;
  if(action==="flee"){
    const seaTalent=generalPerkModifier(actor,"ship_escape"); const captainSeaTalent=actor?.id===state.player.character.id?{value:0,sources:[]}:generalPerkModifier(state.player.character,"ship_escape"); const escapePerk=seaTalent.value>=captainSeaTalent.value?seaTalent:captainSeaTalent;
    return resolveCheck({worldSeed:state.worldSeed,checkId,skillId:"seamanship",skillRating:specialist.rating,attributeId:"agility",attributeRating:actor?.attributes.agility??state.player.character.attributes.agility,difficulty:18+(enemy.speed+enemy.maneuverability)*2,assistanceModifier:(playerShip.speed+playerShip.maneuverability)*2+crewActionModifier(state,"seamanship"),perkModifier:escapePerk.value,perkSources:escapePerk.sources,...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId}).chance;
  }
  return undefined;
}

export function combatAction(state: GameState, action: CombatAction): { ok: boolean; message: string } {
  const encounter = state.encounter;
  if (!encounter || encounter.phase !== "combat") return { ok: false, message: "No naval combat is active." };
  const enemy = state.ships[encounter.otherShipId];
  const playerShip = state.ships[state.player.shipId];
  if (!enemy || !playerShip) return { ok: false, message: "Combat state is incomplete." };
  if (!isShipOperational(enemy)) {
    encounter.phase = "resolved";
    return { ok:false, message:`${enemy.name} is already out of active service (${enemy.lifecycle?.status ?? "resolved"}); this encounter cannot produce another combat or prize.` };
  }

  // Reject impossible commands before consuming a five-minute tactical round.
  if (action === "grapple" && (encounter.rangeYards > 50 || encounter.shipsSecured)) return { ok: false, message: "You must close inside 50 yards before attempting to secure the ships." };
  if ((action === "fire_hull" || action === "fire_rigging") && (encounter.rangeYards > 1500 || encounter.shipsSecured)) return { ok:false, message: encounter.shipsSecured ? "The ships are secured together; the main battery cannot fire safely." : "The current battery is outside effective firing range." };
  if ((action === "close" || action === "open" || action === "flee") && encounter.shipsSecured) return { ok:false, message: action === "flee" ? "You cannot flee while the ships are secured together." : "The ships are secured together; break grapples before maneuvering." };

  // If a lawful patrol forced combat after the captain resisted a warrant, the first coercive/violent
  // order also becomes an attack on that government vessel. Normal defensive maneuver/repair/flee
  // does not invent an additional offense. Player-initiated attacks were already recorded on approach.
  if(encounter.authorityDemanded && ["grapple","demand_surrender","fire_hull","fire_rigging"].includes(action)){
    encounter.playerIdentityKnown=true;
    recordNavalAggressionCrime(state,enemy,encounter);
  }

  encounter.round += 1;
  advanceCombatTime(state, encounter);
  let playerText = "";

  if (action === "grapple") {
    recordDangerousCrewOrder(state,"closing to grapple and board an enemy vessel",1);
    const specialist=effectiveSpecialist(state,"seamanship"); const actor=specialist.source==="officer"?state.npcs[specialist.characterId]:state.player.character;
    const check=resolveCheck({worldSeed:state.worldSeed,checkId:`combat:${encounter.id}:grapple_attempt:${encounter.round}`,skillId:"seamanship",skillRating:specialist.rating,attributeId:"agility",attributeRating:actor?.attributes.agility??state.player.character.attributes.agility,difficulty:18+enemy.maneuverability*2,assistanceModifier:Math.round(state.player.character.skills.command/12)+playerShip.maneuverability+crewActionModifier(state,"boarding"),...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId});
    if (!["failure","severe_failure"].includes(check.outcome)) { encounter.rangeYards=0; encounter.range="grapple"; encounter.shipsSecured=true; playerText=`${specialist.name} brings Tideworn alongside and the grapples bite (${check.roll} vs ${check.chance}).`; }
    else { encounter.rangeYards=Math.min(100,encounter.rangeYards+20); syncRange(encounter); playerText=`The enemy sheers away from the grapples (${check.outcome}); separation opens to ${Math.round(encounter.rangeYards)} yd.`; }
  } else if (action === "demand_surrender") {
    const pc=state.player.character;
    const commandTalent=generalPerkModifier(pc,"command_surrender");
    const check=resolveCheck({worldSeed:state.worldSeed,checkId:`combat:${encounter.id}:surrender:${encounter.round}`,skillId:"command",skillRating:pc.skills.command,attributeId:"presence",attributeRating:pc.attributes.presence,difficulty:20+Math.round(enemy.systems.morale/4),assistanceModifier:Math.round(Math.max(0,40-enemy.systems.morale)/3),perkModifier:commandTalent.value,perkSources:commandTalent.sources,...navalCombatSpecializationRequest(action,encounter.rangeYards),specializations:pc.specializations,specialistCharacterId:pc.id});
    if (enemy.systems.hull < enemy.systems.hullMax * 0.55 && !["failure","severe_failure"].includes(check.outcome)) {
      enemy.systems.morale = 0;
      playerText = `${enemy.name} answers your demand by striking colors.`;
    } else {
      playerText = `${enemy.name} refuses to strike colors.`;
    }
  } else if (action === "close" || action === "open") {
    const specialist=effectiveSpecialist(state,"seamanship"); const actor=specialist.source==="officer"?state.npcs[specialist.characterId]:state.player.character;
    const check=resolveCheck({worldSeed:state.worldSeed,checkId:`combat:${encounter.id}:maneuver:${encounter.round}:${action}`,skillId:"seamanship",skillRating:specialist.rating,attributeId:"agility",attributeRating:actor?.attributes.agility??state.player.character.attributes.agility,difficulty:16+enemy.maneuverability*2,assistanceModifier:playerShip.maneuverability*2+crewActionModifier(state,"seamanship"),...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId});
    if (!["failure","severe_failure"].includes(check.outcome)) {
      const relative = maneuverRelativeKnots(playerShip,enemy,action);
      const signed = action === "close" ? relative : -relative;
      const delta=changeRange(encounter,signed);
      playerText=`${specialist.name} ${action === "close" ? "closes" : "opens"} about ${Math.round(delta)} yd; separation is ${Math.round(encounter.rangeYards)} yd (${encounter.range}, ${check.outcome}).`;
      if (encounter.rangeYards > MAX_TACTICAL_RANGE_YARDS) {
        encounter.phase="sighting";
        playerText += " You are now outside tactical range but still have visual contact.";
      }
    } else playerText=`The maneuver fails to gain the range you wanted (${check.outcome}).`;
  } else if (action === "fire_hull" || action === "fire_rigging") {
    if (encounter.rangeYards > 1500 || encounter.shipsSecured || encounter.range === "boarding") return { ok: false, message: "The current battery cannot resolve that fire order at this exact range/state." };
    const specialist=effectiveSpecialist(state,"gunnery"); const actor=specialist.source==="officer"?state.npcs[specialist.characterId]:state.player.character;
    const prepared=preparedAbilityBonus(state,"tech.precision_weapons.precision_bore_sighting","naval_fire",playerShip.id);
    if(prepared>0)consumePreparedAbilityEffect(state,"tech.precision_weapons.precision_bore_sighting","naval_fire",playerShip.id);
    const gunTalent=generalPerkModifier(actor,"naval_gunnery"); const captainGunTalent=actor?.id===state.player.character.id?{value:0,sources:[]}:generalPerkModifier(state.player.character,"naval_gunnery"); const gunneryPerk=gunTalent.value>=captainGunTalent.value?gunTalent:captainGunTalent;
    const check=resolveCheck({worldSeed:state.worldSeed,checkId:`combat:${encounter.id}:fire:${encounter.round}:${action}`,skillId:"gunnery",skillRating:specialist.rating,attributeId:"perception",attributeRating:actor?.attributes.perception??state.player.character.attributes.perception,difficulty:18+enemy.maneuverability*2+(action==="fire_rigging"?6:0)-rangeModifier(encounter.rangeYards)*2,assistanceModifier:playerShip.firepower*2+prepared+crewActionModifier(state,"gunnery"),perkModifier:gunneryPerk.value,perkSources:gunneryPerk.sources,...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId});
    recordMeaningfulPractice(state,specialist.characterId,"gunnery",`naval_fire:${encounter.otherShipId}`,28);
    if (!["failure","severe_failure"].includes(check.outcome)) { const damage=Math.max(2,playerShip.firepower+Math.max(0,Math.floor(check.margin/12))); damageShip(enemy,damage,action==="fire_rigging"?"sails":"hull"); enemy.systems.morale=clamp(enemy.systems.morale-3,0,100); playerText=`${specialist.name}'s battery lands effective ${action === "fire_rigging" ? "chain" : "round"} shot at ${Math.round(encounter.rangeYards)} yd for ${damage} damage.`; }
    else playerText=`The broadside at ${Math.round(encounter.rangeYards)} yd fails to produce an effective hit (${check.outcome}).`;
  } else if (action === "repair") {
    const specialist=effectiveSpecialist(state,"engineering"); const actor=specialist.source==="officer"?state.npcs[specialist.characterId]:state.player.character;
    const repairTalent=generalPerkModifier(actor,"field_repair"); const captainRepairTalent=actor?.id===state.player.character.id?{value:0,sources:[]}:generalPerkModifier(state.player.character,"field_repair"); const repairPerk=repairTalent.value>=captainRepairTalent.value?repairTalent:captainRepairTalent;
    const check=resolveCheck({worldSeed:state.worldSeed,checkId:`combat:${encounter.id}:repair:${encounter.round}`,skillId:"engineering",skillRating:specialist.rating,attributeId:"intellect",attributeRating:actor?.attributes.intellect??state.player.character.attributes.intellect,difficulty:18+playerShip.systems.flooding*5,perkModifier:repairPerk.value,perkSources:repairPerk.sources,...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId});
    recordMeaningfulPractice(state,specialist.characterId,"engineering",`combat_damage_control:${encounter.id}`,28);
    const repaired=["failure","severe_failure"].includes(check.outcome)?0:Math.max(1,2+Math.floor(Math.max(0,check.margin)/15)); playerShip.systems.hull=clamp(playerShip.systems.hull+repaired,0,playerShip.systems.hullMax); if(check.margin>=10)playerShip.systems.flooding=Math.max(0,playerShip.systems.flooding-1); playerText=repaired?`${specialist.name}'s damage-control party restores ${repaired} hull condition.`:`Damage control cannot stabilize the damage this round.`;
  } else if (action === "flee") {
    const specialist=effectiveSpecialist(state,"seamanship"); const actor=specialist.source==="officer"?state.npcs[specialist.characterId]:state.player.character;
    const seaTalent=generalPerkModifier(actor,"ship_escape"); const captainSeaTalent=actor?.id===state.player.character.id?{value:0,sources:[]}:generalPerkModifier(state.player.character,"ship_escape"); const escapePerk=seaTalent.value>=captainSeaTalent.value?seaTalent:captainSeaTalent;
    const check=resolveCheck({worldSeed:state.worldSeed,checkId:`combat:${encounter.id}:flee:${encounter.round}`,skillId:"seamanship",skillRating:specialist.rating,attributeId:"agility",attributeRating:actor?.attributes.agility??state.player.character.attributes.agility,difficulty:18+(enemy.speed+enemy.maneuverability)*2,assistanceModifier:(playerShip.speed+playerShip.maneuverability)*2+crewActionModifier(state,"seamanship"),perkModifier:escapePerk.value,perkSources:escapePerk.sources,...navalCombatSpecializationRequest(action,encounter.rangeYards),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId});
    if (!["failure","severe_failure"].includes(check.outcome)) {
      const relative=maneuverRelativeKnots(playerShip,enemy,"open")*1.5;
      const delta=changeRange(encounter,-relative);
      if(encounter.rangeYards>MAX_TACTICAL_RANGE_YARDS){
        encounter.phase = "resolved";
        encounter.playerEscaped = true;
        playerText = `${specialist.name} opens ${Math.round(delta)} yd and breaks tactical contact beyond ${MAX_TACTICAL_RANGE_YARDS.toLocaleString()} yd (${check.outcome}).`;
        awardLifeExperience(state,state.player.character.id,`naval-escape:${encounter.id}`,`Survived and escaped naval combat with ${enemy.name}`,"meaningful");
        state.worldEvents.push({ id:`event.combat.escape.${encounter.id}`, type:"naval_combat_resolved", atHour:state.absoluteHour, participants:[playerShip.id,enemy.id], summary:`Escaped naval combat with ${enemy.name}.`, canonicalData:{result:"escaped",rangeYards:Math.round(encounter.rangeYards),combatElapsedMinutes:encounter.elapsedMinutes}, importance:2 });
        reportEncounterCrimes(state, encounter, enemy, "the other vessel survived the encounter and can carry word of the attack");
        encounter.log.push(playerText);
        return { ok: true, message: playerText };
      }
      playerText=`${specialist.name} opens ${Math.round(delta)} yd, but contact remains at ${Math.round(encounter.rangeYards)} yd.`;
    } else playerText = `You fail to shake the pursuit (${check.outcome}).`;
  }

  encounter.log.push(playerText);
  const victory = resolveVictory(state);
  if (victory) { encounter.log.push(victory); return { ok: true, message: victory }; }
  const enemyText = resolveEnemyTurn(state);
  if (enemyText) encounter.log.push(enemyText);
  const after = resolveVictory(state);
  if (after) { encounter.log.push(after); return { ok: true, message: after }; }
  return { ok: true, message: `${playerText} ${enemyText}`.trim() };
}
