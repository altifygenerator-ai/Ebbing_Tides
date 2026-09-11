import { CONTENT_BY_ID } from "../data/seed/contentRegistry.js";
import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { PORT_COMMODITY_PRODUCTION_FACTORS } from "../data/seed/economyFlows.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { settlementAvailabilityFor } from "../data/seed/regionalAvailability.js";
import { calculatePrice, marketStorageCapacity } from "./economy.js";
import { deterministicUnit } from "./rng.js";
import { worldCauseInfluenceForPortCommodity } from "./worldCauses.js";
const TURNOVER_BY_CATEGORY = {
    food: 0.024,
    medical: 0.014,
    raw: 0.013,
    textile: 0.011,
    manufactured: 0.010,
    military: 0.008,
    luxury: 0.007,
    arcane: 0.006,
    illicit: 0,
    document: 0.006
};
function availabilityProductionFactor(portId, row) {
    const explicit = PORT_COMMODITY_PRODUCTION_FACTORS[portId]?.[row.commodityId];
    if (explicit !== undefined)
        return { factor: explicit, source: "authored settlement production" };
    const good = COMMODITY_BY_ID[row.commodityId];
    const definition = good?.contentDefinitionId ? CONTENT_BY_ID[good.contentDefinitionId] : undefined;
    if (definition) {
        const availability = settlementAvailabilityFor(definition, portId);
        const factorBySource = {
            local: 0.97,
            regional: 0.56,
            import: 0.06,
            state: 0.62,
            religious: 0.68,
            captured: 0.08,
            surplus: 1.00,
            smuggled: 0.03
        };
        let factor = factorBySource[availability.source] ?? 0.60;
        if (availability.availability === "local_specialty")
            factor += 0.02;
        if (availability.availability === "rare_import")
            factor = Math.min(factor, 0.18);
        return { factor, source: `settlement availability: ${availability.source}` };
    }
    // Legacy rows without a canonical content link remain data-driven by their authored local price
    // multiplier until they are mapped to a richer commodity definition.
    const factor = row.localMultiplier <= 0.90 ? 1.18 : row.localMultiplier <= 1.05 ? 0.95 : row.localMultiplier <= 1.20 ? 0.62 : 0.34;
    return { factor, source: "legacy settlement market profile" };
}
export function commodityFlowRates(portId, row) {
    const good = COMMODITY_BY_ID[row.commodityId];
    const turnover = TURNOVER_BY_CATEGORY[good?.category ?? "manufactured"] ?? 0.01;
    const dailyConsumption = Math.max(0.08, row.targetStock * turnover);
    const production = availabilityProductionFactor(portId, row);
    const explicit = PORT_COMMODITY_PRODUCTION_FACTORS[portId]?.[row.commodityId] !== undefined;
    let externalFactor = 0;
    const goodDef = good?.contentDefinitionId ? CONTENT_BY_ID[good.contentDefinitionId] : undefined;
    if (explicit) {
        externalFactor = row.localMultiplier <= 0.90 ? 0.04 : row.localMultiplier <= 1.05 ? 0.12 : row.localMultiplier <= 1.20 ? 0.34 : 0.55;
    }
    else if (goodDef) {
        const availability = settlementAvailabilityFor(goodDef, portId);
        const externalBySource = { local: 0.02, regional: 0.42, import: 0.82, state: 0.34, religious: 0.30, captured: 0.70, surplus: 0.06, smuggled: 0.50 };
        externalFactor = externalBySource[availability.source] ?? 0.35;
        if (availability.availability === "rare_import")
            externalFactor = Math.min(externalFactor, 0.72);
    }
    else {
        externalFactor = row.localMultiplier > 1.05 ? 0.35 : 0.12;
    }
    // The four-port Alpha does not yet simulate Skeldra's inland farms, villages and every coastal
    // trader as individual entities. Staple-food background supply represents those real off-screen
    // sources so the proving-ground ports do not starve merely because rural nodes are inactive.
    // Future blockade/famine policy can reduce this one flow rather than adding a parallel price modifier.
    if (good?.category === "food")
        externalFactor += 0.20;
    return {
        dailyProduction: dailyConsumption * production.factor,
        dailyExternalSupply: dailyConsumption * externalFactor,
        dailyConsumption,
        storageCapacity: marketStorageCapacity(row),
        productionFactor: production.factor,
        source: production.source
    };
}
/**
 * Advance settlement production, consumption, and coarse off-screen supply. Materialized player/NPC
 * trade moves goods through the same inventory. The coarse supply represents non-materialized
 * hinterland/LOD trade only; it does not target-seek or maintain a second market state.
 */
