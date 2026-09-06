import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
export function getPlayerShip(state) {
    return state.ships[state.player.shipId];
}
export function currentPortName(state) {
    return state.player.currentPortId ? (PORT_BY_ID[state.player.currentPortId]?.name ?? state.player.currentPortId) : "At Sea";
}
export function cargoSummary(state) {
    const ship = getPlayerShip(state);
    if (!ship || ship.cargo.length === 0)
        return "Hold empty";
    return ship.cargo.map((stack) => `${stack.quantity} ${COMMODITY_BY_ID[stack.commodityId]?.name ?? stack.commodityId}`).join(", ");
}
//# sourceMappingURL=stateUtils.js.map