import { ITEM_BY_ID } from "../data/seed/items.js";
import { armorDefense, equippedDefinition, firearmAttack, meleeApCost, meleeAttack } from "./inventory.js";
import { deterministicUnit } from "./rng.js";
import { resolveCheck } from "./checks.js";
import { consumePreparedAbilityEffect, preparedAbilityBonus } from "./preparedEffects.js";
import { awardLifeExperience, recordMeaningfulPractice } from "./progression.js";
import type { BodyPart, GameState, Injury, InjuryType, PersonalCombatStance, PersonalCombatState } from "./types.js";
import { reportEncounterCrimes } from "./reputationLaw.js";
import { isShipOperational, resolvePlayerPrize } from "./vesselLifecycle.js";
import { advanceWorld } from "./worldSimulation.js";
import { consumeServiceResources, quoteMedicalTreatment } from "./portServices.js";

export type PersonalCombatAction = "slash" | "pistol" | "reload" | "defend" | "stance_aggressive" | "stance_balanced" | "stance_defensive" | "end_turn";

const BODY_PARTS: BodyPart[] = ["torso", "left_arm", "right_arm", "left_leg", "right_leg", "head"];
const INJURY_TYPES: InjuryType[] = ["cut", "puncture", "bruise", "fracture", "concussion"];
const DECK_DRILL_DURATION_HOURS = 2;
const DECK_DRILL_RELATIONSHIP_CADENCE_HOURS = 72;
const DECK_DRILL_RESPECT_CEILING = 60;

function clamp(v: number, min: number, max: number): number { return Math.max(min, Math.min(max, v)); }
function stanceAttack(stance: PersonalCombatStance): number { return stance === "aggressive" ? 2 : stance === "defensive" ? -2 : 0; }
function stanceDefense(stance: PersonalCombatStance): number { return stance === "defensive" ? 3 : stance === "aggressive" ? -2 : 0; }
function injuryPenalty(state: GameState): number { return state.player.injuries.filter((i) => !i.treated).reduce((sum, i) => sum + i.severity, 0); }

function addInjury(state: GameState, source: string, severity: 1 | 2 | 3, key: string): Injury {
  const part = BODY_PARTS[Math.floor(deterministicUnit(state.worldSeed, `${key}:part`) * BODY_PARTS.length)] ?? "torso";
  const type = INJURY_TYPES[Math.floor(deterministicUnit(state.worldSeed, `${key}:type`) * INJURY_TYPES.length)] ?? "bruise";
  const injury: Injury = {
    id: `injury.${state.absoluteHour}.${state.player.injuries.length}.${part}`,
    bodyPart: part,
    type,
    severity,
    acquiredAtHour: state.absoluteHour,
    source,
    treated: false
  };
  state.player.injuries.push(injury);
  state.worldEvents.push({
    id: `event.injury.${injury.id}`,
    type: "character_injury",
    atHour: state.absoluteHour,
    participants: [state.player.character.id],
    summary: `${state.player.character.name} suffered a severity ${severity} ${type} to the ${part.replaceAll("_", " ")}.`,
    canonicalData: { injuryId: injury.id, type, bodyPart: part, severity, source },
    importance: severity >= 3 ? 4 : 2
  });
  return injury;
}

function playerHealthMax(state: GameState): number {
  return 28 + state.player.character.attributes.might * 2 + state.player.character.attributes.will;
}

