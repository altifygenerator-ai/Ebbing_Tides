import { ITEM_BY_ID, availableItemDefinitionsAtSettlement, itemPurchasePriceAtSettlement } from "../data/seed/items.js";
import type { EquipmentSlot, GameState, ItemDefinition, ItemInstance, NpcCharacter } from "./types.js";

export type InventoryOwnerId = "player" | string;

export const PLAYER_EQUIPMENT_SLOTS: EquipmentSlot[] = ["head","chest","hands","legs","feet","mainHand","offHand","neck","ring1","ring2","relic","tool","back"];
export const COMPANION_EQUIPMENT_SLOTS: EquipmentSlot[] = ["head","chest","hands","legs","feet","mainHand","offHand","relic"];

export function defaultEquipmentState(slots: EquipmentSlot[] = PLAYER_EQUIPMENT_SLOTS): Record<EquipmentSlot, string | undefined> {
  return Object.fromEntries(slots.map((slot) => [slot, undefined])) as Record<EquipmentSlot, string | undefined>;
}

function ownerNpc(state: GameState, ownerId: string): NpcCharacter | undefined {
  return ownerId === "player" ? undefined : state.npcs[ownerId];
}

export function inventoryForOwner(state: GameState, ownerId: InventoryOwnerId): ItemInstance[] {
  if (ownerId === "player") return state.player.inventory;
  const npc = ownerNpc(state, ownerId);
  if (!npc) return [];
  npc.inventory ??= [];
  return npc.inventory;
}

export function equipmentForOwner(state: GameState, ownerId: InventoryOwnerId) {
  if (ownerId === "player") return state.player.equipment;
  const npc = ownerNpc(state, ownerId);
  if (!npc) return undefined;
  npc.equipment ??= defaultEquipmentState(COMPANION_EQUIPMENT_SLOTS);
  return npc.equipment;
}

export function itemInstance(state: GameState, instanceId: string, ownerId: InventoryOwnerId = "player"): ItemInstance | undefined {
  return inventoryForOwner(state, ownerId).find((item) => item.id === instanceId);
}

export function isItemEquipped(state: GameState, instanceId: string, ownerId: InventoryOwnerId = "player"): boolean {
  const equipment = equipmentForOwner(state, ownerId);
  return equipment ? Object.values(equipment).includes(instanceId) : false;
}

export function equippedDefinition(state: GameState, slot: EquipmentSlot, ownerId: InventoryOwnerId = "player") {
  const equipment = equipmentForOwner(state, ownerId);
  const instanceId = equipment?.[slot];
  if (!instanceId) return undefined;
  const instance = itemInstance(state, instanceId, ownerId);
  return instance ? ITEM_BY_ID[instance.definitionId] : undefined;
}

export function allowedSlotsForItem(def: ItemDefinition): EquipmentSlot[] {
  return def.allowedSlots?.length ? def.allowedSlots : def.slot ? [def.slot] : [];
}

function canOwnerUseSlot(ownerId: InventoryOwnerId, slot: EquipmentSlot): boolean {
  return ownerId === "player" ? PLAYER_EQUIPMENT_SLOTS.includes(slot) : COMPANION_EQUIPMENT_SLOTS.includes(slot);
}

function firstSupportedSlot(ownerId: InventoryOwnerId, def: ItemDefinition): EquipmentSlot | undefined {
  return allowedSlotsForItem(def).find((slot) => canOwnerUseSlot(ownerId, slot));
}

export function equipItem(state: GameState, instanceId: string, ownerId: InventoryOwnerId = "player", preferredSlot?: EquipmentSlot): { ok: boolean; message: string } {
  const instance = itemInstance(state, instanceId, ownerId);
  if (!instance) return { ok: false, message: "That item is not in this inventory." };
  const def = ITEM_BY_ID[instance.definitionId];
  if (!def) return { ok: false, message: "That item definition is missing." };
  const equipment = equipmentForOwner(state, ownerId);
  if (!equipment) return { ok: false, message: "That character cannot equip gear." };
  const requested = preferredSlot && allowedSlotsForItem(def).includes(preferredSlot) ? preferredSlot : undefined;
  const slot = requested ?? firstSupportedSlot(ownerId, def);
  if (!slot) return { ok: false, message: `${def.name} cannot be equipped by this character.` };
  equipment[slot] = instance.id;
  const actorId = ownerId === "player" ? state.player.character.id : ownerId;
  const actorName = ownerId === "player" ? state.player.character.name : state.npcs[ownerId]?.name ?? "Companion";
  state.worldEvents.push({
    id: `event.equip.${actorId}.${instance.id}.${state.absoluteHour}.${state.worldEvents.length}`,
    type: "equipment_changed",
    atHour: state.absoluteHour,
    participants: [actorId],
    summary: `${actorName} equipped ${def.name}.`,
    canonicalData: { itemInstanceId: instance.id, definitionId: def.id, slot, ownerId },
    importance: 0
  });
  return { ok: true, message: `${def.name} equipped to ${slotLabel(slot)}.` };
}

