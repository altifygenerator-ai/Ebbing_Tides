import { CANON_SETTLEMENTS, CANON_WORLD_LOCATION_BY_ID } from "./settlementCanon.js";
import { CONTENT_DEFINITIONS, CONTENT_BY_ID, SHIP_CLASS_DEFINITIONS, SHIP_CLASS_BY_ID } from "./contentRegistry.js";
export const REGIONS = ["skeldra", "asteria", "serath", "kaishin", "crossroads", "outer_isles"];
export const REGION_ECONOMIC_DOCTRINES = {
    skeldra: {
        regionId: "skeldra",
        primaryIndustries: ["shipbuilding", "foundries", "iron and steel goods", "timber work", "naval supply", "cold-water fishing"],
        exports: ["industrial goods", "machinery", "weapons", "iron and steel goods", "ship fittings"],
        imports: ["luxuries", "fine foods", "Arcane materials", "silk", "spices"],
        dominantTags: ["skeldra", "industrial", "ship_module", "weapon", "armor", "tool", "wool", "timber", "iron", "coal"],
        costlyImportTags: ["asteria", "arcane_equipment", "silk", "spices", "luxury"],
        marketTypes: ["general_market", "weaponsmith", "armorer", "outfitter", "ship_chandler", "shipyard", "foundry", "merchant_exchange", "apothecary", "book_chart_seller", "religious_vendor"],
        shipbuildingLevel: 4, repairCapability: 4, medicalCapability: 3, militarySupplyLevel: 4, arcaneServices: 1, industrialServices: 4, luxuryAvailability: 2, smugglingAvailability: 1, religiousGoods: 3
    },
    asteria: {
        regionId: "asteria",
        primaryIndustries: ["Arcane scholarship", "ritual craft", "wine", "ceramics", "fine craft", "merchant shipping"],
        exports: ["wine", "art", "magical services", "luxury crafts", "ceramics"],
        imports: ["timber", "coal", "metals", "heavy machinery"],
        dominantTags: ["asteria", "arcane", "arcane_equipment", "clothing", "valuable", "wine", "ceramics", "scholarly"],
        costlyImportTags: ["industrial_equipment", "coal", "iron", "timber", "kaishin"],
        marketTypes: ["general_market", "weaponsmith", "outfitter", "ship_chandler", "shipyard", "arcane_dealer", "merchant_exchange", "apothecary", "book_chart_seller", "religious_vendor"],
        shipbuildingLevel: 4, repairCapability: 3, medicalCapability: 3, militarySupplyLevel: 3, arcaneServices: 4, industrialServices: 1, luxuryAvailability: 4, smugglingAvailability: 1, religiousGoods: 3
    },
    serath: {
        regionId: "serath",
        primaryIndustries: ["textiles", "glasswork", "dyes", "medicine", "manuscripts", "pilgrimage trade", "caravan-sea exchange"],
        exports: ["dyes", "glass", "textiles", "spices", "manuscripts", "jewelry", "medicine"],
        imports: ["heavy machinery", "extreme Arcane devices", "northern timber"],
        dominantTags: ["serath", "religious_object", "document", "medicine", "glass", "textiles", "spices", "clothing"],
        costlyImportTags: ["industrial_equipment", "skeldra", "high-order", "arcane_equipment"],
        marketTypes: ["general_market", "weaponsmith", "outfitter", "ship_chandler", "shipyard", "religious_vendor", "merchant_exchange", "apothecary", "book_chart_seller"],
        shipbuildingLevel: 3, repairCapability: 3, medicalCapability: 4, militarySupplyLevel: 3, arcaneServices: 2, industrialServices: 1, luxuryAvailability: 3, smugglingAvailability: 1, religiousGoods: 4
    },
    kaishin: {
        regionId: "kaishin",
        primaryIndustries: ["ceramics", "silk and textiles", "paper and books", "medicine", "specialty metallurgy", "organized shipbuilding"],
        exports: ["ceramics", "silk", "medicine", "books", "tea", "specialty metallurgy"],
        imports: ["foreign industrial machines", "Asterian ritual curiosities", "select western luxuries"],
        dominantTags: ["kaishin", "tool", "document", "silk", "paper", "ceramics", "medicine", "ship_module"],
        costlyImportTags: ["industrial_equipment", "asteria", "arcane_equipment"],
        marketTypes: ["general_market", "weaponsmith", "armorer", "outfitter", "ship_chandler", "shipyard", "merchant_exchange", "apothecary", "book_chart_seller", "religious_vendor"],
        shipbuildingLevel: 4, repairCapability: 4, medicalCapability: 4, militarySupplyLevel: 3, arcaneServices: 2, industrialServices: 2, luxuryAvailability: 3, smugglingAvailability: 1, religiousGoods: 3
    },
    crossroads: {
        regionId: "crossroads",
        primaryIndustries: ["transshipment", "customs", "fort supply", "finance", "legal services", "ship repair", "intelligence trade"],
        exports: ["re-exported goods", "legal documents", "fort supplies", "brokerage services"],
        imports: ["arms", "luxuries", "food", "specialty craft", "Arcane and Industrial goods"],
        dominantTags: ["crossroads", "document", "valuable", "weapon", "merchant_exchange", "import"],
        costlyImportTags: ["rare", "unique"],
        marketTypes: ["general_market", "weaponsmith", "armorer", "outfitter", "ship_chandler", "shipyard", "foundry", "arcane_dealer", "religious_vendor", "black_market", "merchant_exchange", "apothecary", "book_chart_seller"],
        shipbuildingLevel: 3, repairCapability: 4, medicalCapability: 3, militarySupplyLevel: 4, arcaneServices: 3, industrialServices: 3, luxuryAvailability: 4, smugglingAvailability: 2, religiousGoods: 3
    },
    outer_isles: {
        regionId: "outer_isles",
        primaryIndustries: ["salvage", "privateering", "smuggling", "fishing", "rare hardwoods", "colonial goods", "repair and refit"],
        exports: ["rare hardwoods", "minerals", "Arcane materials", "colonial goods", "salvage", "prize cargo"],
        imports: ["manufactured equipment", "standardized parts", "weapons", "luxuries"],
        dominantTags: ["outer_isles", "captured", "repaired", "patched", "smuggling", "weapon", "ship_module", "colonial"],
        costlyImportTags: ["industrial_equipment", "sacred", "luxury", "standardized"],
        marketTypes: ["general_market", "weaponsmith", "outfitter", "ship_chandler", "shipyard", "black_market", "merchant_exchange", "apothecary", "book_chart_seller"],
        shipbuildingLevel: 2, repairCapability: 3, medicalCapability: 2, militarySupplyLevel: 2, arcaneServices: 2, industrialServices: 1, luxuryAvailability: 2, smugglingAvailability: 4, religiousGoods: 1
    }
};
const REGION_SHIP_CLASSES = Object.fromEntries(REGIONS.map((regionId) => [regionId, SHIP_CLASS_DEFINITIONS.filter((row) => row.region === regionId || row.region === "common").map((row) => row.id)]));
const s = (name) => SHIP_CLASS_DEFINITIONS.find((row) => row.name === name).id;
const EMPTY_YARD = { builds: [], commonlySells: [], sometimesSells: [], imports: [], repairs: 0, refits: 0, specialistCapabilities: [] };
function genericYard(regionId, shipbuildingLevel, repairCapability) {
    const regional = REGION_SHIP_CLASSES[regionId];
    const builds = regional.filter((id) => {
        const role = SHIP_CLASS_BY_ID[id]?.role;
        if (shipbuildingLevel <= 1)
            return role === "workboat" || role === "coastal" || role === "coastal_trader" || role === "coastal_merchant";
        if (shipbuildingLevel === 2)
            return !["capital_warship", "capital_arcane", "industrial_special", "industrial_test"].includes(role ?? "");
        if (shipbuildingLevel === 3)
            return role !== "capital_warship" && role !== "capital_arcane";
        return true;
    });
    return { builds, commonlySells: builds.slice(0, 4), sometimesSells: builds.slice(4), imports: [], repairs: repairCapability, refits: Math.min(4, repairCapability), specialistCapabilities: [] };
}
const SETTLEMENT_OVERRIDES = {
    "port.veyrholm": {
        primaryIndustries: ["royal administration", "naval command", "finance", "major shipyard", "high-quality fittings"],
        shipbuildingLevel: 4, repairCapability: 4, medicalCapability: 3, militarySupplyLevel: 4, industrialServices: 3, luxuryAvailability: 3,
        shipyard: { builds: [s("Royal Sloop"), s("Skeldran Frigate"), s("Skeldran Heavy Warship"), s("North Sea Trader")], commonlySells: [s("Royal Sloop"), s("Skeldran Frigate"), s("North Sea Trader")], sometimesSells: [s("Skeldran Heavy Warship")], imports: [], repairs: 4, refits: 4, specialistCapabilities: ["royal naval work", "major repairs", "high-quality fittings", "naval refits"] }
    },
    "port.ironhaven": {
        primaryIndustries: ["foundries", "naval engineering", "heavy machinery", "standardized weapons", "industrial ship refit"],
        shipbuildingLevel: 4, repairCapability: 4, medicalCapability: 4, militarySupplyLevel: 4, industrialServices: 4, arcaneServices: 0,
        shipyard: { builds: [s("North Sea Trader"), s("Skeldran Frigate"), s("Steam-Assisted Experimental Frigate")], commonlySells: [s("North Sea Trader"), s("Skeldran Frigate")], sometimesSells: [s("Steam-Assisted Experimental Frigate")], imports: [], repairs: 4, refits: 4, specialistCapabilities: ["Industrial refits", "pressure machinery", "experimental steam assistance", "major repairs"] }
    },
    "port.stormvik": {
        primaryIndustries: ["fishing", "working harbor", "coastal shipbuilding", "exploration fitting", "timber work"],
        shipbuildingLevel: 3, repairCapability: 3, medicalCapability: 2, militarySupplyLevel: 2, industrialServices: 2,
        shipyard: { builds: [s("Fjord Cutter"), s("Coastal Fishing Boat"), s("North Sea Trader"), s("Western Passage Survey Ship")], commonlySells: [s("Fjord Cutter"), s("Coastal Fishing Boat"), s("North Sea Trader")], sometimesSells: [s("Western Passage Survey Ship")], imports: [], repairs: 3, refits: 3, specialistCapabilities: ["storm rigging", "exploration fitting", "working-vessel repair"] }
    },
    "port.thorenfjord": {
        primaryIndustries: ["pilgrimage", "sacred craft", "fishing", "local boat repair", "manuscripts and ritual goods"],
        shipbuildingLevel: 1, repairCapability: 2, medicalCapability: 2, militarySupplyLevel: 1, industrialServices: 0, arcaneServices: 2, religiousGoods: 4,
        shipyard: { builds: [s("Harbor Skiff"), s("Coastal Fishing Boat")], commonlySells: [s("Harbor Skiff"), s("Coastal Fishing Boat")], sometimesSells: [s("Fjord Cutter")], imports: [s("Fjord Cutter")], repairs: 2, refits: 1, specialistCapabilities: ["small-craft repair", "ritual fittings"] }
    },
    "settlement.asterra": { arcaneServices: 4, luxuryAvailability: 4, shipbuildingLevel: 4, repairCapability: 4, medicalCapability: 3, militarySupplyLevel: 4 },
    "settlement.eirenos": { primaryIndustries: ["shipbuilding", "fine maritime craft", "Arcane-compatible fittings"], shipbuildingLevel: 4, repairCapability: 4 },
    "settlement.delphara": { religiousGoods: 4, arcaneServices: 4, medicalCapability: 3, militarySupplyLevel: 1 },
    "settlement.rhadessa": { primaryIndustries: ["merchant exchange", "shipping", "warehousing", "finance"], luxuryAvailability: 4 },
    "settlement.vespera": { luxuryAvailability: 4, repairCapability: 4, militarySupplyLevel: 4, smugglingAvailability: 2 },
    "settlement.southwatch": { militarySupplyLevel: 4, smugglingAvailability: 1 },
    "settlement.lantern_key": { primaryIndustries: ["piloting", "charts", "courier services", "small-vessel repair"], shipbuildingLevel: 2, repairCapability: 3 },
    "settlement.aurel": { religiousGoods: 4, luxuryAvailability: 4, medicalCapability: 4, militarySupplyLevel: 4 },
    "settlement.tyras": { primaryIndustries: ["strait trade", "convoy supply", "naval patrol support"], militarySupplyLevel: 4, repairCapability: 3 },
    "settlement.japhra": { primaryIndustries: ["caravan-sea exchange", "warehousing", "textiles", "spices"], luxuryAvailability: 3 },
    "settlement.qasirah": { primaryIndustries: ["pearls", "coastal trade", "luxury craft"], luxuryAvailability: 4 },
    "settlement.kaishin": { shipbuildingLevel: 4, repairCapability: 4, medicalCapability: 4, militarySupplyLevel: 4, luxuryAvailability: 4 },
    "settlement.ryosen": { primaryIndustries: ["shipbuilding", "compartmented hull construction", "naval supply"], shipbuildingLevel: 4, repairCapability: 4 },
    "settlement.nagara": { primaryIndustries: ["western trade", "merchant exchange", "import brokerage"], luxuryAvailability: 3 },
    "settlement.kuroseki": { militarySupplyLevel: 4, repairCapability: 3, religiousGoods: 2 },
    "settlement.blackhaven": { smugglingAvailability: 4, repairCapability: 4, luxuryAvailability: 3, militarySupplyLevel: 3 },
    "settlement.saltwake": { smugglingAvailability: 4, militarySupplyLevel: 1 },
    "settlement.redhook": { primaryIndustries: ["fishing", "raiding", "repair", "salvage"], repairCapability: 3, smugglingAvailability: 3 },
    "settlement.port_meridian": { primaryIndustries: ["merchant shipping", "warehousing", "brokerage"], luxuryAvailability: 3, smugglingAvailability: 2 }
};
function profileForSettlement(settlementId) {
    const settlement = CANON_WORLD_LOCATION_BY_ID[settlementId];
    if (!settlement || settlement.kind !== "settlement")
        throw new Error(`Unknown canonical settlement ${settlementId}`);
    const regionId = settlement.runtimeRegion;
    const base = REGION_ECONOMIC_DOCTRINES[regionId];
    const isMajor = settlement.category === "major_capital_great_port";
    const isFortress = settlement.category === "sacred_city_fortress";
    const shipbuildingLevel = (isMajor ? Math.max(3, base.shipbuildingLevel) : isFortress ? Math.min(base.shipbuildingLevel, 2) : Math.min(base.shipbuildingLevel, 3));
    const repairCapability = (isMajor ? Math.max(3, base.repairCapability) : Math.min(base.repairCapability, 3));
    const generic = {
        settlementId,
        regionId,
        primaryIndustries: [...base.primaryIndustries],
        exports: [...base.exports],
        imports: [...base.imports],
        shipbuildingLevel,
        repairCapability,
        medicalCapability: base.medicalCapability,
        militarySupplyLevel: (isMajor ? Math.max(3, base.militarySupplyLevel) : base.militarySupplyLevel),
        arcaneServices: base.arcaneServices,
        industrialServices: base.industrialServices,
        luxuryAvailability: base.luxuryAvailability,
        smugglingAvailability: base.smugglingAvailability,
        religiousGoods: (isFortress ? Math.max(3, base.religiousGoods) : base.religiousGoods),
        marketTypes: [...base.marketTypes],
        shipyard: genericYard(regionId, shipbuildingLevel, repairCapability)
    };
    const override = SETTLEMENT_OVERRIDES[settlementId];
    if (!override)
        return generic;
    return { ...generic, ...override, shipyard: override.shipyard ?? generic.shipyard };
}
export const SETTLEMENT_ECONOMIC_PROFILES = CANON_SETTLEMENTS.map((row) => profileForSettlement(row.id));
export const SETTLEMENT_ECONOMIC_PROFILE_BY_ID = Object.fromEntries(SETTLEMENT_ECONOMIC_PROFILES.map((row) => [row.settlementId, row]));
function tagsFor(def) {
    return [def.category, def.subcategory ?? "", String(def.originRegion ?? ""), ...def.availabilityTags, ...def.gameplayRoles].map((v) => v.toLowerCase());
}
const REGIONAL_COMMODITY_LOCAL_NAMES = {
    skeldra: ["coal", "iron ore", "pig iron", "steel bars", "brass fittings", "machine parts", "precision tools", "timber", "oak ship timber", "wool"],
    asteria: ["wine", "fine ceramics", "glassware", "perfume", "jewelry", "paintings", "musical instruments", "ritual inks", "resonant crystal"],
    serath: ["dyestuffs", "glass", "linen", "cotton", "spices", "jewelry", "fine books", "rare herbs", "chemical reagents"],
    kaishin: ["fine ceramics", "silk", "dyed silk", "tea", "fine books", "paper", "precision tools", "steel bars", "rare herbs"],
    crossroads: ["wine", "spices", "jewelry", "fine books", "glassware"],
    outer_isles: ["timber", "oak ship timber", "furs", "leather", "copper", "tin", "spirit wood", "rare herbs", "relic fragments", "sugar", "coffee-like imported beverage"]
};
const REGIONAL_COMMODITY_IMPORT_NAMES = {
    skeldra: ["wine", "spices", "fine ceramics", "perfume", "dyed silk", "silk", "resonant crystal", "ritual inks", "arcane salts", "dream incense"],
    asteria: ["timber", "oak ship timber", "coal", "iron ore", "pig iron", "steel bars", "machine parts", "precision tools"],
    serath: ["machine parts", "coal", "precision tools", "resonant crystal"],
    kaishin: ["machine parts", "coal", "wine", "resonant crystal", "ritual inks"],
    outer_isles: ["machine parts", "precision tools", "brass fittings", "steel bars"]
};
function commodityRegionalSignal(definition, regionId) {
    if (definition.category !== "commodity")
        return undefined;
    const name = definition.name.toLowerCase();
    if (REGIONAL_COMMODITY_LOCAL_NAMES[regionId].some((entry) => entry === name))
        return "local";
    if ((REGIONAL_COMMODITY_IMPORT_NAMES[regionId] ?? []).some((entry) => entry === name))
        return "import";
    return undefined;
}
export function regionalAvailabilityFor(definition, regionId) {
    const doctrine = REGION_ECONOMIC_DOCTRINES[regionId];
    const tags = tagsFor(definition);
    const commoditySignal = commodityRegionalSignal(definition, regionId);
    const local = definition.originRegion === regionId || commoditySignal === "local";
    const commonOrigin = definition.originRegion === "common" || definition.originRegion === "cross_regional" || definition.originRegion == null;
    const dominant = doctrine.dominantTags.some((tag) => tags.some((candidate) => candidate.includes(tag.toLowerCase())));
    const costly = doctrine.costlyImportTags.some((tag) => tags.some((candidate) => candidate.includes(tag.toLowerCase())));
    let commonality = commoditySignal === "import" ? "rare_import" : local ? "local_specialty" : commonOrigin ? "common" : dominant ? "common" : costly ? "rare_import" : "occasional";
    let priceModifier = commoditySignal === "import" ? 1.28 : local ? 0.92 : commonOrigin ? 1 : commonality === "common" ? 1.02 : commonality === "occasional" ? 1.16 : 1.38;
    let importDependency = commoditySignal === "import" ? "high" : local ? "none" : commonOrigin ? "low" : commonality === "rare_import" ? "high" : "moderate";
    // Asteria can manufacture firearms, but culturally distinctive ranged gear is more often Arcane than gun-centered.
    if (regionId === "asteria" && definition.category === "firearm") {
        commonality = local ? "occasional" : "rare_import";
        priceModifier = local ? 1.05 : 1.28;
        importDependency = local ? "low" : "high";
    }
    // Vespera is a crossroads: broad imports, but local forms remain the strongest identity.
    if (regionId === "crossroads" && !local && definition.rarity !== "unique") {
        commonality = definition.rarity === "rare" ? "rare_import" : "occasional";
        priceModifier = definition.rarity === "rare" ? 1.24 : 1.08;
        importDependency = "moderate";
    }
    // Outer Isles variety comes through capture/import/repair rather than universal local manufacture.
    if (regionId === "outer_isles" && !local && !commonOrigin && definition.rarity !== "unique") {
        commonality = "occasional";
        priceModifier = 1.08;
        importDependency = "high";
    }
    if (definition.rarity === "unique") {
        commonality = "unavailable";
        importDependency = "exclusive_import";
        priceModifier = 2;
    }
    return { definitionId: definition.id, regionId, manufacturedLocally: local, commonality, importDependency, legalStatus: definition.legalStatus, priceModifier };
}
export const REGIONAL_AVAILABILITY = REGIONS.flatMap((regionId) => CONTENT_DEFINITIONS.map((def) => regionalAvailabilityFor(def, regionId)));
function settlementSource(def, profile, regional) {
    if (regional.manufacturedLocally)
        return "local";
    if (def.category === "religious_object" && profile.religiousGoods >= 3)
        return "religious";
    if (profile.regionId === "outer_isles" && def.originRegion !== "common")
        return def.legalStatus === "contraband" ? "smuggled" : "captured";
    if (def.legalStatus === "military_only" && profile.militarySupplyLevel >= 3)
        return "state";
    return regional.importDependency === "none" || regional.importDependency === "low" ? "regional" : "import";
}
export function settlementAvailabilityFor(definition, settlementId) {
    const profile = SETTLEMENT_ECONOMIC_PROFILE_BY_ID[settlementId];
    if (!profile)
        throw new Error(`Unknown settlement profile ${settlementId}`);
    const regional = regionalAvailabilityFor(definition, profile.regionId);
    let availability = regional.commonality;
    const restrictions = [];
    if (definition.rarity === "unique" || definition.uniqueMarketStock)
        availability = "unavailable";
    if (definition.legalStatus === "military_only" && profile.militarySupplyLevel < 3) {
        availability = "restricted";
        restrictions.push("military supply authorization required");
    }
    if (definition.legalStatus === "restricted" || definition.legalStatus === "licensed")
        restrictions.push(`${definition.legalStatus} item`);
    if (definition.legalStatus === "contraband" && profile.smugglingAvailability < 2) {
        availability = "unavailable";
        restrictions.push("not ordinary legal stock");
    }
    if (definition.legalStatus === "sacred" && profile.religiousGoods < 2) {
        availability = "restricted";
        restrictions.push("religious provenance or institutional access required");
    }
    if (definition.category === "arcane_equipment" && profile.arcaneServices === 0)
        availability = "rare_import";
    if (definition.category === "industrial_equipment" && profile.industrialServices === 0)
        availability = "rare_import";
    // Playable Skeldran ports get supply-side identity now, without turning 0.6C into a dynamic economy simulation.
    if (definition.category === "commodity") {
        const name = definition.name.toLowerCase();
        const localByPort = {
            "port.veyrholm": ["wool", "brass fittings", "steel bars", "fine books"],
            "port.ironhaven": ["coal", "iron ore", "pig iron", "steel bars", "brass fittings", "machine parts", "precision tools", "chemical reagents"],
            "port.stormvik": ["salted fish", "timber", "oak ship timber", "pitch/tar", "rope fiber", "furs"],
            "port.thorenfjord": ["salted fish", "wool", "linen", "hard cheese", "consecrated oils", "dream incense"]
        };
        if ((localByPort[settlementId] ?? []).includes(name))
            availability = "local_specialty";
    }
    const source = settlementSource(definition, profile, regional);
    const bandWeight = { unavailable: 0, restricted: 0.15, rare_import: 0.25, occasional: 0.55, common: 0.8, local_specialty: 1 };
    const stockWeight = bandWeight[availability];
    const localAdjustment = source === "local" ? 0.94 : source === "captured" || source === "surplus" ? 0.98 : source === "smuggled" ? 1.22 : 1;
    return { settlementId, contentDefinitionId: definition.id, availability, source, priceModifier: Number((regional.priceModifier * localAdjustment).toFixed(2)), stockWeight, restrictions };
}
export const SETTLEMENT_AVAILABILITY = SETTLEMENT_ECONOMIC_PROFILES.flatMap((profile) => CONTENT_DEFINITIONS.map((def) => settlementAvailabilityFor(def, profile.settlementId)));
export function marketInventoryForSettlement(settlementId, marketType, limit = 40) {
    const profile = SETTLEMENT_ECONOMIC_PROFILE_BY_ID[settlementId];
    if (!profile || !profile.marketTypes.includes(marketType))
        return [];
    return CONTENT_DEFINITIONS
        .filter((def) => def.marketTypes.includes(marketType))
        .map((def) => settlementAvailabilityFor(def, settlementId))
        .filter((row) => row.availability !== "unavailable" && row.availability !== "restricted" && CONTENT_BY_ID[row.contentDefinitionId]?.legalStatus !== "contraband")
        .sort((a, b) => b.stockWeight - a.stockWeight || a.priceModifier - b.priceModifier || a.contentDefinitionId.localeCompare(b.contentDefinitionId))
        .slice(0, limit);
}
export function blackMarketInventoryForSettlement(settlementId, limit = 30) {
    const profile = SETTLEMENT_ECONOMIC_PROFILE_BY_ID[settlementId];
    if (!profile || profile.smugglingAvailability < 2)
        return [];
    return CONTENT_DEFINITIONS
        .filter((def) => def.legalStatus === "contraband" || def.legalStatus === "stolen" || def.marketTypes.includes("black_market"))
        .filter((def) => def.rarity !== "unique")
        .map((def) => ({ ...settlementAvailabilityFor(def, settlementId), source: "smuggled", availability: "occasional" }))
        .slice(0, limit);
}
export function shipyardClassesForSettlement(settlementId) {
    const yard = SETTLEMENT_ECONOMIC_PROFILE_BY_ID[settlementId]?.shipyard ?? EMPTY_YARD;
    const rows = (ids) => ids.map((id) => SHIP_CLASS_BY_ID[id]).filter((row) => Boolean(row));
    return { builds: rows(yard.builds), sells: rows([...yard.commonlySells, ...yard.sometimesSells]), imports: rows(yard.imports) };
}
export const REGIONAL_IDENTITY_SAMPLE_SETTLEMENTS = {
    skeldra: "port.veyrholm",
    asteria: "settlement.asterra",
    serath: "settlement.tyras",
    kaishin: "settlement.nagara",
    crossroads: "settlement.vespera",
    outer_isles: "settlement.blackhaven"
};
//# sourceMappingURL=regionalAvailability.js.map