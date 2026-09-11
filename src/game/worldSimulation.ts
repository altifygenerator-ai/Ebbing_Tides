import { clockFromAbsoluteHour } from "./clock.js";
import { refreshMarketPrices } from "./economy.js";
import { expireContracts, generateContracts } from "./contracts.js";
import type { GameState } from "./types.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { advanceNpcPlan, mutinyPressure, updateNpcSimulationLod } from "./npcBrain.js";
import { isShipOperational } from "./vesselLifecycle.js";
import { compactSimulationEvents } from "./simulationQueue.js";
import { advanceSettlementEconomy } from "./economySimulation.js";
import { advanceArcaneStrainRecovery } from "./attunement.js";
import { processDueLegalReports } from "./reputationLaw.js";
import { processWorldCauseLifecycle } from "./worldCauses.js";

function updateNpcLives(state: GameState, hours: number): void {
  for (const npc of Object.values(state.npcs)) {
    const npcShip = npc.shipId ? state.ships[npc.shipId] : undefined;
    if (npcShip && !isShipOperational(npcShip)) continue;
    updateNpcSimulationLod(state, npc);
    advanceNpcPlan(state, npc, hours);
    const pressure = mutinyPressure(npc);
    if (pressure >= 70 && npc.shipId) {
      const bucket = Math.floor(state.absoluteHour / 24);
      const id = `event.mutiny_pressure.${npc.id}.${bucket}`;
      if (!state.worldEvents.some(event => event.id === id)) state.worldEvents.push({ id, type:"crew_morale_crisis", atHour:state.absoluteHour, participants:[npc.id,npc.shipId], summary:`${npc.name}'s crew has entered a serious discipline crisis.`, canonicalData:{npcId:npc.id,shipId:npc.shipId,mutinyPressure:pressure}, importance:2 });
    }
  }
}


function processScheduledSimulationEvents(state: GameState): void {
  for (const event of state.simulationEvents) {
    if (event.status !== "scheduled" || event.scheduledAtHour > state.absoluteHour) continue;
    if (event.eventType === "npc_plan_checkpoint") {
      const npc = state.npcs[event.entityId];
      const planId = String(event.payload.planId ?? "");
      if (!npc || !npc.brain.currentPlan || npc.brain.currentPlan.id !== planId || npc.brain.currentPlan.status !== "active") {
        event.status = "processed";
        continue;
      }
      // Plan execution itself is advanced by the simulation; this event is the explicit wakeup/checkpoint record.
      npc.brain.nextDecisionAtHour = Math.min(npc.brain.nextDecisionAtHour ?? state.absoluteHour, state.absoluteHour);
      event.status = "processed";
    } else {
      event.status = "processed";
    }
  }
  compactSimulationEvents(state);
}

export function advanceWorld(state: GameState, hours: number): void {
  const elapsedHours = Math.max(0, Math.floor(hours));
  const before = state.absoluteHour;
  compactSimulationEvents(state);
  state.absoluteHour += elapsedHours;
  state.clock = clockFromAbsoluteHour(state.absoluteHour);
  // A0.2C: Arcane Strain recovers only through the authoritative world clock.
  // Apply to every persistent character so later NPC Arcane use inherits the same lifecycle.
  advanceArcaneStrainRecovery(state.player.character,before,state.absoluteHour);
  for (const npc of Object.values(state.npcs)) advanceArcaneStrainRecovery(npc,before,state.absoluteHour);
  // A0.3C: live world causes use the same authoritative clock. Resolve time-bounded causes
  // before consumers evaluate each elapsed day so old policy cannot leak past its end hour.
  processWorldCauseLifecycle(state,before,state.absoluteHour);
  // Local production/consumption advances first. Merchant/player transactions then mutate the
  // same inventory; there is no target-seeking stock regeneration.
  advanceSettlementEconomy(state, before);
  refreshMarketPrices(state);
  updateNpcLives(state, elapsedHours);
  // A0.2D: legal reports are physical/institutional information. Receipt is driven by the
  // same authoritative world clock, not by the crime event itself.
  processDueLegalReports(state);
  processScheduledSimulationEvents(state);
  // NPC port calls may have moved cargo through markets during this world step.
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