export function unequipItem(state: GameState, slot: EquipmentSlot, ownerId: InventoryOwnerId = "player"): { ok: boolean; message: string } {
  const equipment = equipmentForOwner(state, ownerId);
  if (!equipment) return { ok: false, message: "That character has no equipment layout." };
  const instanceId = equipment[slot];
  if (!instanceId) return { ok: false, message: `${slotLabel(slot)} is already empty.` };
  const def = ITEM_BY_ID[itemInstance(state, instanceId, ownerId)?.definitionId ?? ""];
  equipment[slot] = undefined;
  return { ok: true, message: `${def?.name ?? "Item"} removed from ${slotLabel(slot)}.` };
}

export function slotLabel(slot: EquipmentSlot): string {
  return slot === "ring1" ? "Ring 1"
    : slot === "ring2" ? "Ring 2"
    : slot === "mainHand" ? "Main Hand"
    : slot === "offHand" ? "Off Hand"
    : slot === "back" ? "Back"
    : slot.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

export function armorDefense(state: GameState): number {
  return equippedDefinition(state, "chest")?.defense ?? 0;
}

export function meleeAttack(state: GameState): number {
  return equippedDefinition(state, "mainHand")?.attack ?? 2;
}

export function meleeApCost(state: GameState): number {
  return equippedDefinition(state, "mainHand")?.apCost ?? 3;
}

export function firearmAttack(state: GameState): number {
  const main = equippedDefinition(state, "mainHand");
  const off = equippedDefinition(state, "offHand");
  const firearm = [main, off].find((def) => def?.category === "firearm" || def?.tags.includes("pistol"));
  return firearm?.attack ?? 0;
}

export function purchaseItem(state: GameState, definitionId: string): { ok: boolean; message: string } {
  if (!state.player.currentPortId) return { ok: false, message: "You need to be in port to purchase equipment." };
  const def = ITEM_BY_ID[definitionId];
  if (!def) return { ok: false, message: "Unknown equipment." };
  const available = availableItemDefinitionsAtSettlement(state.player.currentPortId);
  if (!available.some((item) => item.id === definitionId)) return { ok: false, message: `${def.name} is not ordinary stock in this port.` };
  const price = itemPurchasePriceAtSettlement(definitionId, state.player.currentPortId);
  if (price == null) return { ok: false, message: `${def.name} is not available for ordinary purchase here.` };
  if (state.player.character.crowns < price) return { ok: false, message: `${def.name} costs ${price} crowns.` };
  state.player.character.crowns -= price;
  const instance: ItemInstance = {
    id: `instance.purchase.${state.absoluteHour}.${state.player.inventory.length}.${definitionId.replaceAll(".", "_")}`,
    definitionId,
    quality: "standard",
    condition: "new",
    origin: state.player.currentPortId,
    acquiredAtHour: state.absoluteHour,
    history: [`Purchased in ${state.player.currentPortId} at hour ${state.absoluteHour}.`]
  };
  state.player.inventory.push(instance);
  state.worldEvents.push({
    id: `event.item.purchase.${instance.id}`,
    type: "equipment_purchased",
    atHour: state.absoluteHour,
    locationId: state.player.currentPortId,
    participants: [state.player.character.id],
    summary: `${def.name} purchased for ${price} crowns.`,
    canonicalData: { definitionId, instanceId: instance.id, price },
    importance: 0
  });
  return { ok: true, message: `${def.name} purchased for ${price} crowns.` };
}
