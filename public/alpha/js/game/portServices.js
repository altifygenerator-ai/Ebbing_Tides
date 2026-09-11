import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { SETTLEMENT_ECONOMIC_PROFILE_BY_ID } from "../data/seed/regionalAvailability.js";
import { calculatePrice } from "./economy.js";
const YARD_CAPABILITY_LABELS = {
    0: "No local yard",
    1: "Basic boat repair",
    2: "Working harbor yard",
    3: "Full commercial yard",
    4: "Major specialist yard"
};
const MEDICAL_CAPABILITY_LABELS = {
    0: "No local treatment",
    1: "Basic healer / first aid",
    2: "Local physician / clinic",
    3: "Established medical service",
    4: "Major hospital / specialist care"
};
const REPAIR_CONDITION_CEILING = { 0: 0, 1: 0.65, 2: 0.80, 3: 0.92, 4: 1 };
const REPAIR_FULL_DAMAGE_THRESHOLD = { 0: 0, 1: 0.08, 2: 0.15, 3: 0.30, 4: 1 };
const REPAIR_LABOR_MULTIPLIER = { 0: 2, 1: 1.60, 2: 1.30, 3: 1.10, 4: 1 };
const REPAIR_BASE_HOURS = { 0: 0, 1: 18, 2: 12, 3: 9, 4: 6 };
const REFIT_PRICE_MULTIPLIER = { 0: 2, 1: 1.55, 2: 1.30, 3: 1.12, 4: 1 };
const REFIT_TIME_MULTIPLIER = { 0: 2, 1: 1.75, 2: 1.45, 3: 1.20, 4: 1 };
const MEDICAL_PRICE_MULTIPLIER = { 0: 2, 1: 1.35, 2: 1.15, 3: 1, 4: 0.90 };
const MEDICAL_HOURS = { 0: 0, 1: 8, 2: 6, 3: 4, 4: 3 };
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function ceilToHour(value) { return Math.max(1, Math.ceil(value)); }
function resourceRowsForCategories(state, portId, categories) {
    const market = state.markets[portId];
    if (!market)
        return [];
    return Object.values(market.goods)
        .filter(row => categories.has(COMMODITY_BY_ID[row.commodityId]?.category ?? ""))
        .sort((a, b) => {
        const ar = a.targetStock > 0 ? a.stock / a.targetStock : 0;
        const br = b.targetStock > 0 ? b.stock / b.targetStock : 0;
        return br - ar || calculatePrice(state, market, a.commodityId) - calculatePrice(state, market, b.commodityId) || a.commodityId.localeCompare(b.commodityId);
    });
}
/**
 * Service procurement deliberately consumes the same live market rows used by trade/economy.
 * A "service unit" is an abstract yard/medical bundle, not a second inventory of exact boards,
 * rivets, medicines, or labor. This keeps the economy causal without workshop micromanagement.
 */
