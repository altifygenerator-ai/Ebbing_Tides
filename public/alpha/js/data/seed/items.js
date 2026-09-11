import { CONTENT_BY_ID } from "./contentRegistry.js";
import { SETTLEMENT_ECONOMIC_PROFILE_BY_ID, settlementAvailabilityFor } from "./regionalAvailability.js";
export const ITEM_DEFINITIONS = [
    {
        id: "item.weapon.skeldran_naval_saber",
        name: "Skeldran Naval Saber",
        category: "weapon",
        slot: "mainHand",
        allowedSlots: ["mainHand", "offHand"],
        baseValue: 92,
        attack: 5,
        defense: 2,
        apCost: 3,
        tags: ["blade", "naval", "skeldran"],
        description: "A broad, practical naval saber built for wet decks, close quarters, and hard use rather than parade display.",
        artAssetId: "item.weapon.skeldran_naval_saber"
    },
    {
        id: "item.weapon.common_boarding_axe",
        name: "Boarding Axe",
        category: "weapon",
        slot: "mainHand",
        allowedSlots: ["mainHand", "offHand"],
        baseValue: 54,
        attack: 6,
        defense: 0,
        apCost: 4,
        tags: ["axe", "boarding", "tool"],
        description: "A compact boarding axe useful for rope, timber, doors, and people when the deck turns violent.",
        artAssetId: "item.weapon.common_boarding_axe"
    },
    {
        id: "item.weapon.common_utility_dagger",
        name: "Utility Dagger",
        category: "weapon",
        slot: "offHand",
        allowedSlots: ["mainHand", "offHand"],
        baseValue: 24,
        attack: 3,
        defense: 1,
        apCost: 2,
        tags: ["blade", "utility"],
        description: "A plain working dagger kept sharp because ships provide too many reasons to need a knife.",
        artAssetId: "item.weapon.common_utility_dagger"
    },
    {
        id: "item.weapon.skeldran_naval_pistol",
        name: "Skeldran Naval Pistol",
        category: "firearm",
        slot: "mainHand",
        allowedSlots: ["mainHand", "offHand"],
        baseValue: 118,
        attack: 8,
        defense: 0,
        apCost: 4,
        tags: ["pistol", "flintlock", "skeldran"],
        description: "A robust flintlock sidearm with restrained northern metalwork and a mechanism designed to tolerate shipboard abuse.",
        artAssetId: "item.weapon.skeldran_naval_pistol"
    },
    {
        id: "item.armor.common_reinforced_jack",
        name: "Reinforced Jack",
        category: "armor",
        slot: "chest",
        baseValue: 76,
        attack: 0,
        defense: 2,
        apCost: 0,
        tags: ["padded", "shipboard"],
        description: "Padded and locally reinforced protection that still permits climbing, hauling, and fighting aboard ship.",
        artAssetId: "item.armor.common_reinforced_jack"
    },
    {
        id: "item.armor.common_brigandine",
        name: "Concealed-Plate Coat",
        category: "armor",
        slot: "chest",
        baseValue: 168,
        attack: 0,
        defense: 4,
        apCost: 0,
        tags: ["brigandine", "concealed_plate"],
        description: "A sea-suitable coat hiding overlapping plates beneath cloth and leather. Heavier than a jack, but still practical on deck.",
        artAssetId: "item.armor.common_brigandine"
    },
    {
        id: "item.armor.naval_breastplate",
        name: "Naval Breastplate",
        category: "armor",
        slot: "chest",
        baseValue: 230,
        attack: 0,
        defense: 6,
        apCost: 0,
        tags: ["plate", "naval", "heavy"],
        description: "Purpose-built heavy shipboard protection concentrating metal where a sailor is most likely to survive wearing it.",
        artAssetId: "item.armor.naval_breastplate"
    },
    {
        id: "item.tool.calibrated_sextant",
        name: "Calibrated Sextant",
        category: "tool", slot: "tool", baseValue: 145, attack: 0, defense: 0, apCost: 0,
        tags: ["navigation_instrument", "precision_instrument"],
        description: "A carefully calibrated optical navigation instrument. It improves position fixing only in trained hands and useful visibility.",
        artAssetId: "item.tool.calibrated_sextant",
        attunementLoad: { arcane: 0, industrial: 8, sensitivity: 0.65, mitigationTags: ["simple_precision_instrument"] }, region: "skeldra", legalStatus: "ordinary"
    },
];
export const ITEM_BY_ID = Object.fromEntries(ITEM_DEFINITIONS.map((item) => [item.id, item]));
export function itemPurchasePriceAtSettlement(definitionId, settlementId) {
    const def = ITEM_BY_ID[definitionId];
    if (!def)
        return undefined;
    const content = CONTENT_BY_ID[definitionId];
    if (!content)
        return def.baseValue;
    const availability = settlementAvailabilityFor(content, settlementId);
    if (availability.availability === "unavailable" || availability.availability === "restricted")
        return undefined;
    if (content.legalStatus === "contraband" || content.legalStatus === "stolen" || content.legalStatus === "military_only")
        return undefined;
    return Math.max(1, Math.round(def.baseValue * availability.priceModifier));
}
export function availableItemDefinitionsAtSettlement(settlementId) {
    const profile = SETTLEMENT_ECONOMIC_PROFILE_BY_ID[settlementId];
    if (!profile)
        return [];
    return ITEM_DEFINITIONS.filter((def) => {
        const price = itemPurchasePriceAtSettlement(def.id, settlementId);
        if (price == null)
            return false;
        // Heavy naval armor belongs in major/naval supply centers, not every fishing or sacred harbor.
        if (def.id === "item.armor.naval_breastplate" && profile.militarySupplyLevel < 3)
            return false;
        // Licensed naval firearms need at least a working military/arms supply chain.
        if (def.category === "firearm" && profile.militarySupplyLevel < 2)
            return false;
        // Precision navigation instruments need a fitting, shipyard, or exchange economy.
        if (def.id === "item.tool.calibrated_sextant" && profile.shipbuildingLevel < 2 && !profile.marketTypes.includes("book_chart_seller"))
            return false;
        return true;
    });
}
export function startingInventory(background, profession) {
    const ids = [
        "item.weapon.skeldran_naval_saber",
        "item.weapon.skeldran_naval_pistol",
        "item.weapon.common_utility_dagger",
        "item.armor.common_reinforced_jack"
    ];
    if (background === "foundry_child" || profession === "dockworker")
        ids.push("item.weapon.common_boarding_axe");
    if (profession === "navigator")
        ids.push("item.tool.calibrated_sextant");
    return ids.map((definitionId, index) => ({
        id: `instance.start.${index}.${definitionId.replaceAll(".", "_")}`,
        definitionId,
        quality: definitionId.includes("skeldran_naval") ? "standard" : "standard",
        condition: index === 0 ? "salt_weathered" : "worn",
        origin: "Starting equipment",
        acquiredAtHour: 0,
        history: ["Carried aboard Tideworn when the campaign began."]
    }));
}
//# sourceMappingURL=items.js.map