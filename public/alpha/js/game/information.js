import { PORT_BY_ID } from "../data/seed/ports.js";
import { findSeaPath } from "./navigation.js";
import { routeDistanceNm } from "./physicalDistance.js";
const CATEGORY_DEFAULT_STALE_HOURS = {
    trade: 72,
    danger: 120,
    maritime: 120,
    political: 336,
    local: 336,
    religious: 720
};
function categoryForLegacyDomain(domain) {
    switch (domain) {
        case "economic": return "trade";
        case "religious": return "religious";
        case "professional": return "personal";
        case "historical": return "political";
        case "rumor": return "local";
        case "geographic":
        case "social":
        case "linguistic":
        default: return "local";
    }
}
function truthForLegacyStatus(status) {
    if (status === "fact")
        return "confirmed";
    if (status === "contradiction")
        return "disproved";
    return "unknown";
}
function legacyKnowledgeRecord(entry) {
    const stale = entry.status === "outdated" ? 0 : entry.domain === "rumor" ? 168 : undefined;
    return {
        id: entry.id,
        claimKey: entry.id,
        category: categoryForLegacyDomain(entry.domain),
        ...(entry.subjectId ? { subjectId: entry.subjectId } : {}),
        text: entry.claim,
        source: entry.source,
        learnedAtHour: entry.learnedAtHour,
        observedAtHour: entry.lastConfirmedAtHour ?? entry.learnedAtHour,
        refreshedAtHour: entry.lastConfirmedAtHour ?? entry.learnedAtHour,
        ...(stale !== undefined ? { staleAfterHours: stale } : {}),
        confidence: Math.max(0, Math.min(100, entry.confidence)),
        truthStatus: truthForLegacyStatus(entry.status),
        informationState: entry.status === "contradiction" ? "contradicted" : "current",
        hardRumor: entry.domain === "rumor" || entry.status === "rumor"
    };
}
function claimKeyForLegacyRuntimeRecord(record) {
    if (record.id.startsWith("knowledge.port_read."))
        return record.id.slice("knowledge.".length);
    if (record.source === "Direct observation" && record.truthStatus === "confirmed" && record.subjectId && record.category === "maritime")
        return `ship.identity.${record.subjectId}`;
    return record.id;
}
export function knowledgeClaimKey(record) {
    return record.claimKey ?? record.id;
}
export function knowledgeReferenceHour(record) {
    return record.refreshedAtHour ?? record.observedAtHour ?? record.learnedAtHour;
}
export function knowledgeFreshnessAtHour(record, absoluteHour) {
    if (record.informationState === "contradicted")
        return "contradicted";
    if (record.informationState === "superseded")
        return "superseded";
    if (record.staleAfterHours === undefined)
        return "current";
    const age = Math.max(0, absoluteHour - knowledgeReferenceHour(record));
    if (age >= record.staleAfterHours)
        return "stale";
    if (age >= Math.max(1, Math.floor(record.staleAfterHours * 0.55)))
        return "aging";
    return "current";
}
export function currentKnowledgeForClaim(state, claimKey) {
    normalizeKnowledgeOwnership(state);
    return state.player.knowledge.find((entry) => knowledgeClaimKey(entry) === claimKey && entry.informationState !== "superseded");
}
export function knowledgeNeedsRefresh(state, claimKey, nextText, minimumChangeRefreshHours = 12) {
    const existing = currentKnowledgeForClaim(state, claimKey);
    if (!existing)
        return true;
    const freshness = knowledgeFreshnessAtHour(existing, state.absoluteHour);
    if (freshness === "stale" || freshness === "contradicted" || freshness === "superseded")
        return true;
    if (nextText !== undefined && nextText !== existing.text) {
        return state.absoluteHour - knowledgeReferenceHour(existing) >= minimumChangeRefreshHours;
    }
    return false;
}
/**
 * Canonical campaign-knowledge write path. A stable claim key owns one current player-facing claim;
 * learning it again refreshes that record rather than growing an endless duplicate list. Historical
 * acquisition/refutation events belong in worldEvents.
 */
export function upsertPlayerKnowledge(state, incoming) {
    normalizeKnowledgeOwnership(state);
    const claimKey = knowledgeClaimKey(incoming);
    // Historical refresh/refutation is recorded in worldEvents, so one semantic claim owns one
    // campaign-knowledge row even if an older save marked that row superseded.
    const idx = state.player.knowledge.findIndex((entry) => knowledgeClaimKey(entry) === claimKey);
    if (idx < 0) {
        const created = {
            ...incoming,
            claimKey,
            refreshedAtHour: incoming.refreshedAtHour ?? state.absoluteHour,
            informationState: incoming.informationState ?? "current"
        };
        state.player.knowledge.push(created);
        return { record: created, created: true, changed: true };
    }
    const previous = state.player.knowledge[idx];
    const changed = previous.text !== incoming.text
        || previous.source !== incoming.source
        || previous.confidence !== incoming.confidence
        || previous.truthStatus !== incoming.truthStatus
        || previous.informationState !== (incoming.informationState ?? "current");
    const refreshed = {
        ...previous,
        ...incoming,
        id: previous.id,
        claimKey,
        learnedAtHour: previous.learnedAtHour,
        refreshedAtHour: incoming.refreshedAtHour ?? state.absoluteHour,
        informationState: incoming.informationState ?? "current"
    };
    state.player.knowledge[idx] = refreshed;
    return { record: refreshed, created: false, changed };
}
export function contradictPlayerKnowledge(state, claimKey) {
    const record = currentKnowledgeForClaim(state, claimKey);
    if (!record)
        return false;
    record.informationState = "contradicted";
    return true;
}
export function supersedePlayerKnowledge(state, claimKey) {
    const record = currentKnowledgeForClaim(state, claimKey);
    if (!record)
        return false;
    record.informationState = "superseded";
    return true;
}
/**
 * A0.2A ownership repair. PlayerState.knowledge is the one mutable campaign-intelligence ledger.
 * The old CharacterCapabilityState.knowledgeEntries array is imported once for compatibility and
 * cleared so future systems cannot accidentally maintain two competing truths about the captain.
 */
