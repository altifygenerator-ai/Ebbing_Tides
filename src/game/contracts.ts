import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import type { Contract, GameState } from "./types.js";
import { calculatePrice } from "./economy.js";
import { awardLifeExperience } from "./progression.js";
import { politicalPowerForRegion } from "../data/seed/politicalPowers.js";
import { adjustFactionStanding, adjustPortStanding } from "./reputationLaw.js";
import { activeWorldCauses, worldCauseAppliesToPort, worldCauseContractDemandForPort } from "./worldCauses.js";
import { evaluateCommodityTradeLaw } from "./tradeLaw.js";

export function generateContracts(state: GameState): void {
  const current = state.player.currentPortId;
  if (!current) return;
  const currentMarket = state.markets[current];
  if (!currentMarket) return;

  const existingKey = new Set(state.contracts.filter((c) => c.status === "available" || c.status === "accepted")
    .map((c) => `${c.sourcePortId}:${c.destinationPortId}:${c.commodityId}`));

  for (const destination of Object.values(PORT_BY_ID)) {
    if (destination.id === current) continue;
    const destinationMarket = state.markets[destination.id];
    if (!destinationMarket) continue;

    for (const [commodityId, row] of Object.entries(destinationMarket.goods)) {
      const sourceRow = currentMarket.goods[commodityId];
      const good = COMMODITY_BY_ID[commodityId];
      if (!sourceRow || !good) continue;
      const sourceLaw=evaluateCommodityTradeLaw(state,current,commodityId);
      const destinationLaw=evaluateCommodityTradeLaw(state,destination.id,commodityId);
      if(["prohibited","embargoed"].includes(sourceLaw.status)||["prohibited","embargoed"].includes(destinationLaw.status))continue;
      const needRatio = row.stock / Math.max(1, row.targetStock);
      const sourceRatio = sourceRow.stock / Math.max(1, sourceRow.targetStock);
      const procurement = worldCauseContractDemandForPort(state,destination.id);
      if (procurement.multiplier <= 0.01) continue;
      const needThreshold = Math.max(0.45, Math.min(0.82, 0.62 + (procurement.multiplier-1) * 0.12));
      if (needRatio > needThreshold || sourceRatio < 0.72) continue;
      const key = `${current}:${destination.id}:${commodityId}`;
      if (existingKey.has(key)) continue;
      const localPrice = calculatePrice(state, currentMarket, commodityId);
      const destPrice = calculatePrice(state, destinationMarket, commodityId);
      if (destPrice <= localPrice) continue;
      const baseQuantity = Math.max(2, Math.floor((row.targetStock - row.stock) / 8));
      const quantity = Math.max(2, Math.min(8, Math.ceil(baseQuantity * Math.max(0.25,procurement.multiplier))));
      const reward = Math.round((destPrice - localPrice) * quantity * 1.4 + 55 * Math.max(0.25,procurement.multiplier));
      const cause = activeWorldCauses(state).find((candidate)=>procurement.causeIds.includes(candidate.id) && worldCauseAppliesToPort(candidate,destination.id));
      const causeReason = cause ? ` ${cause.title} is increasing institutional demand.` : "";
      const contract: Contract = {
        id: `contract.delivery.${current}.${destination.id}.${commodityId}.${state.absoluteHour}`,
        type: "delivery",
        issuerName: `${PORT_BY_ID[current]?.name ?? "Local"} merchant factor`,
        sourcePortId: current,
        destinationPortId: destination.id,
        commodityId,
        quantity,
        reward,
        deadlineHour: state.absoluteHour + 96,
        reason: `${destination.name} is drawing down local ${good.name.toLowerCase()} stocks faster than normal traffic is replacing them.${causeReason}`,
        status: "available",
        createdAtHour: state.absoluteHour
      };
      state.contracts.push(contract);
      existingKey.add(key);
      if (state.contracts.filter((c) => c.status === "available").length >= 5) return;
    }
  }
}

export function acceptContract(state: GameState, contractId: string): { ok: boolean; message: string } {
  const contract = state.contracts.find((item) => item.id === contractId);
  if (!contract || contract.status !== "available") return { ok: false, message: "That opportunity is no longer available." };
  if (state.player.currentPortId !== contract.sourcePortId) return { ok: false, message: "You must be at the issuing port to accept this contract." };
  contract.status = "accepted";
  state.player.acceptedContractIds.push(contract.id);
  state.worldEvents.push({
    id: `event.contract.accept.${state.absoluteHour}.${state.worldEvents.length}`,
    type: "contract_accepted",
    atHour: state.absoluteHour,
    locationId: contract.sourcePortId,
    participants: [state.player.character.id],
    summary: `Accepted delivery contract to ${PORT_BY_ID[contract.destinationPortId]?.name ?? contract.destinationPortId}.`,
    canonicalData: { contractId },
    importance: 2
  });
  return { ok: true, message: "Contract accepted. It is now a real obligation in your journal." };
}