export function beginDeckDrill(state: GameState): { ok: boolean; message: string } {
  if (!state.player.currentPortId) return { ok: false, message: "Deck drills require the ship to be safely in port in this alpha." };
  if (state.personalCombat && !state.personalCombat.resolved) return { ok: false, message: "A personal combat is already active." };
  const firstMate = state.npcs[state.player.firstMateId];
  const firstMateName = firstMate?.name ?? "First Mate";

  // A0.2B: training is lived time, not a zero-time combat faucet. World advancement is
  // authoritative, so economy/NPC/contracts all experience the same two hours.
  advanceWorld(state, DECK_DRILL_DURATION_HOURS);

  state.personalCombat = {
    id: `personal.drill.${state.absoluteHour}.${state.player.firstMateId}`,
    source: "deck_drill",
    opponentId: state.player.firstMateId,
    opponentName: firstMateName,
    opponentSkill: firstMate?.skills.blades ?? 52,
    opponentArmor: 1,
    playerHealth: playerHealthMax(state),
    playerHealthMax: playerHealthMax(state),
    opponentHealth: 34,
    opponentHealthMax: 34,
    playerAP: 6,
    opponentAP: 6,
    playerStance: "balanced",
    opponentStance: "balanced",
    pistolLoaded: false,
    round: 1,
    log: [`${firstMateName} clears a patch of deck and calls for a controlled two-hour drill. Blades are dulled; the mechanics are real.`],
    resolved: false
  };
  return { ok: true, message: `Two hours pass in controlled deck drill with ${firstMateName}. No lasting injuries can be caused by the drill.` };
}

export function beginBoardingCombat(state: GameState): { ok: boolean; message: string } {
  const encounter = state.encounter;
  if (!encounter || encounter.phase !== "combat" || !encounter.shipsSecured) return { ok: false, message: "You must have the enemy grappled and secured before boarding." };
  const ship = state.ships[encounter.otherShipId];
  if (!ship) return { ok: false, message: "Enemy ship not found." };
  if (!isShipOperational(ship)) return { ok:false, message:`${ship.name} has already been resolved as a ${ship.lifecycle?.status ?? "terminal"} vessel.` };
  const captain = state.npcs[ship.ownerCharacterId];
  state.personalCombat = {
    id: `personal.boarding.${encounter.id}`,
    source: "boarding",
    opponentId: ship.ownerCharacterId,
    opponentName: captain?.name ?? `Captain of ${ship.name}`,
    opponentSkill: captain?.skills.blades ?? (ship.disposition === "pirate" ? 58 : 50),
    opponentArmor: ship.disposition === "navy" ? 3 : 2,
    playerHealth: playerHealthMax(state),
    playerHealthMax: playerHealthMax(state),
    opponentHealth: 38 + Math.round(ship.systems.morale / 10),
    opponentHealthMax: 38 + Math.round(ship.systems.morale / 10),
    playerAP: 6,
    opponentAP: 6,
    playerStance: "balanced",
    opponentStance: ship.disposition === "pirate" ? "aggressive" : "balanced",
    pistolLoaded: Boolean(firearmAttack(state)),
    round: 1,
    log: [`Grapples hold. You cross into the smoke and splintered rail of ${ship.name}. ${captain?.name ?? "The enemy captain"} meets you amid the press of crews.`],
    resolved: false
  };
  encounter.rangeYards = 0;
  encounter.range = "boarding";
  encounter.shipsSecured = true;
  return { ok: true, message: `Boarding action begins against ${state.personalCombat.opponentName}.` };
}

function resolvePlayerHit(state: GameState, combat: PersonalCombatState, kind: "melee" | "pistol"): string {
  const actionIndex = combat.log.length; const pc=state.player.character;
  const skillId = kind === "pistol" ? "firearms" : "blades"; const attributeId = kind === "pistol" ? "perception" : "agility";
  const check=resolveCheck({worldSeed:state.worldSeed,checkId:`${combat.id}:player:${combat.round}:${actionIndex}:${kind}`,skillId,skillRating:pc.skills[skillId],attributeId,attributeRating:pc.attributes[attributeId],difficulty:Math.round(18+combat.opponentSkill*.32+combat.opponentArmor*3),assistanceModifier:stanceAttack(combat.playerStance)*3-injuryPenalty(state)*3,specializations:pc.specializations,specialistCharacterId:pc.id});
  const practiceKey = combat.source === "deck_drill"
    ? `deck_drill:${combat.opponentId}:${kind}`
    : `personal_combat:${combat.id}:${kind}`;
  recordMeaningfulPractice(state,pc.id,skillId,practiceKey,24);
  if (["failure","severe_failure"].includes(check.outcome)) return `${kind === "pistol" ? "The pistol shot" : "Your attack"} fails to land cleanly (${check.roll} vs ${check.chance}).`;
  const weapon=kind === "pistol"?firearmAttack(state):meleeAttack(state); const damage=Math.max(2,Math.floor(weapon+Math.max(0,check.margin)/12)); combat.opponentHealth=clamp(combat.opponentHealth-damage,0,combat.opponentHealthMax);
  return `${kind === "pistol" ? "Your pistol cracks at arm's length" : "Your blade lands"} for ${damage} damage (${check.outcome}).`;
}