export function normalizeKnowledgeOwnership(state) {
    state.player.knowledge ??= [];
    for (const record of state.player.knowledge) {
        record.claimKey ??= claimKeyForLegacyRuntimeRecord(record);
        record.refreshedAtHour ??= record.learnedAtHour;
        record.informationState ??= "current";
        if (record.staleAfterHours === undefined && record.truthStatus === "unknown") {
            const fallback = CATEGORY_DEFAULT_STALE_HOURS[record.category];
            if (fallback !== undefined)
                record.staleAfterHours = fallback;
        }
    }
    const legacy = state.player.character.knowledgeEntries ?? [];
    if (legacy.length) {
        for (const entry of legacy) {
            const converted = legacyKnowledgeRecord(entry);
            const key = knowledgeClaimKey(converted);
            const existing = state.player.knowledge.find((row) => knowledgeClaimKey(row) === key);
            if (!existing)
                state.player.knowledge.push(converted);
            else if (converted.confidence > existing.confidence && converted.truthStatus === "confirmed") {
                existing.confidence = converted.confidence;
                existing.truthStatus = "confirmed";
                existing.informationState = "current";
                if (converted.staleAfterHours === undefined)
                    delete existing.staleAfterHours;
            }
        }
        state.player.character.knowledgeEntries = [];
    }
    // Older Alpha saves could contain several timestamped observations that now resolve to the
    // same stable claim. Keep one current row; acquisition/refutation history belongs in worldEvents.
    const compacted = [];
    const indexByClaim = new Map();
    for (const record of state.player.knowledge) {
        const key = knowledgeClaimKey(record);
        const existingIndex = indexByClaim.get(key);
        if (existingIndex === undefined) {
            indexByClaim.set(key, compacted.length);
            compacted.push(record);
            continue;
        }
        const existing = compacted[existingIndex];
        const recordHour = knowledgeReferenceHour(record);
        const existingHour = knowledgeReferenceHour(existing);
        const preferRecord = recordHour > existingHour
            || (recordHour === existingHour && record.truthStatus === "confirmed" && existing.truthStatus !== "confirmed")
            || (recordHour === existingHour && record.truthStatus === existing.truthStatus && record.confidence > existing.confidence);
        const kept = preferRecord ? record : existing;
        kept.learnedAtHour = Math.min(existing.learnedAtHour, record.learnedAtHour);
        compacted[existingIndex] = kept;
    }
    if (compacted.length !== state.player.knowledge.length)
        state.player.knowledge = compacted;
}
/** A rumor or old report is not enough to identify a ship on sight forever. */
export function knowledgeSupportsRecognition(state, subjectId) {
    normalizeKnowledgeOwnership(state);
    return state.player.knowledge.some((record) => {
        if (record.subjectId !== subjectId)
            return false;
        const freshness = knowledgeFreshnessAtHour(record, state.absoluteHour);
        if (freshness === "contradicted" || freshness === "superseded")
            return false;
        if (record.truthStatus === "confirmed")
            return true;
        return record.hardRumor && record.confidence >= 90 && freshness !== "stale";
    });
}
/**
 * Coarse physical news delay. This is not omniscient propagation: it only says when a public report
 * could plausibly have reached another currently registered port. Learning still requires a player
 * source such as rumor gathering. New registered ports automatically participate without named-port branches.
 */
export function informationTravelHours(fromPortId, toPortId) {
    if (fromPortId === toPortId)
        return 0;
    const from = PORT_BY_ID[fromPortId];
    const to = PORT_BY_ID[toPortId];
    if (!from || !to)
        return undefined;
    const path = findSeaPath(from.approachPoint, to.approachPoint);
    if (path.length < 2)
        return undefined;
    const distanceNm = routeDistanceNm(path);
    // Merchant packets / ordinary sailing news: ~6 knots plus handling time at both ends.
    return Math.max(8, Math.ceil(distanceNm / 6) + 8);
}
export function eventInformationCanReachPort(state, event, targetPortId) {
    if (!event.locationId)
        return false;
    if (event.locationId === targetPortId)
        return true;
    const delay = informationTravelHours(event.locationId, targetPortId);
    return delay !== undefined && state.absoluteHour >= event.atHour + delay;
}
/**
 * Public-event eligibility for the generic information layer. Law/crime transmission is intentionally
 * excluded until A0.2D, where witness/evidence and authority receipt become authoritative.
 */
export function publicEventInformationProfile(event) {
    if (event.type === "npc_arrival")
        return { category: "maritime", source: "Harbor and sailor traffic", confidence: 72, staleAfterHours: 120 };
    if (event.canonicalData.publicKnowledge === true) {
        const category = typeof event.canonicalData.informationCategory === "string" ? event.canonicalData.informationCategory : "local";
        const allowed = ["trade", "local", "danger", "personal", "political", "religious", "maritime"];
        return {
            category: allowed.includes(category) ? category : "local",
            source: typeof event.canonicalData.informationSource === "string" ? event.canonicalData.informationSource : "Public report",
            confidence: typeof event.canonicalData.informationConfidence === "number" ? Math.max(10, Math.min(100, event.canonicalData.informationConfidence)) : 70,
            ...(typeof event.canonicalData.informationStaleHours === "number" ? { staleAfterHours: Math.max(1, event.canonicalData.informationStaleHours) } : {})
        };
    }
    return undefined;
}
//# sourceMappingURL=information.js.map