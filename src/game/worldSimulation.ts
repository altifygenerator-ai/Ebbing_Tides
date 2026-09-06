import { clockFromAbsoluteHour } from "./clock.js";
import { refreshMarketPrices } from "./economy.js";
import { expireContracts, generateContracts } from "./contracts.js";
import type { GameState } from "./types.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { deterministicUnit } from "./rng.js";
import { routePoint } from "../data/seed/routes.js";

function updateNpcShipRoutes(state: GameState, hours: number): void {
  for (const ship of Object.values(state.ships)) {
    if (ship.disposition === "player" || !ship.route) continue;
    const routeHours = ship.id === "ship.stormcrow" ? 24 : 20;
    ship.route.progress += (hours / routeHours) * ship.route.direction;
    if (ship.route.progress >= 1) {
      ship.route.progress = 1;
      ship.route.direction = -1;
      ship.dockedAtPortId = ship.route.toPortId;
    } else if (ship.route.progress <= 0) {
      ship.route.progress = 0;
      ship.route.direction = 1;
      ship.dockedAtPortId = ship.route.fromPortId;
    } else {
      delete ship.dockedAtPortId;
    }
    ship.position = routePoint(ship.route.fromPortId, ship.route.toPortId, ship.route.progress);
  }
}

function restockMarkets(state: GameState, beforeHour: number): void {
  const beforeDay = Math.floor(beforeHour / 24);
  const afterDay = Math.floor(state.absoluteHour / 24);
  if (afterDay <= beforeDay) return;
  for (let day = beforeDay + 1; day <= afterDay; day += 1) {
    for (const market of Object.values(state.markets)) {
      for (const row of Object.values(market.goods)) {
        const delta = row.targetStock - row.stock;
        const baseMove = Math.sign(delta) * Math.min(Math.abs(delta), Math.max(1, Math.round(Math.abs(delta) * 0.08)));
        const jitter = deterministicUnit(state.worldSeed, `restock:${market.portId}:${row.commodityId}:${day}`) > 0.82 ? 1 : 0;
        row.stock = Math.max(0, row.stock + baseMove + jitter);
      }
    }
  }
}

export function advanceWorld(state: GameState, hours: number): void {
  const before = state.absoluteHour;
  state.absoluteHour += Math.max(0, Math.floor(hours));
  state.clock = clockFromAbsoluteHour(state.absoluteHour);
  updateNpcShipRoutes(state, hours);
  restockMarkets(state, before);
  refreshMarketPrices(state);
  expireContracts(state);
  if (state.player.currentPortId) generateContracts(state);
  state.updatedAtIso = new Date().toISOString();
}

export function recordArrival(state: GameState, portId: string): void {
  const port = PORT_BY_ID[portId];
  state.worldEvents.push({
    id: `event.arrival.${portId}.${state.absoluteHour}`,
    type: "arrival",
    atHour: state.absoluteHour,
    locationId: portId,
    participants: [state.player.character.id, state.player.shipId],
    summary: `Arrived at ${port?.name ?? portId}.`,
    canonicalData: { portId },
    importance: 1
  });
}
