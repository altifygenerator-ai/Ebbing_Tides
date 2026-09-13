export const SHIP_DIRECTIONS = ["north", "east", "south", "west"];
const FAMILY_DEFINITIONS = [
    { familyName: "Harbor Skiff", key: "harbor_skiff", folder: "common" }, { familyName: "Coastal Fishing Boat", key: "coastal_fishing_boat", folder: "common" },
    { familyName: "Fjord Cutter", key: "fjord_cutter", folder: "skeldra", region: "skeldra" }, { familyName: "North Sea Trader", key: "north_sea_trader", folder: "skeldra", region: "skeldra" }, { familyName: "Royal Sloop", key: "royal_sloop", folder: "skeldra", region: "skeldra" }, { familyName: "Skeldran Frigate", key: "skeldran_frigate", folder: "skeldra", region: "skeldra" }, { familyName: "Skeldran Heavy Warship", key: "skeldran_heavy_warship", folder: "skeldra", region: "skeldra" }, { familyName: "Steam-Assisted Experimental Frigate", key: "steam_assisted_experimental_frigate", folder: "skeldra", region: "skeldra" },
    { familyName: "Island Felucca", key: "island_felucca", folder: "asteria", region: "asteria" }, { familyName: "Asterian Merchant Galley-Sailer", key: "asterian_merchant_galley_sailer", folder: "asteria", region: "asteria" }, { familyName: "League Corvette", key: "league_corvette", folder: "asteria", region: "asteria" }, { familyName: "Asterian Frigate", key: "asterian_frigate", folder: "asteria", region: "asteria" }, { familyName: "Wardship", key: "wardship", folder: "asteria", region: "asteria" }, { familyName: "Arcane Heavy Cruiser", key: "arcane_heavy_cruiser", folder: "asteria", region: "asteria" },
    { familyName: "Coastal Dhow-Sailer", key: "coastal_dhow_sailer", folder: "serath", region: "serath" }, { familyName: "Pilgrim Carrier", key: "pilgrim_carrier", folder: "serath", region: "serath" }, { familyName: "Corsair Xebec-Type", key: "corsair_xebec_type", folder: "serath", region: "serath" }, { familyName: "Royal Escort Frigate", key: "royal_escort_frigate", folder: "serath", region: "serath" }, { familyName: "Covenant Relief Ship", key: "covenant_relief_ship", folder: "serath", region: "serath" },
    { familyName: "River-Sea Junk-Type", key: "river_sea_junk_type", folder: "kaishin", region: "kaishin" }, { familyName: "Compartmented Ocean Trader", key: "compartmented_ocean_trader", folder: "kaishin", region: "kaishin" }, { familyName: "Eastern Patrol Ship", key: "eastern_patrol_ship", folder: "kaishin", region: "kaishin" }, { familyName: "Iron Crane Experimental Ship", key: "iron_crane_experimental_ship", folder: "kaishin", region: "kaishin" }, { familyName: "Imperial Heavy Warship", key: "imperial_heavy_warship", folder: "kaishin", region: "kaishin" },
    { familyName: "Strait Courier", key: "strait_courier", folder: "crossroads", region: "crossroads" }, { familyName: "Golden Strait Merchantman", key: "golden_strait_merchantman", folder: "crossroads", region: "crossroads" }, { familyName: "Fortress Escort", key: "fortress_escort", folder: "crossroads", region: "crossroads" },
    { familyName: "Shallow Smuggler", key: "shallow_smuggler", folder: "outer_isles", region: "outer_isles" }, { familyName: "Privateer Sloop", key: "privateer_sloop", folder: "outer_isles", region: "outer_isles" }, { familyName: "Boarding Brig", key: "boarding_brig", folder: "outer_isles", region: "outer_isles" }, { familyName: "Captured Frigate Refit", key: "captured_frigate_refit", folder: "outer_isles", region: "outer_isles" }, { familyName: "High Captain Flagship", key: "high_captain_flagship", folder: "outer_isles", region: "outer_isles" },
    { familyName: "Western Passage Survey Ship", key: "western_passage_survey_ship", folder: "explorer" }
];
const tokenAssetIds = (key) => ({ north: `ship.family.${key}.token.north`, east: `ship.family.${key}.token.east`, south: `ship.family.${key}.token.south`, west: `ship.family.${key}.token.west` });
export const SHIP_COMBAT_VISUALS = FAMILY_DEFINITIONS.map(family => { const tokens = tokenAssetIds(family.key); return { familyName: family.familyName, key: family.key, intactAssetId: `ship.family.${family.key}.intact`, tokenAssetId: tokens.north, tokenAssetIds: tokens, wreckedAssetId: `ship.family.${family.key}.wrecked` }; });
const normalize = (value) => (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const VISUAL_BY_FAMILY = new Map(SHIP_COMBAT_VISUALS.map(entry => [normalize(entry.familyName), entry]));
const RUNTIME_FAMILY_ALIASES = { "skeldran coastal sloop": "Fjord Cutter", "skeldran modern battle frigate": "Skeldran Frigate", "skeldran armed merchant": "North Sea Trader", "skeldran industrial coaster": "North Sea Trader", "skeldran fishing cutter": "Coastal Fishing Boat", "skeldran packet": "Fjord Cutter", "refitted coastal raider": "Privateer Sloop" };
const NAMED_SHIP_FAMILIES = { tideworn: "Fjord Cutter", stormcrow: "Skeldran Frigate", providence: "North Sea Trader", "ash gull": "Privateer Sloop", "iron finch": "North Sea Trader", "freyra s grace": "Coastal Fishing Boat", hearthward: "Fjord Cutter", "widow s mercy": undefined, "gilded knife": undefined };
export function shipHullVisualState(hull, hullMax) { const ratio = hullMax > 0 ? hull / hullMax : 0; if (ratio <= .20)
    return "wrecked"; if (ratio <= .50)
    return "damaged"; return "intact"; }
export function combatVisualRangeBand(rangeYards, shipsSecured = false) { if (shipsSecured || rangeYards < 200)
    return "point-blank"; if (rangeYards < 500)
    return "close"; if (rangeYards < 1000)
    return "medium"; return "long"; }
export function shipCombatVisualSet(familyName, shipName) { const namedFamily = NAMED_SHIP_FAMILIES[normalize(shipName)]; const requestedFamily = namedFamily ?? RUNTIME_FAMILY_ALIASES[normalize(familyName)] ?? familyName; return VISUAL_BY_FAMILY.get(normalize(requestedFamily)); }
export function shipCombatAssetId(set, state) { if (!set)
    return undefined; if (state === "wrecked")
    return set.wreckedAssetId; if (state === "damaged" && set.damagedAssetId)
    return set.damagedAssetId; return set.intactAssetId; }
export function shipTokenAssetId(set, direction) { return set?.tokenAssetIds[direction]; }
const segmentDistanceSquared = (point, start, end) => { const dx = end.x - start.x, dy = end.y - start.y, lengthSquared = dx * dx + dy * dy; if (lengthSquared <= 0)
    return (point.x - start.x) ** 2 + (point.y - start.y) ** 2; const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)); return (point.x - (start.x + t * dx)) ** 2 + (point.y - (start.y + t * dy)) ** 2; };
