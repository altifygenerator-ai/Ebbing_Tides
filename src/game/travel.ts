import { PORT_BY_ID } from "../data/seed/ports.js";
import { politicalPowerForShip } from "../data/seed/politicalPowers.js";
import { POI_BY_ID, POINTS_OF_INTEREST } from "../data/seed/pois.js";
import type { ActiveEncounter, CheckOutcome, GameState, NavigationTarget, ShipEntity, VoyageReport, VoyageState } from "./types.js";
import { advanceWorld, recordArrival } from "./worldSimulation.js";
import { deterministicUnit } from "./rng.js";
import { resolveCheck } from "./checks.js";
import { effectiveSpecialist } from "./delegation.js";
import { consumePreparedAbilityEffect, preparedAbilityBonus } from "./preparedEffects.js";
import { awardLifeExperience, generalPerkModifier, recordMeaningfulPractice } from "./progression.js";
import { recordShipIntel } from "./intelligence.js";
import { navigationTargetForPort, navigationTargetForPoi, navigationTargetForSea, plotCourse } from "./navigation.js";
import { dayOfYear } from "./time/calendar.js";
import { MAX_TACTICAL_RANGE_YARDS, nmToYards, pointAlongPathDistance, rangeBandFromYards, rangeChangeYards, routeDistanceNm, straightLineDistanceNm, yardsToNm } from "./physicalDistance.js";
import { advanceRouteDistanceByHours, baseCruiseSpeedKnots, estimateRemainingRouteHours } from "./shipSpeed.js";
import { applyZeroSupplyHardship, ensureCrewWelfare, markSupplyExhausted, resetSupplyHardshipIfProvisioned } from "./crewHardship.js";
import { recordCompletedCrewVoyage, recordUnderprovisionedDeparture } from "./crewMechanics.js";
import { effectivePlayerVoyageSeamanship } from "./crewState.js";
import { recordNavalAggressionCrime, recordResistingAuthorityCrime, reportEncounterCrimes, satisfyActiveWarrant, vesselPostureTowardPlayer } from "./reputationLaw.js";
import { isShipOperational } from "./vesselLifecycle.js";
import { knowledgeSupportsRecognition, upsertPlayerKnowledge } from "./information.js";
import { prepareCustomsInspectionOnArrival } from "./customs.js";

interface VisibilityEnvelope {
  condition: "clear_daylight" | "excellent" | "haze_rain" | "fog" | "night";
  rangeNm: number;
}

export function navigationHazardDamageModifier(outcome: CheckOutcome): number {
  if (outcome === "exceptional_success") return -2;
  if (outcome === "clean_success") return -1;
  if (outcome === "failure") return 1;
  if (outcome === "severe_failure") return 2;
  return 0;
}

export function visibilityEnvelopeFor(state: GameState, target?: ShipEntity): VisibilityEnvelope {
  const hour = state.clock.hour;
  const roll = deterministicUnit(state.worldSeed, `visibility:${Math.floor(state.absoluteHour / 4)}`);
  let condition: VisibilityEnvelope["condition"];
  let rangeNm: number;
  if (roll < 0.08) { condition = "fog"; rangeNm = 1.0; }
  else if (roll < 0.22) { condition = "haze_rain"; rangeNm = 4.0; }
  else if (hour < 6 || hour >= 19) { condition = "night"; rangeNm = 2.0; }
  else if (roll > 0.90) { condition = "excellent"; rangeNm = 12.0; }
  else { condition = "clear_daylight"; rangeNm = 8.0; }

  // Large rigs/high works can be noticed farther away without guaranteeing identification.
  if (target && (condition === "clear_daylight" || condition === "excellent")) {
    const sizeBonus = target.systems.hullMax >= 110 ? 2.5 : target.systems.hullMax >= 70 ? 1.25 : 0;
    rangeNm = Math.min(condition === "excellent" ? 15 : 10, rangeNm + sizeBonus);
  }
  return { condition, rangeNm };
}

function findEncounterShip(state: GameState): { ship: ShipEntity; separationNm: number; visibility: VisibilityEnvelope } | undefined {
  const playerShip = state.ships[state.player.shipId];
  if (!playerShip) return undefined;
  const candidates = Object.values(state.ships)
    .filter((ship) => ship.id !== playerShip.id && !ship.dockedAtPortId && isShipOperational(ship))
    .map((ship) => ({ ship, separationNm: straightLineDistanceNm(playerShip.position, ship.position), visibility: visibilityEnvelopeFor(state, ship) }))
    .filter((row) => row.separationNm <= row.visibility.rangeNm)
    .sort((a, b) => a.separationNm - b.separationNm);
  return candidates[0];
}