export function fulfillContract(state: GameState, contractId: string): { ok: boolean; message: string } {
  const contract = state.contracts.find((item) => item.id === contractId);
  if (!contract || contract.status !== "accepted") return { ok: false, message: "Contract is not active." };
  if (state.player.currentPortId !== contract.destinationPortId) return { ok: false, message: "You are not at the delivery port." };
  if (state.absoluteHour > contract.deadlineHour) return { ok: false, message: "The deadline has passed." };
  const destinationLaw=evaluateCommodityTradeLaw(state,contract.destinationPortId,contract.commodityId);
  if(destinationLaw.status!=="open")return {ok:false,message:`The delivery cannot be cleared under current trade law: ${destinationLaw.reason}`};
  const ship = state.ships[state.player.shipId];
  const stack = ship?.cargo.find((item) => item.commodityId === contract.commodityId);
  if (!ship || !stack || stack.quantity < contract.quantity) return { ok: false, message: `You need ${contract.quantity} units of ${COMMODITY_BY_ID[contract.commodityId]?.name ?? "cargo"}.` };
  stack.quantity -= contract.quantity;
  ship.cargo = ship.cargo.filter((item) => item.quantity > 0);
  state.player.character.crowns += contract.reward;
  contract.status = "completed";
  state.player.acceptedContractIds = state.player.acceptedContractIds.filter((id) => id !== contract.id);
  const market = state.markets[contract.destinationPortId];
  const row = market?.goods[contract.commodityId];
  if (row) row.stock += contract.quantity;
  awardLifeExperience(state,state.player.character.id,`contract:${contract.id}`,`Completed delivery obligation to ${PORT_BY_ID[contract.destinationPortId]?.name ?? contract.destinationPortId}`,"major");
  adjustPortStanding(state,contract.destinationPortId,6);
  const destinationPort=PORT_BY_ID[contract.destinationPortId];
  if(destinationPort)adjustFactionStanding(state,politicalPowerForRegion(destinationPort.region).factionId,2);
  state.worldEvents.push({
    id: `event.contract.complete.${state.absoluteHour}.${state.worldEvents.length}`,
    type: "contract_completed",
    atHour: state.absoluteHour,
    locationId: contract.destinationPortId,
    participants: [state.player.character.id],
    summary: `Delivered ${contract.quantity} units of ${COMMODITY_BY_ID[contract.commodityId]?.name ?? contract.commodityId}; local stock improved and ${contract.reward} crowns were paid.`,
    canonicalData: { contractId, reward: contract.reward, quantity: contract.quantity, commodityId: contract.commodityId, portStandingDelta:6, factionStandingDelta:2 },
    importance: 3
  });
  return { ok: true, message: `Delivery completed. You received ${contract.reward} crowns.` };
}

export function expireContracts(state: GameState): void {
  for (const contract of state.contracts) {
    if ((contract.status === "available" || contract.status === "accepted") && state.absoluteHour > contract.deadlineHour) {
      const wasAccepted=contract.status === "accepted";
      contract.status = wasAccepted ? "expired" : "resolved_without_you";
      if(wasAccepted){
        state.player.acceptedContractIds = state.player.acceptedContractIds.filter(id=>id!==contract.id);
        adjustPortStanding(state,contract.destinationPortId,-4);
        const destinationPort=PORT_BY_ID[contract.destinationPortId];
        if(destinationPort)adjustFactionStanding(state,politicalPowerForRegion(destinationPort.region).factionId,-1);
        state.worldEvents.push({
          id: `event.contract.expire.${contract.id}`,
          type: "contract_resolved",
          atHour: state.absoluteHour,
          locationId: contract.destinationPortId,
          participants: [state.player.character.id],
          summary: "An accepted delivery obligation expired.",
          canonicalData: { contractId: contract.id, status: contract.status, portStandingDelta:-4, factionStandingDelta:-1 },
          importance: 2
        });
      }
      // Unaccepted routine delivery notices are operational opportunities, not permanent historical
      // events. The underlying shortage/market state remains canonical and can generate fresh work.
    }
  }
  // Keep a short recent tail so the journal can show that work moved on, then retire routine
  // unaccepted contract objects. Accepted/completed/expired player obligations remain persistent.
  const routineHistoryCutoff = state.absoluteHour - 24*7;
  state.contracts = state.contracts.filter(contract => contract.status !== "resolved_without_you" || contract.deadlineHour >= routineHistoryCutoff);
}
