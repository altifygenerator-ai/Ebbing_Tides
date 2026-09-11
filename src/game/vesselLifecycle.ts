import type { ActiveEncounter, GameState, ShipEntity, ShipLifecycleStatus } from "./types.js";
import { recordPrizeForCrew } from "./crewMechanics.js";
import { recordPiracyPrizeCrime, reportEncounterCrimes } from "./reputationLaw.js";
import { removePlanCheckpoints } from "./simulationQueue.js";
import { isAuthorizedPrizeTarget } from "./tradeLaw.js";

export type PlayerPrizeMethod = "naval" | "boarding";

export interface PlayerPrizeResolution {
  ok: boolean;
  prize: number;
  status: ShipLifecycleStatus;
  alreadyResolved: boolean;
}

/** Legacy v12 ships without lifecycle data are active by definition. */
export function shipLifecycleStatus(ship: ShipEntity): ShipLifecycleStatus {
  return ship.lifecycle?.status ?? "active";
}

export function isShipOperational(ship: ShipEntity | undefined): boolean {
  return Boolean(ship) && shipLifecycleStatus(ship as ShipEntity) === "active";
}

/**
 * One authoritative immediate-prize valuation for every player victory path.
 * The value is deliberately compact for the current alpha: visible cargo value plus a restrained
 * vessel/armament salvage component. Future prize courts, ship capture ownership, ransom and
 * detailed cargo transfer can expand this without creating a second resolution pipeline.
 */
export function immediatePrizeValue(ship: ShipEntity): number {
  const cargoValue = ship.cargo.reduce((sum, stack) => sum + stack.quantity * 10, 0);
  return Math.max(25, Math.round(cargoValue + 45 + ship.firepower * 4));
}

function terminalStatusFor(ship: ShipEntity, method: PlayerPrizeMethod): ShipLifecycleStatus {
  if (method === "boarding") return "captured";
  if (ship.systems.hull <= 0 || ship.systems.crew <= 0) return "disabled";
  return "captured"; // morale/surrender victory with an otherwise viable hull
}

function retireNpcShipOperations(state: GameState, ship: ShipEntity): void {
  delete ship.route;
  delete ship.dockedAtPortId;
  const owner = state.npcs[ship.ownerCharacterId];
  const plan = owner?.brain.currentPlan;
  if (plan && plan.status === "active") {
    plan.status = "invalid";
    plan.interruptReason = "VESSEL_TERMINAL_STATE";
    owner!.brain.nextDecisionAtHour = state.absoluteHour;
    removePlanCheckpoints(state, plan.id);
  }
}

/**
 * Resolve prize-taking exactly once, regardless of whether victory came from naval fire,
 * surrender, or the personal boarding transition. This function owns the persistent vessel
 * terminal state and all shared downstream prize consequences.
 */
export function resolvePlayerPrize(
  state: GameState,
  encounter: ActiveEncounter,
  enemy: ShipEntity,
  method: PlayerPrizeMethod
): PlayerPrizeResolution {
  const existing = enemy.lifecycle;
  if (shipLifecycleStatus(enemy) !== "active" || existing?.prizeClaimed) {
    encounter.phase = "resolved";
    return { ok:false, prize:0, status:shipLifecycleStatus(enemy), alreadyResolved:true };
  }

  const status = terminalStatusFor(enemy, method);
  const prize = immediatePrizeValue(enemy);
  enemy.lifecycle = {
    status,
    resolvedAtHour: state.absoluteHour,
    resolvedEncounterId: encounter.id,
    resolvedByShipId: state.player.shipId,
    resolutionMethod: method,
    prizeClaimed: true,
    prizeValue: prize
  };
  enemy.systems.morale = 0;
  encounter.phase = "resolved";

  state.player.character.crowns += prize;
  recordPrizeForCrew(state, prize);
  const prizeAuthority=isAuthorizedPrizeTarget(state,enemy);
  // R2 changes legal classification only. A0.1A remains the sole prize/vessel lifecycle owner.
  recordPiracyPrizeCrime(state, enemy, encounter);
  reportEncounterCrimes(state, encounter, enemy, method === "boarding"
    ? "survivors carried word of the boarding action and prize-taking"
    : "surviving crew carried word of the defeated vessel and prize-taking");
  retireNpcShipOperations(state, enemy);

  const eventId = `event.vessel_resolution.${enemy.id}.${encounter.id}`;
  if (!state.worldEvents.some(event => event.id === eventId)) {
    state.worldEvents.push({
      id: eventId,
      type: "vessel_disposition_resolved",
      atHour: state.absoluteHour,
      participants: [state.player.shipId, enemy.id, enemy.ownerCharacterId],
      summary: status === "captured"
        ? `${enemy.name} became a captured prize after the engagement.`
        : `${enemy.name} was disabled and removed from ordinary traffic after the engagement.`,
      canonicalData: { enemyShipId:enemy.id, encounterId:encounter.id, status, method, prize, authorizedPrize:prizeAuthority.authorized, ...(prizeAuthority.commission?{commissionId:prizeAuthority.commission.id}:{}) },
      importance: 4
    });
  }

  return { ok:true, prize, status, alreadyResolved:false };
}