function maybeCreateEncounter(state: GameState): ActiveEncounter | undefined {
  if (!state.voyage || state.encounter) return undefined;
  const contact = findEncounterShip(state);
  if (!contact) return undefined;
  const { ship: candidate, separationNm, visibility } = contact;
  const specialist = effectiveSpecialist(state, "navigation");
  const specialistCharacter = specialist.source === "officer" ? state.npcs[specialist.characterId] : state.player.character;
  const relativeDifficulty = Math.round((separationNm / Math.max(0.25, visibility.rangeNm)) * 8);
  const check = resolveCheck({ worldSeed:state.worldSeed, checkId:`detect:${state.absoluteHour}:${candidate.id}`, skillId:"navigation", skillRating:specialist.rating, attributeId:"perception", attributeRating:specialistCharacter?.attributes.perception ?? state.player.character.attributes.perception, difficulty:9 + relativeDifficulty, ...(specialistCharacter ? { specializations:specialistCharacter.specializations } : {}), specialistCharacterId:specialist.characterId });
  if (check.outcome === "failure" || check.outcome === "severe_failure") return undefined;
  const identified = (check.margin >= 18 && separationNm <= 6) || knowledgeSupportsRecognition(state,candidate.id) || knowledgeSupportsRecognition(state,candidate.ownerCharacterId);
  const rangeYards = nmToYards(separationNm);
  const encounter: ActiveEncounter = {
    id: `encounter.${candidate.id}.${state.absoluteHour}`,
    phase: "sighting",
    otherShipId: candidate.id,
    range: rangeBandFromYards(rangeYards),
    rangeYards,
    sightingRangeNm: visibility.rangeNm,
    shipsSecured: false,
    elapsedMinutes: 0,
    identified,
    playerIdentityKnown: false,
    authorityDemanded: false,
    playerEscaped: false,
    log: [`${specialist.name} reports sails at ${separationNm.toFixed(1)} nm in ${visibility.condition.replaceAll("_", " ")} visibility. Navigation detection ${check.roll} vs ${check.chance} (${check.outcome}).`],
    round: 0
  };
  state.encounter = encounter;
  const posture=vesselPostureTowardPlayer(state,candidate);
  if(posture.willPursue) encounter.log.push(`${candidate.name} changes course toward you. ${posture.summary}`);
  recordShipIntel(state, candidate, identified, "Direct sighting", identified ? 100 : 72);
  state.worldEvents.push({
    id: `event.sighting.${candidate.id}.${state.absoluteHour}`,
    type: "ship_sighting",
    atHour: state.absoluteHour,
    participants: [state.player.shipId, candidate.id],
    summary: identified ? `Sighted and identified ${candidate.name}.` : "Sighted an unidentified vessel.",
    canonicalData: { otherShipId: candidate.id, identified, chance: check.chance, roll: check.roll, specialist: specialist.name, encounterDistanceNm: Number(separationNm.toFixed(3)), visibilityRangeNm: visibility.rangeNm, visibilityCondition: visibility.condition },
    importance: 2,
    roll: { key: check.checkId, value: check.roll, threshold: check.chance }
  });
  return encounter;
}

function awardVoyageExperience(state:GameState,target:NavigationTarget,fromPortId?:string):void {
  const key=`voyage:${fromPortId ?? "open_sea"}:${target.type}:${target.id}`;
  awardLifeExperience(state,state.player.character.id,key,`Completed voyage to ${target.name}`,"meaningful");
  for(const member of state.player.crew){ if(member.npcId) awardLifeExperience(state,member.npcId,key,`Served aboard Tideworn on voyage to ${target.name}`,20); }
  recordCompletedCrewVoyage(state);
}

export function beginNavigation(state: GameState, target: NavigationTarget): { ok: boolean; message: string } {
  if (state.voyage) return { ok: false, message: "A voyage is already active." };
  const ship = state.ships[state.player.shipId];
  if (!ship) return { ok: false, message: "Player ship not found." };
  if (target.type === "port" && !state.player.knownPortIds.includes(target.id)) return { ok: false, message: "Your character does not know a usable route to that port." };
  if (target.type === "poi" && !state.player.knownPoiIds.includes(target.id)) return { ok: false, message: "Your character does not know enough to plot a course to that location." };
  resetSupplyHardshipIfProvisioned(state);
  const preview = plotCourse(state, target);
  if (!preview.path.length) return { ok: false, message: "No navigable sea route can be plotted to that destination." };
  if (preview.path.length === 1) return { ok: false, message: "Tideworn is already at that grid square." };

  const fromPortId = state.player.currentPortId;
  if(fromPortId && ship.supplies<=0) recordUnderprovisionedDeparture(state);
  const specialist = effectiveSpecialist(state, "navigation");
  const specialistCharacter = specialist.source === "officer" ? state.npcs[specialist.characterId] : state.player.character;
  const readWindPreparation = preparedAbilityBonus(state,"arcane.wind_weather.read_wind","navigation_departure",ship.id);
  const sextantPreparation = preparedAbilityBonus(state,"tech.instruments.calibrated_sextant_method","navigation_departure",ship.id);
  const preparation = readWindPreparation + sextantPreparation;
  const weatherTalent = generalPerkModifier(specialistCharacter,"weather_navigation");
  const captainWeatherTalent = specialistCharacter?.id===state.player.character.id ? {value:0,sources:[]} : generalPerkModifier(state.player.character,"weather_navigation");
  const weatherPerk = weatherTalent.value>=captainWeatherTalent.value ? weatherTalent : captainWeatherTalent;
  const navCheck = resolveCheck({ worldSeed:state.worldSeed, checkId:`voyage:${ship.position.x},${ship.position.y}:${target.id}:${state.absoluteHour}`, skillId:"navigation", skillRating:specialist.rating, attributeId:"perception", attributeRating:specialistCharacter?.attributes.perception ?? state.player.character.attributes.perception, difficulty:10, assistanceModifier:preparation, perkModifier:weatherPerk.value, perkSources:weatherPerk.sources, ...(specialistCharacter ? { specializations:specialistCharacter.specializations } : {}), specialistCharacterId:specialist.characterId });
  // Route-planning quality persists into the voyage as hazard handling. It never changes whether
  // weather exists; it changes how well the chosen route/positioning handles that weather.
  const hazardDamageModifier=navigationHazardDamageModifier(navCheck.outcome);
  const totalHours = Math.max(1, preview.estimatedHours);
  recordMeaningfulPractice(state,specialist.characterId,"navigation",`plot:${target.type}:${target.id}`,18);
  state.voyage = {
    originPoint: { ...ship.position },
    destination: structuredClone(target),
    path: preview.path.map((point) => ({ ...point })),
    routeId: `course.${state.absoluteHour}.${target.id}`,
    totalHours,
    elapsedHours: 0,
    startHour: state.absoluteHour,
    routeDistanceNm: preview.routeDistanceNm,
    distanceTravelledNm: 0,
    plannedAverageSpeedKnots: preview.plannedAverageSpeedKnots,
    progress: 0,
    navigationQuality: { outcome:navCheck.outcome, margin:navCheck.margin, chance:navCheck.chance, preparationBonus:preparation, hazardDamageModifier },
    telemetry: {
      startingSupplies: ship.supplies,
      startingCrewMorale: ship.systems.morale,
      startingCrewHealth: ensureCrewWelfare(ship).averageHealth,
      startingZeroSupplyHours: ensureCrewWelfare(ship).zeroSupplyHours,
      startingHull: ship.systems.hull,
      startingSails: ship.systems.sails,
      startingRigging: ship.systems.rigging
    },
    ...(fromPortId ? { fromPortId } : {}),
    ...(target.type === "port" ? { toPortId: target.id } : {})
  };
  // A promised "next navigation check" is consumed by this actual departure check, once.
  if(readWindPreparation>0)consumePreparedAbilityEffect(state,"arcane.wind_weather.read_wind","navigation_departure",ship.id);
  if(sextantPreparation>0)consumePreparedAbilityEffect(state,"tech.instruments.calibrated_sextant_method","navigation_departure",ship.id);
  delete state.arrival;
  delete state.player.currentPortId;
  delete state.player.currentPoiId;
  delete ship.dockedAtPortId;
  state.worldEvents.push({
    id: `event.departure.${state.absoluteHour}.${target.id}`,
    type: "departure",
    atHour: state.absoluteHour,
    ...(fromPortId ? { locationId: fromPortId } : {}),
    participants: [state.player.character.id, ship.id],
    summary: `Course plotted for ${target.name}.`,
    canonicalData: { destinationId: target.id, destinationType: target.type, expectedHours: totalHours, pathCells: preview.path.length, routeDistanceNm:Number(preview.routeDistanceNm.toFixed(3)), straightLineDistanceNm:Number(preview.straightLineDistanceNm.toFixed(3)), plannedAverageSpeedKnots:Number(preview.plannedAverageSpeedKnots.toFixed(3)), navigationOutcome:navCheck.outcome, navigationMargin:navCheck.margin, preparationBonus:preparation, hazardDamageModifier, specialist:specialist.name },
    importance: 1,
    roll: { key: navCheck.checkId, value: navCheck.roll, threshold: navCheck.chance }
  });
  return { ok: true, message: `Course laid for ${target.name}. ${Math.round(preview.routeDistanceNm)} nm · estimated ${totalHours} hours · ~${estimateVoyageSupplyUnits(totalHours)} supplies at ${preview.plannedAverageSpeedKnots.toFixed(1)} kn.` };
}