export function quoteServiceResources(state, portId, categories, requiredUnits) {
    const market = state.markets[portId];
    const need = Math.max(0, Math.ceil(requiredUnits));
    if (!market || need === 0)
        return { ok: need === 0, requiredUnits: need, availableUnits: 0, stockRatio: 0, lines: [], procurementCost: 0 };
    const rows = resourceRowsForCategories(state, portId, new Set(categories));
    const availableUnits = rows.reduce((sum, row) => sum + Math.max(0, Math.floor(row.stock)), 0);
    const weightedTarget = rows.reduce((sum, row) => sum + Math.max(1, row.targetStock), 0);
    const weightedStock = rows.reduce((sum, row) => sum + Math.max(0, row.stock), 0);
    const stockRatio = weightedTarget > 0 ? Number((weightedStock / weightedTarget).toFixed(3)) : 0;
    let remaining = need;
    let procurementCost = 0;
    const lines = [];
    for (const row of rows) {
        if (remaining <= 0)
            break;
        const quantity = Math.min(remaining, Math.max(0, Math.floor(row.stock)));
        if (quantity <= 0)
            continue;
        const unitPrice = calculatePrice(state, market, row.commodityId);
        lines.push({ commodityId: row.commodityId, quantity, unitPrice });
        procurementCost += quantity * unitPrice;
        remaining -= quantity;
    }
    return { ok: remaining === 0, requiredUnits: need, availableUnits, stockRatio, lines, procurementCost };
}
export function consumeServiceResources(state, portId, quote) {
    if (!quote.ok)
        return;
    const market = state.markets[portId];
    if (!market)
        return;
    for (const line of quote.lines) {
        const row = market.goods[line.commodityId];
        if (row)
            row.stock = Math.max(0, Number((row.stock - line.quantity).toFixed(3)));
    }
}
function targetForRepair(current, max, capability) {
    if (current >= max || capability === 0)
        return current;
    const missingFraction = (max - current) / Math.max(1, max);
    if (missingFraction <= REPAIR_FULL_DAMAGE_THRESHOLD[capability])
        return max;
    return Math.max(current, Math.floor(max * REPAIR_CONDITION_CEILING[capability]));
}
export function quoteShipRepair(state, portId = state.player.currentPortId ?? "") {
    const ship = state.ships[state.player.shipId];
    const profile = SETTLEMENT_ECONOMIC_PROFILE_BY_ID[portId];
    const capability = profile?.shipyard.repairs ?? 0;
    const capabilityLabel = YARD_CAPABILITY_LABELS[capability];
    const emptyResources = { ok: false, requiredUnits: 0, availableUnits: 0, stockRatio: 0, lines: [], procurementCost: 0 };
    if (!portId || !profile || !ship)
        return { ok: false, portId, capability, capabilityLabel, cost: 0, hours: 0, repairPoints: 0, targetHull: ship?.systems.hull ?? 0, targetSails: ship?.systems.sails ?? 0, targetRigging: ship?.systems.rigging ?? 0, targetFire: ship?.systems.fire ?? 0, targetFlooding: ship?.systems.flooding ?? 0, fullRestoration: false, resources: emptyResources, message: "No usable shipyard service is available here." };
    if (capability === 0)
        return { ok: false, portId, capability, capabilityLabel, cost: 0, hours: 0, repairPoints: 0, targetHull: ship.systems.hull, targetSails: ship.systems.sails, targetRigging: ship.systems.rigging, targetFire: ship.systems.fire, targetFlooding: ship.systems.flooding, fullRestoration: false, resources: emptyResources, message: "This settlement has no yard capable of repairing this ship." };
    const targetHull = targetForRepair(ship.systems.hull, ship.systems.hullMax, capability);
    const targetSails = targetForRepair(ship.systems.sails, ship.systems.sailsMax, capability);
    const targetRigging = targetForRepair(ship.systems.rigging, ship.systems.riggingMax, capability);
    const targetFire = capability >= 3 ? 0 : capability === 2 ? Math.floor(ship.systems.fire / 2) : ship.systems.fire;
    const targetFlooding = capability >= 3 ? 0 : capability === 2 ? Math.floor(ship.systems.flooding / 2) : ship.systems.flooding;
    const repairPoints = (targetHull - ship.systems.hull) + Math.ceil((targetSails - ship.systems.sails) / 2) + Math.ceil((targetRigging - ship.systems.rigging) / 2) + (ship.systems.fire - targetFire) * 2 + (ship.systems.flooding - targetFlooding) * 2;
    if (repairPoints <= 0) {
        const stillDamaged = ship.systems.hull < ship.systems.hullMax || ship.systems.sails < ship.systems.sailsMax || ship.systems.rigging < ship.systems.riggingMax || ship.systems.fire > 0 || ship.systems.flooding > 0;
        return { ok: false, portId, capability, capabilityLabel, cost: 0, hours: 0, repairPoints: 0, targetHull, targetSails, targetRigging, targetFire, targetFlooding, fullRestoration: !stillDamaged, resources: emptyResources, message: stillDamaged ? "The remaining damage requires a more capable yard." : `${ship.name} does not need yard repairs.` };
    }
    const requiredUnits = Math.max(1, Math.min(6, Math.ceil(repairPoints / 18)));
    const resources = quoteServiceResources(state, portId, new Set(["raw", "manufactured"]), requiredUnits);
    if (!resources.ok)
        return { ok: false, portId, capability, capabilityLabel, cost: 0, hours: 0, repairPoints, targetHull, targetSails, targetRigging, targetFire, targetFlooding, fullRestoration: false, resources, message: "The yard has the skill, but current material stocks cannot support this repair." };
    const scarcityMultiplier = resources.stockRatio < 0.35 ? 1.30 : resources.stockRatio < 0.60 ? 1.15 : resources.stockRatio > 1.15 ? 0.96 : 1;
    const labor = Math.max(12, repairPoints * 2);
    const cost = Math.max(12, Math.round(labor * REPAIR_LABOR_MULTIPLIER[capability] * scarcityMultiplier + resources.procurementCost * 0.25));
    const severityScale = 1 + Math.max(0, repairPoints - 24) / 120;
    const hours = ceilToHour(REPAIR_BASE_HOURS[capability] * severityScale * (resources.stockRatio < 0.35 ? 1.25 : 1));
    const fullRestoration = targetHull === ship.systems.hullMax && targetSails === ship.systems.sailsMax && targetRigging === ship.systems.riggingMax && targetFire === 0 && targetFlooding === 0;
    return { ok: true, portId, capability, capabilityLabel, cost, hours, repairPoints, targetHull, targetSails, targetRigging, targetFire, targetFlooding, fullRestoration, resources, message: fullRestoration ? `This yard can restore ${ship.name} fully.` : `This yard can repair ${ship.name}, but major-yard work will still be needed for full restoration.` };
}
export function quoteGenericRefitService(state, portId, baseCost, baseHours, requiredCapability, resourceUnits, specialistTag) {
    const profile = SETTLEMENT_ECONOMIC_PROFILE_BY_ID[portId];
    const capability = profile?.shipyard.refits ?? 0;
    const capabilityLabel = YARD_CAPABILITY_LABELS[capability];
    const emptyResources = { ok: false, requiredUnits: Math.max(1, resourceUnits), availableUnits: 0, stockRatio: 0, lines: [], procurementCost: 0 };
    if (!profile || capability < requiredCapability)
        return { ok: false, portId, capability, capabilityLabel, cost: 0, hours: 0, resources: emptyResources, specialistMatched: false, message: `This yard is not capable of that refit. ${requiredCapability >= 4 ? "A major specialist facility is required." : "A better-equipped shipyard is required."}` };
    const specialistMatched = Boolean(specialistTag && profile.shipyard.specialistCapabilities.some(tag => tag.toLowerCase().includes(specialistTag.toLowerCase())));
    if (specialistTag && capability === requiredCapability && !specialistMatched) {
        return { ok: false, portId, capability, capabilityLabel, cost: 0, hours: 0, resources: emptyResources, specialistMatched: false, message: `The yard lacks the specialist capability required for this refit.` };
    }
    const resources = quoteServiceResources(state, portId, new Set(["raw", "manufactured"]), Math.max(1, resourceUnits));
    if (!resources.ok)
        return { ok: false, portId, capability, capabilityLabel, cost: 0, hours: 0, resources, specialistMatched, message: "Current yard material stocks are too thin for that refit." };
    const specialistPrice = specialistMatched ? 0.94 : 1;
    const specialistTime = specialistMatched ? 0.90 : 1;
    const scarcityMultiplier = resources.stockRatio < 0.35 ? 1.25 : resources.stockRatio < 0.60 ? 1.12 : 1;
    const cost = Math.max(1, Math.round(baseCost * REFIT_PRICE_MULTIPLIER[capability] * specialistPrice * scarcityMultiplier + resources.procurementCost * 0.20));
    const hours = ceilToHour(baseHours * REFIT_TIME_MULTIPLIER[capability] * specialistTime * (resources.stockRatio < 0.35 ? 1.20 : 1));
    return { ok: true, portId, capability, capabilityLabel, cost, hours, resources, specialistMatched, message: specialistMatched ? "A local specialist can perform this work efficiently." : "The yard can perform this refit with ordinary facilities." };
}
function medicalSeverityLimit(capability) {
    if (capability <= 0)
        return 0;
    if (capability === 1)
        return 1;
    if (capability === 2)
        return 2;
    return 3;
}
function medicalEligible(injuries, maxSeverity) {
    const untreated = injuries.filter(injury => !injury.treated);
    return { treatable: untreated.filter(injury => injury.severity <= maxSeverity), unsupported: untreated.filter(injury => injury.severity > maxSeverity) };
}
export function quoteMedicalTreatment(state, portId = state.player.currentPortId ?? "") {
    const profile = SETTLEMENT_ECONOMIC_PROFILE_BY_ID[portId];
    const capability = profile?.medicalCapability ?? 0;
    const capabilityLabel = MEDICAL_CAPABILITY_LABELS[capability];
    const maxSeverity = medicalSeverityLimit(capability);
    const emptyResources = { ok: false, requiredUnits: 0, availableUnits: 0, stockRatio: 0, lines: [], procurementCost: 0 };
    if (!portId || !profile)
        return { ok: false, portId, capability, capabilityLabel, maxSeverity, treatableInjuryIds: [], unsupportedInjuryIds: [], cost: 0, hours: 0, resources: emptyResources, message: "No local medical service is available here." };
    const { treatable, unsupported } = medicalEligible(state.player.injuries, maxSeverity);
    if (!treatable.length) {
        const untreated = state.player.injuries.filter(injury => !injury.treated);
        const message = !untreated.length ? "You have no untreated injuries." : "Local practitioners cannot safely treat the remaining injuries; a better medical facility is required.";
        return { ok: false, portId, capability, capabilityLabel, maxSeverity, treatableInjuryIds: [], unsupportedInjuryIds: unsupported.map(injury => injury.id), cost: 0, hours: 0, resources: emptyResources, message };
    }
    const severityTotal = treatable.reduce((sum, injury) => sum + injury.severity, 0);
    const resourceUnits = Math.max(1, Math.ceil(severityTotal / 2));
    const resources = quoteServiceResources(state, portId, new Set(["medical"]), resourceUnits);
    if (!resources.ok)
        return { ok: false, portId, capability, capabilityLabel, maxSeverity, treatableInjuryIds: treatable.map(injury => injury.id), unsupportedInjuryIds: unsupported.map(injury => injury.id), cost: 0, hours: 0, resources, message: "Practitioners are available, but the port does not have enough medical stock for treatment." };
    const scarcityMultiplier = resources.stockRatio < 0.35 ? 1.25 : resources.stockRatio < 0.60 ? 1.12 : 1;
    const baseCost = severityTotal * 18;
    const cost = Math.max(6, Math.round(baseCost * MEDICAL_PRICE_MULTIPLIER[capability] * scarcityMultiplier + resources.procurementCost * 0.18));
    const hours = ceilToHour(MEDICAL_HOURS[capability] + Math.max(0, treatable.length - 1));
    return { ok: true, portId, capability, capabilityLabel, maxSeverity, treatableInjuryIds: treatable.map(injury => injury.id), unsupportedInjuryIds: unsupported.map(injury => injury.id), cost, hours, resources, message: unsupported.length ? `${treatable.length} injuries can be treated here; ${unsupported.length} require a stronger medical facility.` : `Local practitioners can treat all ${treatable.length} untreated injuries.` };
}
export function portServiceSummary(state, portId) {
    const profile = SETTLEMENT_ECONOMIC_PROFILE_BY_ID[portId];
    const market = state.markets[portId];
    if (!profile)
        return { yard: "No yard data", medical: "No medical data", provisions: "No provisioning data" };
    const foodRows = market ? Object.values(market.goods).filter(row => COMMODITY_BY_ID[row.commodityId]?.category === "food") : [];
    const foodAvailable = foodRows.reduce((sum, row) => sum + Math.max(0, Math.floor(row.stock)), 0);
    const provisions = foodAvailable <= 0 ? "Stores exhausted" : foodAvailable < 4 ? "Stores very tight" : foodAvailable < 12 ? "Stores limited" : "Stores available";
    return { yard: YARD_CAPABILITY_LABELS[profile.shipyard.repairs], medical: MEDICAL_CAPABILITY_LABELS[profile.medicalCapability], provisions };
}
/** Convenience for tests/consumer code that needs a stable display label without duplicating levels. */
export function capabilityLabel(level) { return YARD_CAPABILITY_LABELS[clamp(level, 0, 4)]; }
//# sourceMappingURL=portServices.js.map