export function advanceSettlementEconomy(state, beforeHour) {
    const beforeDay = Math.floor(beforeHour / 24);
    const afterDay = Math.floor(state.absoluteHour / 24);
    if (afterDay <= beforeDay)
        return;
    for (let day = beforeDay + 1; day <= afterDay; day += 1) {
        for (const market of Object.values(state.markets)) {
            for (const row of Object.values(market.goods)) {
                const flow = commodityFlowRates(market.portId, row);
                if (flow.dailyConsumption <= 0 && flow.dailyProduction <= 0)
                    continue;
                const category = COMMODITY_BY_ID[row.commodityId]?.category ?? "manufactured";
                const cause = worldCauseInfluenceForPortCommodity(state, market.portId, category, day * 24);
                const productionNoise = 0.94 + deterministicUnit(state.worldSeed, `production:${market.portId}:${row.commodityId}:${day}`) * 0.12;
                const consumptionNoise = 0.94 + deterministicUnit(state.worldSeed, `consumption:${market.portId}:${row.commodityId}:${day}`) * 0.12;
                const produced = row.stock >= flow.storageCapacity ? 0 : flow.dailyProduction * cause.productionMultiplier * productionNoise;
                // Explicit coarse off-screen imports represent the part of the wider world that is not yet
                // simulated as individual ships/ports. A0.3C world causes modify this causal input directly;
                // price still comes only from the resulting live stock, never from a duplicate event markup.
                const imported = row.stock >= flow.storageCapacity ? 0 : flow.dailyExternalSupply * cause.externalSupplyMultiplier * (0.96 + deterministicUnit(state.worldSeed, `aggregate-import:${market.portId}:${row.commodityId}:${day}`) * 0.08);
                const availableAfterProduction = Math.min(flow.storageCapacity, row.stock + produced + imported);
                const consumed = Math.min(availableAfterProduction, flow.dailyConsumption * cause.consumptionMultiplier * consumptionNoise);
                row.stock = Math.max(0, Math.min(flow.storageCapacity, Number((availableAfterProduction - consumed).toFixed(3))));
            }
        }
    }
}
function cargoUnitsUsed(ship) {
    return ship.cargo.reduce((sum, stack) => sum + (COMMODITY_BY_ID[stack.commodityId]?.cargoUnits ?? 1) * stack.quantity, 0);
}
function marketableCargoRows(market, ship) {
    return ship.cargo.filter(stack => Boolean(market.goods[stack.commodityId]) && stack.quantity > 0);
}
/** Sell cargo that has reached a market. Routine NPC trade mutates canonical cargo, cash and stock
 * but does not spam the historical event ledger: ordinary trade is economic state, not notable news. */
export function settleNpcCargoAtPort(state, npc, portId) {
    const ship = npc.shipId ? state.ships[npc.shipId] : undefined;
    const market = state.markets[portId];
    if (!ship || !market)
        return 0;
    let revenue = 0;
    for (const stack of marketableCargoRows(market, ship)) {
        const row = market.goods[stack.commodityId];
        const unitPrice = calculatePrice(state, market, stack.commodityId);
        const warehouseSpace = Math.max(0, Math.floor(marketStorageCapacity(row) - row.stock));
        const quantity = Math.min(Math.max(0, Math.floor(stack.quantity)), warehouseSpace);
        if (quantity <= 0)
            continue;
        row.stock += quantity;
        revenue += Math.max(1, Math.round(unitPrice * 0.84)) * quantity;
        stack.quantity -= quantity;
    }
    ship.cargo = ship.cargo.filter(stack => stack.quantity > 0);
    npc.brain.needs.moneyReserve += revenue;
    return revenue;
}
function foodRowsForPort(state, portId) {
    const market = state.markets[portId];
    if (!market)
        return [];
    return Object.values(market.goods)
        .filter(row => COMMODITY_BY_ID[row.commodityId]?.category === "food" && row.stock >= 1)
        .sort((a, b) => calculatePrice(state, market, a.commodityId) - calculatePrice(state, market, b.commodityId));
}
/** One ordinary market cargo unit of staple provisions represents roughly six reserve-days for
 * the current aggregate NPC ship-needs model. Fresh water remains a normal harbor utility until
 * water inventory is represented explicitly in every active settlement. */