// Compatibility wrapper used by older tests and future NPC/contract helpers.
export function beginVoyage(state: GameState, destinationPortId: string): { ok: boolean; message: string } {
  const target = navigationTargetForPort(destinationPortId);
  if (!target) return { ok: false, message: "Unknown port." };
  return beginNavigation(state, target);
}

export function beginPoiVoyage(state: GameState, poiId: string): { ok: boolean; message: string } {
  const target = navigationTargetForPoi(poiId);
  if (!target || !POI_BY_ID[poiId]) return { ok: false, message: "Unknown point of interest." };
  return beginNavigation(state, target);
}

export function beginSeaVoyage(state: GameState, x: number, y: number): { ok: boolean; message: string } {
  const target = navigationTargetForSea({ x, y });
  if (!target) return { ok: false, message: "That grid square is land or otherwise unnavigable." };
  return beginNavigation(state, target);
}

function ensureVoyageTelemetry(voyage: VoyageState, ship: ShipEntity): NonNullable<VoyageState["telemetry"]> {
  if (!voyage.telemetry) {
    voyage.telemetry = {
      startingSupplies: ship.supplies,
      startingCrewMorale: ship.systems.morale,
      startingCrewHealth: ensureCrewWelfare(ship).averageHealth,
      startingZeroSupplyHours: ensureCrewWelfare(ship).zeroSupplyHours,
      startingHull: ship.systems.hull,
      startingSails: ship.systems.sails,
      startingRigging: ship.systems.rigging
    };
  }
  return voyage.telemetry;
}

function voyageReport(voyage: VoyageState, ship: ShipEntity): VoyageReport {
  const telemetry = ensureVoyageTelemetry(voyage, ship);
  const welfare=ensureCrewWelfare(ship);
  return {
    distanceTravelledNm: Number(voyage.distanceTravelledNm.toFixed(3)),
    elapsedHours: voyage.elapsedHours,
    suppliesUsed: Math.max(0, telemetry.startingSupplies - ship.supplies),
    suppliesRemaining: ship.supplies,
    suppliesExhausted: ship.supplies <= 0,
    zeroSupplyHours: Math.max(0,welfare.zeroSupplyHours-(telemetry.startingZeroSupplyHours??0)),
    crewMoraleLoss: Math.max(0,(telemetry.startingCrewMorale??ship.systems.morale)-ship.systems.morale),
    crewHealthLoss: Math.max(0,(telemetry.startingCrewHealth??welfare.averageHealth)-welfare.averageHealth),
    hullDamage: Math.max(0, telemetry.startingHull - ship.systems.hull),
    sailsDamage: Math.max(0, telemetry.startingSails - ship.systems.sails),
    riggingDamage: Math.max(0, telemetry.startingRigging - ship.systems.rigging)
  };
}

export const PLAYER_VOYAGE_SUPPLY_STEP_HOURS = 2;

/**
 * Player-facing planning estimate for the normal Sail Until Interrupted cadence.
 * Weather/damage can increase actual use by extending the voyage, so UI should label this as approximate.
 */
export function estimateVoyageSupplyUnits(estimatedHours: number, stepHours = PLAYER_VOYAGE_SUPPLY_STEP_HOURS): number {
  if (!Number.isFinite(estimatedHours) || estimatedHours <= 0) return 0;
  return Math.max(1, Math.ceil(estimatedHours / Math.max(1, stepHours)));
}

export function currentVoyageEtaHours(state: GameState): number {
  const voyage = state.voyage;
  const ship = state.ships[state.player.shipId];
  if (!voyage || !ship) return 0;
  const specialist=effectiveSpecialist(state,"seamanship").rating;
  return estimateRemainingRouteHours(voyage.path, voyage.distanceTravelledNm, ship, effectivePlayerVoyageSeamanship(state,specialist));
}

