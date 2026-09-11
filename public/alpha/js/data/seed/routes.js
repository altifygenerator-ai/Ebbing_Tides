import { PORT_BY_ID } from "./ports.js";
import { findSeaPath, pointAlongPath } from "../../game/navigation.js";
// Named routes remain useful for economy/rumor/danger metadata, but movement no longer assumes
// a straight line. Every ship position is derived from traversable atlas cells.
export const ROUTES = [
    { id: "route.veyrholm.ironhaven", fromPortId: "port.veyrholm", toPortId: "port.ironhaven", baseHours: 20, danger: 0.18 },
    { id: "route.veyrholm.stormvik", fromPortId: "port.veyrholm", toPortId: "port.stormvik", baseHours: 24, danger: 0.24 },
    { id: "route.veyrholm.thorenfjord", fromPortId: "port.veyrholm", toPortId: "port.thorenfjord", baseHours: 28, danger: 0.22 },
    { id: "route.stormvik.thorenfjord", fromPortId: "port.stormvik", toPortId: "port.thorenfjord", baseHours: 30, danger: 0.3 },
    { id: "route.ironhaven.thorenfjord", fromPortId: "port.ironhaven", toPortId: "port.thorenfjord", baseHours: 32, danger: 0.2 },
    { id: "route.stormvik.ironhaven", fromPortId: "port.stormvik", toPortId: "port.ironhaven", baseHours: 38, danger: 0.27 }
];
export function findRoute(a, b) {
    return ROUTES.find((route) => (route.fromPortId === a && route.toPortId === b) || (route.fromPortId === b && route.toPortId === a));
}
export function routePoint(fromId, toId, progress) {
    const from = PORT_BY_ID[fromId];
    const to = PORT_BY_ID[toId];
    if (!from || !to)
        throw new Error(`Unknown route endpoint ${fromId} -> ${toId}`);
    const path = findSeaPath(from.approachPoint, to.approachPoint);
    if (!path.length)
        return { ...from.approachPoint };
    return pointAlongPath(path, progress);
}
//# sourceMappingURL=routes.js.map