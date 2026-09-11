import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { deterministicUnit } from "./rng.js";
import { advanceWorld } from "./worldSimulation.js";
import { resolveCheck } from "./checks.js";
import { recordMeaningfulPractice } from "./progression.js";
import { marketSignals, portReadLens } from "./playerFacing.js";
import { portBuildInsights } from "./characterConsequences.js";
import { crewRecruitOffers, recruitCrewOffer, takeCrewShoreLeave } from "./crewMechanics.js";
import { currentKnowledgeForClaim, eventInformationCanReachPort, knowledgeFreshnessAtHour, knowledgeNeedsRefresh, publicEventInformationProfile, upsertPlayerKnowledge } from "./information.js";
const RUMORS = {
    "port.veyrholm": [
        { claimKey: "rumor.seed.veyrholm.leif_covenant", category: "political", text: "Some dock clerks say Crown Prince Leif has been spending more time with Covenant advisers than the palace admits.", source: "Veyrholm dockside talk", confidence: 48, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 336, refreshable: false },
        { claimKey: "rumor.seed.veyrholm.stormcrow_patrol", category: "maritime", subjectId: "ship.stormcrow", text: "Stormcrow has been running hard patrols between Veyrholm and Stormvik.", source: "Naval chandlery gossip", confidence: 72, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 120, refreshable: false },
        { claimKey: "rumor.seed.veyrholm.ironhaven_food", category: "trade", text: "Ironhaven factors have been paying close attention to food cargoes while foundry work draws labor into the city.", source: "Merchant house runner", confidence: 78, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 72, refreshable: false }
    ],
    "port.ironhaven": [
        { claimKey: "rumor.seed.ironhaven.repair_hands", category: "local", text: "Foundry foremen are competing for skilled repair hands, and a sailor who understands engines can usually find side work quickly.", source: "Ironhaven alehouse", confidence: 74, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 336, refreshable: false },
        { claimKey: "rumor.seed.ironhaven.relief_rivalry", category: "religious", text: "Old Gods societies and Covenant charities both organize relief among the industrial districts, and each watches closely when the other gains public credit.", source: "Dockworker gossip", confidence: 63, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 336, refreshable: false },
        { claimKey: "rumor.seed.ironhaven.fast_raider", category: "danger", text: "Sailors have traded reports of an unregistered fast raider west of the Veyrholm route, but no two accounts agree on its colors.", source: "Sailor table", confidence: 52, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 120, refreshable: false }
    ],
    "port.stormvik": [
        { claimKey: "rumor.seed.stormvik.weather", category: "maritime", text: "Stormvik pilots say northern weather has been turning faster than many visiting crews expect.", source: "Pilot house", confidence: 70, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 120, refreshable: false },
        { claimKey: "rumor.seed.stormvik.shrine_repairs", category: "religious", text: "A well-funded ancestral society has been paying for repairs to old shrines along the waterfront.", source: "Fishmarket talk", confidence: 58, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 336, refreshable: false }
    ],
    "port.thorenfjord": [
        { claimKey: "rumor.seed.thorenfjord.pilgrims", category: "religious", text: "Pilgrims have been arriving early for rites at the Great Hall of Thoren, and some speak openly of a broader ancestral revival.", source: "Pilgrim hostel", confidence: 67, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 336, refreshable: false },
        { claimKey: "rumor.seed.thorenfjord.traditionalists", category: "political", text: "Traditionalist speakers have begun tying naval strength to loyalty to the old rites.", source: "Public-house debate", confidence: 56, truthStatus: "unknown", informationState: "current", hardRumor: false, staleAfterHours: 336, refreshable: false }
    ]
};
/** Durable local character. Current market/traffic facts are appended from live simulation below. */
const PORT_READS = {
    "port.veyrholm": {
        trade: "Veyrholm is a deep capital market with broad supply and many competing factors. Its size makes ordinary cargo easier to move, but the best margins usually come from knowing which neighboring port is under pressure.",
        maritime: "The capital harbor mixes Admiralty traffic, merchants, packets, fishing craft, and foreign callers. A captain who reads flags, departure rhythms, and chandlery talk can usually tell which routes are active.",
        underworld: "Veyrholm's size creates cover, but royal customs and naval eyes make predictable smuggling habits dangerous. Quiet business survives by hiding inside legitimate harbor traffic rather than by assuming the authorities are absent.",
        industrial: "The capital yards can handle ordinary naval and commercial work, while Ironhaven remains the stronger place for concentrated foundry and machinery expertise.",
        scholarly: "The Crown, the Admiralty, Old Gods institutions, and Covenant advisers all overlap here. A religious statement in Veyrholm is often also a political statement, whether the speaker admits it or not.",
        social: "Veyrholm rewards introductions. Dock clerks, chandlers, and junior officers all know somebody more important, but they notice who treats them like people rather than furniture."
    },
    "port.ironhaven": {
        trade: "Ironhaven's foundries and shipwork create unusually heavy demand for food, labor, raw material, and transport. Which cargo pays best depends on what the yards and households have actually consumed lately.",
        maritime: "Ironhaven's waterfront is crowded with working traffic: colliers, supply craft, merchants, repair-bound ships, and naval contractors. Useful news tends to follow cargo and shift changes rather than court ceremony.",
        underworld: "Industrial congestion creates blind spots. Workers, carters, and night shifts move enough legitimate material that discreet cargo can disappear into the rhythm of the yards.",
        industrial: "The yards are rich in capable repair hands, foundry knowledge, and machinery gossip. Practical expertise carries more weight here than fashionable theory.",
        scholarly: "Old Gods halls and Covenant charities both have a presence among workers. Their influence is social and political as well as theological, and neither should be treated as a single automatic cause of conflict.",
        social: "Ironhaven respects usefulness. A captain who can solve a practical problem will get farther with foremen and dock crews than one who arrives demanding status."
    },
    "port.stormvik": {
        trade: "Fish and timber are durable local strengths. Imported necessities become more valuable when weather or interrupted shipping thins the harbor stores, so current stock matters more than a fixed route rule.",
        maritime: "Stormvik pilots put more faith in local water and weather knowledge than in confident visiting assumptions. Northern sailing rewards crews who keep revising what they think they know.",
        underworld: "Stormvik is too small for anonymity to last. Quiet business depends more on trusted local intermediaries than on disappearing into a crowd.",
        industrial: "The yards are practical rather than experimental. Good timber, competent shipwrights, and conservative repairs matter more here than elaborate machinery.",
        scholarly: "The harbor's Old Gods identity is not merely ceremonial. Local authority, family standing, and maritime custom still overlap with ancestral practice.",
        social: "The waterfront is close-knit. Sailors who prove themselves at sea are heard more readily than strangers with polished introductions."
    },
    "port.thorenfjord": {
        trade: "Pilgrimage supports food, lodging, offerings, and small crafted goods. The market is less industrial than Veyrholm or Ironhaven, so modest changes in visiting traffic can matter more here.",
        maritime: "The fjord is familiar to local pilots and wrapped in old maritime stories. Fishing crews still trade tales of strange lights beneath the water, usually laughing until somebody asks for details.",
        underworld: "Smuggling through a sacred city depends on discretion. Pilgrim traffic provides cover, but offending the wrong household or priest can close more doors than a customs fine.",
        industrial: "There is little appetite here for experimental machinery. Repairs favor proven craft, timber, sail, and conservative shipwork.",
        scholarly: "The Great Hall of Thoren is a political institution as well as a sacred one. Traditionalist influence here must be read through actual people, institutions, and events rather than assumed from religion alone.",
        social: "Pilgrims, priests, sailors, and old families all share the harbor. Respect for local custom buys more patience here than swagger."
    }
};
function latestPublicPortEvent(state, portId) {
    return [...state.worldEvents]
        .reverse()
        .find((event) => event.atHour >= state.absoluteHour - 120 && publicEventInformationProfile(event) && eventInformationCanReachPort(state, event, portId));
}
function dynamicPortReadText(state, portId, lensId) {
    const base = PORT_READS[portId]?.[lensId] ?? PORT_READS[portId]?.social ?? `You spend an hour reading ${PORT_BY_ID[portId]?.name ?? "the port"} through the habits your life has taught you.`;
    let text = base;
    if (lensId === "trade") {
        const signals = marketSignals(state, portId).filter((signal) => Boolean(signal.commodityId));
        const useful = signals.slice(0, 2).map((signal) => signal.text);
        if (useful.length)
            text = `${text} Right now: ${useful.join(" ")}`;
    }
    if (lensId === "maritime") {
        const event = latestPublicPortEvent(state, portId);
        if (event)
            text = `${text} The freshest harbor talk you can place is this: ${event.summary}`;
    }
    const buildInsights = portBuildInsights(state, portId, lensId);
    return buildInsights.length ? `${text} Your own history changes what stands out: ${buildInsights.join(" ")}` : text;
}
function marketRumorCandidates(state, portId) {
    return marketSignals(state, portId)
        .filter((signal) => Boolean(signal.commodityId))
        .map((signal) => {
        const goodName = COMMODITY_BY_ID[signal.commodityId]?.name ?? signal.label;
        const toneText = signal.tone === "shortage"
            ? `${goodName} is drawing firmer offers around ${PORT_BY_ID[portId]?.name ?? "the port"}; merchants say local stores are thin.`
            : `${goodName} is sitting heavy in local stores around ${PORT_BY_ID[portId]?.name ?? "the port"}; factors are looking for somewhere better to send it.`;
        return {
            id: `knowledge.market.${portId}.${signal.commodityId}`,
            claimKey: `market.${portId}.${signal.commodityId}`,
            category: "trade",
            subjectId: signal.commodityId,
            text: toneText,
            source: "Merchant and quay talk",
            learnedAtHour: state.absoluteHour,
            observedAtHour: state.absoluteHour,
            refreshedAtHour: state.absoluteHour,
            staleAfterHours: 72,
            confidence: 72,
            truthStatus: "unknown",
            informationState: "current",
            hardRumor: false,
            originLocationId: portId,
            refreshable: true
        };
    });
}
function publicEventRumorCandidates(state, portId) {
    return state.worldEvents.flatMap((event) => {
        const profile = publicEventInformationProfile(event);
        if (!profile || !eventInformationCanReachPort(state, event, portId))
            return [];
        if (event.atHour < state.absoluteHour - 336)
            return [];
        const local = event.locationId === portId;
        const text = local ? `Harbor talk is carrying this report: ${event.summary}` : `News carried into port says: ${event.summary}`;
        return [{
                id: `knowledge.event.${event.id}`,
                claimKey: `event.${event.id}`,
                category: profile.category,
                text,
                source: profile.source,
                learnedAtHour: state.absoluteHour,
                observedAtHour: event.atHour,
                refreshedAtHour: state.absoluteHour,
                ...(profile.staleAfterHours !== undefined ? { staleAfterHours: profile.staleAfterHours } : {}),
                confidence: profile.confidence,
                truthStatus: "unknown",
                informationState: "current",
                hardRumor: false,
                sourceEventId: event.id,
                ...(event.locationId ? { originLocationId: event.locationId } : {}),
                refreshable: false
            }];
    });
}
function authoredRumorCandidates(state, portId) {
    return (RUMORS[portId] ?? []).map((candidate, index) => ({
        ...candidate,
        id: `knowledge.authored.${portId}.${index}`,
        learnedAtHour: state.absoluteHour,
        observedAtHour: state.absoluteHour,
        refreshedAtHour: state.absoluteHour,
        originLocationId: portId
    }));
}
/** Exported for regression tests and future tavern/contact surfaces. */
export function rumorCandidatesForPort(state, portId) {
    const all = [...publicEventRumorCandidates(state, portId), ...marketRumorCandidates(state, portId), ...authoredRumorCandidates(state, portId)];
    const byClaim = new Map();
    for (const candidate of all)
        if (!byClaim.has(candidate.claimKey))
            byClaim.set(candidate.claimKey, candidate);
    return [...byClaim.values()];
}
function candidateIsUsefulNow(state, candidate) {
    const existing = currentKnowledgeForClaim(state, candidate.claimKey);
    if (!existing)
        return true;
    if (!candidate.refreshable)
        return false;
    return knowledgeNeedsRefresh(state, candidate.claimKey, candidate.text, 12);
}
export function assessPort(state) {
    const portId = state.player.currentPortId;
    if (!portId)
        return { ok: false, message: "You need a port around you to take its measure." };
    const lens = portReadLens(state);
    const claimKey = `port_read.${portId}.${lens.id}`;
    const previewText = dynamicPortReadText(state, portId, lens.id);
    const existing = currentKnowledgeForClaim(state, claimKey);
    if (existing && !knowledgeNeedsRefresh(state, claimKey, previewText, 12)) {
        const freshness = knowledgeFreshnessAtHour(existing, state.absoluteHour);
        return { ok: false, message: freshness === "aging" ? "Your last read is aging, but nothing has changed enough yet to justify spending another hour on it." : "Your last read of this angle is still current." };
    }
    const c = state.player.character;
    const check = resolveCheck({
        worldSeed: state.worldSeed,
        checkId: `port-read:${portId}:${lens.id}:${Math.floor(state.absoluteHour / 24)}`,
        skillId: lens.skillId,
        skillRating: c.skills[lens.skillId],
        attributeId: lens.attributeId,
        attributeRating: c.attributes[lens.attributeId],
        difficulty: 14,
        specializations: c.specializations
    });
    recordMeaningfulPractice(state, c.id, lens.skillId, `port-read:${portId}`, 14);
    advanceWorld(state, 1);
    const base = dynamicPortReadText(state, portId, lens.id);
    const confidence = check.outcome === "exceptional_success" ? 92 : check.outcome === "clean_success" ? 82 : check.outcome === "costly_success" ? 68 : check.outcome === "severe_failure" ? 38 : 52;
    const text = ["failure", "severe_failure"].includes(check.outcome) ? `${base} You are less certain which part of that impression will actually matter.` : base;
    const result = upsertPlayerKnowledge(state, {
        id: `knowledge.port_read.${portId}.${lens.id}`,
        claimKey,
        category: lens.category,
        text,
        source: lens.source,
        learnedAtHour: state.absoluteHour,
        observedAtHour: state.absoluteHour,
        refreshedAtHour: state.absoluteHour,
        staleAfterHours: 72,
        confidence,
        truthStatus: "unknown",
        informationState: "current",
        hardRumor: false,
        subjectId: portId,
        originLocationId: portId
    });
    state.worldEvents.push({ id: `event.port_read.${portId}.${lens.id}.${state.absoluteHour}.${state.worldEvents.length}`, type: "port_assessment", atHour: state.absoluteHour, locationId: portId, participants: [c.id], summary: `${c.name} ${result.created ? "read" : "refreshed a read of"} ${PORT_BY_ID[portId]?.name ?? portId} through ${lens.source.toLowerCase()}.`, canonicalData: { lens: lens.id, skill: lens.skillId, outcome: check.outcome, claimKey, refreshed: !result.created }, importance: 1 });
    return { ok: true, message: text };
}
export function gatherRumor(state) {
    const portId = state.player.currentPortId;
    if (!portId)
        return { ok: false, message: "Rumors need people, and you are at sea." };
    const useful = rumorCandidatesForPort(state, portId).filter((candidate) => candidateIsUsefulNow(state, candidate));
    if (!useful.length)
        return { ok: false, message: "You have already pulled the useful talk from this port for now. Give the harbor time to change or new news to arrive." };
    const idx = Math.floor(deterministicUnit(state.worldSeed, `rumor:${portId}:${state.absoluteHour}:${useful.map(row => row.claimKey).join("|")}`) * useful.length);
    const picked = useful[idx] ?? useful[0];
    const pc = state.player.character;
    const socialSkill = pc.skills.streetwise >= pc.skills.persuasion ? "streetwise" : "persuasion";
    const socialCheck = resolveCheck({ worldSeed: state.worldSeed, checkId: `rumor:${portId}:${state.absoluteHour}:${picked.claimKey}`, skillId: socialSkill, skillRating: pc.skills[socialSkill], attributeId: "presence", attributeRating: pc.attributes.presence, difficulty: 16, specializations: pc.specializations });
    recordMeaningfulPractice(state, pc.id, socialSkill, `rumor:${portId}`, 16);
    advanceWorld(state, 1);
    const confidenceShift = socialCheck.outcome === "exceptional_success" ? 12 : socialCheck.outcome === "clean_success" ? 7 : socialCheck.outcome === "costly_success" ? 2 : socialCheck.outcome === "severe_failure" ? -18 : -8;
    const { refreshable: _refreshable, ...pickedRecord } = picked;
    const learned = upsertPlayerKnowledge(state, {
        ...pickedRecord,
        id: picked.id,
        learnedAtHour: state.absoluteHour,
        refreshedAtHour: state.absoluteHour,
        confidence: Math.max(10, Math.min(95, picked.confidence + confidenceShift))
    });
    state.worldEvents.push({
        id: `event.rumor.${portId}.${state.absoluteHour}.${state.worldEvents.length}`,
        type: "information_acquired",
        atHour: state.absoluteHour,
        locationId: portId,
        participants: [pc.id],
        summary: `${learned.created ? "Learned" : "Refreshed"} a report in ${PORT_BY_ID[portId]?.name ?? portId}.`,
        canonicalData: { knowledgeId: learned.record.id, claimKey: picked.claimKey, confidence: learned.record.confidence, socialSkill, socialOutcome: socialCheck.outcome, refreshed: !learned.created },
        importance: 0
    });
    return { ok: true, message: learned.record.text };
}
export function restCrew(state) {
    return takeCrewShoreLeave(state);
}
/** Compatibility helper for older tests/UI. New Tavern UI exposes deterministic quality offers. */
export function recruitDeckhand(state) {
    const offer = crewRecruitOffers(state)[0];
    if (!offer)
        return { ok: false, message: "No sailors are available to recruit here right now." };
    return recruitCrewOffer(state, offer.id);
}
//# sourceMappingURL=portActions.js.map