function resolveEnemyTurn(state: GameState, combat: PersonalCombatState): string {
  const opponent=state.npcs[combat.opponentId]; const skill=opponent?.skills.blades ?? combat.opponentSkill; const agility=opponent?.attributes.agility ?? 5;
  // A controlled deck drill is not the "next dangerous exchange" promised by Personal Ward.
  const wardBonus=combat.source === "boarding" ? preparedAbilityBonus(state,"arcane.warding.personal_ward","personal_defense",state.player.character.id) : 0;
  if(wardBonus>0)consumePreparedAbilityEffect(state,"arcane.warding.personal_ward","personal_defense",state.player.character.id);
  const check=resolveCheck({worldSeed:state.worldSeed,checkId:`${combat.id}:enemy:${combat.round}`,skillId:"blades",skillRating:skill,attributeId:"agility",attributeRating:agility,difficulty:Math.round(18+state.player.character.skills.athletics*.28+armorDefense(state)*3+wardBonus),assistanceModifier:stanceAttack(combat.opponentStance)*3,...(opponent?{specializations:opponent.specializations,specialistCharacterId:opponent.id}:{})});
  if (["failure","severe_failure"].includes(check.outcome)) return `${combat.opponentName} attacks, but you turn or evade the blow (${check.outcome}).`;
  const damage=Math.max(2,4+Math.floor(Math.max(0,check.margin)/15)); combat.playerHealth=clamp(combat.playerHealth-damage,0,combat.playerHealthMax); let text=`${combat.opponentName} lands a hit for ${damage} damage.`;
  if (combat.source === "boarding" && (damage >= 6 || check.margin >= 18)) { const severity=damage>=9?3:damage>=7?2:1; const injury=addInjury(state,`Boarding ${state.ships[state.encounter?.otherShipId ?? ""]?.name ?? "combat"}`,severity,`${combat.id}:${combat.round}:injury`); text+=` You suffer a ${injury.type} to the ${injury.bodyPart.replaceAll("_"," ")}.`; }
  return text;
}

function recentRespectfulDeckDrill(state: GameState, firstMateId: string): boolean {
  return state.worldEvents.some(event =>
    event.type === "deck_drill_completed" &&
    event.participants.includes(firstMateId) &&
    event.canonicalData.respectAwarded === true &&
    state.absoluteHour - event.atHour >= 0 &&
    state.absoluteHour - event.atHour < DECK_DRILL_RELATIONSHIP_CADENCE_HOURS
  );
}

function resolveDeckDrill(state: GameState, combat: PersonalCombatState, playerWon: boolean): string {
  combat.outcome = "drill_complete";
  if (!playerWon) combat.playerHealth = Math.max(1, combat.playerHealth);
  const firstMate = state.npcs[combat.opponentId];
  const firstMateName = firstMate?.name ?? combat.opponentName ?? "First Mate";
  let respectAwarded = false;

  // Repeated sparring can build ordinary professional respect, but cannot manufacture
  // deep loyalty/admiration. Higher relationship tiers must come from real decisions/events.
  if (playerWon && firstMate && firstMate.relationshipToPlayer.respect < DECK_DRILL_RESPECT_CEILING && !recentRespectfulDeckDrill(state, combat.opponentId)) {
    firstMate.relationshipToPlayer.respect = clamp(firstMate.relationshipToPlayer.respect + 1, -100, 100);
    respectAwarded = true;
  }

  const eventId = `event.deck_drill.${combat.id}`;
  if (!state.worldEvents.some(event => event.id === eventId)) {
    state.worldEvents.push({
      id:eventId,
      type:"deck_drill_completed",
      atHour:state.absoluteHour,
      ...(state.player.currentPortId ? { locationId:state.player.currentPortId } : {}),
      participants:[state.player.character.id, combat.opponentId, state.player.shipId],
      summary:playerWon
        ? `${state.player.character.name} completed a successful deck drill with ${firstMateName}.`
        : `${state.player.character.name} completed a deck drill with ${firstMateName} after the first mate called the exchange.`,
      canonicalData:{ result:playerWon ? "player_win" : "first_mate_win", durationHours:DECK_DRILL_DURATION_HOURS, respectAwarded },
      importance:1
    });
  }

  return playerWon
    ? `${firstMateName} yields the drill and gives a short approving nod. No one was hurt beyond bruises.`
    : `${firstMateName} calls the drill before you take a real injury and tells you exactly where your guard failed.`;
}

