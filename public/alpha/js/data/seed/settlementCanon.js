/**
 * WORLD SETTLEMENT & MARITIME GEOGRAPHY CANON 0.1
 *
 * Development authority for settlement existence, naming, regional grouping,
 * settlement category, maritime role, and relative geographic placement.
 * The shipped reference map remains the spatial visual authority. Runtime grid
 * coordinates remain separate until a region is deliberately registered for play.
 *
 * Precedence: later explicit user decisions > this canon > older settlement/location lore.
 */
export const WORLD_SETTLEMENT_GEOGRAPHY_CANON_VERSION = "0.1";
export const WORLD_SETTLEMENT_GEOGRAPHY_CANON_MAP_ASSET_ID = "canon.world_settlement_maritime_geography.0_1.map";
export const WORLD_SETTLEMENT_GEOGRAPHY_CANON_RECORD_ASSET_ID = "canon.world_settlement_maritime_geography.0_1.settlement_record";
export const SETTLEMENT_GEOGRAPHY_RULES = [
    "Ports belong on coasts, bays, river mouths, islands, fjords, and straits.",
    "Inland cities must have visible river or gulf access.",
    "Named cities must make maritime sense in their location, culture, and function.",
    "Major capitals and great ports anchor trade, religion, and politics across the world."
];
export const CANON_WORLD_LOCATIONS = [
    // Skeldra
    { id: "port.veyrholm", name: "Veyrholm", canonicalRegion: "skeldra", runtimeRegion: "skeldra", category: "major_capital_great_port", role: "capital / great port", kind: "settlement", playableInCurrentAlpha: true, gameplayEntityId: "port.veyrholm" },
    { id: "port.ironhaven", name: "Ironhaven", canonicalRegion: "skeldra", runtimeRegion: "skeldra", category: "city_regional_port", role: "industrial port", kind: "settlement", playableInCurrentAlpha: true, gameplayEntityId: "port.ironhaven" },
    { id: "port.stormvik", name: "Stormvik", canonicalRegion: "skeldra", runtimeRegion: "skeldra", category: "city_regional_port", role: "storm-coast harbor", kind: "settlement", playableInCurrentAlpha: true, gameplayEntityId: "port.stormvik" },
    { id: "port.thorenfjord", name: "Thorenfjord", canonicalRegion: "skeldra", runtimeRegion: "skeldra", category: "sacred_city_fortress", role: "sacred fjord city", kind: "settlement", playableInCurrentAlpha: true, gameplayEntityId: "port.thorenfjord" },
    { id: "settlement.hrafnvik", name: "Hrafnvik", canonicalRegion: "skeldra", runtimeRegion: "skeldra", category: "city_regional_port", role: "northern whaling harbor", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.kaldstrand", name: "Kaldstrand", canonicalRegion: "skeldra", runtimeRegion: "skeldra", category: "city_regional_port", role: "cold eastern port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.bjornhavn", name: "Bjornhavn", canonicalRegion: "skeldra", runtimeRegion: "skeldra", category: "city_regional_port", role: "ore and timber export port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.runeskar", name: "Runeskar", canonicalRegion: "skeldra", runtimeRegion: "skeldra", category: "sacred_city_fortress", role: "watch-fort island harbor", kind: "settlement", playableInCurrentAlpha: false },
    { id: "poi.old_veyr_beacon", name: "Old Veyr Beacon", canonicalRegion: "skeldra", runtimeRegion: "skeldra", category: "poi_danger_geography", role: "navigational landmark", kind: "poi", playableInCurrentAlpha: true, gameplayEntityId: "poi.old_veyr_beacon" },
    // Outer Isles / Greywater Coast
    { id: "settlement.greywater", name: "Greywater", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "outer_isles", category: "city_regional_port", role: "marsh trade port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.port_meridian", name: "Port Meridian", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "outer_isles", category: "city_regional_port", role: "merchant harbor", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.blackhaven", name: "Blackhaven", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "outer_isles", category: "city_regional_port", role: "freeport", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.ardaran", name: "Ardaran", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "crossroads", category: "city_regional_port", role: "channel customs port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.saltwake", name: "Saltwake", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "outer_isles", category: "city_regional_port", role: "smuggling harbor", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.saint_corren", name: "Saint Corren", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "outer_isles", category: "city_regional_port", role: "island mission port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.redhook", name: "Redhook", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "outer_isles", category: "city_regional_port", role: "fishing / raider port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.gullreach", name: "Gullreach", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "outer_isles", category: "city_regional_port", role: "outer market port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "poi.black_cape", name: "Black Cape", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "outer_isles", category: "poi_danger_geography", role: "dangerous headland", kind: "poi", playableInCurrentAlpha: false },
    { id: "poi.western_deep", name: "Western Deep", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "crossroads", category: "poi_danger_geography", role: "deep-sea region", kind: "poi", playableInCurrentAlpha: false },
    { id: "poi.greywater_wrecks", name: "Greywater Wrecks", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "skeldra", category: "poi_danger_geography", role: "ship graveyard", kind: "poi", playableInCurrentAlpha: true, gameplayEntityId: "poi.greywater_wrecks" },
    { id: "poi.widows_passage", name: "Widow's Passage", canonicalRegion: "outer_isles_greywater_coast", runtimeRegion: "outer_isles", category: "poi_danger_geography", role: "hazardous strait", kind: "poi", playableInCurrentAlpha: false },
    // Asteria / Asterian Sea
    { id: "settlement.asterra", name: "Asterra", canonicalRegion: "asterian_sea", runtimeRegion: "asteria", category: "major_capital_great_port", role: "capital / great port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.thalassa", name: "Thalassa", canonicalRegion: "asterian_sea", runtimeRegion: "asteria", category: "city_regional_port", role: "southern harbor city", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.aurelia", name: "Aurelia", aliases: ["Aurellia"], canonicalRegion: "asterian_sea", runtimeRegion: "asteria", category: "city_regional_port", role: "southern trade coast", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.korinthos", name: "Korinthos", canonicalRegion: "asterian_sea", runtimeRegion: "asteria", category: "city_regional_port", role: "regional strait hub", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.delphara", name: "Delphara", canonicalRegion: "asterian_sea", runtimeRegion: "asteria", category: "sacred_city_fortress", role: "shrine island port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.rhadessa", name: "Rhadessa", canonicalRegion: "asterian_sea", runtimeRegion: "asteria", category: "city_regional_port", role: "eastern merchant port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.myrine", name: "Myrine", canonicalRegion: "asterian_sea", runtimeRegion: "asteria", category: "city_regional_port", role: "market harbor", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.eirenos", name: "Eirenos", canonicalRegion: "asterian_sea", runtimeRegion: "asteria", category: "city_regional_port", role: "shipwright town", kind: "settlement", playableInCurrentAlpha: false },
    { id: "poi.thalassors_teeth", name: "Thalassor's Teeth", canonicalRegion: "asterian_sea", runtimeRegion: "asteria", category: "poi_danger_geography", role: "hazardous reef chain", kind: "poi", playableInCurrentAlpha: false },
    // Vesperan Strait
    { id: "settlement.vespera", name: "Vespera", canonicalRegion: "vesperan_strait", runtimeRegion: "crossroads", category: "major_capital_great_port", role: "great gateway port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.pelasion", name: "Pelasion", canonicalRegion: "vesperan_strait", runtimeRegion: "crossroads", category: "city_regional_port", role: "western approach port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.southwatch", name: "Southwatch", canonicalRegion: "vesperan_strait", runtimeRegion: "crossroads", category: "city_regional_port", role: "customs harbor", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.lantern_key", name: "Lantern Key", canonicalRegion: "vesperan_strait", runtimeRegion: "crossroads", category: "city_regional_port", role: "pilot isle harbor", kind: "settlement", playableInCurrentAlpha: false },
    // Serath
    { id: "settlement.aurel", name: "Aurel", canonicalRegion: "serath", runtimeRegion: "serath", category: "major_capital_great_port", role: "great capital / great port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.antiochara", name: "Antiochara", canonicalRegion: "serath", runtimeRegion: "serath", category: "city_regional_port", role: "eastern gulf city", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.tyras", name: "Tyras", canonicalRegion: "serath", runtimeRegion: "serath", category: "city_regional_port", role: "northern strait port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.japhra", name: "Japhra", canonicalRegion: "serath", runtimeRegion: "serath", category: "city_regional_port", role: "western caravan harbor", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.qasirah", name: "Qasirah", canonicalRegion: "serath", runtimeRegion: "serath", category: "city_regional_port", role: "southeastern pearl port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.safir", name: "Safir", canonicalRegion: "serath", runtimeRegion: "serath", category: "city_regional_port", role: "southern coast town", kind: "settlement", playableInCurrentAlpha: false },
    // Eastern Approaches / Kaishin
    { id: "settlement.kaishin", name: "Kaishin", canonicalRegion: "eastern_approaches_kaishin", runtimeRegion: "kaishin", category: "major_capital_great_port", role: "great capital", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.tenzan", name: "Tenzan", canonicalRegion: "eastern_approaches_kaishin", runtimeRegion: "kaishin", category: "city_regional_port", role: "northern mountain city with river access", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.nagara", name: "Nagara", canonicalRegion: "eastern_approaches_kaishin", runtimeRegion: "kaishin", category: "city_regional_port", role: "western trade port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.hanzhou", name: "Hanzhou", canonicalRegion: "eastern_approaches_kaishin", runtimeRegion: "kaishin", category: "city_regional_port", role: "river city", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.ryosen", name: "Ryosen", canonicalRegion: "eastern_approaches_kaishin", runtimeRegion: "kaishin", category: "city_regional_port", role: "shipbuilding port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.shido", name: "Shido", canonicalRegion: "eastern_approaches_kaishin", runtimeRegion: "kaishin", category: "city_regional_port", role: "eastern archipelago port", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.linhai", name: "Linhai", canonicalRegion: "eastern_approaches_kaishin", runtimeRegion: "kaishin", category: "city_regional_port", role: "southern coast market", kind: "settlement", playableInCurrentAlpha: false },
    { id: "settlement.kuroseki", name: "Kuroseki", canonicalRegion: "eastern_approaches_kaishin", runtimeRegion: "kaishin", category: "sacred_city_fortress", role: "southwestern fortress harbor", kind: "settlement", playableInCurrentAlpha: false },
    { id: "poi.spiral_maw", name: "Spiral Maw", canonicalRegion: "eastern_approaches_kaishin", runtimeRegion: "kaishin", category: "poi_danger_geography", role: "dangerous whirlpool region", kind: "poi", playableInCurrentAlpha: false }
];
export const CANON_SETTLEMENTS = CANON_WORLD_LOCATIONS.filter((row) => row.kind === "settlement");
export const CANON_MARITIME_POIS = CANON_WORLD_LOCATIONS.filter((row) => row.kind === "poi");
export const CANON_WORLD_LOCATION_BY_ID = Object.fromEntries(CANON_WORLD_LOCATIONS.map((row) => [row.id, row]));
export function canonLocationsForRegion(region) {
    return CANON_WORLD_LOCATIONS.filter((row) => row.canonicalRegion === region);
}
export function canonicalLocationName(id) {
    return CANON_WORLD_LOCATION_BY_ID[id]?.name ?? id;
}
//# sourceMappingURL=settlementCanon.js.map