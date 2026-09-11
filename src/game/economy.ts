import { COMMODITY_BY_ID, COMMODITIES } from "../data/seed/commodities.js";
import type { GameState, PortMarketState } from "./types.js";
import { deterministicUnit } from "./rng.js";
import { effectiveSpecialist } from "./delegation.js";
import { resolveCheck } from "./checks.js";
import { recordMeaningfulPractice } from "./progression.js";
import { evaluateCommodityTradeLaw } from "./tradeLaw.js";

export function marketStorageCapacity(row: { targetStock:number }): number {
  return Math.max(row.targetStock + 8, row.targetStock * 1.75);
}

export function calculatePrice(state: GameState, market: PortMarketState, commodityId: string): number {
  const good = COMMODITY_BY_ID[commodityId];
  const stock = market.goods[commodityId];
  if (!good || !stock) throw new Error(`Unknown commodity ${commodityId}`);
  const scarcity = Math.max(0.65, Math.min(1.7, stock.targetStock / Math.max(8, stock.stock)));
  const day = Math.floor(state.absoluteHour / 24);
  const drift = 0.94 + deterministicUnit(state.worldSeed, `market:${market.portId}:${commodityId}:day:${day}`) * 0.12;
  return Math.max(1, Math.round(good.basePrice * stock.localMultiplier * scarcity * drift));
}

export function refreshMarketPrices(state: GameState): void {
  for (const market of Object.values(state.markets)) {
    for (const commodity of COMMODITIES) {
      const row = market.goods[commodity.id];
      if (!row) continue;
      row.lastPrice = calculatePrice(state, market, commodity.id);
    }
    market.lastUpdatedHour = state.absoluteHour;
  }
}

export function cargoUsed(state: GameState): number {
  const ship = state.ships[state.player.shipId];
  if (!ship) return 0;
  return ship.cargo.reduce((used, stack) => used + (COMMODITY_BY_ID[stack.commodityId]?.cargoUnits ?? 1) * stack.quantity, 0);
}

export interface TradeTransactionOptions {
  channel?: "legal" | "smuggled";
  priceMultiplier?: number;
}

export function transact(state: GameState, commodityId: string, quantity: number, direction: "buy" | "sell", options:TradeTransactionOptions={}): { ok: boolean; message: string } {
  const portId = state.player.currentPortId;
  if (!portId) return { ok: false, message: "You are not in port." };
  const market = state.markets[portId];
  const ship = state.ships[state.player.shipId];
  const good = COMMODITY_BY_ID[commodityId];
  const row = market?.goods[commodityId];
  if (!market || !ship || !good || !row) return { ok: false, message: "Market data unavailable." };
  const channel=options.channel??"legal";
  if(channel==="legal"){
    const law=evaluateCommodityTradeLaw(state,portId,commodityId);
    if(law.status!=="open")return {ok:false,message:`${good.name}: ${law.label}. ${law.reason}`};
  }
  const amount = Math.max(1, Math.floor(quantity));
  const listedPrice = calculatePrice(state, market, commodityId);
  const specialist = effectiveSpecialist(state,"commerce");
  const actor = specialist.source === "officer" ? state.npcs[specialist.characterId] : state.player.character;
  const bargain = resolveCheck({worldSeed:state.worldSeed,checkId:`commerce:${portId}:${commodityId}:${direction}:${Math.floor(state.absoluteHour/24)}`,skillId:"commerce",skillRating:specialist.rating,attributeId:"presence",attributeRating:actor?.attributes.presence ?? state.player.character.attributes.presence,difficulty:18,...(actor?{specializations:actor.specializations}:{}),specialistCharacterId:specialist.characterId});
  const discount = bargain.outcome === "exceptional_success" ? .08 : bargain.outcome === "clean_success" ? .05 : bargain.outcome === "costly_success" ? .02 : bargain.outcome === "severe_failure" ? -.04 : 0;
  const channelMultiplier=Math.max(.25,Math.min(4,Number(options.priceMultiplier??1)));
  const price = Math.max(1,Math.round(listedPrice * (direction === "buy" ? 1-discount : 1+discount) * channelMultiplier));
  recordMeaningfulPractice(state,specialist.characterId,"commerce",`market:${portId}:${commodityId}`,18);
  let stack = ship.cargo.find((item) => item.commodityId === commodityId);

  if (direction === "buy") {
    const cost = price * amount;
    if (row.stock < amount) return { ok: false, message: "The market does not have that much stock." };
    if (state.player.character.crowns < cost) return { ok: false, message: "You do not have enough crowns." };
    if (cargoUsed(state) + good.cargoUnits * amount > ship.cargoCapacity) return { ok: false, message: "The hold cannot take that much cargo." };
    state.player.character.crowns -= cost;
    row.stock -= amount;
    if (!stack) { stack = { commodityId, quantity: 0 }; ship.cargo.push(stack); }
    stack.quantity += amount;
    state.worldEvents.push({
      id: `event.trade.buy.${state.absoluteHour}.${state.worldEvents.length}`,
      type: "market_transaction",
      atHour: state.absoluteHour,
      locationId: portId,
      participants: [state.player.character.id],
      summary: `Bought ${amount} ${good.name} for ${cost} crowns in ${portId}.`,
      canonicalData: { commodityId, amount, price, listedPrice, direction, channel, bargainOutcome:bargain.outcome, specialist:specialist.name },
      importance: 1
    });
  } else {
    if (!stack || stack.quantity < amount) return { ok: false, message: "You do not have that much cargo." };
    if (row.stock + amount > marketStorageCapacity(row)) return { ok:false, message:"The local exchange cannot absorb that much more of this cargo right now." };
    const revenue = price * amount;
    state.player.character.crowns += revenue;
    stack.quantity -= amount;
    row.stock += amount;
    ship.cargo = ship.cargo.filter((item) => item.quantity > 0);
    state.worldEvents.push({
      id: `event.trade.sell.${state.absoluteHour}.${state.worldEvents.length}`,
      type: "market_transaction",
      atHour: state.absoluteHour,
      locationId: portId,
      participants: [state.player.character.id],
      summary: `Sold ${amount} ${good.name} for ${revenue} crowns in ${portId}.`,
      canonicalData: { commodityId, amount, price, listedPrice, direction, channel, bargainOutcome:bargain.outcome, specialist:specialist.name },
      importance: 1
    });
  }

  row.lastPrice = calculatePrice(state, market, commodityId);
  state.player.observedPrices[`${portId}:${commodityId}`] = { price: row.lastPrice, observedAtHour: state.absoluteHour };
  return { ok: true, message: `${direction === "buy" ? "Bought" : "Sold"} ${amount} ${good.name}${price !== listedPrice ? ` at a negotiated ${price} cr instead of ${listedPrice}` : ""}.` };
}