function resolveOutcome(state: GameState, combat: PersonalCombatState): string | undefined {
  if (combat.opponentHealth <= 0) {
    combat.resolved = true;
    if (combat.source === "deck_drill") return resolveDeckDrill(state, combat, true);
    combat.outcome = "victory";
    const encounter = state.encounter;
    const enemy = encounter ? state.ships[encounter.otherShipId] : undefined;
    if (encounter && enemy) {
      const resolution = resolvePlayerPrize(state, encounter, enemy, "boarding");
      if (!resolution.ok) return `${enemy.name} was already resolved; no second prize can be claimed.`;
      const prize = resolution.prize;
      awardLifeExperience(state,state.player.character.id,`boarding-victory:${encounter.id}`,`Won decisive boarding fight aboard ${enemy.name}`,"major");
      state.worldEvents.push({
        id: `event.boarding.victory.${encounter.id}`,
        type: "boarding_resolved",
        atHour: state.absoluteHour,
        participants: [state.player.character.id, enemy.ownerCharacterId, enemy.id],
        summary: `${state.player.character.name} won the decisive boarding fight aboard ${enemy.name}; the vessel became a captured prize.`,
        canonicalData: { result: "player_victory", enemyShipId: enemy.id, vesselStatus:resolution.status, prize },
        importance: 5
      });
      return `${combat.opponentName} can no longer continue. ${enemy.name} strikes colors; ${prize} crowns in immediate prize value are secured.`;
    }
  }
  if (combat.playerHealth <= 0) {
    combat.resolved = true;
    if (combat.source === "deck_drill") return resolveDeckDrill(state, combat, false);
    combat.outcome = "defeat";
    const encounter = state.encounter;
    const enemy = encounter ? state.ships[encounter.otherShipId] : undefined;
    if (encounter && enemy) reportEncounterCrimes(state, encounter, enemy, "the defending vessel survived the failed boarding attempt");
    if (encounter) encounter.phase = "resolved";
    state.player.character.crowns = Math.max(0, state.player.character.crowns - 45);
    awardLifeExperience(state,state.player.character.id,`boarding-defeat:${combat.id}`,`Survived defeat in a boarding action`,"meaningful");
    state.worldEvents.push({
      id: `event.boarding.defeat.${combat.id}`,
      type: "boarding_resolved",
      atHour: state.absoluteHour,
      participants: [state.player.character.id, combat.opponentId],
      summary: `${state.player.character.name} was defeated in a boarding action and survived after the crew disengaged or yielded.`,
      canonicalData: { result: "player_defeat", lostCrowns: 45 },
      importance: 5
    });
    return "You go down in the boarding fight. Your crew gets you back alive, but the defeat costs 45 crowns and leaves its mark.";
  }
  return undefined;
}

function endTurn(state: GameState, combat: PersonalCombatState): string {
  const enemy = resolveEnemyTurn(state, combat);
  combat.log.push(enemy);
  const outcome = resolveOutcome(state, combat);
  if (outcome) { combat.log.push(outcome); return outcome; }
  combat.round += 1;
  combat.playerAP = 6;
  combat.opponentAP = 6;
  return enemy;
}

