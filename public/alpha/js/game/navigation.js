import { PORT_BY_ID } from "../data/seed/ports.js";
import { POI_BY_ID } from "../data/seed/pois.js";
import { cellKey, getWorldCell, GLOBAL_ATLAS, isNavigableCell, parseCellKey } from "../data/seed/worldMap.js";
import { effectiveSpecialist } from "./delegation.js";
import { effectivePlayerVoyageSeamanship } from "./crewState.js";
import { pointAlongPathDistance, routeDistanceNm as measureRouteDistanceNm, straightLineDistanceNm as measureStraightLineDistanceNm } from "./physicalDistance.js";
import { estimateRouteTravelHours, plannedAverageSpeedKnots } from "./shipSpeed.js";
const DIRECTIONS = [
    { x: 1, y: 0, factor: 1 }, { x: -1, y: 0, factor: 1 }, { x: 0, y: 1, factor: 1 }, { x: 0, y: -1, factor: 1 },
    { x: 1, y: 1, factor: Math.SQRT2 }, { x: 1, y: -1, factor: Math.SQRT2 }, { x: -1, y: 1, factor: Math.SQRT2 }, { x: -1, y: -1, factor: Math.SQRT2 }
];
function heuristic(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function canTraverseDiagonal(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) !== 1 || Math.abs(dy) !== 1)
        return true;
    // Prevent corner-cutting through two touching land cells.
    return isNavigableCell({ x: from.x + dx, y: from.y }) && isNavigableCell({ x: from.x, y: from.y + dy });
}
export function findSeaPath(start, goal) {
    const startCell = getWorldCell(start);
    const goalCell = getWorldCell(goal);
    if (!startCell.navigable || !goalCell.navigable)
        return [];
    const startKey = cellKey(start);
    const goalKey = cellKey(goal);
    if (startKey === goalKey)
        return [{ ...start }];
    const open = new Map([[startKey, heuristic(start, goal)]]);
    const cameFrom = new Map();
    const gScore = new Map([[startKey, 0]]);
    let guard = GLOBAL_ATLAS.width * GLOBAL_ATLAS.height * 3;
    while (open.size && guard-- > 0) {
        let currentKey = "";
        let currentF = Infinity;
        for (const [key, f] of open)
            if (f < currentF) {
                currentF = f;
                currentKey = key;
            }
        if (!currentKey)
            break;
        if (currentKey === goalKey) {
            const path = [parseCellKey(currentKey)];
            while (cameFrom.has(currentKey)) {
                currentKey = cameFrom.get(currentKey);
                path.push(parseCellKey(currentKey));
            }
            return path.reverse();
        }
        open.delete(currentKey);
        const current = parseCellKey(currentKey);
        const currentG = gScore.get(currentKey) ?? Infinity;
        for (const direction of DIRECTIONS) {
            const next = { x: current.x + direction.x, y: current.y + direction.y };
            const nextCell = getWorldCell(next);
            if (!nextCell.navigable || !canTraverseDiagonal(current, next))
                continue;
            const nextKey = cellKey(next);
            // Routing cost chooses a safer/faster-looking path. It is NOT physical distance.
            const tentative = currentG + nextCell.movementCost * direction.factor;
            if (tentative >= (gScore.get(nextKey) ?? Infinity))
                continue;
            cameFrom.set(nextKey, currentKey);
            gScore.set(nextKey, tentative);
            open.set(nextKey, tentative + heuristic(next, goal));
        }
    }
    return [];
}
export function navigationTargetForPort(portId) {
    const port = PORT_BY_ID[portId];
    if (!port)
        return undefined;
    return { type: "port", id: port.id, name: port.name, point: { ...port.approachPoint }, markerPoint: { ...port.point } };
}
export function navigationTargetForPoi(poiId) {
    const poi = POI_BY_ID[poiId];
    if (!poi)
        return undefined;
    return { type: "poi", id: poi.id, name: poi.name, point: { ...poi.approachPoint }, markerPoint: { ...poi.point } };
}
export function navigationTargetForSea(point) {
    const cell = getWorldCell(point);
    if (!cell.navigable)
        return undefined;
    return { type: "sea", id: `sea.${point.x}.${point.y}`, name: "Open Water", point: { ...point } };
}
export function plotCourse(state, target) {
    const ship = state.ships[state.player.shipId];
    if (!ship)
        return { path: [], totalCost: 0, routeDistanceNm: 0, straightLineDistanceNm: 0, plannedAverageSpeedKnots: 0, estimatedHours: 0, destinationCell: getWorldCell(target.point) };
    const start = { x: Math.round(ship.position.x), y: Math.round(ship.position.y) };
    const path = findSeaPath(start, target.point);
    let totalCost = 0;
    for (let i = 1; i < path.length; i += 1)
        totalCost += getWorldCell(path[i]).movementCost * (path[i].x !== path[i - 1].x && path[i].y !== path[i - 1].y ? Math.SQRT2 : 1);
    const routeDistanceNm = measureRouteDistanceNm(path);
    const straightLineDistanceNm = measureStraightLineDistanceNm(ship.position, target.point);
    const seamanshipSpecialist = effectiveSpecialist(state, "seamanship").rating;
    const seamanship = effectivePlayerVoyageSeamanship(state, seamanshipSpecialist);
    const exactHours = estimateRouteTravelHours(path, ship, seamanship);
    const estimatedHours = path.length <= 1 ? 0 : Math.max(1, Math.ceil(exactHours));
    return {
        path,
        totalCost,
        routeDistanceNm,
        straightLineDistanceNm,
        plannedAverageSpeedKnots: plannedAverageSpeedKnots(path, ship, seamanship),
        estimatedHours,
        destinationCell: getWorldCell(target.point)
    };
}
/** Compatibility helper: progress is interpreted as physical fraction of route distance. */
export function pointAlongPath(path, progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    return pointAlongPathDistance(path, measureRouteDistanceNm(path) * clamped);
}
//# sourceMappingURL=navigation.js.map