export function provisionNpcAtPort(state, npc, portId, targetDays = 18) {
    const market = state.markets[portId];
    if (!market)
        return { foodDaysAdded: 0, cost: 0 };
    let unitsNeeded = Math.max(0, Math.ceil((targetDays - npc.brain.needs.foodDays) / 6));
    let cost = 0;
    let foodDaysAdded = 0;
    for (const row of foodRowsForPort(state, portId)) {
        if (unitsNeeded <= 0)
            break;
        const unitPrice = Math.max(1, Math.round(calculatePrice(state, market, row.commodityId) * 0.80));
        const ship = npc.shipId ? state.ships[npc.shipId] : undefined;
        const selfFinanced = ship?.disposition === "merchant" || ship?.disposition === "privateer";
        const affordable = selfFinanced ? Math.max(0, Math.floor((npc.brain.needs.moneyReserve - 30) / unitPrice)) : unitsNeeded;
        const quantity = Math.min(unitsNeeded, Math.floor(row.stock), affordable);
        if (quantity <= 0)
            continue;
        row.stock -= quantity;
        const lineCost = quantity * unitPrice;
        if (selfFinanced)
            npc.brain.needs.moneyReserve -= lineCost;
        cost += lineCost;
        foodDaysAdded += quantity * 6;
        unitsNeeded -= quantity;
    }
    npc.brain.needs.foodDays = Math.min(targetDays, npc.brain.needs.foodDays + foodDaysAdded);
    // Potable water can be taken on at an operating harbor; it is not conjured into market stock.
    if (PORT_BY_ID[portId])
        npc.brain.needs.waterDays = Math.max(npc.brain.needs.waterDays, Math.min(targetDays, npc.brain.needs.foodDays));
    return { foodDaysAdded, cost };
}
function exportableUnits(row) {
    // Merchants can draw from healthy stock without stripping a settlement below its safety reserve.
    return Math.max(0, Math.floor(row.stock - row.targetStock * 0.72));
}
export function tradeOpportunityScore(state, fromPortId, toPortId) {
    const from = state.markets[fromPortId];
    const to = state.markets[toPortId];
    if (!from || !to || fromPortId === toPortId)
        return -Infinity;
    let best = 0;
    for (const row of Object.values(from.goods)) {
        const destination = to.goods[row.commodityId];
        const good = COMMODITY_BY_ID[row.commodityId];
        if (!destination || !good || good.category === "illicit")
            continue;
        const available = exportableUnits(row);
        if (available <= 0)
            continue;
        const sourcePrice = calculatePrice(state, from, row.commodityId);
        const destinationPrice = calculatePrice(state, to, row.commodityId);
        const sourceRatio = row.stock / Math.max(1, row.targetStock);
        const destinationRatio = destination.stock / Math.max(1, destination.targetStock);
        const needGap = Math.max(0, sourceRatio - destinationRatio);
        const shortage = Math.max(0, 1 - destinationRatio);
        const margin = destinationPrice - sourcePrice;
        if (margin <= 0 && needGap < 0.20)
            continue;
        const needWeight = good.category === "food" ? 8 : good.category === "medical" ? 5 : 3;
        best = Math.max(best, margin * Math.min(6, available) + needGap * good.basePrice * needWeight + shortage * good.basePrice * needWeight);
    }
    return best;
}
/** Load a merchant for a known next destination from real source stock. No inventory is created by
 * the route planner; if the source port has no exportable stock, the ship simply sails light. */