export function advanceVoyage(state: GameState, hours = 4): { ok: boolean; message: string; encounter?: ActiveEncounter; arrived?: string; arrivedAtSea?: boolean; weather?: string; voyageReport?: VoyageReport } {
  const voyage = state.voyage;
  const ship = state.ships[state.player.shipId];
  if (!voyage || !ship) return { ok: false, message: "No voyage is active." };
  if (state.encounter?.phase === "resolved") delete state.encounter;
  if (state.encounter && state.encounter.phase !== "resolved") return { ok: false, message: "Resolve the current encounter before continuing." };

  const seamanshipSpecialist = effectiveSpecialist(state,"seamanship").rating;
  const seamanship = effectivePlayerVoyageSeamanship(state,seamanshipSpecialist);
  const remainingEta = estimateRemainingRouteHours(voyage.path, voyage.distanceTravelledNm, ship, seamanship);
  const step = Math.min(Math.max(1, Math.floor(hours)), Math.max(1, Math.ceil(remainingEta)));
  const previousHour = state.absoluteHour;
  const movement = advanceRouteDistanceByHours(voyage.path, voyage.distanceTravelledNm, step, ship, seamanship);
  advanceWorld(state, step);
  voyage.elapsedHours += step;
  voyage.distanceTravelledNm = Math.min(voyage.routeDistanceNm, movement.distanceTravelledNm);
  voyage.progress = voyage.routeDistanceNm <= 0 ? 1 : Math.min(1, voyage.distanceTravelledNm / voyage.routeDistanceNm);
  ship.position = pointAlongPathDistance(voyage.path, voyage.distanceTravelledNm);
  ensureVoyageTelemetry(voyage, ship);
  const suppliesBefore = ship.supplies;
  ship.supplies = Math.max(0, ship.supplies - Math.max(1, Math.round(step / 6)));
  if (suppliesBefore > 0 && ship.supplies === 0) {
    markSupplyExhausted(state);
    state.worldEvents.push({
      id: `event.voyage.supplies_exhausted.${voyage.routeId}.${state.absoluteHour}`,
      type: "voyage_supplies_exhausted",
      atHour: state.absoluteHour,
      participants: [state.player.character.id, ship.id],
      summary: `Ship supplies were exhausted while underway for ${voyage.destination.name}.`,
      canonicalData: { routeId: voyage.routeId, destinationId: voyage.destination.id, distanceTravelledNm: Number(voyage.distanceTravelledNm.toFixed(3)) },
      importance: 1
    });
  }
  // Shortage is a consequence, never a navigation gate. The first step that empties stores
  // is treated as the moment exhaustion begins; later time at zero stores accumulates hardship.
  if (suppliesBefore <= 0) applyZeroSupplyHardship(state,step);

  let weather: string | undefined;
  const weatherRoll = deterministicUnit(state.worldSeed, `weather:${voyage.routeId}:${Math.floor(state.absoluteHour / 4)}`);
  if (weatherRoll < 0.12) {
    const navHazardModifier=voyage.navigationQuality?.hazardDamageModifier ?? 0;
    const sailDamage=Math.max(0,2+navHazardModifier);
    ship.systems.sails = Math.max(1, ship.systems.sails - sailDamage);
    weather = sailDamage <= 0
      ? "A hard squall crosses the route, but the laid course and advance reading keep Tideworn out of its worst water."
      : sailDamage === 1
        ? "A hard squall crosses the route. Good route work limits the strain on the canvas."
        : sailDamage >= 4
          ? "A hard squall catches the ship on a poor line; the canvas takes a hard beating before the crew can shorten sail."
          : "A hard squall crosses the route. The crew shortens sail; damaged canvas will reduce effective speed until repaired.";
    state.worldEvents.push({
      id: `event.weather.squall.${state.absoluteHour}`,
      type: "weather_squall",
      atHour: state.absoluteHour,
      participants: [ship.id],
      summary: weather,
      canonicalData: { sailDamage, navigationHazardModifier:navHazardModifier, routeId: voyage.routeId, routeDistanceNm: Number(voyage.routeDistanceNm.toFixed(3)), distanceTravelledNm:Number(voyage.distanceTravelledNm.toFixed(3)) },
      importance: 1,
      roll: { key: `weather:${voyage.routeId}:${Math.floor(state.absoluteHour / 4)}`, value: weatherRoll, threshold: 0.12 }
    });
  }

  const encounter = voyage.progress < 1 ? maybeCreateEncounter(state) : undefined;
  if (encounter) return { ok: true, message: `Sails sighted at ${yardsToNm(encounter.rangeYards).toFixed(1)} nm. Voyage interrupted.`, encounter, ...(weather ? { weather } : {}) };

  if (voyage.progress >= 1) {
    const target = voyage.destination;
    const experienceFromPortId = voyage.fromPortId;
    ship.position = { ...target.point };
    voyage.distanceTravelledNm = voyage.routeDistanceNm;
    voyage.progress = 1;
    const report = voyageReport(voyage, ship);
    awardVoyageExperience(state,target,experienceFromPortId);
    delete state.voyage;
    if (target.type === "port") {
      state.player.currentPortId = target.id;
      ship.dockedAtPortId = target.id;
      state.arrival = { destination: structuredClone(target), arrivedAtHour: state.absoluteHour, voyageReport: report };
      recordArrival(state, target.id);
      const inspection=prepareCustomsInspectionOnArrival(state,target.id);
      return { ok: true, message: inspection ? `Arrived at ${target.name}. Customs has opened an inspection before shore business.` : `Arrived at ${target.name}.`, arrived: target.id, voyageReport: report, ...(weather ? { weather } : {}) };
    }
    if (target.type === "poi") {
      state.player.currentPoiId = target.id;
      state.arrival = { destination: structuredClone(target), arrivedAtHour: state.absoluteHour, voyageReport: report };
      state.worldEvents.push({
        id: `event.poi_arrival.${target.id}.${state.absoluteHour}`,
        type: "poi_arrival",
        atHour: state.absoluteHour,
        locationId: target.id,
        participants: [state.player.character.id, ship.id],
        summary: `Arrived at ${target.name}.`,
        canonicalData: { poiId: target.id, x: target.point.x, y: target.point.y },
        importance: 1
      });
      return { ok: true, message: `Arrived at ${target.name}.`, arrived: target.id, voyageReport: report, ...(weather ? { weather } : {}) };
    }
    state.worldEvents.push({
      id: `event.sea_arrival.${target.point.x}.${target.point.y}.${state.absoluteHour}`,
      type: "sea_position_reached",
      atHour: state.absoluteHour,
      participants: [state.player.character.id, ship.id],
      summary: `Reached open water at grid ${target.point.x},${target.point.y}.`,
      canonicalData: { x: target.point.x, y: target.point.y },
      importance: 0
    });
    return { ok: true, message: `Reached open water at ${target.point.x},${target.point.y}.`, arrivedAtSea: true, voyageReport: report, ...(weather ? { weather } : {}) };
  }

  const eta = currentVoyageEtaHours(state);
  return { ok: true, message: `Advanced ${state.absoluteHour - previousHour} hours · ${Math.round(voyage.distanceTravelledNm)}/${Math.round(voyage.routeDistanceNm)} nm · ETA ${Math.ceil(eta)}h.`, ...(weather ? { weather } : {}) };
}

