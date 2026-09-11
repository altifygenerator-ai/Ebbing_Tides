import type { GameState } from "./types.js";
import { advanceWorld } from "./worldSimulation.js";
import { resetSupplyHardshipIfProvisioned } from "./crewHardship.js";
import { ensureCrewCommunity } from "./crewState.js";
import { consumeSupplyQuote, quoteShipSupplies } from "./economySimulation.js";
import { consumeServiceResources, quoteGenericRefitService, quoteShipRepair, type GenericRefitServiceQuote } from "./portServices.js";

export const SHIP_REFITS = {
  "refit.storm_rigging": { name: "Storm Rigging Package", cost: 150, hours: 12, description: "+8 max sails, +1 seaworthiness.", requiredCapability: 2, resourceUnits: 2, specialistTag: "storm rigging" },
  "refit.reinforced_pumps": { name: "Reinforced Bilge Pumps", cost: 190, hours: 14, description: "+6 max hull, improved damage-control foundation.", requiredCapability: 3, resourceUnits: 3, specialistTag: "major repairs" }
} as const;

export function quoteRefitAtPort(state: GameState, refitId: keyof typeof SHIP_REFITS): GenericRefitServiceQuote {
  const portId = state.player.currentPortId;
  const refit = SHIP_REFITS[refitId];
  if (!portId || !refit) {
    return { ok:false, portId:portId ?? "", capability:0, capabilityLabel:"No local service", cost:0, hours:0, resources:{ok:false,requiredUnits:0,availableUnits:0,stockRatio:0,lines:[],procurementCost:0}, specialistMatched:false, message:"Refits require a shipyard." };
  }
  return quoteGenericRefitService(state, portId, refit.cost, refit.hours, refit.requiredCapability, refit.resourceUnits, refit.specialistTag);
}

export function repairShip(state: GameState): { ok: boolean; message: string } {
  const portId = state.player.currentPortId;
  if (!portId) return { ok: false, message: "You need a port and a yard crew for repairs." };
  const ship = state.ships[state.player.shipId];
  if (!ship) return { ok: false, message: "Player ship not found." };
  const quote = quoteShipRepair(state, portId);
  if (!quote.ok) return { ok:false, message:quote.message };
  if (state.player.character.crowns < quote.cost) return { ok: false, message: `This yard repair costs ${quote.cost} crowns.` };

  state.player.character.crowns -= quote.cost;
  consumeServiceResources(state, portId, quote.resources);
  ship.systems.hull = quote.targetHull;
  ship.systems.sails = quote.targetSails;
  ship.systems.rigging = quote.targetRigging;
  ship.systems.fire = quote.targetFire;
  ship.systems.flooding = quote.targetFlooding;
  advanceWorld(state, quote.hours);
  state.worldEvents.push({
    id: `event.shipyard.repair.${state.absoluteHour}.${state.worldEvents.length}`,
    type: "ship_repair",
    atHour: state.absoluteHour,
    locationId: portId,
    participants: [ship.id],
    summary: quote.fullRestoration
      ? `${ship.name} completed a full yard repair for ${quote.cost} crowns.`
      : `${ship.name} completed the repairs this yard could support for ${quote.cost} crowns.`,
    canonicalData: {
      cost: quote.cost, hours: quote.hours, capability: quote.capability, fullRestoration: quote.fullRestoration,
      sourceRows: quote.resources.lines.map((row)=>`${row.commodityId}:${row.quantity}`).join(",")
    },
    importance: 1
  });
  return { ok: true, message: quote.fullRestoration
    ? `Yard crews restore the ship fully for ${quote.cost} crowns. ${quote.hours} hours pass.`
    : `The yard repairs what its facilities can handle for ${quote.cost} crowns. ${quote.hours} hours pass; major-yard work is still needed.` };
}

export function buySupplies(state: GameState, amount = 6): { ok: boolean; message: string } {
  const portId = state.player.currentPortId;
  if (!portId) return { ok: false, message: "Supplies can only be purchased in port." };
  const ship = state.ships[state.player.shipId];
  if (!ship) return { ok: false, message: "Player ship not found." };
  const quote = quoteShipSupplies(state,portId,amount);
  if (!quote.ok) return { ok:false, message:quote.message ?? "The harbor cannot fill that stores order." };
  if (state.player.character.crowns < quote.cost) return { ok: false, message: `You need ${quote.cost} crowns.` };
  state.player.character.crowns -= quote.cost;
  consumeSupplyQuote(state,portId,quote);
  ship.supplies += quote.amount;
  ensureCrewCommunity(ship).foodSatisfaction = Math.min(100,ensureCrewCommunity(ship).foodSatisfaction+5);
  resetSupplyHardshipIfProvisioned(state);
  state.worldEvents.push({
    id: `event.supplies.${state.absoluteHour}.${state.worldEvents.length}`,
    type: "ship_supplies_purchased",
    atHour: state.absoluteHour,
    locationId: portId,
    participants: [ship.id],
    summary: `${quote.amount} ship-supply units purchased for ${quote.cost} crowns from current harbor provisions.`,
    canonicalData: { amount:quote.amount, cost:quote.cost, marketUnits:quote.marketUnits, sourceRows:quote.sourceRows.map(row=>`${row.commodityId}:${row.quantity}`).join(",") },
    importance: 0
  });
  return { ok: true, message: `${quote.amount} supply units loaded for ${quote.cost} crowns.` };
}

export function installRefit(state: GameState, refitId: keyof typeof SHIP_REFITS): { ok: boolean; message: string } {
  const portId = state.player.currentPortId;
  if (!portId) return { ok: false, message: "Refits require a shipyard." };
  const ship = state.ships[state.player.shipId];
  if (!ship) return { ok: false, message: "Player ship not found." };
  const refit = SHIP_REFITS[refitId];
  if (!refit) return { ok: false, message: "Unknown refit." };
  if (ship.refits.includes(refitId)) return { ok: false, message: `${refit.name} is already installed.` };
  const quote = quoteRefitAtPort(state, refitId);
  if (!quote.ok) return { ok:false, message:quote.message };
  if (state.player.character.crowns < quote.cost) return { ok: false, message: `${refit.name} costs ${quote.cost} crowns at this yard.` };

  state.player.character.crowns -= quote.cost;
  consumeServiceResources(state, portId, quote.resources);
  ship.refits.push(refitId);
  if (refitId === "refit.storm_rigging") {
    ship.systems.sailsMax += 8;
    ship.systems.sails += 8;
    ship.seaworthiness += 1;
  } else {
    ship.systems.hullMax += 6;
    ship.systems.hull += 6;
  }
  advanceWorld(state, quote.hours);
  state.worldEvents.push({
    id: `event.refit.${refitId}.${state.absoluteHour}`,
    type: "ship_refit_installed",
    atHour: state.absoluteHour,
    locationId: portId,
    participants: [ship.id],
    summary: `${refit.name} installed aboard ${ship.name}.`,
    canonicalData: {
      refitId, cost: quote.cost, hours: quote.hours, capability: quote.capability, specialistMatched: quote.specialistMatched,
      sourceRows: quote.resources.lines.map((row)=>`${row.commodityId}:${row.quantity}`).join(",")
    },
    importance: 2
  });
  return { ok: true, message: `${refit.name} installed for ${quote.cost} crowns. ${quote.hours} hours pass.` };
}
