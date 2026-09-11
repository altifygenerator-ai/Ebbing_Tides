import type { GameState, ShipEntity } from "./types.js";

export function recordShipIntel(state: GameState, ship: ShipEntity, identified: boolean, source: string, confidence = 100): void {
  const existing = state.player.shipIntel[ship.id];
  const resolvedIdentity = identified || existing?.identified || false;
  state.player.shipIntel[ship.id] = {
    shipId: ship.id,
    identified: resolvedIdentity,
    confidence: Math.max(existing?.confidence ?? 0, confidence),
    lastKnownPosition: { ...ship.position },
    lastKnownAtHour: state.absoluteHour,
    source,
    ...(resolvedIdentity ? { name: ship.name, disposition: ship.disposition } : {})
  };
}

export function intelAgeHours(state: GameState, shipId: string): number | undefined {
  const intel = state.player.shipIntel[shipId];
  return intel ? Math.max(0, state.absoluteHour - intel.lastKnownAtHour) : undefined;
}

export function intelFreshnessLabel(state: GameState, shipId: string): string {
  const age = intelAgeHours(state, shipId);
  if (age === undefined) return "unknown";
  if (age <= 4) return "fresh";
  if (age <= 18) return "recent";
  if (age <= 48) return "aging";
  return "stale";
}
