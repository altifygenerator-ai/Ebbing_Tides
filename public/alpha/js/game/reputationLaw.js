import { PORT_BY_ID, PORTS } from "../data/seed/ports.js";
import { POLITICAL_POWER_BY_FACTION, POLITICAL_POWER_BY_JURISDICTION, politicalPowerForRegion, politicalPowerForShip } from "../data/seed/politicalPowers.js";
import { findSeaPath } from "./navigation.js";
import { routeDistanceNm } from "./physicalDistance.js";
import { worldCauseLegalReportTransitForPort } from "./worldCauses.js";
import { isAuthorizedPrizeTarget, wartimePostureAgainstPlayer } from "./tradeLaw.js";
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function clampStanding(value) { return clamp(Math.round(value), -100, 100); }
export function standingLabel(value) {
    if (value >= 50)
        return "Celebrated";
    if (value >= 25)
        return "Respected";
    if (value >= 10)
        return "Favorable";
    if (value > -10)
        return "Neutral";
    if (value > -25)
        return "Wary";
    if (value > -50)
        return "Hostile";
    return "Enemy";
}
export function legalStatusLabel(status) {
    return status === "clear" ? "Clear" : status === "watched" ? "Watched" : status === "wanted" ? "Wanted" : "Outlawed";
}
export function factionStanding(state, factionId) {
    return Number(state.player.character.reputation[factionId] ?? 0);
}
export function adjustFactionStanding(state, factionId, delta) {
    const next = clampStanding(factionStanding(state, factionId) + delta);
    state.player.character.reputation[factionId] = next;
    return next;
}
export function portStanding(state, portId) {
    return Number(state.player.portStanding[portId] ?? 0);
}
export function adjustPortStanding(state, portId, delta) {
    const next = clampStanding(portStanding(state, portId) + delta);
    state.player.portStanding[portId] = next;
    return next;
}
function derivedLegalStatus(legal) {
    if (legal.bounty >= 1500 || legal.heat >= 90)
        return "outlawed";
    if (legal.activeWarrantIds.length > 0)
        return "wanted";
    if (legal.heat >= 18)
        return "watched";
    return "clear";
}
export function ensureJurisdictionLegalState(state, jurisdictionId, factionId) {
    const power = POLITICAL_POWER_BY_JURISDICTION[jurisdictionId];
    const resolvedFaction = factionId ?? power?.factionId ?? "faction.unknown";
    const existing = state.player.legal[jurisdictionId];
    if (existing) {
        existing.factionId ||= resolvedFaction;
        existing.activeWarrantIds = existing.activeWarrantIds.filter((id) => state.player.warrants.some((w) => w.id === id && w.status === "active"));
        existing.bounty = state.player.warrants.filter((w) => w.jurisdictionId === jurisdictionId && w.status === "active").reduce((sum, w) => sum + w.bounty, 0);
        existing.status = derivedLegalStatus(existing);
        return existing;
    }
    const created = { jurisdictionId, factionId: resolvedFaction, status: "clear", heat: 0, bounty: 0, activeWarrantIds: [] };
    state.player.legal[jurisdictionId] = created;
    return created;
}
export function legalStateForFaction(state, factionId) {
    const power = POLITICAL_POWER_BY_FACTION[factionId];
    return ensureJurisdictionLegalState(state, power?.jurisdictionId ?? `jurisdiction.${factionId.replace(/^faction\./, "")}`, factionId);
}
export function legalStateForShip(state, ship) {
    const power = politicalPowerForShip(ship);
    return ensureJurisdictionLegalState(state, power.jurisdictionId, power.factionId);
}
export function activeWarrants(state, jurisdictionId) {
    return state.player.warrants.filter((w) => w.status === "active" && (!jurisdictionId || w.jurisdictionId === jurisdictionId));
}
export function unresolvedReportedCrimes(state, jurisdictionId) {
    return state.player.crimes.filter((crime) => crime.reported && !TERMINAL_LEGAL_MATTERS.has(matterStatus(crime)) && (!jurisdictionId || crime.jurisdictionId === jurisdictionId));
}
export function isLawfulVessel(ship) {
    return ship.disposition === "navy" || ship.disposition === "merchant" || ship.disposition === "privateer";
}
/**
 * R1/R2 encounter law: lawful ships are not generic enemies. Navies enforce known warrants and
 * live wartime policy; licensed privateers need a current legal/political cause; merchants avoid
 * dangerous or enemy shipping. Pirate pursuit is opportunistic rather than a universal hostility switch.
 */
