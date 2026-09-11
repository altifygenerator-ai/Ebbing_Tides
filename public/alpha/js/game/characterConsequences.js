import { ABILITY_BY_ID } from "../data/seed/abilities.js";
import { LEARNING_SOURCE_BY_ID, LEARNING_SOURCES, RELIGIOUS_INSTITUTION_BY_PORT } from "../data/seed/learningSources.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { upsertPlayerKnowledge } from "./information.js";
import { learnAbilityFromSource, learnSpecializationFromSource } from "./progression.js";
import { advanceWorld } from "./worldSimulation.js";
export const ANCESTRY_GAMEPLAY_POLICY = "identity_and_context_not_stat_package";
function subjectKnown(state, source) {
    const c = state.player.character;
    const subject = source.subject;
    if (subject.type === "ability")
        return c.abilities.some(row => row.abilityId === subject.abilityId);
    return c.specializations.some(row => row.skillId === subject.skillId && row.name === subject.name);
}
function pathMatches(state, path) {
    const c = state.player.character;
    if (path.skillMinimums && Object.entries(path.skillMinimums).some(([skill, value]) => c.skills[skill] < (value ?? 0)))
        return false;
    if (path.religions && !path.religions.includes(c.religion))
        return false;
    if (path.backgrounds && !path.backgrounds.includes(c.background))
        return false;
    if (path.professions && !path.professions.includes(c.recentProfession))
        return false;
    if (path.socialOrigins && !path.socialOrigins.includes(c.socialOrigin))
        return false;
    if (path.shipOrigins && !path.shipOrigins.includes(c.shipOrigin))
        return false;
    if (path.relationship) {
        const npc = state.npcs[path.relationship.npcId];
        if (!npc)
            return false;
        if (npc.relationshipToPlayer.trust < (path.relationship.minTrust ?? 0))
            return false;
        if (npc.relationshipToPlayer.respect < (path.relationship.minRespect ?? 0))
            return false;
    }
    return true;
}
function discoveryRequirementMet(state, source) {
    if (!source.poiId || !source.requiredPoiActions?.length)
        return true;
    return state.worldEvents.some(event => event.type === "poi_action" && event.locationId === source.poiId && source.requiredPoiActions.includes(String(event.canonicalData?.action ?? "")));
}
function sourceContextAvailable(state, source) {
    if (source.portId && state.player.currentPortId !== source.portId)
        return false;
    if (source.poiId && state.player.currentPoiId !== source.poiId)
        return false;
    if (source.onboardNpcId) {
        const aboard = state.player.crew.some(member => member.npcId === source.onboardNpcId);
        if (!aboard)
            return false;
    }
    return true;
}
function subjectRequirementMet(state, source) {
    const c = state.player.character;
    if (source.subject.type === "ability") {
        const def = ABILITY_BY_ID[source.subject.abilityId];
        if (!def)
            return false;
        return !def.requiredSkillId || c.skills[def.requiredSkillId] >= (def.requiredSkillRating ?? 0);
    }
    return c.skills[source.subject.skillId] >= source.subject.requiredSkillRating;
}
export function quoteLearningSource(state, sourceId) {
    const source = LEARNING_SOURCE_BY_ID[sourceId];
    if (!source)
        return undefined;
    const c = state.player.character;
    let hours = source.hours;
    let costCrowns = source.costCrowns;
    const modifiers = [];
    const reasons = [];
    const contextAvailable = sourceContextAvailable(state, source);
    const accessPath = source.accessPaths.find(path => pathMatches(state, path));
    const discovered = discoveryRequirementMet(state, source);
    const subjectReady = subjectRequirementMet(state, source);
    const known = subjectKnown(state, source);
    if (source.kind === "book" && c.trait === "bookworm") {
        hours = Math.max(1, hours - 2);
        modifiers.push("Bookworm: written study takes 2 fewer hours");
    }
    if (source.tags.includes("admiralty") && (c.background === "former_naval_midshipman" || c.socialOrigin === "naval_family" || c.shipOrigin === "naval_surplus")) {
        hours = Math.max(1, hours - 1);
        costCrowns = Math.max(0, costCrowns - 6);
        modifiers.push("Naval familiarity: easier Admiralty access");
    }
    if (source.tags.includes("industrial") && (c.background === "foundry_child" || c.background === "engineers_apprentice" || c.recentProfession === "apprentice_engineer" || c.recentProfession === "shipwright")) {
        hours = Math.max(1, hours - 2);
        costCrowns = Math.max(0, costCrowns - 8);
        modifiers.push("Technical experience: less introductory yard work");
    }
    if (source.tags.includes("religious") && c.religion === "old_gods") {
        if (c.devotion === "moderate") {
            hours = Math.max(1, hours - 1);
            costCrowns = Math.max(0, costCrowns - 4);
            modifiers.push("Practicing Old Gods faith: familiar ritual context");
        }
        if (c.devotion === "devout") {
            hours = Math.max(1, hours - 2);
            costCrowns = Math.max(0, costCrowns - 8);
            modifiers.push("Devout Old Gods practice: recognized ritual familiarity");
        }
    }
    if (!contextAvailable)
        reasons.push("The source is not physically available here.");
    if (!discovered)
        reasons.push("The relevant discovery has not been made at this site.");
    if (!subjectReady)
        reasons.push(source.subject.type === "ability" ? `Requires ${ABILITY_BY_ID[source.subject.abilityId]?.requiredSkillRating ?? 0} ${ABILITY_BY_ID[source.subject.abilityId]?.requiredSkillId ?? "skill"}.` : `Requires ${source.subject.requiredSkillRating} ${source.subject.skillId}.`);
    if (!accessPath)
        reasons.push(`Access: ${source.accessPaths.map(path => path.label).join("; ")}.`);
    if (known)
        reasons.push("Already learned.");
    if (c.crowns < costCrowns)
        reasons.push(`Requires ${costCrowns} crowns.`);
    const unlocked = Boolean(accessPath) && discovered && subjectReady;
    return { source, known, contextAvailable, unlocked, available: contextAvailable && unlocked && !known && c.crowns >= costCrowns, hours, costCrowns, reasons, modifiers };
}
export function learningSourcesAtCurrentContext(state, kinds, venue) {
    return LEARNING_SOURCES
        .filter(source => (!kinds || kinds.includes(source.kind)) && (!venue || source.venue === venue) && sourceContextAvailable(state, source))
        .map(source => quoteLearningSource(state, source.id))
        .filter(Boolean);
}
export function studyLearningSource(state, sourceId) {
    const quote = quoteLearningSource(state, sourceId);
    if (!quote)
        return { ok: false, message: "Unknown learning source." };
    if (quote.known)
        return { ok: false, message: "That method is already part of your training." };
    if (!quote.contextAvailable)
        return { ok: false, message: "That learning source is not available where you are." };
    if (!quote.unlocked)
        return { ok: false, message: quote.reasons[0] ?? "You do not yet meet the source's requirements." };
    if (state.player.character.crowns < quote.costCrowns)
        return { ok: false, message: `You need ${quote.costCrowns} crowns for that instruction.` };
    const startedAtHour = state.absoluteHour;
    state.player.character.crowns -= quote.costCrowns;
    advanceWorld(state, quote.hours);
    const acquisition = { startedAtHour, costCrowns: quote.costCrowns, sourceId: quote.source.id };
    const result = quote.source.subject.type === "ability"
        ? learnAbilityFromSource(state, state.player.character.id, quote.source.subject.abilityId, quote.source.sourceLabel, acquisition)
        : learnSpecializationFromSource(state, state.player.character.id, quote.source.subject.skillId, quote.source.subject.name, quote.source.sourceLabel, quote.source.subject.rating, acquisition);
    if (!result.ok) {
        // Validation above should prevent this. Refund money rather than compounding a failed transaction;
        // elapsed world time still represents the attempted instruction if future data is malformed.
        state.player.character.crowns += quote.costCrowns;
        return result;
    }
    const modifiers = quote.modifiers.length ? ` ${quote.modifiers.join(" · ")}.` : "";
    return { ok: true, message: `${result.message} Training took ${quote.hours}h${quote.costCrowns ? ` and cost ${quote.costCrowns} crowns` : ""}.${modifiers}` };
}
const OMEN_LABELS = { great_storm: "birth during a great storm", high_tide: "birth at high tide", first_snow: "birth during the first snow" };
/** Cultural interpretation only. A0.3B deliberately does not declare an omen objectively supernatural. */
export function birthOmenInterpretation(religion, omen, superstitious = false) {
    const label = OMEN_LABELS[omen] ?? "unusual birth omen";
    if (religion === "covenant")
        return `Covenant teachers usually treat your ${label} as a circumstance people may give meaning to, not a command from Ilyon.${superstitious ? " You still notice how sailors and families read more into it than the clergy do." : ""}`;
    if (religion === "old_gods") {
        const reading = omen === "great_storm" ? "some keepers call storm-born people tested early by Thoren" : omen === "high_tide" ? "some sailors call a high-tide birth a sign of a life repeatedly pulled toward the sea" : "some households associate first-snow births with endurance and long memory";
        return `Among Old Gods communities, ${reading}; other priests and sailors disagree, and no one reading is treated as settled truth.${superstitious ? " Your superstitious habits make those disagreements hard to ignore." : ""}`;
    }
    if (religion === "pantheon")
        return `Pantheon traditions can assign several competing patrons or meanings to a ${label}; no single interpretation is treated here as proven.${superstitious ? " You tend to remember the interpretations that recur around dangerous journeys." : ""}`;
    if (religion === "turning_wheel")
        return `Turning Wheel teachers may treat a ${label} as part of circumstance and cycle rather than a fixed destiny.${superstitious ? " You still watch for repetitions that others would dismiss." : ""}`;
    return `People from different traditions disagree about what your ${label} means. It can shape how people speak to you without guaranteeing luck, power, or fate.${superstitious ? " You pay closer attention when those readings surface." : ""}`;
}
export function religiousParticipationProfile(state, portId) {
    const institution = RELIGIOUS_INSTITUTION_BY_PORT[portId];
    if (!institution)
        return undefined;
    const c = state.player.character;
    const represented = institution.representedReligions.includes(c.religion);
    const label = represented ? (c.devotion === "devout" ? "Join the Rites & Serve" : c.devotion === "moderate" ? "Take Part in Local Worship" : "Attend Familiar Rites") : "Observe & Speak with Worshippers";
    const position = represented
        ? c.devotion === "devout" ? `As a devout ${c.religion.replaceAll("_", " ")} adherent, you are able to participate rather than merely watch.` : c.devotion === "moderate" ? `Your practiced faith gives you enough familiarity to take part without treating the institution as your whole identity.` : `Your faith is culturally familiar here, though your devotion is light enough that observation matters as much as participation.`
        : c.religion === "unaffiliated" ? "You approach as an unaffiliated observer, learning from what people actually do rather than claiming their beliefs as your own." : `Your own faith is not the main practice represented here, so you learn as a respectful outsider.`;
    return { label, summary: `${institution.name}: ${position}`, omenText: birthOmenInterpretation(institution.tradition, c.birthOmen, c.trait === "superstitious"), category: "religious" };
}
export function participateInReligiousLife(state) {
    const portId = state.player.currentPortId;
    if (!portId)
        return { ok: false, message: "You need to be in a port's religious district." };
    const profile = religiousParticipationProfile(state, portId);
    if (!profile)
        return { ok: false, message: "There is no religious institution context registered here." };
    const last = [...state.worldEvents].reverse().find(event => event.type === "religious_participation" && event.locationId === portId && event.participants?.includes(state.player.character.id));
    if (last && state.absoluteHour - last.atHour < 72)
        return { ok: false, message: "You have already spent meaningful time in these institutions recently. Let local life change before repeating the same visit." };
    advanceWorld(state, 2);
    const c = state.player.character;
    const text = `${profile.summary} ${profile.omenText}`;
    upsertPlayerKnowledge(state, { id: `knowledge.religious_participation.${portId}.${c.id}`, claimKey: `religious_participation.${portId}.${c.id}`, category: "religious", subjectId: portId, text, source: `Direct participation and observation at ${PORT_BY_ID[portId]?.religionName ?? portId}`, learnedAtHour: state.absoluteHour, observedAtHour: state.absoluteHour, refreshedAtHour: state.absoluteHour, staleAfterHours: 336, confidence: 88, truthStatus: "unknown", informationState: "current", hardRumor: false, originLocationId: portId });
    state.worldEvents.push({ id: `event.religious_participation.${portId}.${state.absoluteHour}.${state.worldEvents.length}`, type: "religious_participation", atHour: state.absoluteHour, locationId: portId, participants: [c.id], summary: `${c.name} spent time participating in or observing religious life at ${PORT_BY_ID[portId]?.religionName ?? portId}.`, canonicalData: { religion: c.religion, devotion: c.devotion, birthOmen: c.birthOmen, trait: c.trait }, importance: 1 });
    return { ok: true, message: text };
}
export function portBuildInsights(state, portId, lensId) {
    const c = state.player.character;
    const port = PORT_BY_ID[portId];
    if (!port)
        return [];
    const out = [];
    if (c.homelandRegion === port.region || c.culture === "skeldran")
        out.push(`Your ${c.culture.replaceAll("_", " ")} familiarity helps you recognize which customs are ordinary here and which are worth asking about; it does not grant hidden factual knowledge.`);
    else
        out.push(`Because you were raised outside ${port.region}, local habits stand out as learned context rather than something you can safely assume you understand.`);
    if (lensId === "scholarly" || lensId === "social") {
        const religious = RELIGIOUS_INSTITUTION_BY_PORT[portId];
        if (religious)
            out.push(religious.representedReligions.includes(c.religion) ? `Your ${c.devotion} ${c.religion.replaceAll("_", " ")} practice gives you a familiar point of entry into local religious conversation.` : `Your own ${c.religion.replaceAll("_", " ")} outlook makes the local religious institutions something you must read as an outsider rather than treating them as interchangeable.`);
    }
    if (lensId === "maritime" || lensId === "trade") {
        if (c.shipOrigin === "naval_surplus")
            out.push("Tideworn's naval-surplus history makes Admiralty habits, recognition, and paperwork more relevant to how you read the waterfront.");
        else if (c.shipOrigin === "prize_share")
            out.push("Having come by the ship through prize service makes veteran sailors and prize talk more legible to you than to a captain with no such history.");
        else if (c.shipOrigin === "inherited" && c.homeSettlementId === portId)
            out.push("An inherited ship in your home port carries family and local history that strangers would not read the same way.");
        else if (c.shipOrigin === "purchased_on_debt")
            out.push("A financed start makes freight, reliable work, and the cost of idle days part of how you judge an opportunity, without inventing a second debt meter.");
    }
    if (c.trait === "superstitious" && (lensId === "maritime" || lensId === "scholarly"))
        out.push(`You notice when sailors or priests connect current talk to your ${OMEN_LABELS[c.birthOmen] ?? "birth omen"}; that changes what you ask and remember, not the truth of the weather or the world.`);
    return out.slice(0, 2);
}
//# sourceMappingURL=characterConsequences.js.map