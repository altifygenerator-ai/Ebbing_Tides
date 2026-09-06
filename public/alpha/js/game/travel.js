import { PORT_BY_ID } from "../data/seed/ports.js";
import { findRoute, routePoint } from "../data/seed/routes.js";
import { advanceWorld, recordArrival } from "./worldSimulation.js";
import { deterministicUnit, roll2d10 } from "./rng.js";
import { attributeModifier } from "./skills.js";
function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
function findEncounterShip(state) {
    const playerShip = state.ships[state.player.shipId];
    if (!playerShip)
        return undefined;
    return Object.values(state.ships)
        .filter((ship) => ship.id !== playerShip.id && !ship.dockedAtPortId)
        .sort((a, b) => distance(a.position, playerShip.position) - distance(b.position, playerShip.position))
        .find((ship) => distance(ship.position, playerShip.position) <= 1.35);
}
function maybeCreateEncounter(state) {
    if (!state.voyage || state.encounter)
        return undefined;
    const candidate = findEncounterShip(state);
    if (!candidate)
        return undefined;
    const player = state.player.character;
    const roll = roll2d10(state.worldSeed, `detect:${state.absoluteHour}:${candidate.id}`);
    const score = roll.total + player.skills.navigation + attributeModifier(player.attributes.perception);
    const threshold = 11;
    if (score < threshold)
        return undefined;
    const identified = score >= 16 || state.player.knowledge.some((knowledge) => knowledge.subjectId === candidate.id || knowledge.subjectId === candidate.ownerCharacterId);
    const encounter = {
        id: `encounter.${candidate.id}.${state.absoluteHour}`,
        phase: "sighting",
        otherShipId: candidate.id,
        range: "distant",
        identified,
        playerEscaped: false,
        log: [`Lookout reports sails. Detection ${roll.dice[0]}+${roll.dice[1]} with navigation/perception modifiers = ${score}.`],
        round: 0
    };
    state.encounter = encounter;
    state.worldEvents.push({
        id: `event.sighting.${candidate.id}.${state.absoluteHour}`,
        type: "ship_sighting",
        atHour: state.absoluteHour,
        participants: [state.player.shipId, candidate.id],
        summary: identified ? `Sighted and identified ${candidate.name}.` : "Sighted an unidentified vessel.",
        canonicalData: { otherShipId: candidate.id, identified, score },
        importance: 2,
        roll: { key: `detect:${state.absoluteHour}:${candidate.id}`, value: score, threshold }
    });
    return encounter;
}
export function beginVoyage(state, destinationPortId) {
    const from = state.player.currentPortId;
    if (!from)
        return { ok: false, message: "You are already at sea." };
    if (!state.player.knownPortIds.includes(destinationPortId))
        return { ok: false, message: "Your character does not know a usable route to that destination." };
    const route = findRoute(from, destinationPortId);
    if (!route)
        return { ok: false, message: "No direct route is charted in this alpha slice." };
    const ship = state.ships[state.player.shipId];
    if (!ship)
        return { ok: false, message: "Player ship not found." };
    if (ship.supplies < 3)
        return { ok: false, message: "You need more ship supplies before leaving port." };
    const navRoll = roll2d10(state.worldSeed, `voyage:${from}:${destinationPortId}:${state.absoluteHour}`);
    const navigationBonus = state.player.character.skills.navigation + attributeModifier(state.player.character.attributes.perception);
    const variance = Math.max(-4, Math.min(8, 14 - (navRoll.total + navigationBonus)));
    const totalHours = Math.max(8, route.baseHours + variance);
    state.voyage = {
        fromPortId: from,
        toPortId: destinationPortId,
        routeId: route.id,
        totalHours,
        elapsedHours: 0,
        startHour: state.absoluteHour,
        progress: 0
    };
    delete state.player.currentPortId;
    delete ship.dockedAtPortId;
    ship.position = { ...PORT_BY_ID[from].point };
    state.worldEvents.push({
        id: `event.departure.${from}.${state.absoluteHour}`,
        type: "departure",
        atHour: state.absoluteHour,
        locationId: from,
        participants: [state.player.character.id, ship.id],
        summary: `Departed ${PORT_BY_ID[from]?.name ?? from} for ${PORT_BY_ID[destinationPortId]?.name ?? destinationPortId}.`,
        canonicalData: { destinationPortId, routeId: route.id, expectedHours: totalHours },
        importance: 1,
        roll: { key: `voyage:${from}:${destinationPortId}:${state.absoluteHour}`, value: navRoll.total + navigationBonus }
    });
    return { ok: true, message: `Course laid for ${PORT_BY_ID[destinationPortId]?.name}. Estimated ${totalHours} hours.` };
}
export function advanceVoyage(state, hours = 4) {
    const voyage = state.voyage;
    const ship = state.ships[state.player.shipId];
    if (!voyage || !ship)
        return { ok: false, message: "No voyage is active." };
    if (state.encounter?.phase === "resolved")
        delete state.encounter;
    if (state.encounter && state.encounter.phase !== "resolved")
        return { ok: false, message: "Resolve the current encounter before continuing." };
    const remaining = voyage.totalHours - voyage.elapsedHours;
    const step = Math.min(hours, remaining);
    const previousHour = state.absoluteHour;
    advanceWorld(state, step);
    voyage.elapsedHours += step;
    voyage.progress = Math.min(1, voyage.elapsedHours / voyage.totalHours);
    ship.position = routePoint(voyage.fromPortId, voyage.toPortId, voyage.progress);
    ship.supplies = Math.max(0, ship.supplies - Math.max(1, Math.round(step / 6)));
    let weather;
    const weatherRoll = deterministicUnit(state.worldSeed, `weather:${voyage.routeId}:${Math.floor(state.absoluteHour / 4)}`);
    if (weatherRoll < 0.12) {
        weather = "A hard squall crosses the route. The crew shortens sail and loses time to rough water.";
        ship.systems.sails = Math.max(1, ship.systems.sails - 2);
        state.worldEvents.push({
            id: `event.weather.squall.${state.absoluteHour}`,
            type: "weather_squall",
            atHour: state.absoluteHour,
            participants: [ship.id],
            summary: weather,
            canonicalData: { sailDamage: 2, routeId: voyage.routeId },
            importance: 1,
            roll: { key: `weather:${voyage.routeId}:${Math.floor(state.absoluteHour / 4)}`, value: weatherRoll, threshold: 0.12 }
        });
    }
    const encounter = maybeCreateEncounter(state);
    if (encounter)
        return { ok: true, message: "Sails sighted. Voyage interrupted.", encounter, ...(weather ? { weather } : {}) };
    if (voyage.progress >= 1) {
        const destination = voyage.toPortId;
        state.player.currentPortId = destination;
        ship.dockedAtPortId = destination;
        ship.position = { ...PORT_BY_ID[destination].point };
        delete state.voyage;
        recordArrival(state, destination);
        return { ok: true, message: `Arrived at ${PORT_BY_ID[destination]?.name}.`, arrived: destination, ...(weather ? { weather } : {}) };
    }
    return { ok: true, message: `Advanced ${state.absoluteHour - previousHour} hours.`, ...(weather ? { weather } : {}) };
}
export function avoidEncounter(state) {
    const encounter = state.encounter;
    if (!encounter || encounter.phase !== "sighting")
        return { ok: false, message: "No sighting to avoid." };
    const other = state.ships[encounter.otherShipId];
    const ship = state.ships[state.player.shipId];
    if (!other || !ship)
        return { ok: false, message: "Encounter ship missing." };
    const roll = roll2d10(state.worldSeed, `avoid:${encounter.id}`);
    const playerScore = roll.total + state.player.character.skills.sailing + ship.maneuverability;
    const opposing = 11 + other.maneuverability;
    if (playerScore >= opposing || other.disposition !== "pirate") {
        encounter.phase = "resolved";
        encounter.playerEscaped = true;
        encounter.log.push(`You keep your distance and continue on course (${playerScore} vs ${opposing}).`);
        state.worldEvents.push({
            id: `event.encounter.avoided.${encounter.id}`,
            type: "encounter_resolved",
            atHour: state.absoluteHour,
            participants: [ship.id, other.id],
            summary: `Avoided contact with ${other.name}.`,
            canonicalData: { result: "avoided" },
            importance: 1,
            roll: { key: `avoid:${encounter.id}`, value: playerScore, threshold: opposing }
        });
        return { ok: true, message: "You keep clear and return to the voyage." };
    }
    encounter.phase = "combat";
    encounter.range = "long";
    encounter.log.push("The other ship turns to pursue. Avoidance fails; range closes to long.");
    return { ok: true, message: "They turn after you. Prepare for combat." };
}
export function hailEncounter(state) {
    const encounter = state.encounter;
    if (!encounter || encounter.phase !== "sighting")
        return { ok: false, message: "No ship is in hailing range." };
    const other = state.ships[encounter.otherShipId];
    if (!other)
        return { ok: false, message: "Encounter ship missing." };
    encounter.identified = true;
    if (other.disposition === "pirate") {
        encounter.phase = "combat";
        encounter.range = "long";
        encounter.log.push(`${other.name} answers with a warning shot and turns to close.`);
        return { ok: true, message: `${other.name} answers with cannon. Combat begins.` };
    }
    encounter.phase = "resolved";
    encounter.log.push(`${other.name} exchanges identity and course, then parts company.`);
    state.player.knowledge.push({
        id: `knowledge.sighting.${other.id}.${state.absoluteHour}`,
        category: "maritime",
        subjectId: other.id,
        text: `${other.name} was personally sighted on this route at Day ${state.clock.day}, ${state.clock.hour}:00.`,
        source: "Direct observation",
        learnedAtHour: state.absoluteHour,
        confidence: 100,
        truthStatus: "confirmed",
        hardRumor: false
    });
    return { ok: true, message: `${other.name} identifies itself and continues on its own course.` };
}
export function attackEncounter(state) {
    const encounter = state.encounter;
    if (!encounter || encounter.phase !== "sighting")
        return { ok: false, message: "No valid target." };
    encounter.phase = "combat";
    encounter.range = "long";
    encounter.log.push("You order the ship cleared for action and turn in to engage.");
    return { ok: true, message: "Combat begins at long range." };
}
//# sourceMappingURL=travel.js.map