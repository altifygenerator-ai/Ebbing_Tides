import { COMMODITIES, PORT_MARKET_PROFILES } from "../data/seed/commodities.js";
import { CONTENT_BY_ID } from "../data/seed/contentRegistry.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { settlementAvailabilityFor } from "../data/seed/regionalAvailability.js";
const MAX_LIVE_CARGO_ROWS = 24;
const LEGACY_GOOD_IDS = new Set(Object.values(PORT_MARKET_PROFILES).flatMap((profile) => Object.keys(profile)));
function hashUnit(input) {
    let h = 2166136261;
    for (const ch of input)
        h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return (h % 1000) / 999;
}
function generatedMarketRow(portId, good) {
    if (!good.contentDefinitionId)
        return undefined;
    const definition = CONTENT_BY_ID[good.contentDefinitionId];
    if (!definition)
        return undefined;
    const availability = settlementAvailabilityFor(definition, portId);
    if (availability.availability === "unavailable" || availability.availability === "restricted")
        return undefined;
    if (definition.legalStatus === "contraband" || definition.legalStatus === "stolen" || definition.legalStatus === "military_only")
        return undefined;
    const targetByBand = {
        unavailable: 0,
        restricted: 0,
        rare_import: 14,
        occasional: 28,
        common: 48,
        local_specialty: 68
    };
    const targetStock = targetByBand[availability.availability];
    if (targetStock <= 0)
        return undefined;
    const stockDrift = 0.72 + hashUnit(`${portId}:${good.id}:stock`) * 0.62;
    return {
        commodityId: good.id,
        stock: Math.max(4, Math.round(targetStock * stockDrift)),
        targetStock,
        localMultiplier: availability.priceModifier,
        lastPrice: 0
    };
}
function canonicalCargoCandidates(portId) {
    return COMMODITIES.flatMap((good) => {
        if (LEGACY_GOOD_IDS.has(good.id))
            return [];
        const row = generatedMarketRow(portId, good);
        if (!row || !good.contentDefinitionId)
            return [];
        const definition = CONTENT_BY_ID[good.contentDefinitionId];
        if (!definition)
            return [];
        const availability = settlementAvailabilityFor(definition, portId);
        const bandScore = { local_specialty: 100, common: 75, occasional: 48, rare_import: 26, restricted: 0, unavailable: 0 }[availability.availability];
        // Favor ordinary trade over curiosities while preserving a small imported tail.
        const legalScore = definition.legalStatus === "ordinary" ? 8 : definition.legalStatus === "licensed" ? 2 : -10;
        const deterministicTie = hashUnit(`${portId}:${good.id}:rank`);
        return [{ good, row, score: bandScore + legalScore + deterministicTie }];
    }).sort((a, b) => b.score - a.score || a.good.id.localeCompare(b.good.id));
}
export function buildInitialPortMarkets() {
    const markets = {};
    for (const portId of Object.keys(PORT_BY_ID)) {
        const legacyProfile = PORT_MARKET_PROFILES[portId] ?? {};
        const goods = Object.fromEntries(Object.entries(legacyProfile).map(([commodityId, row]) => [commodityId, {
                commodityId,
                stock: row.stock,
                targetStock: row.target,
                localMultiplier: row.multiplier,
                lastPrice: 0
            }]));
        for (const candidate of canonicalCargoCandidates(portId)) {
            if (Object.keys(goods).length >= MAX_LIVE_CARGO_ROWS)
                break;
            goods[candidate.good.id] = candidate.row;
        }
        markets[portId] = { portId, goods, lastUpdatedHour: 0 };
    }
    return markets;
}
//# sourceMappingURL=marketGeneration.js.map