function strategicClosingKnots(aggressor: ShipEntity, target: ShipEntity): number {
  const speed = baseCruiseSpeedKnots(aggressor);
  const maneuverEdge = (aggressor.maneuverability - target.maneuverability) * 0.25;
  return Math.max(1.5, Math.min(7, speed * 0.65 + maneuverEdge));
}

function advanceEncounterMinutes(state: GameState, encounter: ActiveEncounter, minutes: number): void {
  const beforeHours = Math.floor(encounter.elapsedMinutes / 60);
  encounter.elapsedMinutes += Math.max(0, minutes);
  const afterHours = Math.floor(encounter.elapsedMinutes / 60);
  if (afterHours > beforeHours) advanceWorld(state, afterHours - beforeHours);
}

function closeSightingRange(state: GameState, aggressor: ShipEntity, target: ShipEntity, minutes = 30): string {
  const encounter = state.encounter!;
  const delta = rangeChangeYards(strategicClosingKnots(aggressor,target), minutes);
  encounter.rangeYards = Math.max(0, encounter.rangeYards - delta);
  encounter.range = rangeBandFromYards(encounter.rangeYards, encounter.range === "boarding");
  advanceEncounterMinutes(state, encounter, minutes);
  if (encounter.rangeYards <= MAX_TACTICAL_RANGE_YARDS) encounter.phase = "combat";
  return encounter.phase === "combat"
    ? `Contact closes to ${Math.round(encounter.rangeYards).toLocaleString()} yd; tactical engagement begins.`
    : `Contact closes to ${yardsToNm(encounter.rangeYards).toFixed(1)} nm; still outside tactical range.`;
}

export function avoidEncounter(state: GameState): { ok: boolean; message: string } {
  const encounter = state.encounter;
  if (!encounter || encounter.phase !== "sighting") return { ok: false, message: "No sighting to avoid." };
  const other = state.ships[encounter.otherShipId];
  const ship = state.ships[state.player.shipId];
  if (!other || !ship) return { ok: false, message: "Encounter ship missing." };
  const posture=vesselPostureTowardPlayer(state,other);
  if(posture.kind==="detain"&&other.disposition==="navy"){
    encounter.playerIdentityKnown=true;
    encounter.authorityDemanded=true;
    recordResistingAuthorityCrime(state,other,encounter);
  }
  const specialist = effectiveSpecialist(state,"seamanship");
  const actor = specialist.source === "officer" ? state.npcs[specialist.characterId] : state.player.character;
  const seaTalent=generalPerkModifier(actor,"ship_escape");
  const captainSeaTalent=actor?.id===state.player.character.id?{value:0,sources:[]}:generalPerkModifier(state.player.character,"ship_escape");
  const escapePerk=seaTalent.value>=captainSeaTalent.value?seaTalent:captainSeaTalent;
  const check = resolveCheck({worldSeed:state.worldSeed,checkId:`avoid:${encounter.id}`,skillId:"seamanship",skillRating:specialist.rating,attributeId:"agility",attributeRating:actor?.attributes.agility ?? state.player.character.attributes.agility,difficulty:10+other.maneuverability,perkModifier:escapePerk.value,perkSources:escapePerk.sources, ...(actor ? {specializations:actor.specializations}:{}), specialistCharacterId:specialist.characterId});
  if (!["failure","severe_failure"].includes(check.outcome) || !posture.willPursue) {
    encounter.phase = "resolved";
    encounter.playerEscaped = true;
    encounter.log.push(`${specialist.name} keeps Tideworn clear at ${yardsToNm(encounter.rangeYards).toFixed(1)} nm (${check.roll} vs ${check.chance}; ${check.outcome}).`);
    if(posture.kind==="detain")reportEncounterCrimes(state,encounter,other,"the player refused detention and escaped");
    awardLifeExperience(state,state.player.character.id,`encounter-avoid:${encounter.id}`,`Safely avoided contact with ${other.name}`,"minor");
    state.worldEvents.push({
      id: `event.encounter.avoided.${encounter.id}`,
      type: "encounter_resolved",
      atHour: state.absoluteHour,
      participants: [ship.id, other.id],
      summary: `Avoided contact with ${other.name}.`,
      canonicalData: { result: "avoided", encounterDistanceNm:Number(yardsToNm(encounter.rangeYards).toFixed(3)), posture:posture.kind },
      importance: 1,
      roll: { key: check.checkId, value: check.roll, threshold: check.chance }
    });
    return { ok: true, message: posture.kind==="detain" ? "You refuse the patrol's authority and keep clear. The attempted escape worsens the warrant." : "You keep clear and return to the voyage." };
  }
  const text = closeSightingRange(state, other, ship);
  encounter.log.push(`Avoidance fails. ${other.name} turns to pursue. ${text}`);
  return { ok: true, message: state.encounter?.phase === "combat" ? `${posture.label}: they force the range down into tactical contact.` : `${posture.label}: they turn after you and the pursuit continues.` };
}