export function vesselPostureTowardPlayer(state, ship) {
    if (ship.disposition === "pirate") {
        const npc = state.npcs[ship.ownerCharacterId];
        const playerShip = state.ships[state.player.shipId];
        const aggression = Number(npc?.personality.aggression ?? 55);
        const greed = Number(npc?.personality.greed ?? 55);
        const opportunity = (playerShip?.cargo.reduce((sum, row) => sum + row.quantity, 0) ?? 0) + (playerShip && ship.firepower >= playerShip.firepower ? 12 : 0);
        if (aggression + greed + opportunity >= 90)
            return { kind: "predatory", label: "Predatory", summary: "The raider's temperament and the apparent opportunity make a prize attempt likely.", willPursue: true, lawful: false };
        return { kind: "wary", label: "Watching", summary: "The raider sees no good prize worth forcing right now and keeps its options open.", willPursue: false, lawful: false };
    }
    const power = politicalPowerForShip(ship);
    const rep = factionStanding(state, power.factionId);
    const law = ensureJurisdictionLegalState(state, power.jurisdictionId, power.factionId);
    if (ship.disposition === "merchant") {
        if (wartimePostureAgainstPlayer(state, ship))
            return { kind: "avoid", label: "Enemy Shipping", summary: "Current wartime policy marks your political flag as hostile; this merchant tries to avoid contact.", willPursue: false, lawful: true };
        if (law.status === "outlawed" || law.status === "wanted" || rep <= -50)
            return { kind: "avoid", label: "Avoiding You", summary: "The merchant has reason to fear or distrust your colors and will not seek a fight.", willPursue: false, lawful: true };
        if (rep >= 25)
            return { kind: "friendly", label: "Friendly", summary: "Your standing is good enough that ordinary commerce and signals are welcome.", willPursue: false, lawful: true };
        return { kind: "neutral", label: "Neutral", summary: "A lawful merchant has no cause to attack you.", willPursue: false, lawful: true };
    }
    if (ship.disposition === "navy") {
        if (wartimePostureAgainstPlayer(state, ship))
            return { kind: "hostile", label: "Wartime Enemy", summary: "Current war policy identifies your political flag as an enemy vessel.", willPursue: true, lawful: true };
        if (law.status === "outlawed" || law.status === "wanted")
            return { kind: "detain", label: "Warrant Enforcement", summary: "This naval vessel has authority to order you to heave to on the active warrant.", willPursue: true, lawful: true };
        if (rep <= -50)
            return { kind: "hostile", label: "Hostile", summary: "Your standing has fallen to enemy status; naval forces treat your ship as hostile.", willPursue: true, lawful: true };
        if (law.status === "watched" || rep <= -25)
            return { kind: "wary", label: "Wary", summary: "The patrol has reason to question your ship, but no cause to open fire without escalation.", willPursue: false, lawful: true };
        if (rep >= 25)
            return { kind: "friendly", label: "Friendly Patrol", summary: "The patrol recognizes your favorable standing and has no cause to interfere.", willPursue: false, lawful: true };
        return { kind: "neutral", label: "Lawful Patrol", summary: "The patrol has no cause to attack a captain in clear standing.", willPursue: false, lawful: true };
    }
    if (wartimePostureAgainstPlayer(state, ship))
        return { kind: "hostile", label: "Commission Target", summary: "Current privateering authority identifies your political flag as a lawful enemy prize.", willPursue: true, lawful: true };
    if (law.status === "outlawed" || law.status === "wanted" || rep <= -50)
        return { kind: "hostile", label: "Privateer Interest", summary: "Your legal or political standing makes you a target worth pursuing.", willPursue: true, lawful: true };
    if (rep >= 25)
        return { kind: "friendly", label: "Friendly", summary: "The privateer has no legal or political cause to challenge you.", willPursue: false, lawful: true };
    return { kind: "neutral", label: "Licensed / Neutral", summary: "The privateer is armed but has no current cause to attack you.", willPursue: false, lawful: true };
}
const CRIME_RULES = {
    unlawful_attack: { severity: 2, bounty: 180, factionDelta: -8, portDelta: -3, label: "Unlawful attack on a lawful vessel" },
    attack_government_vessel: { severity: 4, bounty: 650, factionDelta: -18, portDelta: -6, label: "Attack on a government vessel" },
    piracy: { severity: 4, bounty: 500, factionDelta: -14, portDelta: -6, label: "Piracy and unlawful prize-taking" },
    resisting_authority: { severity: 3, bounty: 300, factionDelta: -8, portDelta: -3, label: "Resisting lawful authority" },
    murder: { severity: 5, bounty: 900, factionDelta: -20, portDelta: -8, label: "Murder" },
    theft: { severity: 2, bounty: 120, factionDelta: -5, portDelta: -5, label: "Theft" },
    smuggling: { severity: 2, bounty: 140, factionDelta: -3, portDelta: -4, label: "Smuggling" },
    customs_evasion: { severity: 3, bounty: 240, factionDelta: -6, portDelta: -5, label: "Customs evasion" },
    illegal_salvage: { severity: 2, bounty: 160, factionDelta: -4, portDelta: -4, label: "Illegal salvage" },
    aiding_enemy: { severity: 4, bounty: 520, factionDelta: -16, portDelta: -4, label: "Aiding an enemy power" }
};
const TERMINAL_LEGAL_MATTERS = new Set(["satisfied", "pardoned", "dismissed"]);
const LEGAL_REPORT_HISTORY_LIMIT = 128;
function matterStatus(crime) {
    if (crime.legalMatterStatus)
        return crime.legalMatterStatus;
    return crime.reported ? "active" : "unreported";
}
function relatedPortIdsForShip(ship) {
    const ids = new Set();
    if (ship.dockedAtPortId)
        ids.add(ship.dockedAtPortId);
    if (ship.route?.fromPortId)
        ids.add(ship.route.fromPortId);
    if (ship.route?.toPortId)
        ids.add(ship.route.toPortId);
    const explicit = [...ids].filter((id) => Boolean(PORT_BY_ID[id]));
    if (explicit.length)
        return explicit;
    const nearest = PORTS
        .filter((port) => port.region === ship.region)
        .map((port) => ({ id: port.id, distance: Math.hypot(port.approachPoint.x - ship.position.x, port.approachPoint.y - ship.position.y) }))
        .sort((a, b) => a.distance - b.distance)[0];
    return nearest ? [nearest.id] : [];
}
function rememberIncident(state, ship, eventId, severity) {
    const npc = state.npcs[ship.ownerCharacterId];
    if (!npc)
        return;
    const r = npc.relationshipToPlayer;
    r.trust = clamp(r.trust - (severity * 8), -100, 100);
    r.affection = clamp(r.affection - (severity * 3), -100, 100);
    r.suspicion = clamp(r.suspicion + (severity * 9), 0, 100);
    r.hatred = clamp(r.hatred + (severity * 7), 0, 100);
    r.fear = clamp(r.fear + (severity >= 4 ? 6 : 2), 0, 100);
    if (!npc.brain.memories.includes(eventId))
        npc.brain.memories.push(eventId);
}
function crimeAlreadyRecorded(state, encounterId, type) {
    return state.player.crimes.some((crime) => crime.encounterId === encounterId && crime.type === type);
}
function witnessEvidenceFor(target, encounter, crimeId, atHour) {
    return {
        id: `evidence.${crimeId}.${target.id}`,
        kind: target.disposition === "navy" ? "official_witness" : "eyewitness",
        createdAtHour: atHour,
        sourceShipId: target.id,
        sourceCharacterId: target.ownerCharacterId,
        playerIdentified: Boolean(encounter.playerIdentityKnown),
        status: "potential",
        summary: `Surviving crew of ${target.name} witnessed the incident.`
    };
}
function baseCrime(state, target, encounter, type, summary) {
    const power = politicalPowerForShip(target);
    const rule = CRIME_RULES[type];
    const id = `crime.${type}.${encounter.id}`;
    return {
        id, type, jurisdictionId: power.jurisdictionId, factionId: power.factionId, atHour: state.absoluteHour,
        encounterId: encounter.id, victimShipId: target.id, victimCharacterId: target.ownerCharacterId, severity: rule.severity,
        playerIdentified: Boolean(encounter.playerIdentityKnown), witnessed: target.systems.crew > 0, reported: false,
        evidence: target.systems.crew > 0 ? [witnessEvidenceFor(target, encounter, id, state.absoluteHour)] : [],
        legalMatterStatus: "unreported", bountyValue: rule.bounty, summary
    };
}
function recordCrimeEvent(state, crime, target) {
    const eventId = `event.${crime.id}`;
    if (!state.worldEvents.some(event => event.id === eventId))
        state.worldEvents.push({
            id: eventId, type: "crime_committed", atHour: crime.atHour, participants: [state.player.character.id, state.player.shipId, target.id, target.ownerCharacterId], summary: crime.summary,
            canonicalData: { crimeId: crime.id, crimeType: crime.type, jurisdictionId: crime.jurisdictionId, factionId: crime.factionId, reported: false, playerIdentified: crime.playerIdentified }, importance: crime.severity
        });
    rememberIncident(state, target, eventId, crime.severity);
}
export function recordNavalAggressionCrime(state, target, encounter) {
    if (!isLawfulVessel(target))
        return undefined;
    if (isAuthorizedPrizeTarget(state, target).authorized)
        return undefined;
    const type = target.disposition === "navy" ? "attack_government_vessel" : "unlawful_attack";
    if (crimeAlreadyRecorded(state, encounter.id, type))
        return state.player.crimes.find((crime) => crime.encounterId === encounter.id && crime.type === type);
    const crime = baseCrime(state, target, encounter, type, `${CRIME_RULES[type].label}: ${target.name}.`);
    state.player.crimes.push(crime);
    recordCrimeEvent(state, crime, target);
    return crime;
}
export function recordResistingAuthorityCrime(state, target, encounter) {
    if (target.disposition !== "navy" || !encounter.authorityDemanded)
        return undefined;
    const type = "resisting_authority";
    if (crimeAlreadyRecorded(state, encounter.id, type))
        return state.player.crimes.find((crime) => crime.encounterId === encounter.id && crime.type === type);
    const crime = baseCrime(state, target, encounter, type, `${CRIME_RULES[type].label}: refused the order of ${target.name}.`);
    crime.playerIdentified = true;
    crime.witnessed = true;
    crime.evidence = [{
            id: `evidence.${crime.id}.authority`, kind: "official_witness", createdAtHour: state.absoluteHour, sourceShipId: target.id, sourceCharacterId: target.ownerCharacterId,
            playerIdentified: true, status: "available", summary: `${target.name} directly witnessed refusal of its lawful order.`
        }];
    state.player.crimes.push(crime);
    recordCrimeEvent(state, crime, target);
    // The enforcing patrol is itself a competent authority. This is the same report lifecycle with zero transit,
    // not a special direct warrant mutation.
    dispatchLegalReport(state, crime, { channel: "direct_authority", sourceShipId: target.id, sourceCharacterId: target.ownerCharacterId, evidenceIds: crime.evidence.map(e => e.id), reason: "The enforcing patrol directly recorded resistance to its lawful order.", deliveryAtHour: state.absoluteHour });
    return crime;
}
export function recordPiracyPrizeCrime(state, target, encounter) {
    if (!isLawfulVessel(target))
        return undefined;
    if (isAuthorizedPrizeTarget(state, target).authorized)
        return undefined;
    const type = "piracy";
    if (crimeAlreadyRecorded(state, encounter.id, type))
        return state.player.crimes.find((crime) => crime.encounterId === encounter.id && crime.type === type);
    const crime = baseCrime(state, target, encounter, type, `${CRIME_RULES[type].label}: prize taken from ${target.name}.`);
    state.player.crimes.push(crime);
    recordCrimeEvent(state, crime, target);
    return crime;
}
/** R2 port/customs hook. CrimeRecord remains the single crime truth; observed offenses enter A0.2D immediately. */
export function recordPortCrime(state, type, portId, summary, authorityWitnessed) {
    const port = PORT_BY_ID[portId];
    if (!port)
        return undefined;
    const power = politicalPowerForRegion(port.region);
    const rule = CRIME_RULES[type];
    const id = `crime.${type}.${portId}.${state.absoluteHour}.${state.player.crimes.filter(row => row.type === type && row.locationId === portId && row.atHour === state.absoluteHour).length}`;
    const existing = state.player.crimes.find(row => row.id === id);
    if (existing)
        return existing;
    const crime = { id, type, jurisdictionId: power.jurisdictionId, factionId: power.factionId, atHour: state.absoluteHour, locationId: portId, severity: rule.severity, playerIdentified: authorityWitnessed, witnessed: authorityWitnessed, reported: false, evidence: [], legalMatterStatus: "unreported", bountyValue: rule.bounty, summary };
    if (authorityWitnessed)
        crime.evidence = [{ id: `evidence.${id}.customs`, kind: "official_witness", createdAtHour: state.absoluteHour, playerIdentified: true, status: "available", summary: `Customs officers at ${port.name} directly witnessed the offense.` }];
    state.player.crimes.push(crime);
    state.worldEvents.push({ id: `event.${id}`, type: "crime_committed", atHour: crime.atHour, locationId: portId, participants: [state.player.character.id, state.player.shipId], summary, canonicalData: { crimeId: id, crimeType: type, jurisdictionId: power.jurisdictionId, factionId: power.factionId, reported: false, playerIdentified: authorityWitnessed }, importance: rule.severity });
    if (authorityWitnessed)
        reportCrimeToLocalAuthority(state, id, portId, `Customs officers at ${port.name} directly recorded the offense.`);
    return crime;
}
function activeWarrantForJurisdiction(state, jurisdictionId) {
    return state.player.warrants.find((w) => w.jurisdictionId === jurisdictionId && w.status === "active");
}
function reportTargetForShip(state, crime, sourceShip) {
    const power = POLITICAL_POWER_BY_JURISDICTION[crime.jurisdictionId];
    if (!power)
        return undefined;
    const start = { x: Math.round(sourceShip.position.x), y: Math.round(sourceShip.position.y) };
    const candidates = PORTS.filter(port => port.region === power.region).map(port => {
        const path = findSeaPath(start, port.approachPoint);
        if (path.length < 1)
            return undefined;
        const distance = routeDistanceNm(path);
        // Same physical information principle as A0.2A: information moves through geography and world time.
        // Four hours covers survivor landing, statement taking and institutional handling at the receiving port.
        // A0.3C can slow or accelerate that institutional transit, but never issues law consequences itself.
        const baseTransit = Math.max(4, Math.ceil(distance / 6) + 4);
        const institutional = worldCauseLegalReportTransitForPort(state, port.id);
        const transit = Math.max(1, Math.ceil(baseTransit * institutional.multiplier));
        return { portId: port.id, deliveryAtHour: state.absoluteHour + transit, distance };
    }).filter((row) => Boolean(row));
    candidates.sort((a, b) => a.deliveryAtHour - b.deliveryAtHour || a.distance - b.distance || a.portId.localeCompare(b.portId));
    return candidates[0];
}
function qualifyingEvidence(crime, evidenceIds) {
    const ids = new Set(evidenceIds);
    return (crime.evidence ?? []).filter(e => ids.has(e.id) && e.playerIdentified && e.status !== "lost");
}
function dispatchLegalReport(state, crime, options) {
    normalizeLawInformationState(state);
    if (TERMINAL_LEGAL_MATTERS.has(matterStatus(crime)) || crime.authorityReceivedAtHour !== undefined)
        return undefined;
    if (state.player.legalReports.some(report => report.crimeId === crime.id && report.status !== "rejected"))
        return undefined;
    const evidence = qualifyingEvidence(crime, options.evidenceIds);
    if (!evidence.length)
        return undefined;
    for (const row of evidence)
        row.status = "submitted";
    const report = {
        id: `legal_report.${crime.id}.${state.player.legalReports.filter(row => row.crimeId === crime.id).length}`, crimeId: crime.id, jurisdictionId: crime.jurisdictionId, factionId: crime.factionId,
        createdAtHour: state.absoluteHour, deliveryAtHour: Math.max(state.absoluteHour, Math.floor(options.deliveryAtHour)),
        ...(options.targetPortId ? { targetPortId: options.targetPortId } : {}), ...(options.sourceShipId ? { sourceShipId: options.sourceShipId } : {}),
        ...(options.sourceCharacterId ? { sourceCharacterId: options.sourceCharacterId } : {}), evidenceIds: evidence.map(e => e.id), channel: options.channel, status: "in_transit", reason: options.reason
    };
    state.player.legalReports.push(report);
    crime.legalMatterStatus = "report_in_transit";
    state.worldEvents.push({
        id: `event.legal_report.dispatched.${crime.id}`, type: "legal_report_dispatched", atHour: state.absoluteHour,
        ...(options.targetPortId ? { locationId: options.targetPortId } : {}), participants: [state.player.character.id, ...(options.sourceShipId ? [options.sourceShipId] : [])],
        summary: options.channel === "direct_authority" ? `A competent authority recorded a legal report concerning ${crime.summary}` : `A legal report concerning ${crime.summary} began physical delivery to the relevant authority.`,
        canonicalData: { crimeId: crime.id, reportId: report.id, jurisdictionId: crime.jurisdictionId, deliveryAtHour: report.deliveryAtHour, channel: report.channel, ...(options.targetPortId ? { targetPortId: options.targetPortId } : {}) }, importance: Math.max(1, crime.severity - 1)
    });
    if (report.deliveryAtHour <= state.absoluteHour)
        processDueLegalReports(state);
    return report;
}
function receiveValidatedCrimeReport(state, report, crime, receivedAtHour) {
    if (crime.authorityReceivedAtHour !== undefined || crime.reported)
        return false;
    const evidence = qualifyingEvidence(crime, report.evidenceIds);
    report.receivedAtHour = receivedAtHour;
    if (!evidence.length) {
        report.status = "rejected";
        crime.legalMatterStatus = "unreported";
        state.worldEvents.push({ id: `event.legal_report.rejected.${crime.id}`, type: "legal_report_rejected", atHour: receivedAtHour, ...(report.targetPortId ? { locationId: report.targetPortId } : {}), participants: [state.player.character.id], summary: `Authority received but could not validate a legal report concerning ${crime.summary}`, canonicalData: { crimeId: crime.id, reportId: report.id, jurisdictionId: crime.jurisdictionId }, importance: 1 });
        return false;
    }
    report.status = "validated";
    report.validatedAtHour = receivedAtHour;
    crime.reported = true;
    crime.authorityReceivedAtHour = receivedAtHour;
    crime.legalMatterStatus = "active";
    const rule = CRIME_RULES[crime.type];
    const legal = ensureJurisdictionLegalState(state, crime.jurisdictionId, crime.factionId);
    legal.heat = clamp(legal.heat + rule.severity * 12, 0, 100);
    legal.lastIncidentAtHour = receivedAtHour;
    adjustFactionStanding(state, crime.factionId, rule.factionDelta);
    if (report.targetPortId)
        adjustPortStanding(state, report.targetPortId, rule.portDelta);
    let warrant = activeWarrantForJurisdiction(state, crime.jurisdictionId);
    if (!warrant) {
        warrant = { id: `warrant.${crime.jurisdictionId}.${receivedAtHour}.${state.player.warrants.length}`, jurisdictionId: crime.jurisdictionId, factionId: crime.factionId, issuedAtHour: receivedAtHour, crimeIds: [], bounty: 0, status: "active", reason: crime.summary };
        state.player.warrants.push(warrant);
    }
    if (!warrant.crimeIds.includes(crime.id)) {
        warrant.crimeIds.push(crime.id);
        warrant.bounty += crime.bountyValue;
    }
    legal.activeWarrantIds = [warrant.id];
    legal.bounty = warrant.bounty;
    legal.status = derivedLegalStatus(legal);
    state.worldEvents.push({ id: `event.legal_report.received.${crime.id}`, type: "legal_report_received", atHour: receivedAtHour, ...(report.targetPortId ? { locationId: report.targetPortId } : {}), participants: [state.player.character.id], summary: `The relevant authority received and validated a report concerning ${crime.summary}`, canonicalData: { reportId: report.id, crimeId: crime.id, jurisdictionId: crime.jurisdictionId, authorityReceivedAtHour: receivedAtHour }, importance: Math.max(2, crime.severity) });
    if (!state.worldEvents.some(event => event.id === `event.warrant.${crime.id}`))
        state.worldEvents.push({ id: `event.warrant.${crime.id}`, type: "warrant_issued", atHour: receivedAtHour, participants: [state.player.character.id], summary: `A warrant is active under ${POLITICAL_POWER_BY_JURISDICTION[crime.jurisdictionId]?.jurisdictionLabel ?? crime.jurisdictionId}: ${warrant.bounty} crowns.`, canonicalData: { warrantId: warrant.id, crimeId: crime.id, jurisdictionId: crime.jurisdictionId, bounty: warrant.bounty, legalStatus: legal.status }, importance: Math.max(2, crime.severity) });
    return true;
}
/** Process physical/institutional legal reports whose delivery time has crossed the authoritative world clock. */
export function processDueLegalReports(state) {
    state.player.legalReports ??= [];
    let processed = 0;
    const due = state.player.legalReports.filter(report => report.status === "in_transit" && report.deliveryAtHour <= state.absoluteHour).sort((a, b) => a.deliveryAtHour - b.deliveryAtHour || a.id.localeCompare(b.id));
    for (const report of due) {
        const crime = state.player.crimes.find(row => row.id === report.crimeId);
        if (!crime) {
            report.status = "rejected";
            report.receivedAtHour = report.deliveryAtHour;
            continue;
        }
        receiveValidatedCrimeReport(state, report, crime, report.deliveryAtHour);
        processed += 1;
    }
    compactLegalReports(state);
    return processed;
}
/** Bound the operational report queue while keeping canonical history in CrimeRecord + WorldEvent. */
export function compactLegalReports(state) {
    state.player.legalReports ??= [];
    const seen = new Set();
    const active = [];
    const terminal = [];
    for (const report of state.player.legalReports) {
        if (!report?.id || seen.has(report.id) || !Number.isFinite(report.deliveryAtHour))
            continue;
        seen.add(report.id);
        (report.status === "in_transit" ? active : terminal).push(report);
    }
    terminal.sort((a, b) => (b.receivedAtHour ?? b.deliveryAtHour) - (a.receivedAtHour ?? a.deliveryAtHour) || b.id.localeCompare(a.id));
    state.player.legalReports = [...active, ...terminal.slice(0, LEGAL_REPORT_HISTORY_LIMIT)];
}
/** Save/load normalization for additive A0.2D state; schema remains v12. */
export function normalizeLawInformationState(state) {
    state.player.legalReports ??= [];
    state.player.crimes ??= [];
    state.player.warrants ??= [];
    for (const crime of state.player.crimes) {
        crime.evidence ??= [];
        if (!crime.legalMatterStatus) {
            const linked = state.player.warrants.filter(w => w.crimeIds?.includes(crime.id));
            if (linked.some(w => w.status === "active"))
                crime.legalMatterStatus = "active";
            else if (linked.some(w => w.status === "pardoned"))
                crime.legalMatterStatus = "pardoned";
            else if (linked.some(w => w.status === "satisfied"))
                crime.legalMatterStatus = "satisfied";
            else
                crime.legalMatterStatus = crime.reported ? "active" : "unreported";
        }
        if (crime.reported && crime.authorityReceivedAtHour === undefined) {
            const issued = state.player.warrants.filter(w => w.crimeIds?.includes(crime.id)).map(w => w.issuedAtHour).sort((a, b) => a - b)[0];
            crime.authorityReceivedAtHour = issued ?? crime.atHour;
        }
    }
    compactLegalReports(state);
}
/** Surviving identifying witnesses create a report in transit; they no longer teleport legal consequences. */
export function reportEncounterCrimes(state, encounter, target, reason) {
    normalizeLawInformationState(state);
    const canReport = encounter.playerIdentityKnown === true && target.systems.crew > 0;
    let count = 0;
    for (const crime of state.player.crimes) {
        if (crime.encounterId !== encounter.id || crime.reported || TERMINAL_LEGAL_MATTERS.has(matterStatus(crime)))
            continue;
        const evidence = (crime.evidence ?? []).filter(row => row.sourceShipId === target.id && row.kind !== "physical");
        if (!canReport) {
            for (const row of evidence)
                if (row.status === "potential")
                    row.status = "lost";
            continue;
        }
        crime.playerIdentified = true;
        crime.witnessed = true;
        for (const row of evidence) {
            row.playerIdentified = true;
            if (row.status === "potential")
                row.status = "available";
        }
        let usable = evidence.filter(row => row.playerIdentified && row.status !== "lost");
        if (!usable.length) {
            const added = witnessEvidenceFor(target, encounter, crime.id, state.absoluteHour);
            added.playerIdentified = true;
            added.status = "available";
            (crime.evidence ??= []).push(added);
            usable = [added];
        }
        const plan = reportTargetForShip(state, crime, target);
        if (!plan)
            continue;
        const report = dispatchLegalReport(state, crime, { channel: "survivor_delivery", sourceShipId: target.id, sourceCharacterId: target.ownerCharacterId, targetPortId: plan.portId, deliveryAtHour: plan.deliveryAtHour, evidenceIds: usable.map(row => row.id), reason });
        if (report)
            count += 1;
    }
    if (count > 0)
        state.worldEvents.push({ id: `event.crime_report.${encounter.id}.${state.absoluteHour}`, type: "crime_report_created", atHour: state.absoluteHour, participants: [state.player.character.id, target.id], summary: `Survivors from ${target.name} can carry a legal report of the encounter (${reason}).`, canonicalData: { encounterId: encounter.id, reportsCreated: count, jurisdictionId: politicalPowerForShip(target).jurisdictionId }, importance: 2 });
    return count;
}
/** Submit already-existing identifying evidence to the competent authority at a port. */
export function submitCrimeEvidenceToAuthority(state, crimeId, portId, evidenceIds, reason) {
    normalizeLawInformationState(state);
    const crime = state.player.crimes.find(row => row.id === crimeId);
    const port = PORT_BY_ID[portId];
    if (!crime || !port)
        return false;
    const power = POLITICAL_POWER_BY_JURISDICTION[crime.jurisdictionId];
    if (!power || port.region !== power.region)
        return false;
    const report = dispatchLegalReport(state, crime, { channel: "institutional_courier", targetPortId: portId, deliveryAtHour: state.absoluteHour, evidenceIds, reason });
    return Boolean(report) || crime.authorityReceivedAtHour !== undefined;
}
/** Future port/customs/event hook: competent local authority can receive evidence immediately through the same lifecycle. */
export function reportCrimeToLocalAuthority(state, crimeId, portId, reason) {
    normalizeLawInformationState(state);
    const crime = state.player.crimes.find(row => row.id === crimeId);
    const port = PORT_BY_ID[portId];
    if (!crime || !port)
        return false;
    const power = POLITICAL_POWER_BY_JURISDICTION[crime.jurisdictionId];
    if (!power || port.region !== power.region)
        return false;
    const evidence = { id: `evidence.${crime.id}.authority.${portId}`, kind: "official_witness", createdAtHour: state.absoluteHour, playerIdentified: true, status: "available", summary: `Competent local authority at ${port.name} directly established the captain's identity.` };
    crime.evidence ??= [];
    if (!crime.evidence.some(row => row.id === evidence.id))
        crime.evidence.push(evidence);
    const chosen = crime.evidence.find(row => row.id === evidence.id);
    const report = dispatchLegalReport(state, crime, { channel: "direct_authority", targetPortId: portId, deliveryAtHour: state.absoluteHour, evidenceIds: [chosen.id], reason });
    return Boolean(report) || crime.authorityReceivedAtHour !== undefined;
}
/** Future investigation hook: physical evidence may identify the player even when no witness survived. */
export function recordIndependentCrimeEvidence(state, crimeId, summary, playerIdentified = true) {
    const crime = state.player.crimes.find(row => row.id === crimeId);
    if (!crime)
        return undefined;
    crime.evidence ??= [];
    const id = `evidence.${crime.id}.physical.${crime.evidence.filter(row => row.kind === "physical").length}`;
    const evidence = { id, kind: "physical", createdAtHour: state.absoluteHour, playerIdentified, status: "available", summary };
    crime.evidence.push(evidence);
    return evidence;
}
function resolveLinkedCrimeMatters(state, warrants, status, note) {
    const ids = new Set(warrants.flatMap(w => w.crimeIds));
    for (const crime of state.player.crimes) {
        if (!ids.has(crime.id))
            continue;
        crime.legalMatterStatus = status;
        crime.resolvedAtHour = state.absoluteHour;
        crime.resolutionNote = note;
    }
}
export function satisfyActiveWarrant(state, jurisdictionId) {
    normalizeLawInformationState(state);
    const warrants = activeWarrants(state, jurisdictionId);
    if (!warrants.length)
        return { ok: false, message: "No active warrant is recorded in this jurisdiction." };
    const total = warrants.reduce((sum, w) => sum + w.bounty, 0);
    if (state.player.character.crowns < total)
        return { ok: false, message: `The warrant requires ${total} crowns. You have ${state.player.character.crowns}.` };
    state.player.character.crowns -= total;
    for (const warrant of warrants)
        warrant.status = "satisfied";
    resolveLinkedCrimeMatters(state, warrants, "satisfied", `Warrant satisfied by payment of ${total} crowns.`);
    const legal = ensureJurisdictionLegalState(state, jurisdictionId, warrants[0]?.factionId);
    legal.activeWarrantIds = [];
    legal.bounty = 0;
    legal.heat = Math.min(17, Math.floor(legal.heat * .2));
    legal.status = derivedLegalStatus(legal);
    state.worldEvents.push({ id: `event.warrant.satisfied.${jurisdictionId}.${state.absoluteHour}`, type: "warrant_satisfied", atHour: state.absoluteHour, participants: [state.player.character.id], summary: `${state.player.character.name} answered the active warrant and paid ${total} crowns.`, canonicalData: { jurisdictionId, paid: total, legalStatus: legal.status }, importance: 2 });
    compactLegalReports(state);
    return { ok: true, message: `You answer the warrant and pay ${total} crowns. Your legal status is now ${legalStatusLabel(legal.status)}.`, paid: total };
}
/** System-facing pardon path; preserves crime history while closing the active legal matter. */
export function pardonActiveWarrant(state, jurisdictionId, reason = "Pardoned by lawful authority.") {
    normalizeLawInformationState(state);
    const warrants = activeWarrants(state, jurisdictionId);
    if (!warrants.length)
        return { ok: false, message: "No active warrant is recorded in this jurisdiction." };
    for (const warrant of warrants)
        warrant.status = "pardoned";
    resolveLinkedCrimeMatters(state, warrants, "pardoned", reason);
    const legal = ensureJurisdictionLegalState(state, jurisdictionId, warrants[0]?.factionId);
    legal.activeWarrantIds = [];
    legal.bounty = 0;
    legal.heat = Math.min(17, Math.floor(legal.heat * .2));
    legal.status = derivedLegalStatus(legal);
    state.worldEvents.push({ id: `event.warrant.pardoned.${jurisdictionId}.${state.absoluteHour}`, type: "warrant_pardoned", atHour: state.absoluteHour, participants: [state.player.character.id], summary: reason, canonicalData: { jurisdictionId, legalStatus: legal.status }, importance: 2 });
    compactLegalReports(state);
    return { ok: true, message: `The active warrant is pardoned. Your legal status is now ${legalStatusLabel(legal.status)}.` };
}
export function powerLabel(factionId) {
    return POLITICAL_POWER_BY_FACTION[factionId]?.label ?? factionId.replace(/^faction\./, "").replaceAll("_", " ");
}
export function jurisdictionLabel(jurisdictionId) {
    return POLITICAL_POWER_BY_JURISDICTION[jurisdictionId]?.jurisdictionLabel ?? jurisdictionId.replace(/^jurisdiction\./, "").replaceAll("_", " ");
}
//# sourceMappingURL=reputationLaw.js.map