export function personalCombatAction(state: GameState, action: PersonalCombatAction): { ok: boolean; message: string } {
  const combat = state.personalCombat;
  if (!combat || combat.resolved) return { ok: false, message: "No active personal combat." };
  let text = "";
  if (action.startsWith("stance_")) {
    const stance = action.replace("stance_", "") as PersonalCombatStance;
    if (combat.playerAP < 1) return { ok: false, message: "Not enough AP." };
    combat.playerAP -= 1;
    combat.playerStance = stance;
    text = `You shift to a ${stance} stance.`;
  } else if (action === "slash") {
    const cost = meleeApCost(state);
    if (combat.playerAP < cost) return { ok: false, message: `You need ${cost} AP for your equipped melee weapon.` };
    combat.playerAP -= cost;
    text = resolvePlayerHit(state, combat, "melee");
  } else if (action === "pistol") {
    if (!firearmAttack(state)) return { ok: false, message: "No firearm is equipped in either hand." };
    if (!combat.pistolLoaded) return { ok: false, message: "Your pistol is not loaded." };
    if (combat.playerAP < 4) return { ok: false, message: "You need 4 AP to fire." };
    combat.playerAP -= 4;
    combat.pistolLoaded = false;
    text = resolvePlayerHit(state, combat, "pistol");
  } else if (action === "reload") {
    if (combat.playerAP < 3) return { ok: false, message: "You need 3 AP to reload under pressure." };
    if (combat.pistolLoaded) return { ok: false, message: "The pistol is already loaded." };
    combat.playerAP -= 3;
    combat.pistolLoaded = true;
    text = "You bite cartridge, prime, ram, and bring the pistol back to readiness.";
  } else if (action === "defend") {
    if (combat.playerAP < 2) return { ok: false, message: "You need 2 AP to settle into a guarded defense." };
    combat.playerAP -= 2;
    combat.playerStance = "defensive";
    text = "You give ground, guard high, and force the next exchange onto your terms.";
  } else if (action === "end_turn") {
    combat.playerAP = 0;
    text = "You yield the initiative.";
  }

  if (text) combat.log.push(text);
  const outcome = resolveOutcome(state, combat);
  if (outcome) { combat.log.push(outcome); return { ok: true, message: outcome }; }
  if (combat.playerAP <= 0) {
    const enemyText = endTurn(state, combat);
    return { ok: true, message: `${text} ${enemyText}`.trim() };
  }
  return { ok: true, message: text };
}

export function treatInjuries(state: GameState): { ok: boolean; message: string } {
  const portId = state.player.currentPortId;
  if (!portId) return { ok: false, message: "You need a port physician or healer in this alpha." };
  const quote = quoteMedicalTreatment(state, portId);
  if (!quote.ok) return { ok:false, message:quote.message };
  if (state.player.character.crowns < quote.cost) return { ok: false, message: `Treatment costs ${quote.cost} crowns here.` };

  const treatableIds = new Set(quote.treatableInjuryIds);
  const treated = state.player.injuries.filter((injury) => treatableIds.has(injury.id) && !injury.treated);
  state.player.character.crowns -= quote.cost;
  consumeServiceResources(state, portId, quote.resources);
  for (const injury of treated) injury.treated = true;
  advanceWorld(state, quote.hours);
  state.worldEvents.push({
    id: `event.treatment.${state.absoluteHour}.${state.worldEvents.length}`,
    type: "medical_treatment",
    atHour: state.absoluteHour,
    locationId: portId,
    participants: [state.player.character.id],
    summary: `${treated.length} injuries were treated for ${quote.cost} crowns.`,
    canonicalData: {
      injuryCount: treated.length, cost: quote.cost, hours: quote.hours, capability: quote.capability, unresolvedCount: quote.unsupportedInjuryIds.length,
      sourceRows: quote.resources.lines.map((row)=>`${row.commodityId}:${row.quantity}`).join(",")
    },
    importance: 1
  });
  const remaining = quote.unsupportedInjuryIds.length;
  return { ok: true, message: remaining
    ? `${treated.length} injuries treated for ${quote.cost} crowns. ${quote.hours} hours pass; ${remaining} more serious ${remaining===1?"injury requires":"injuries require"} a stronger facility.`
    : `${treated.length} injuries treated for ${quote.cost} crowns. ${quote.hours} hours pass. Their history remains, but active penalties are removed.` };
}