export function hailEncounter(state: GameState): { ok: boolean; message: string } {
  const encounter = state.encounter;
  if (!encounter || encounter.phase !== "sighting") return { ok: false, message: "No ship is in sighting/signaling range." };
  const other = state.ships[encounter.otherShipId];
  const ship = state.ships[state.player.shipId];
  if (!other || !ship) return { ok: false, message: "Encounter ship missing." };
  encounter.identified = true;
  encounter.playerIdentityKnown = true;
  recordShipIntel(state, other, true, "Hailed/signaled at sea", 100);
  const posture=vesselPostureTowardPlayer(state,other);
  if (other.disposition === "pirate") {
    const text = closeSightingRange(state, other, ship);
    encounter.log.push(`${other.name} answers the signal by turning to close. ${text}`);
    return { ok: true, message: state.encounter?.phase === "combat" ? `${other.name} closes into tactical range.` : `${other.name} identifies itself by action and continues closing.` };
  }
  if(posture.kind==="detain"&&other.disposition==="navy"){
    encounter.authorityDemanded=true;
    encounter.log.push(`${other.name} answers under authority and orders Tideworn to heave to on an active warrant.`);
    return {ok:true,message:`${other.name} identifies itself as a lawful patrol and orders you to heave to. You may answer the warrant, avoid them, or resist.`};
  }
  if(posture.kind==="hostile"){
    const text=closeSightingRange(state,other,ship);
    encounter.log.push(`${other.name} acknowledges your colors and turns aggressively to close. ${text}`);
    return {ok:true,message:state.encounter?.phase==="combat"?`${other.name} treats you as hostile and closes into tactical range.`:`${other.name} treats you as hostile and continues closing.`};
  }
  encounter.phase = "resolved";
  const contactText=posture.kind==="avoid"?`${other.name} answers briefly but keeps distance from your colors.`:`${other.name} exchanges identity and course by signal, then parts company at ${yardsToNm(encounter.rangeYards).toFixed(1)} nm.`;
  encounter.log.push(contactText);
  upsertPlayerKnowledge(state,{
    id: `knowledge.sighting.${other.id}.${state.absoluteHour}`,
    claimKey: `ship.identity.${other.id}`,
    category: "maritime",
    subjectId: other.id,
    text: `${other.name} was personally sighted on this route at Day ${dayOfYear(state.clock)}, ${state.clock.hour}:00.`,
    source: "Direct observation",
    learnedAtHour: state.absoluteHour,
    observedAtHour: state.absoluteHour,
    refreshedAtHour: state.absoluteHour,
    confidence: 100,
    truthStatus: "confirmed",
    informationState: "current",
    hardRumor: false
  });
  return { ok: true, message: posture.kind==="avoid" ? `${other.name} identifies itself but keeps wary distance.` : `${other.name} identifies itself and continues on its own course.` };
}

export function submitToAuthorityEncounter(state:GameState):{ok:boolean;message:string} {
  const encounter=state.encounter;
  if(!encounter||encounter.phase!=="sighting")return {ok:false,message:"No lawful demand is active."};
  const other=state.ships[encounter.otherShipId];
  if(!other||other.disposition!=="navy")return {ok:false,message:"This vessel has no R1 authority action to answer."};
  const posture=vesselPostureTowardPlayer(state,other);
  if(posture.kind!=="detain")return {ok:false,message:"No active warrant requires you to heave to."};
  encounter.identified=true;
  encounter.playerIdentityKnown=true;
  encounter.authorityDemanded=true;
  const power=politicalPowerForShip(other);
  const result=satisfyActiveWarrant(state,power.jurisdictionId);
  if(!result.ok){encounter.log.push(`${other.name} repeats the order to heave to. ${result.message}`);return result;}
  encounter.phase="resolved";
  encounter.log.push(`${other.name} receives satisfaction of the warrant and releases Tideworn to continue.`);
  return {ok:true,message:`${result.message} ${other.name} releases you to continue.`};
}