export function loadNpcTradeCargo(state, npc, fromPortId, toPortId) {
    const ship = npc.shipId ? state.ships[npc.shipId] : undefined;
    const from = state.markets[fromPortId];
    const to = state.markets[toPortId];
    if (!ship || !from || !to || !["merchant", "privateer"].includes(ship.disposition))
        return { cost: 0, units: 0 };
    const candidates = Object.values(from.goods).flatMap(row => {
        const destination = to.goods[row.commodityId];
        const good = COMMODITY_BY_ID[row.commodityId];
        if (!destination || !good || good.category === "illicit")
            return [];
        const available = exportableUnits(row);
        if (available <= 0)
            return [];
        const sourcePrice = calculatePrice(state, from, row.commodityId);
        const destinationPrice = calculatePrice(state, to, row.commodityId);
        const sourceRatio = row.stock / Math.max(1, row.targetStock);
        const destinationRatio = destination.stock / Math.max(1, destination.targetStock);
        const needGap = sourceRatio - destinationRatio;
        const shortage = Math.max(0, 1 - destinationRatio);
        const margin = destinationPrice - sourcePrice;
        const needWeight = good.category === "food" ? 4.5 : good.category === "medical" ? 3 : 0.8;
        const score = margin + needGap * good.basePrice * needWeight + shortage * good.basePrice * needWeight;
        return score > 0 ? [{ row, good, sourcePrice, available, score }] : [];
    }).sort((a, b) => b.score - a.score || a.good.id.localeCompare(b.good.id));
    let cost = 0;
    let units = 0;
    for (const candidate of candidates) {
        const freeCargoUnits = Math.max(0, ship.cargoCapacity - cargoUnitsUsed(ship));
        if (freeCargoUnits < candidate.good.cargoUnits)
            break;
        const affordable = Math.max(0, Math.floor((npc.brain.needs.moneyReserve - 60) / candidate.sourcePrice));
        const byCapacity = Math.floor(freeCargoUnits / candidate.good.cargoUnits);
        const quantity = Math.min(candidate.available, affordable, byCapacity, 8);
        if (quantity <= 0)
            continue;
        candidate.row.stock -= quantity;
        const lineCost = quantity * candidate.sourcePrice;
        npc.brain.needs.moneyReserve -= lineCost;
        cost += lineCost;
        units += quantity;
        const existing = ship.cargo.find(stack => stack.commodityId === candidate.good.id);
        if (existing)
            existing.quantity += quantity;
        else
            ship.cargo.push({ commodityId: candidate.good.id, quantity });
        if (cargoUnitsUsed(ship) >= ship.cargoCapacity * 0.82)
            break;
    }
    return { cost, units };
}
/** Quote player ship stores against real staple stock. Six ship-supply units ~= one ordinary
 * cargo-market unit of mixed provisions. The visible Shipyard control remains a simple one-click
 * action while the source is now the same economy the Market uses. */
export function quoteShipSupplies(state, portId, amount = 6) {
    const market = state.markets[portId];
    const requested = Math.max(1, Math.floor(amount));
    if (!market)
        return { ok: false, amount: requested, cost: 0, marketUnits: 0, sourceRows: [], message: "No provisioning market is available here." };
    let marketUnits = Math.max(1, Math.ceil(requested / 6));
    let cost = 0;
    const sourceRows = [];
    for (const row of foodRowsForPort(state, portId)) {
        if (marketUnits <= 0)
            break;
        const quantity = Math.min(marketUnits, Math.floor(row.stock));
        if (quantity <= 0)
            continue;
        const unitPrice = calculatePrice(state, market, row.commodityId);
        sourceRows.push({ commodityId: row.commodityId, quantity, unitPrice });
        cost += quantity * unitPrice;
        marketUnits -= quantity;
    }
    if (marketUnits > 0)
        return { ok: false, amount: requested, cost, marketUnits: Math.max(1, Math.ceil(requested / 6)), sourceRows: [], message: "The harbor does not have enough staple provisions to fill that order." };
    return { ok: true, amount: requested, cost: Math.max(1, cost), marketUnits: Math.max(1, Math.ceil(requested / 6)), sourceRows };
}
export function consumeSupplyQuote(state, portId, quote) {
    const market = state.markets[portId];
    if (!market || !quote.ok)
        return;
    for (const source of quote.sourceRows) {
        const row = market.goods[source.commodityId];
        if (row)
            row.stock = Math.max(0, row.stock - source.quantity);
    }
}
/** Useful for tests and later world events: every active settlement market can explain its current
 * local production/consumption without requiring named-port branches in the simulation engine. */
export function currentEconomicFlowSnapshot(state, portId) {
    const market = state.markets[portId];
    if (!market)
        return [];
    return Object.values(market.goods).map(row => { const category = COMMODITY_BY_ID[row.commodityId]?.category ?? "manufactured"; return { commodityId: row.commodityId, ...commodityFlowRates(portId, row), worldCauseInfluence: worldCauseInfluenceForPortCommodity(state, portId, category) }; });
}
//# sourceMappingURL=economySimulation.js.map