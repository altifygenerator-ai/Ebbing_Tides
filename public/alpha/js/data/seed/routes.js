import { PORT_BY_ID } from "./ports.js";
export const ROUTES = [
    { id: "route.veyrholm.ironhaven", fromPortId: "port.veyrholm", toPortId: "port.ironhaven", baseHours: 20, danger: 0.18 },
    { id: "route.veyrholm.stormvik", fromPortId: "port.veyrholm", toPortId: "port.stormvik", baseHours: 24, danger: 0.24 },
    { id: "route.veyrholm.thorenfjord", fromPortId: "port.veyrholm", toPortId: "port.thorenfjord", baseHours: 28, danger: 0.22 },
    { id: "route.stormvik.thorenfjord", fromPortId: "port.stormvik", toPortId: "port.thorenfjord", baseHours: 30, danger: 0.3 },
    { id: "route.ironhaven.thorenfjord", fromPortId: "port.ironhaven", toPortId: "port.thorenfjord", baseHours: 32, danger: 0.2 }
];
export function findRoute(a, b) {
    return ROUTES.find((route) => (route.fromPortId === a && route.toPortId === b) || (route.fromPortId === b && route.toPortId === a));
}
export function routePoint(fromId, toId, progress) {
    const from = PORT_BY_ID[fromId];
    const to = PORT_BY_ID[toId];
    if (!from || !to)
        throw new Error(`Unknown route endpoint ${fromId} -> ${toId}`);
    return {
        x: from.point.x + (to.point.x - from.point.x) * progress,
        y: from.point.y + (to.point.y - from.point.y) * progress
    };
}
//# sourceMappingURL=routes.js.map