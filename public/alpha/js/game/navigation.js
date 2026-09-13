import { PORT_BY_ID } from "../data/seed/ports.js";
import { POI_BY_ID } from "../data/seed/pois.js";
import { cellKey, getWorldCell, GLOBAL_ATLAS, parseCellKey } from "../data/seed/worldMap.js";
import { effectiveSpecialist } from "./delegation.js";
import { effectivePlayerVoyageSeamanship } from "./crewState.js";
import { pointAlongPathDistance, routeDistanceNm as measureRouteDistanceNm, straightLineDistanceNm as measureStraightLineDistanceNm } from "./physicalDistance.js";
import { estimateRouteTravelHours, plannedAverageSpeedKnots } from "./shipSpeed.js";
const DIRECTIONS = [
    { x: 1, y: 0, factor: 1 }, { x: -1, y: 0, factor: 1 }, { x: 0, y: 1, factor: 1 }, { x: 0, y: -1, factor: 1 },
    { x: 1, y: 1, factor: Math.SQRT2 }, { x: 1, y: -1, factor: Math.SQRT2 }, { x: -1, y: 1, factor: Math.SQRT2 }, { x: -1, y: -1, factor: Math.SQRT2 }
];
const PATH_CACHE_LIMIT = 2048;
const pathCache = new Map();
const navigationCellCache = new Map();
class MinOpenHeap {
    nodes = [];
    get size() { return this.nodes.length; }
    push(node) {
        const nodes = this.nodes;
        nodes.push(node);
        let index = nodes.length - 1;
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if ((nodes[parent]?.f ?? Infinity) <= node.f)
                break;
            nodes[index] = nodes[parent];
            index = parent;
        }
        nodes[index] = node;
    }
    pop() {
        const nodes = this.nodes;
        const root = nodes[0];
        const tail = nodes.pop();
        if (!root || !tail || nodes.length === 0)
            return root;
        let index = 0;
        while (true) {
            const left = index * 2 + 1;
            if (left >= nodes.length)
                break;
            const right = left + 1;
            const child = right < nodes.length && nodes[right].f < nodes[left].f ? right : left;
            if (nodes[child].f >= tail.f)
                break;
            nodes[index] = nodes[child];
            index = child;
        }
        nodes[index] = tail;
        return root;
    }
}
function heuristic(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clonePath(path) { return path.map((point) => ({ ...point })); }
function routeCacheKey(start, goal) { return `${cellKey(start)}>${cellKey(goal)}`; }
function cachedWorldCell(point) {
    const key = cellKey(point);
    const cached = navigationCellCache.get(key);
    if (cached)
        return cached;
    const cell = getWorldCell(point);
    navigationCellCache.set(key, cell);
    return cell;
}
function cachedPath(key) {
    const cached = pathCache.get(key);
    if (cached === undefined)
        return undefined;
    pathCache.delete(key);
    pathCache.set(key, cached);
    return clonePath(cached);
}
function rememberPath(key, path) {
    if (pathCache.has(key))
        pathCache.delete(key);
    pathCache.set(key, clonePath(path));
    if (pathCache.size <= PATH_CACHE_LIMIT)
        return;
    const oldest = pathCache.keys().next().value;
    if (oldest !== undefined)
        pathCache.delete(oldest);
}
function canTraverseDiagonal(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) !== 1 || Math.abs(dy) !== 1)
        return true;
    return cachedWorldCell({ x: from.x + dx, y: from.y }).navigable && cachedWorldCell({ x: from.x, y: from.y + dy }).navigable;
}
export function findSeaPath(start, goal) {
    const startCell = cachedWorldCell(start);
    const goalCell = cachedWorldCell(goal);
    if (!startCell.navigable || !goalCell.navigable)
        return [];
    const startKey = cellKey(start);
    const goalKey = cellKey(goal);
    if (startKey === goalKey)
        return [{ ...start }];
    const cacheKey = routeCacheKey(start, goal);
    const existing = cachedPath(cacheKey);
    if (existing !== undefined)
        return existing;
    const open = new MinOpenHeap();
    open.push({ key: startKey, f: heuristic(start, goal) });
    const cameFrom = new Map();
    const gScore = new Map([[startKey, 0]]);
    const closed = new Set();
    let guard = GLOBAL_ATLAS.width * GLOBAL_ATLAS.height * 3;
    while (open.size && guard-- > 0) {
        const entry = open.pop();
        if (!entry || closed.has(entry.key))
            continue;
        const currentKey = entry.key;
        const current = parseCellKey(currentKey);
        const currentG = gScore.get(currentKey) ?? Infinity;
        if (entry.f > currentG + heuristic(current, goal) + 1e-9)
            continue;
        if (currentKey === goalKey) {
            const path = [current];
            let traceKey = currentKey;
            while (cameFrom.has(traceKey)) {
                traceKey = cameFrom.get(traceKey);
                path.push(parseCellKey(traceKey));
            }
            path.reverse();
            rememberPath(cacheKey, path);
            return clonePath(path);
        }
        closed.add(currentKey);
        for (const direction of DIRECTIONS) {
            const next = { x: current.x + direction.x, y: current.y + direction.y };
            const nextCell = cachedWorldCell(next);
            if (!nextCell.navigable || !canTraverseDiagonal(current, next))
                continue;
            const nextKey = cellKey(next);
            if (closed.has(nextKey))
                continue;
            const tentative = currentG + nextCell.movementCost * direction.factor;
            if (tentative >= (gScore.get(nextKey) ?? Infinity))
                continue;
            cameFrom.set(nextKey, currentKey);
            gScore.set(nextKey, tentative);
            open.push({ key: nextKey, f: tentative + heuristic(next, goal) });
        }
    }
    rememberPath(cacheKey, []);
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
export function pointAlongPath(path, progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    return pointAlongPathDistance(path, measureRouteDistanceNm(path) * clamped);
}
//# sourceMappingURL=navigation.js.map
