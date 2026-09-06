import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import type { GameState } from "./types.js";

export function getPlayerShip(state: GameState) {
  return state.ships[state.player.shipId];
}

export function currentPortName(state: GameState): string {
  return state.player.currentPortId ? (PORT_BY_ID[state.player.currentPortId]?.name ?? state.player.currentPortId) : "At Sea";
}

export function cargoSummary(state: GameState): string {
  const ship = getPlayerShip(state);
  if (!ship || ship.cargo.length === 0) return "Hold empty";
  return ship.cargo.map((stack) => `${stack.quantity} ${COMMODITY_BY_ID[stack.commodityId]?.name ?? stack.commodityId}`).join(", ");
}