export function observeEncounter(state: GameState): { ok: boolean; message: string } {
  const encounter = state.encounter;
  if (!encounter || encounter.phase !== "sighting") return { ok: false, message: "No vessel is under observation." };
  const other = state.ships[encounter.otherShipId];
  if (!other) return { ok: false, message: "Encounter ship missing." };
  const specialist = effectiveSpecialist(state,"navigation");
  const actor = specialist.source === "officer" ? state.npcs[specialist.characterId] : state.player.character;
  const rangePenalty = Math.round(Math.min(8, yardsToNm(encounter.rangeYards)));
  const check = resolveCheck({worldSeed:state.worldSeed,checkId:`observe:${encounter.id}:${encounter.log.length}`,skillId:"navigation",skillRating:specialist.rating,attributeId:"perception",attributeRating:actor?.attributes.perception ?? state.player.character.attributes.perception,difficulty:12+rangePenalty,knowledgeModifier:Math.round(state.player.character.skills.scholarship/10),...(actor ? {specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId});
  if (!["failure","severe_failure"].includes(check.outcome)) {
    encounter.identified = true;
    recordShipIntel(state, other, true, "Spyglass observation", Math.min(100, 72 + Math.max(0,check.margin)));
    encounter.log.push(`${specialist.name}'s careful observation identifies ${other.name} at ${yardsToNm(encounter.rangeYards).toFixed(1)} nm (${check.outcome}).`);
    return { ok: true, message: `You identify ${other.name}, a ${other.disposition} vessel.` };
  }
  recordShipIntel(state, other, false, "Spyglass observation", Math.min(90, 50 + Math.max(0,check.chance-check.roll)));
  encounter.log.push(`You study the rig and silhouette at ${yardsToNm(encounter.rangeYards).toFixed(1)} nm but cannot establish identity (${check.outcome}).`);
  return { ok: true, message: "You improve the last-known contact, but cannot identify the vessel." };
}

function markPlayerNavalAggression(state:GameState,encounter:ActiveEncounter,other:ShipEntity):void {
  encounter.playerIdentityKnown=true;
  if(encounter.authorityDemanded)recordResistingAuthorityCrime(state,other,encounter);
  recordNavalAggressionCrime(state,other,encounter);
}

/** Existing UI action retained; outside 6,000 yd it performs a physical approach rather than teleporting into combat. */
export function attackEncounter(state: GameState): { ok: boolean; message: string } {
  const encounter = state.encounter;
  if (!encounter || encounter.phase !== "sighting") return { ok: false, message: "No valid target." };
  const ship = state.ships[state.player.shipId];
  const other = state.ships[encounter.otherShipId];
  if (!ship || !other) return { ok:false, message:"Encounter ship missing." };
  if (!isShipOperational(other)) { encounter.phase="resolved"; return {ok:false,message:`${other.name} is no longer an active vessel and cannot be attacked again.`}; }
  if (encounter.rangeYards <= MAX_TACTICAL_RANGE_YARDS) {
    encounter.phase = "combat";
    encounter.range = rangeBandFromYards(encounter.rangeYards);
    markPlayerNavalAggression(state,encounter,other);
    encounter.log.push(`You clear for action at ${Math.round(encounter.rangeYards).toLocaleString()} yd.`);
    return { ok: true, message: `Tactical combat begins at ${Math.round(encounter.rangeYards).toLocaleString()} yards (${encounter.range}).` };
  }
  let text = "";
  let guard = 24;
  while (encounter.phase === "sighting" && guard-- > 0) text = closeSightingRange(state, ship, other, 30);
  const tactical = state.encounter?.phase === "combat";
  if(tactical)markPlayerNavalAggression(state,encounter,other);
  encounter.log.push(`You order Tideworn cleared for action and commit to the approach. ${text}`);
  return { ok:true, message:tactical ? `You close into tactical range at ${Math.round(encounter.rangeYards).toLocaleString()} yards (${encounter.range}).` : `You pursue, but the contact remains ${yardsToNm(encounter.rangeYards).toFixed(1)} nm away.` };
}

export type VoyageStopReason = "arrival" | "encounter" | "cancelled" | "no_voyage" | "guard";

export interface SailUntilInterruptedResult {
  ok: boolean;
  message: string;
  stopReason: VoyageStopReason;
  advancedHours: number;
  encounter?: ActiveEncounter;
  arrived?: string;
  arrivedAtSea?: boolean;
  weatherEvents: string[];
  voyageReport?: VoyageReport;
}

/** Player-facing voyage operation: advance the deep simulation until something requires attention. */
export function sailUntilInterrupted(state: GameState, stepHours = PLAYER_VOYAGE_SUPPLY_STEP_HOURS, maxSteps = 240): SailUntilInterruptedResult {
  if (!state.voyage) return { ok:false, message:"No voyage is active.", stopReason:"no_voyage", advancedHours:0, weatherEvents:[] };
  const startedAt = state.absoluteHour;
  const weatherEvents: string[] = [];
  let guard = Math.max(1, maxSteps);
  while (state.voyage && guard-- > 0) {
    const result = advanceVoyage(state, stepHours);
    if (!result.ok) {
      return { ok:false, message:result.message, stopReason:state.encounter ? "encounter" : "guard", advancedHours:state.absoluteHour-startedAt, weatherEvents };
    }
    if (result.weather) weatherEvents.push(result.weather);
    if (result.encounter) {
      return { ok:true, message:result.message, stopReason:"encounter", advancedHours:state.absoluteHour-startedAt, encounter:result.encounter, weatherEvents };
    }
    if (result.arrived || result.arrivedAtSea) {
      return { ok:true, message:result.message, stopReason:"arrival", advancedHours:state.absoluteHour-startedAt, ...(result.arrived?{arrived:result.arrived}:{}), ...(result.arrivedAtSea?{arrivedAtSea:true}:{}), ...(result.voyageReport?{voyageReport:result.voyageReport}:{}), weatherEvents };
    }
  }
  return { ok:false, message:"Voyage automation stopped at its safety limit.", stopReason:"guard", advancedHours:state.absoluteHour-startedAt, weatherEvents };
}

export function cancelVoyage(state: GameState): { ok:boolean; message:string } {
  const voyage = state.voyage;
  const ship = state.ships[state.player.shipId];
  if (!voyage || !ship) return { ok:false, message:"No voyage is active." };
  const destination = voyage.destination.name;
  const progressed = voyage.distanceTravelledNm;
  delete state.voyage;
  delete state.arrival;
  delete state.player.currentPortId;
  delete state.player.currentPoiId;
  delete ship.dockedAtPortId;
  state.worldEvents.push({
    id:`event.voyage.cancelled.${state.absoluteHour}.${state.worldEvents.length}`,
    type:"voyage_cancelled",
    atHour:state.absoluteHour,
    participants:[state.player.character.id, ship.id],
    summary:`Voyage toward ${destination} stopped in open water.`,
    canonicalData:{destination, distanceTravelledNm:Number(progressed.toFixed(3)), x:Number(ship.position.x.toFixed(3)), y:Number(ship.position.y.toFixed(3))},
    importance:1
  });
  return { ok:true, message:`Voyage stopped. Tideworn is holding in open water after ${Math.round(progressed)} nm.` };
}

export type SearchWatersKind = "ship" | "discovery" | "wreckage" | "smoke" | "traffic" | "nothing";
export interface SearchWatersResult {
  ok: boolean;
  message: string;
  kind: SearchWatersKind;
  hours: number;
  rangeNm: number;
  encounter?: ActiveEncounter;
  discoveredPoiId?: string;
}

/**
 * Deliberate at-sea observation. This is an operation, not a simulation-tick button: it spends time,
 * advances the world, then returns one useful observation result.
 */
export function searchWaters(state: GameState, hours = 3): SearchWatersResult {
  const ship = state.ships[state.player.shipId];
  if (!ship) return {ok:false,message:"Player ship not found.",kind:"nothing",hours:0,rangeNm:0};
  if (state.player.currentPortId || ship.dockedAtPortId) return {ok:false,message:"Search Waters is available after leaving harbor.",kind:"nothing",hours:0,rangeNm:0};
  if (state.voyage) return {ok:false,message:"Stop the active voyage before conducting a deliberate search.",kind:"nothing",hours:0,rangeNm:0};
  if (state.encounter && state.encounter.phase !== "resolved") return {ok:false,message:"Resolve the current contact first.",kind:"nothing",hours:0,rangeNm:0};
  if (state.encounter?.phase === "resolved") delete state.encounter;

  const duration = Math.max(1, Math.min(6, Math.floor(hours)));
  advanceWorld(state,duration);
  const suppliesBefore=ship.supplies;
  ship.supplies = Math.max(0, ship.supplies - Math.max(1, Math.round(duration / 4)));
  if(suppliesBefore>0 && ship.supplies===0) markSupplyExhausted(state);
  if(suppliesBefore<=0) applyZeroSupplyHardship(state,duration);

  const specialist = effectiveSpecialist(state,"navigation");
  const actor = specialist.source === "officer" ? state.npcs[specialist.characterId] : state.player.character;
  const perception = actor?.attributes.perception ?? state.player.character.attributes.perception;
  const visibility = visibilityEnvelopeFor(state);
  const skillFactor = 0.76 + specialist.rating / 180 + perception / 50;
  const rangeNm = Math.max(0.5, Math.min(18, visibility.rangeNm * skillFactor));

  const nearby = Object.values(state.ships)
    .filter((candidate)=>candidate.id!==ship.id && !candidate.dockedAtPortId && isShipOperational(candidate))
    .map((candidate)=>({candidate,separationNm:straightLineDistanceNm(ship.position,candidate.position)}))
    .filter((row)=>row.separationNm<=rangeNm)
    .sort((a,b)=>a.separationNm-b.separationNm)[0];

  if (nearby) {
    const check=resolveCheck({worldSeed:state.worldSeed,checkId:`search-waters:${state.absoluteHour}:${nearby.candidate.id}`,skillId:"navigation",skillRating:specialist.rating,attributeId:"perception",attributeRating:perception,difficulty:10+Math.round((nearby.separationNm/Math.max(.5,rangeNm))*6),...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId});
    if (!['failure','severe_failure'].includes(check.outcome)) {
      const identified = check.margin>=18 && nearby.separationNm<=6;
      const rangeYards=nmToYards(nearby.separationNm);
      const encounter:ActiveEncounter={id:`encounter.search.${nearby.candidate.id}.${state.absoluteHour}`,phase:"sighting",otherShipId:nearby.candidate.id,range:rangeBandFromYards(rangeYards),rangeYards,sightingRangeNm:rangeNm,shipsSecured:false,elapsedMinutes:0,identified,playerIdentityKnown:false,authorityDemanded:false,playerEscaped:false,log:[`${specialist.name} finds sails at ${nearby.separationNm.toFixed(1)} nm after a deliberate search.`],round:0};
      state.encounter=encounter;
      const posture=vesselPostureTowardPlayer(state,nearby.candidate);
      if(posture.willPursue)encounter.log.push(`${nearby.candidate.name} changes course toward you. ${posture.summary}`);
      recordShipIntel(state,nearby.candidate,identified,"Search Waters",identified?100:74);
      state.worldEvents.push({id:`event.search_waters.ship.${state.absoluteHour}.${state.worldEvents.length}`,type:"search_waters",atHour:state.absoluteHour,participants:[ship.id,nearby.candidate.id],summary:identified?`Search Waters sighted ${nearby.candidate.name}.`:`Search Waters sighted an unidentified vessel.`,canonicalData:{result:"ship",otherShipId:nearby.candidate.id,separationNm:Number(nearby.separationNm.toFixed(3)),rangeNm:Number(rangeNm.toFixed(3)),identified},importance:2});
      return {ok:true,message:`Sail sighted · ${identified?nearby.candidate.name:"unidentified vessel"} · ${nearby.separationNm.toFixed(1)} nm.`,kind:"ship",hours:duration,rangeNm,encounter};
    }
  }

  const unknownPoi = POINTS_OF_INTEREST
    .filter((poi)=>!state.player.knownPoiIds.includes(poi.id))
    .map((poi)=>({poi,separationNm:straightLineDistanceNm(ship.position,poi.approachPoint)}))
    .filter((row)=>row.separationNm<=Math.min(rangeNm,8))
    .sort((a,b)=>a.separationNm-b.separationNm)[0];
  if (unknownPoi) {
    state.player.knownPoiIds.push(unknownPoi.poi.id);
    state.worldEvents.push({id:`event.search_waters.discovery.${state.absoluteHour}.${state.worldEvents.length}`,type:"search_waters",atHour:state.absoluteHour,participants:[ship.id],summary:`Search Waters revealed signs of ${unknownPoi.poi.name}.`,canonicalData:{result:"discovery",poiId:unknownPoi.poi.id,separationNm:Number(unknownPoi.separationNm.toFixed(3))},importance:2});
    return {ok:true,message:`You find signs leading toward ${unknownPoi.poi.name}.`,kind:"discovery",hours:duration,rangeNm,discoveredPoiId:unknownPoi.poi.id};
  }

  const roll=deterministicUnit(state.worldSeed,`search-waters-result:${state.absoluteHour}:${Math.round(ship.position.x*10)},${Math.round(ship.position.y*10)}`);
  const kind:SearchWatersKind=roll<.14?"wreckage":roll<.27?"smoke":roll<.44?"traffic":"nothing";
  const message=kind==="wreckage"?"The lookout finds scattered wreckage and a broken spar riding low in the swell.":kind==="smoke"?"A thin smear of smoke is visible on the horizon, too distant to identify.":kind==="traffic"?"Fresh wake patterns and seabirds suggest recent traffic through these waters.":"The search turns up nothing worth changing course for.";
  state.worldEvents.push({id:`event.search_waters.${kind}.${state.absoluteHour}.${state.worldEvents.length}`,type:"search_waters",atHour:state.absoluteHour,participants:[ship.id],summary:message,canonicalData:{result:kind,rangeNm:Number(rangeNm.toFixed(3)),hours:duration},importance:kind==="nothing"?0:1});
  return {ok:true,message,kind,hours:duration,rangeNm};
}
