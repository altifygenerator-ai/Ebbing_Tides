import { shipClassDefinition } from "../data/seed/contentRegistry.js";
import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { getWorldCell } from "../data/seed/worldMap.js";
import { routeDistanceNm, straightLineDistanceNm } from "./physicalDistance.js";
export function legacyCruiseSpeedKnots(speedRating) {
    return 2.25 + 0.75 * Math.max(0, speedRating);
}
export function baseCruiseSpeedKnots(ship) {
    if (Number.isFinite(ship.cruiseSpeedKnots) && (ship.cruiseSpeedKnots ?? 0) > 0)
        return ship.cruiseSpeedKnots;
    const definition = shipClassDefinition(ship.classId);
    if (definition?.cruiseSpeedKnots && definition.cruiseSpeedKnots > 0)
        return definition.cruiseSpeedKnots;
    return legacyCruiseSpeedKnots(ship.speed);
}
export function terrainSpeedFactor(cell) {
    switch (cell.terrain) {
        case "reef": return 0.60;
        case "coastal_water": return 0.90;
        case "deep_sea": return 1.00;
        default: return 0;
    }
}
export function shipConditionSpeedFactor(ship) {
    const sail = ship.systems.sailsMax > 0 ? ship.systems.sails / ship.systems.sailsMax : 1;
    const rig = ship.systems.riggingMax > 0 ? ship.systems.rigging / ship.systems.riggingMax : 1;
    const hull = ship.systems.hullMax > 0 ? ship.systems.hull / ship.systems.hullMax : 1;
    const rigFactor = Math.max(0.45, Math.min(1, (sail + rig) / 2));
    const hullFactor = Math.max(0.72, 0.72 + Math.max(0, Math.min(1, hull)) * 0.28);
    const cargoUsed = ship.cargo.reduce((sum, stack) => sum + (COMMODITY_BY_ID[stack.commodityId]?.cargoUnits ?? 1) * stack.quantity, 0);
    const loadRatio = ship.cargoCapacity > 0 ? Math.min(1.25, cargoUsed / ship.cargoCapacity) : 0;
    const loadFactor = Math.max(0.84, 1 - Math.max(0, loadRatio - 0.6) * 0.18);
    return rigFactor * hullFactor * loadFactor;
}
export function crewSpeedFactor(seamanshipRating = 50) {
    // Small multiplier only: competence extracts more of the hull/rig's potential without rewriting class speed.
    return Math.max(0.90, Math.min(1.08, 0.90 + Math.max(0, Math.min(100, seamanshipRating)) * 0.0018));
}
export function effectiveSpeedKnots(ship, cellOrPoint, seamanshipRating = 50) {
    const cell = "terrain" in cellOrPoint ? cellOrPoint : getWorldCell({ x: Math.round(cellOrPoint.x), y: Math.round(cellOrPoint.y) });
    const speed = baseCruiseSpeedKnots(ship) * terrainSpeedFactor(cell) * shipConditionSpeedFactor(ship) * crewSpeedFactor(seamanshipRating);
    return Math.max(0.5, speed);
}
export function estimateRouteTravelHours(path, ship, seamanshipRating = 50) {
    let hours = 0;
    for (let i = 1; i < path.length; i += 1) {
        const a = path[i - 1];
        const b = path[i];
        const distanceNm = straightLineDistanceNm(a, b);
        const cell = getWorldCell({ x: Math.round(b.x), y: Math.round(b.y) });
        hours += distanceNm / effectiveSpeedKnots(ship, cell, seamanshipRating);
    }
    return hours;
}
export function plannedAverageSpeedKnots(path, ship, seamanshipRating = 50) {
    const distance = routeDistanceNm(path);
    const hours = estimateRouteTravelHours(path, ship, seamanshipRating);
    return hours > 0 ? distance / hours : baseCruiseSpeedKnots(ship);
}
/**
 * Integrate physical progress through route segments for an integer/fractional hour budget.
 * Terrain changes speed/risk; it never changes geometric route distance.
 */
export function advanceRouteDistanceByHours(path, currentDistanceNm, hours, ship, seamanshipRating = 50) {
    const totalNm = routeDistanceNm(path);
    let alongNm = Math.max(0, Math.min(totalNm, currentDistanceNm));
    let hoursLeft = Math.max(0, hours);
    let hoursUsed = 0;
    if (hoursLeft <= 0 || alongNm >= totalNm || path.length < 2)
        return { distanceTravelledNm: alongNm, hoursUsed };
    let cumulativeNm = 0;
    for (let i = 1; i < path.length && hoursLeft > 0; i += 1) {
        const a = path[i - 1];
        const b = path[i];
        const segmentNm = straightLineDistanceNm(a, b);
        const segmentStart = cumulativeNm;
        const segmentEnd = cumulativeNm + segmentNm;
        cumulativeNm = segmentEnd;
        if (alongNm >= segmentEnd - 1e-9)
            continue;
        const remainingSegmentNm = segmentEnd - Math.max(alongNm, segmentStart);
        const speed = effectiveSpeedKnots(ship, getWorldCell({ x: Math.round(b.x), y: Math.round(b.y) }), seamanshipRating);
        const segmentHours = remainingSegmentNm / speed;
        if (segmentHours <= hoursLeft + 1e-9) {
            alongNm += remainingSegmentNm;
            hoursLeft -= segmentHours;
            hoursUsed += segmentHours;
        }
        else {
            alongNm += speed * hoursLeft;
            hoursUsed += hoursLeft;
            hoursLeft = 0;
        }
    }
    return { distanceTravelledNm: Math.min(totalNm, alongNm), hoursUsed };
}
export function estimateRemainingRouteHours(path, currentDistanceNm, ship, seamanshipRating = 50) {
    const totalNm = routeDistanceNm(path);
    if (currentDistanceNm >= totalNm)
        return 0;
    // Use the same segment integration with a deliberately large time budget, then return time used to finish.
    return advanceRouteDistanceByHours(path, currentDistanceNm, 100000, ship, seamanshipRating).hoursUsed;
}
//# sourceMappingURL=shipSpeed.js.map