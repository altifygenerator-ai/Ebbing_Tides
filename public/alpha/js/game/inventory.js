import { ITEM_BY_ID, availableItemDefinitionsAtSettlement, itemPurchasePriceAtSettlement } from "../data/seed/items.js";
export const PLAYER_EQUIPMENT_SLOTS = ["head", "chest", "hands", "legs", "feet", "mainHand", "offHand", "neck", "ring1", "ring2", "relic", "tool", "back"];
export const COMPANION_EQUIPMENT_SLOTS = ["head", "chest", "hands", "legs", "feet", "mainHand", "offHand", "relic"];
export function defaultEquipmentState(slots = PLAYER_EQUIPMENT_SLOTS) {
    return Object.fromEntries(slots.map((slot) => [slot, undefined]));
}
function ownerNpc(state, ownerId) {
    return ownerId === "player" ? undefined : state.npcs[ownerId];
}
export function inventoryForOwner(state, ownerId) {
    if (ownerId === "player")
        return state.player.inventory;
    const npc = ownerNpc(state, ownerId);
    if (!npc)
        return [];
    npc.inventory ??= [];
    return npc.inventory;
}
export function equipmentForOwner(state, ownerId) {
    if (ownerId === "player")
        return state.player.equipment;
    const npc = ownerNpc(state, ownerId);
    if (!npc)
        return undefined;
    npc.equipment ??= defaultEquipmentState(COMPANION_EQUIPMENT_SLOTS);
    return npc.equipment;
}
export function itemInstance(state, instanceId, ownerId = "player") {
    return inventoryForOwner(state, ownerId).find((item) => item.id === instanceId);
}
export function isItemEquipped(state, instanceId, ownerId = "player") {
    const equipment = equipmentForOwner(state, ownerId);
    return equipment ? Object.values(equipment).includes(instanceId) : false;
}
export function equippedDefinition(state, slot, ownerId = "player") {
    const equipment = equipmentForOwner(state, ownerId);
    const instanceId = equipment?.[slot];
    if (!instanceId)
        return undefined;
    const instance = itemInstance(state, instanceId, ownerId);
    return instance ? ITEM_BY_ID[instance.definitionId] : undefined;
}
export function allowedSlotsForItem(def) {
    return def.allowedSlots?.length ? def.allowedSlots : def.slot ? [def.slot] : [];
}
function canOwnerUseSlot(ownerId, slot) {
    return ownerId === "player" ? PLAYER_EQUIPMENT_SLOTS.includes(slot) : COMPANION_EQUIPMENT_SLOTS.includes(slot);
}
function firstSupportedSlot(ownerId, def) {
    return allowedSlotsForItem(def).find((slot) => canOwnerUseSlot(ownerId, slot));
}
export function equipItem(state, instanceId, ownerId = "player", preferredSlot) {
    const instance = itemInstance(state, instanceId, ownerId);
    if (!instance)
        return { ok: false, message: "That item is not in this inventory." };
    const def = ITEM_BY_ID[instance.definitionId];
    if (!def)
        return { ok: false, message: "That item definition is missing." };
    const equipment = equipmentForOwner(state, ownerId);
    if (!equipment)
        return { ok: false, message: "That character cannot equip gear." };
    const requested = preferredSlot && allowedSlotsForItem(def).includes(preferredSlot) ? preferredSlot : undefined;
    const slot = requested ?? firstSupportedSlot(ownerId, def);
    if (!slot)
        return { ok: false, message: `${def.name} cannot be equipped by this character.` };
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
export function unequipItem(state, slot, ownerId = "player") {
    const equipment = equipmentForOwner(state, ownerId);
    if (!equipment)
        return { ok: false, message: "That character has no equipment layout." };
    const instanceId = equipment[slot];
    if (!instanceId)
        return { ok: false, message: `${slotLabel(slot)} is already empty.` };
    const def = ITEM_BY_ID[itemInstance(state, instanceId, ownerId)?.definitionId ?? ""];
    equipment[slot] = undefined;
    return { ok: true, message: `${def?.name ?? "Item"} removed from ${slotLabel(slot)}.` };
}
export function slotLabel(slot) {
    return slot === "ring1" ? "Ring 1"
        : slot === "ring2" ? "Ring 2"
            : slot === "mainHand" ? "Main Hand"
                : slot === "offHand" ? "Off Hand"
                    : slot === "back" ? "Back"
                        : slot.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
export function armorDefense(state) {
    return equippedDefinition(state, "chest")?.defense ?? 0;
}
export function meleeAttack(state) {
    return equippedDefinition(state, "mainHand")?.attack ?? 2;
}
export function meleeApCost(state) {
    return equippedDefinition(state, "mainHand")?.apCost ?? 3;
}
export function firearmAttack(state) {
    const main = equippedDefinition(state, "mainHand");
    const off = equippedDefinition(state, "offHand");
    const firearm = [main, off].find((def) => def?.category === "firearm" || def?.tags.includes("pistol"));
    return firearm?.attack ?? 0;
}
export function purchaseItem(state, definitionId) {
    if (!state.player.currentPortId)
        return { ok: false, message: "You need to be in port to purchase equipment." };
    const def = ITEM_BY_ID[definitionId];
    if (!def)
        return { ok: false, message: "Unknown equipment." };
    const available = availableItemDefinitionsAtSettlement(state.player.currentPortId);
    if (!available.some((item) => item.id === definitionId))
        return { ok: false, message: `${def.name} is not ordinary stock in this port.` };
    const price = itemPurchasePriceAtSettlement(definitionId, state.player.currentPortId);
    if (price == null)
        return { ok: false, message: `${def.name} is not available for ordinary purchase here.` };
    if (state.player.character.crowns < price)
        return { ok: false, message: `${def.name} costs ${price} crowns.` };
    state.player.character.crowns -= price;
    const instance = {
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
//# sourceMappingURL=inventory.js.map