export function shipDirectionForRoute(path, currentPosition) { if (path.length < 2)
    return "north"; let segmentIndex = 0; if (currentPosition) {
    let best = Number.POSITIVE_INFINITY;
    for (let index = 0; index < path.length - 1; index += 1) {
        const distance = segmentDistanceSquared(currentPosition, path[index], path[index + 1]);
        if (distance < best) {
            best = distance;
            segmentIndex = index;
        }
    }
} const from = path[segmentIndex], to = path[segmentIndex + 1], dx = to.x - from.x, dy = to.y - from.y; if (Math.abs(dx) >= Math.abs(dy) && dx !== 0)
    return dx > 0 ? "east" : "west"; if (dy !== 0)
    return dy > 0 ? "south" : "north"; return "north"; }
const registryEntry = (family, assetId, displayName, type, subcategory, path, sourceMaster) => ({ assetId, displayName, type, category: "ship_art", subcategory, ...(family.region ? { region: family.region } : {}), tier: "B_REGIONAL_FAMILY", status: "PROVISIONAL", artStyleVersion: "EBBING_SHIP_FAMILY_PRODUCTION_1H", era: "628 CR", gameplayRole: type === "SHIP_TOKEN" ? ["navigation", "naval_combat", "ship_identity"] : ["naval_combat", "ship_identity"], artUsage: "content_art", visualAnchor: displayName, alphaPriority: "0.6D-production-1H-ship-art", path, sourceMaster, notes: "Approved Production 1H painted ship family art; presentation only, with no combat-math or save-schema changes." });
/* The supplied token masters were painted with their bow labels reversed by 180 degrees.
   Route semantics stay honest by resolving each logical heading to the matching painted bow. */
const CORRECTED_SOURCE_DIRECTION = { north: "south", east: "west", south: "north", west: "east" };
export const SHIP_COMBAT_ASSET_REGISTRY = FAMILY_DEFINITIONS.flatMap(family => { const base = `/art/ships/production1h/classes/${family.folder}/${family.key}`; const tokens = SHIP_DIRECTIONS.map(direction => registryEntry(family, `ship.family.${family.key}.token.${direction}`, `${family.familyName} — ${direction[0].toUpperCase()}${direction.slice(1)} Token`, "SHIP_TOKEN", "directional_navigation_token", `${base}/tokens/128/token_${CORRECTED_SOURCE_DIRECTION[direction]}.png`, `${family.key}/token_${direction}.png`)); return [registryEntry(family, `ship.family.${family.key}.intact`, `${family.familyName} — Combat Portrait`, "SHIP_REFERENCE", "combat_portrait", `${base}/portrait_pristine.webp`, `${family.key}/portrait_pristine.png`), registryEntry(family, `ship.family.${family.key}.wrecked`, `${family.familyName} — Wrecked / Sinking`, "SHIP_REFERENCE", "wreck_state", `${base}/portrait_wrecked.webp`, `${family.key}/portrait_wrecked.png`), ...tokens]; });
//# sourceMappingURL=shipCombatVisuals.js.map