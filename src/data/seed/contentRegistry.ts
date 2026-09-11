import type { CanonicalContentDefinition, ShipClassDefinition } from "../../game/content.js";
import type { EntityId } from "../../game/types.js";

/**
 * Alpha 0.6C canonical physical-world registry.
 * Source authority: Asset & Content Library Bible v0.1 plus accepted 0.6B→0.6C handoff.
 * Stable logical IDs are gameplay-facing; artwork may remain missing or provisional.
 */

export const SHIP_CLASS_DEFINITIONS: ShipClassDefinition[] = [
  {
    "id": "ship_class.common.harbor_skiff",
    "name": "Harbor Skiff",
    "region": "common",
    "role": "workboat",
    "doctrine": "Oars/small lug sail; fishing, ferrying, harbor jobs",
    "cruiseSpeedKnots": 3.5,
    "artNeed": "Token + small inspection art",
    "availabilityTags": [
      "common",
      "workboat"
    ],
    "buildTags": [
      "workboat",
      "common"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.common.coastal_fishing_boat",
    "name": "Coastal Fishing Boat",
    "region": "common",
    "role": "workboat",
    "doctrine": "Net storage, shallow draft, modest sail plan",
    "cruiseSpeedKnots": 4.5,
    "artNeed": "Token + inspection art",
    "availabilityTags": [
      "common",
      "workboat"
    ],
    "buildTags": [
      "workboat",
      "common"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.skeldra.fjord_cutter",
    "name": "Fjord Cutter",
    "region": "skeldra",
    "role": "fast_coastal",
    "doctrine": "Compact northern hull, strong weather handling, cutter-like rig",
    "cruiseSpeedKnots": 5.25,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "skeldra",
      "fast_coastal"
    ],
    "buildTags": [
      "fast_coastal",
      "skeldra"
    ],
    "attunement": "neutral",
    "artStatus": "provisional",
    "inspectionAssetId": "ship.skeldra.coastal_sloop.reference",
    "tokenAssetId": "ship.skeldra.coastal_sloop.token"
  },
  {
    "id": "ship_class.skeldra.north_sea_trader",
    "name": "North Sea Trader",
    "region": "skeldra",
    "role": "merchant",
    "doctrine": "Broad durable hull, cargo-first, cold-weather deckhouse",
    "cruiseSpeedKnots": 5,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "skeldra",
      "merchant"
    ],
    "buildTags": [
      "merchant",
      "skeldra"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.skeldra.royal_sloop",
    "name": "Royal Sloop",
    "region": "skeldra",
    "role": "naval_patrol",
    "doctrine": "Fast patrol ship, heavier scantlings, practical gun deck",
    "cruiseSpeedKnots": 6.5,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "skeldra",
      "naval_patrol"
    ],
    "buildTags": [
      "naval_patrol",
      "skeldra"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.skeldra.skeldran_frigate",
    "name": "Skeldran Frigate",
    "region": "skeldra",
    "role": "warship",
    "doctrine": "Broad heavy frigate, rough-weather stability, substantial battery",
    "cruiseSpeedKnots": 6,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "skeldra",
      "warship"
    ],
    "buildTags": [
      "warship",
      "skeldra"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.skeldra.skeldran_heavy_warship",
    "name": "Skeldran Heavy Warship",
    "region": "skeldra",
    "role": "capital_warship",
    "doctrine": "Durable, heavily armed, slower, prestige navy silhouette",
    "cruiseSpeedKnots": 4.75,
    "artNeed": "Hero art + token",
    "availabilityTags": [
      "skeldra",
      "capital_warship"
    ],
    "buildTags": [
      "capital_warship",
      "skeldra"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.skeldra.steam_assisted_experimental_frigate",
    "name": "Steam-Assisted Experimental Frigate",
    "region": "skeldra",
    "role": "industrial_special",
    "doctrine": "Sails plus early pressure machinery/pumps/auxiliary propulsion",
    "cruiseSpeedKnots": 6.25,
    "artNeed": "Hero art + token",
    "availabilityTags": [
      "skeldra",
      "industrial_special"
    ],
    "buildTags": [
      "industrial_special",
      "skeldra"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.asteria.island_felucca",
    "name": "Island Felucca",
    "region": "asteria",
    "role": "coastal",
    "doctrine": "Graceful warm-water craft, lateen-dominant, low profile",
    "cruiseSpeedKnots": 6.5,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "asteria",
      "coastal"
    ],
    "buildTags": [
      "coastal",
      "asteria"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.asteria.asterian_merchant_galley_sailer",
    "name": "Asterian Merchant Galley-Sailer",
    "region": "asteria",
    "role": "merchant",
    "doctrine": "Longer hull, mixed rig, efficient island/coastal movement",
    "cruiseSpeedKnots": 5.75,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "asteria",
      "merchant"
    ],
    "buildTags": [
      "merchant",
      "asteria"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.asteria.league_corvette",
    "name": "League Corvette",
    "region": "asteria",
    "role": "naval_patrol",
    "doctrine": "Fast, elegant, maneuverable, moderate armament",
    "cruiseSpeedKnots": 6.75,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "asteria",
      "naval_patrol"
    ],
    "buildTags": [
      "naval_patrol",
      "asteria"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.asteria.asterian_frigate",
    "name": "Asterian Frigate",
    "region": "asteria",
    "role": "warship",
    "doctrine": "Long low hull, mixed rig, Arcane-friendly layout",
    "cruiseSpeedKnots": 6.25,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "asteria",
      "warship"
    ],
    "buildTags": [
      "warship",
      "asteria"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.asteria.wardship",
    "name": "Wardship",
    "region": "asteria",
    "role": "arcane_special",
    "doctrine": "Ritual spaces, ward anchors, spirit-sail compatibility",
    "cruiseSpeedKnots": 6.25,
    "artNeed": "Hero art + token",
    "availabilityTags": [
      "asteria",
      "arcane_special"
    ],
    "buildTags": [
      "arcane_special",
      "asteria"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.asteria.arcane_heavy_cruiser",
    "name": "Arcane Heavy Cruiser",
    "region": "asteria",
    "role": "capital_arcane",
    "doctrine": "Large prestige warship built around wards and ritual navigation rather than machinery",
    "cruiseSpeedKnots": 5.5,
    "artNeed": "Hero art + token",
    "availabilityTags": [
      "asteria",
      "capital_arcane"
    ],
    "buildTags": [
      "capital_arcane",
      "asteria"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.serath.coastal_dhow_sailer",
    "name": "Coastal Dhow-Sailer",
    "region": "serath",
    "role": "coastal_trader",
    "doctrine": "Lateen-influenced efficient warm-water merchant craft",
    "cruiseSpeedKnots": 6.25,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "serath",
      "coastal_trader"
    ],
    "buildTags": [
      "coastal_trader",
      "serath"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.serath.pilgrim_carrier",
    "name": "Pilgrim Carrier",
    "region": "serath",
    "role": "passenger_merchant",
    "doctrine": "Sheltered deck spaces, water stores, shrine/prayer accommodation",
    "cruiseSpeedKnots": 5.25,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "serath",
      "passenger_merchant"
    ],
    "buildTags": [
      "passenger_merchant",
      "serath"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.serath.corsair_xebec_type",
    "name": "Corsair Xebec-Type",
    "region": "serath",
    "role": "pursuit",
    "doctrine": "Fast narrow hull, lateen/mixed rig, pursuit/raiding role",
    "cruiseSpeedKnots": 7,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "serath",
      "pursuit"
    ],
    "buildTags": [
      "pursuit",
      "serath"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.serath.royal_escort_frigate",
    "name": "Royal Escort Frigate",
    "region": "serath",
    "role": "warship",
    "doctrine": "Balanced convoy escort, speed and disciplined gunnery",
    "cruiseSpeedKnots": 6.5,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "serath",
      "warship"
    ],
    "buildTags": [
      "warship",
      "serath"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.serath.covenant_relief_ship",
    "name": "Covenant Relief Ship",
    "region": "serath",
    "role": "support",
    "doctrine": "Food, medicine, refugee/pilgrim transport, modest defenses",
    "cruiseSpeedKnots": 5,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "serath",
      "support"
    ],
    "buildTags": [
      "support",
      "serath"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.kaishin.river_sea_junk_type",
    "name": "River-Sea Junk-Type",
    "region": "kaishin",
    "role": "coastal_merchant",
    "doctrine": "Battened sails, shallow-to-medium draft, organized cargo",
    "cruiseSpeedKnots": 5,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "kaishin",
      "coastal_merchant"
    ],
    "buildTags": [
      "coastal_merchant",
      "kaishin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.kaishin.compartmented_ocean_trader",
    "name": "Compartmented Ocean Trader",
    "region": "kaishin",
    "role": "merchant",
    "doctrine": "Large cargo hull with strong internal subdivision",
    "cruiseSpeedKnots": 4.75,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "kaishin",
      "merchant"
    ],
    "buildTags": [
      "merchant",
      "kaishin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.kaishin.eastern_patrol_ship",
    "name": "Eastern Patrol Ship",
    "region": "kaishin",
    "role": "naval_patrol",
    "doctrine": "Efficient battened rig, organized deck, disciplined missile/gun positions",
    "cruiseSpeedKnots": 6,
    "artNeed": "Unique regional token/art",
    "availabilityTags": [
      "kaishin",
      "naval_patrol"
    ],
    "buildTags": [
      "naval_patrol",
      "kaishin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.kaishin.iron_crane_experimental_ship",
    "name": "Iron Crane Experimental Ship",
    "region": "kaishin",
    "role": "industrial_test",
    "doctrine": "Foreign machinery trial integrated cautiously into Eastern hull doctrine",
    "cruiseSpeedKnots": 5.25,
    "artNeed": "Hero art + token",
    "availabilityTags": [
      "kaishin",
      "industrial_test"
    ],
    "buildTags": [
      "industrial_test",
      "kaishin"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.kaishin.imperial_heavy_warship",
    "name": "Imperial Heavy Warship",
    "region": "kaishin",
    "role": "capital_warship",
    "doctrine": "Stable, compartmented, defensive, high crew organization",
    "cruiseSpeedKnots": 4.5,
    "artNeed": "Hero art + token",
    "availabilityTags": [
      "kaishin",
      "capital_warship"
    ],
    "buildTags": [
      "capital_warship",
      "kaishin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.crossroads.strait_courier",
    "name": "Strait Courier",
    "region": "crossroads",
    "role": "courier",
    "doctrine": "Fast mixed-origin rig, narrow route-specialist",
    "cruiseSpeedKnots": 7,
    "artNeed": "Unique token/art",
    "availabilityTags": [
      "crossroads",
      "courier"
    ],
    "buildTags": [
      "courier",
      "crossroads"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.crossroads.golden_strait_merchantman",
    "name": "Golden Strait Merchantman",
    "region": "crossroads",
    "role": "merchant",
    "doctrine": "Cosmopolitan cargo ship, strong defensive fit",
    "cruiseSpeedKnots": 5.25,
    "artNeed": "Unique token/art",
    "availabilityTags": [
      "crossroads",
      "merchant"
    ],
    "buildTags": [
      "merchant",
      "crossroads"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.crossroads.fortress_escort",
    "name": "Fortress Escort",
    "region": "crossroads",
    "role": "naval",
    "doctrine": "Short-range heavy escort optimized around forts and strait intelligence",
    "cruiseSpeedKnots": 5.5,
    "artNeed": "Unique token/art",
    "availabilityTags": [
      "crossroads",
      "naval"
    ],
    "buildTags": [
      "naval",
      "crossroads"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.outer_isles.shallow_smuggler",
    "name": "Shallow Smuggler",
    "region": "outer_isles",
    "role": "smuggler",
    "doctrine": "Very shallow draft, hidden storage, speed",
    "cruiseSpeedKnots": 6.75,
    "artNeed": "Unique token/art",
    "availabilityTags": [
      "outer_isles",
      "smuggler"
    ],
    "buildTags": [
      "smuggler",
      "outer_isles"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.outer_isles.privateer_sloop",
    "name": "Privateer Sloop",
    "region": "outer_isles",
    "role": "raider",
    "doctrine": "Fast flexible captured/refitted family",
    "cruiseSpeedKnots": 6,
    "artNeed": "Unique token/art",
    "availabilityTags": [
      "outer_isles",
      "raider"
    ],
    "buildTags": [
      "raider",
      "outer_isles"
    ],
    "attunement": "neutral",
    "artStatus": "provisional",
    "inspectionAssetId": "ship.outer_isles.raider.reference",
    "tokenAssetId": "ship.outer_isles.raider.token"
  },
  {
    "id": "ship_class.outer_isles.boarding_brig",
    "name": "Boarding Brig",
    "region": "outer_isles",
    "role": "pirate",
    "doctrine": "Crew-heavy, grappling/boarding biased, mixed weapons",
    "cruiseSpeedKnots": 5.5,
    "artNeed": "Unique token/art",
    "availabilityTags": [
      "outer_isles",
      "pirate"
    ],
    "buildTags": [
      "pirate",
      "outer_isles"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.outer_isles.captured_frigate_refit",
    "name": "Captured Frigate Refit",
    "region": "outer_isles",
    "role": "pirate_heavy",
    "doctrine": "Foreign frigate modified with mismatched repairs and boarding emphasis",
    "cruiseSpeedKnots": 5.25,
    "artNeed": "Unique token/art",
    "availabilityTags": [
      "outer_isles",
      "pirate_heavy"
    ],
    "buildTags": [
      "pirate_heavy",
      "outer_isles"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.outer_isles.high_captain_flagship",
    "name": "High Captain Flagship",
    "region": "outer_isles",
    "role": "prestige_pirate",
    "doctrine": "Unique named-ship category; no standard pirate-castle silhouette",
    "cruiseSpeedKnots": 5.25,
    "artNeed": "Hero art + token",
    "availabilityTags": [
      "outer_isles",
      "prestige_pirate"
    ],
    "buildTags": [
      "prestige_pirate",
      "outer_isles"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "ship_class.explorer.western_passage_survey_ship",
    "name": "Western Passage Survey Ship",
    "region": "explorer",
    "role": "exploration",
    "doctrine": "Extra stores, boats, chart room, reinforced rigging",
    "cruiseSpeedKnots": 5.25,
    "artNeed": "Unique token/art",
    "availabilityTags": [
      "explorer",
      "exploration"
    ],
    "buildTags": [
      "exploration",
      "explorer"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  }
];

export const LEGACY_SHIP_CLASS_ALIASES: Record<EntityId, EntityId> = {
  "ship_class.skeldran_coastal_sloop": "ship_class.skeldra.fjord_cutter",
  "ship_class.skeldran_modern_battle_frigate": "ship_class.skeldra.skeldran_frigate",
  "ship_class.skeldran_armed_merchant": "ship_class.skeldra.north_sea_trader",
  "ship_class.refitted_coastal_raider": "ship_class.outer_isles.privateer_sloop",
  "ship_class.skeldran_industrial_coaster": "ship_class.skeldra.north_sea_trader",
  "ship_class.skeldran_fishing_cutter": "ship_class.common.coastal_fishing_boat",
  "ship_class.skeldran_packet": "ship_class.skeldra.north_sea_trader"
};

export const CONTENT_DEFINITIONS: CanonicalContentDefinition[] = [
  {
    "id": "content.weapon.common.boarding_knife",
    "name": "Boarding knife",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "item.weapon.common_utility_dagger",
    "name": "Utility dagger",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "approved",
    "iconAssetId": "item.weapon.common_utility_dagger"
  },
  {
    "id": "content.weapon.common.sailors_cutlass",
    "name": "Sailor's cutlass",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.common.straight_naval_saber",
    "name": "Straight naval saber",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "item.weapon.common_boarding_axe",
    "name": "Boarding axe",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "approved",
    "iconAssetId": "item.weapon.common_boarding_axe"
  },
  {
    "id": "content.weapon.common.belaying_club_improvised_cudgel",
    "name": "Belaying club / improvised cudgel",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.common.single_shot_flintlock_pistol",
    "name": "Single-shot flintlock pistol",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "licensed",
    "availabilityTags": [
      "common",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.common.naval_carbine",
    "name": "Naval carbine",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "licensed",
    "availabilityTags": [
      "common",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.common.long_musket",
    "name": "Long musket",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "licensed",
    "availabilityTags": [
      "common",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.common.fowling_piece",
    "name": "Fowling piece",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "licensed",
    "availabilityTags": [
      "common",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.common.officers_brace_of_pistols",
    "name": "Officer's brace of pistols",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "licensed",
    "availabilityTags": [
      "common",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.common.simple_hunting_bow",
    "name": "Simple hunting bow",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.common.crossbow_in_older_local_use",
    "name": "Crossbow in older/local use",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "common",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.skeldra.skeldran_bearded_boarding_axe",
    "name": "Skeldran bearded boarding axe",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.skeldra.heavy_ship_axe",
    "name": "Heavy ship axe",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.skeldra.northern_service_saber",
    "name": "Northern service saber",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.skeldra.long_fighting_knife_with_seax_descended_proportions",
    "name": "Long fighting knife with seax-descended proportions",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.skeldra.marine_hanger",
    "name": "Marine hanger",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.skeldra.cold_weather_naval_pistol",
    "name": "Cold-weather naval pistol",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "skeldra",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.skeldra.heavy_naval_musket",
    "name": "Heavy naval musket",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "skeldra",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.skeldra.industrial_precision_pistol",
    "name": "Industrial precision pistol",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "skeldra",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.skeldra.foundry_made_bayonet",
    "name": "Foundry-made bayonet",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.skeldra.rune_marked_oath_blade",
    "name": "Rune-marked oath blade",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.asteria.asterian_rapier",
    "name": "Asterian rapier",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.asteria.side_sword_naval_dueling_sword",
    "name": "Side-sword / naval dueling sword",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.asteria.elegant_maritime_saber",
    "name": "Elegant maritime saber",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.asteria.parrying_dagger",
    "name": "Parrying dagger",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.asteria.academy_dueling_blade",
    "name": "Academy dueling blade",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.asteria.civic_officer_spear",
    "name": "Civic officer spear",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.asteria.compact_flintlock_pistol",
    "name": "Compact flintlock pistol",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "asteria",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.asteria.arcane_duelist_focus_blade",
    "name": "Arcane duelist focus-blade",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.asteria.ward_etched_shield_buckler",
    "name": "Ward-etched shield/buckler",
    "category": "armor",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "armor",
      "regional_weapon"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.asteria.ritual_staff_or_focus_rod",
    "name": "Ritual staff or focus rod",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "asteria",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.serath.curved_cavalry_naval_saber",
    "name": "Curved cavalry/naval saber",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.serath.broad_merchant_guard_saber",
    "name": "Broad merchant guard saber",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.serath.warm_climate_boarding_blade",
    "name": "Warm-climate boarding blade",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.serath.straight_service_sword",
    "name": "Straight service sword",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.serath.decorated_utility_dagger",
    "name": "Decorated utility dagger",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.serath.long_barreled_trade_musket",
    "name": "Long-barreled trade musket",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "serath",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.serath.compact_officer_pistol",
    "name": "Compact officer pistol",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "serath",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.serath.guard_spear",
    "name": "Guard spear",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.serath.pilgrim_staff",
    "name": "Pilgrim staff",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.serath.ceremonial_covenant_sword",
    "name": "Ceremonial Covenant sword",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "serath",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.kaishin.single_edged_dao_like_naval_sword",
    "name": "Single-edged dao-like naval sword",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.kaishin.jian_like_officer_scholar_sword",
    "name": "Jian-like officer/scholar sword",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.kaishin.curved_long_sword",
    "name": "Curved long sword",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.kaishin.short_utility_blade",
    "name": "Short utility blade",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.kaishin.spear",
    "name": "Spear",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.kaishin.polearm_glaive_family",
    "name": "Polearm / glaive family",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.kaishin.composite_or_laminated_bow",
    "name": "Composite or laminated bow",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.kaishin.match_flint_firearm_adapted_to_local_stocks",
    "name": "Match/flint firearm adapted to local stocks",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "kaishin",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.kaishin.officer_pistol_imported_refined_locally",
    "name": "Officer pistol imported/refined locally",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "kaishin",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.kaishin.lacquered_guard_baton",
    "name": "Lacquered guard baton",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.crossroads.strait_guard_saber",
    "name": "Strait guard saber",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.crossroads.merchant_rapier",
    "name": "Merchant rapier",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.crossroads.curved_boarding_saber",
    "name": "Curved boarding saber",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.crossroads.civic_dagger",
    "name": "Civic dagger",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.crossroads.fortress_musket",
    "name": "Fortress musket",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "crossroads",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.crossroads.diplomatic_officer_pistol",
    "name": "Diplomatic officer pistol",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "crossroads",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.crossroads.mixed_asterian_serathi_dueling_sword",
    "name": "Mixed Asterian-Serathi dueling sword",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.outer_isles.captured_cutlass",
    "name": "Captured cutlass",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.outer_isles.machete_like_clearing_boarding_blade",
    "name": "Machete-like clearing/boarding blade",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.outer_isles.sailmakers_knife_used_as_weapon",
    "name": "Sailmaker's knife used as weapon",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.outer_isles.boarding_hatchet",
    "name": "Boarding hatchet",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.outer_isles.mixed_origin_saber",
    "name": "Mixed-origin saber",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.outer_isles.short_boarding_pike",
    "name": "Short boarding pike",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.outer_isles.cheap_trade_pistol",
    "name": "Cheap trade pistol",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "outer_isles",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.outer_isles.sawed_short_ship_musket",
    "name": "Sawed/short ship musket",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "outer_isles",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.firearm.outer_isles.fine_captured_officer_pistol",
    "name": "Fine captured officer pistol",
    "category": "firearm",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "outer_isles",
      "firearm",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.outer_isles.improvised_club",
    "name": "Improvised club",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.weapon.outer_isles.whaler_fishing_spear",
    "name": "Whaler/fishing spear",
    "category": "weapon",
    "subcategory": "regional_weapon",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "regional_weapon"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "weapon",
      "regional_weapon"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "item.weapon.skeldran_naval_saber",
    "name": "Skeldran Naval Saber",
    "category": "weapon",
    "subcategory": "naval_saber",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "naval_saber"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "weapon",
      "naval_saber"
    ],
    "attunement": "neutral",
    "artStatus": "approved",
    "iconAssetId": "item.weapon.skeldran_naval_saber"
  },
  {
    "id": "item.weapon.skeldran_naval_pistol",
    "name": "Skeldran Naval Pistol",
    "category": "firearm",
    "subcategory": "naval_pistol",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "naval_pistol"
    ],
    "marketTypes": [
      "weaponsmith",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "licensed",
    "availabilityTags": [
      "skeldra",
      "firearm",
      "naval_pistol"
    ],
    "attunement": "neutral",
    "artStatus": "approved",
    "iconAssetId": "item.weapon.skeldran_naval_pistol"
  },
  {
    "id": "content.clothing.common.sailor_shirt",
    "name": "Sailor shirt",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "common",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.common.work_trousers",
    "name": "Work trousers",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "common",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.common.canvas_oilskin_over_trousers",
    "name": "Canvas/oilskin over-trousers",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "common",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.common.sea_coat",
    "name": "Sea coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "common",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.common.short_work_jacket",
    "name": "Short work jacket",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "common",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.common.knit_watch_cap",
    "name": "Knit/watch cap",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "common",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.common.broad_hat",
    "name": "Broad hat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "common",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.common.deck_boots",
    "name": "Deck boots",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "common",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.common.soft_shoes",
    "name": "Soft shoes",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "common",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.common.leather_belt_and_pouch",
    "name": "Leather belt and pouch",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "common",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "item.armor.common_reinforced_jack",
    "name": "Padded/reinforced jack",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "common",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "approved",
    "iconAssetId": "item.armor.common_reinforced_jack"
  },
  {
    "id": "item.armor.common_brigandine",
    "name": "Brigandine/concealed-plate coat",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "common",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "approved",
    "iconAssetId": "item.armor.common_brigandine"
  },
  {
    "id": "item.armor.naval_breastplate",
    "name": "Naval breastplate",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "common",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "approved",
    "iconAssetId": "item.armor.naval_breastplate"
  },
  {
    "id": "content.clothing.skeldra.cold_weather_sailor_coat",
    "name": "Cold-weather sailor coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.skeldra.northern_wool_overshirt",
    "name": "Northern wool overshirt",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.skeldra.skeldran_naval_coat",
    "name": "Skeldran naval coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.skeldra.naval_officer_captain_coat_with_restrained_ancestral_embroidery",
    "name": "Naval officer/captain coat with restrained ancestral embroidery",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.skeldra.marine_coat",
    "name": "Marine coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.skeldra.shipwright_apron_jacket",
    "name": "Shipwright apron/jacket",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.skeldra.industrial_worker_coat",
    "name": "Industrial worker coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.skeldra.prosperous_merchant_coat",
    "name": "Prosperous merchant coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.skeldra.old_gods_priest_seer_garments",
    "name": "Old Gods priest/seer garments",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.skeldra.cold_weather_civilian_layers",
    "name": "Cold-weather civilian layers",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.skeldra.marine_armor_over_padded_wool",
    "name": "Marine armor over padded wool",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.asteria.warm_climate_sailor_vest_jacket",
    "name": "Warm-climate sailor vest/jacket",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "asteria",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.asteria.light_naval_trousers",
    "name": "Light naval trousers",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "asteria",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.asteria.asterian_officer_duelist_jacket",
    "name": "Asterian officer/duelist jacket",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "asteria",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.asteria.scholar_academy_coat",
    "name": "Scholar-academy coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "asteria",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.asteria.arcane_practitioner_coat_vest_with_focus_attachments",
    "name": "Arcane practitioner coat/vest with focus attachments",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "asteria",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.asteria.civic_elite_tailoring",
    "name": "Civic elite tailoring",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "asteria",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.asteria.merchant_layers",
    "name": "Merchant layers",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "asteria",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.asteria.temple_attendant_garments",
    "name": "Temple attendant garments",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "asteria",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.asteria.light_duelist_protection",
    "name": "Light duelist protection",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "asteria",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.asteria.ordinary_warm_climate_civilian_dress",
    "name": "Ordinary warm-climate civilian dress",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "asteria",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.serath.light_sailor_tunic_jacket",
    "name": "Light sailor tunic/jacket",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "serath",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.serath.wrapped_sash_and_practical_trousers",
    "name": "Wrapped sash and practical trousers",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "serath",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.serath.merchant_travel_coat_kaftan_derived_garment",
    "name": "Merchant travel coat/kaftan-derived garment",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "serath",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.serath.royal_naval_officer_coat_with_eastern_mediterranean_cut",
    "name": "Royal naval officer coat with eastern Mediterranean cut",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "serath",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.serath.pilgrim_cloak",
    "name": "Pilgrim cloak",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "serath",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.serath.covenant_clerical_robes_by_rank",
    "name": "Covenant clerical robes by rank",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "serath",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.serath.monastic_work_garments",
    "name": "Monastic work garments",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "serath",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.serath.warm_weather_guard_armor",
    "name": "Warm-weather guard armor",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "serath",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.serath.urban_artisan_clothing",
    "name": "Urban artisan clothing",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "serath",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.serath.prosperous_trade_family_dress",
    "name": "Prosperous trade-family dress",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "serath",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.kaishin.maritime_wrap_front_jacket",
    "name": "Maritime wrap-front jacket",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.kaishin.wide_practical_trousers",
    "name": "Wide practical trousers",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.kaishin.layered_civilian_robe",
    "name": "Layered civilian robe",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.kaishin.short_naval_officer_coat",
    "name": "Short naval officer coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.kaishin.lacquered_rain_cape",
    "name": "Lacquered rain cape",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.kaishin.bureaucratic_formal_robe",
    "name": "Bureaucratic formal robe",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.kaishin.merchant_jacket",
    "name": "Merchant jacket",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.kaishin.monastic_robe",
    "name": "Monastic robe",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.kaishin.lamellar_brigandine_derived_marine_armor",
    "name": "Lamellar/brigandine-derived marine armor",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.kaishin.cold_coastal_layered_outfit",
    "name": "Cold coastal layered outfit",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.crossroads.strait_sailor_jacket",
    "name": "Strait sailor jacket",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.crossroads.cosmopolitan_merchant_coat",
    "name": "Cosmopolitan merchant coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.crossroads.fortress_guard_uniform",
    "name": "Fortress guard uniform",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.crossroads.court_diplomatic_coat",
    "name": "Court/diplomatic coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.crossroads.mixed_faith_civic_elite_clothing",
    "name": "Mixed-faith civic elite clothing",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.crossroads.warehouse_worker_clothing",
    "name": "Warehouse worker clothing",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.crossroads.imported_shawls_and_sashes_used_with_local_dress",
    "name": "Imported shawls and sashes used with local dress",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "crossroads",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.outer_isles.sun_faded_sailor_shirt",
    "name": "Sun-faded sailor shirt",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.outer_isles.patched_canvas_trousers",
    "name": "Patched canvas trousers",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.outer_isles.loose_tropical_work_shirt",
    "name": "Loose tropical work shirt",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.outer_isles.captured_naval_coat",
    "name": "Captured naval coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.outer_isles.privateer_captain_coat",
    "name": "Privateer captain coat",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.outer_isles.smuggler_vest_with_hidden_pockets",
    "name": "Smuggler vest with hidden pockets",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.outer_isles.dockworker_clothes",
    "name": "Dockworker clothes",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.outer_isles.improvised_rain_cape",
    "name": "Improvised rain cape",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.clothing.outer_isles.wealthy_pirate_mixed_origin_outfit",
    "name": "Wealthy pirate mixed-origin outfit",
    "category": "clothing",
    "subcategory": "maritime_clothing",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "maritime_clothing"
    ],
    "marketTypes": [
      "outfitter",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "clothing",
      "maritime_clothing"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.outer_isles.light_boarding_protection",
    "name": "Light boarding protection",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.armor.outer_isles.repurposed_military_breastplate",
    "name": "Repurposed military breastplate",
    "category": "armor",
    "subcategory": "protective_wear",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "protective_wear"
    ],
    "marketTypes": [
      "armorer",
      "outfitter"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "outer_isles",
      "armor",
      "protective_wear"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.magnetic_compass",
    "name": "Magnetic compass",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.astrolabe_derived_instrument",
    "name": "Astrolabe-derived instrument",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.cross_staff_backstaff_family",
    "name": "Cross-staff/backstaff family",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "item.tool.calibrated_sextant",
    "name": "Sextant-like precision instrument",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.lead_line",
    "name": "Lead line",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.log_line",
    "name": "Log line",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.parallel_rules",
    "name": "Parallel rules",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.dividers",
    "name": "Dividers",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.chart_case",
    "name": "Chart case",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.chronometer_like_experimental_timekeeper",
    "name": "Chronometer-like experimental timekeeper",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "rare",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.arcane_resonance_compass",
    "name": "Arcane resonance compass",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.weather_glass_barometer",
    "name": "Weather glass/barometer",
    "category": "tool",
    "subcategory": "navigation",
    "originRegion": "common",
    "gameplayRoles": [
      "navigation"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "navigation"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.caulking_mallet",
    "name": "Caulking mallet",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.shipwright_adze",
    "name": "Shipwright adze",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.carpenter_saw",
    "name": "Carpenter saw",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.auger",
    "name": "Auger",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.brace_and_bit",
    "name": "Brace and bit",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.marlinspike",
    "name": "Marlinspike",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.fid",
    "name": "Fid",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.sailmaker_palm",
    "name": "Sailmaker palm",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.needles",
    "name": "Needles",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.rigging_knife",
    "name": "Rigging knife",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.block_and_tackle",
    "name": "Block and tackle",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.pitch_pot",
    "name": "Pitch pot",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.pump_tools",
    "name": "Pump tools",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.portable_forge_kit",
    "name": "Portable forge kit",
    "category": "tool",
    "subcategory": "shipwright_sailor",
    "originRegion": "common",
    "gameplayRoles": [
      "shipwright_sailor"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "shipwright_sailor"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.surgical_knife",
    "name": "Surgical knife",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.bone_saw",
    "name": "Bone saw",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.forceps",
    "name": "Forceps",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.needle_and_sutures",
    "name": "Needle and sutures",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.bandage_roll",
    "name": "Bandage roll",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.herbal_kit",
    "name": "Herbal kit",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.cupping_older_medical_tools",
    "name": "Cupping/older medical tools",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.alcohol_antiseptic_spirits",
    "name": "Alcohol/antiseptic spirits",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.field_splint",
    "name": "Field splint",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.physician_case",
    "name": "Physician case",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.arcane_healing_focus",
    "name": "Arcane healing focus",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.industrial_prosthetic_fitting_tools",
    "name": "Industrial prosthetic fitting tools",
    "category": "tool",
    "subcategory": "medicine",
    "originRegion": "common",
    "gameplayRoles": [
      "medicine"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "medicine"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.merchant_scales",
    "name": "Merchant scales",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.weights",
    "name": "Weights",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.counting_board",
    "name": "Counting board",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.ledger",
    "name": "Ledger",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.seal_press",
    "name": "Seal press",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.wax_seals",
    "name": "Wax seals",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.lockbox",
    "name": "Lockbox",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.measuring_rod",
    "name": "Measuring rod",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.cargo_stamps",
    "name": "Cargo stamps",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.customs_tags",
    "name": "Customs tags",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.writing_kit",
    "name": "Writing kit",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.portable_abacus_counting_frame",
    "name": "Portable abacus/counting frame",
    "category": "tool",
    "subcategory": "trade_admin",
    "originRegion": "common",
    "gameplayRoles": [
      "trade_admin"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "trade_admin"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.blacksmith_hammer",
    "name": "Blacksmith hammer",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.tongs",
    "name": "Tongs",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.file_set",
    "name": "File set",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.calipers",
    "name": "Calipers",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.machinist_gauge",
    "name": "Machinist gauge",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.gear_puller",
    "name": "Gear puller",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.pressure_gauge",
    "name": "Pressure gauge",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.valve_tools",
    "name": "Valve tools",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.precision_screwdriver_set",
    "name": "Precision screwdriver set",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.drafting_instruments",
    "name": "Drafting instruments",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.chemical_glassware",
    "name": "Chemical glassware",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.surveyor_level",
    "name": "Surveyor level",
    "category": "tool",
    "subcategory": "craft_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "craft_industry"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "craft_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.focus_ring",
    "name": "Focus ring",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.focus_bracer",
    "name": "Focus bracer",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.ritual_lens",
    "name": "Ritual lens",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.chalk_ink_geometry_kit",
    "name": "Chalk/ink geometry kit",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.incense_burner",
    "name": "Incense burner",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.rune_carving_tools",
    "name": "Rune carving tools",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.consecrated_cord",
    "name": "Consecrated cord",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.crystal_resonator",
    "name": "Crystal resonator",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.memory_bowl",
    "name": "Memory bowl",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.ward_stakes",
    "name": "Ward stakes",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.symbol_stamps",
    "name": "Symbol stamps",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.tool.common.protective_gloves_for_reagents",
    "name": "Protective gloves for reagents",
    "category": "tool",
    "subcategory": "arcane_ritual",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane_ritual"
    ],
    "marketTypes": [
      "general_market",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "tool",
      "arcane_ritual"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.hull_reinforcement",
    "name": "Hull reinforcement",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.copper_anti_fouling_treatment_analogue",
    "name": "Copper/anti-fouling treatment analogue",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.storm_braces",
    "name": "Storm braces",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.reinforced_mast",
    "name": "Reinforced mast",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.light_racing_spars",
    "name": "Light racing spars",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.standard_square_sail_set",
    "name": "Standard square sail set",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.lateen_sail_set",
    "name": "Lateen sail set",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.battened_sail_set",
    "name": "Battened sail set",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.storm_sail_kit",
    "name": "Storm sail kit",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.fine_rope_rigging",
    "name": "Fine rope/rigging",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.hidden_smuggler_compartments",
    "name": "Hidden smuggler compartments",
    "category": "ship_module",
    "subcategory": "hull_rig",
    "originRegion": "common",
    "gameplayRoles": [
      "hull_rig"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "hull_rig"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.light_swivel_gun",
    "name": "Light swivel gun",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.light_cannon",
    "name": "Light cannon",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.medium_naval_gun",
    "name": "Medium naval gun",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.heavy_naval_gun",
    "name": "Heavy naval gun",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "military_only",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.carronade_like_short_heavy_gun",
    "name": "Carronade-like short heavy gun",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.chaser_gun",
    "name": "Chaser gun",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.round_shot",
    "name": "Round shot",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.chain_shot",
    "name": "Chain shot",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.grape_shot",
    "name": "Grape shot",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.incendiary_shot",
    "name": "Incendiary shot",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.explosive_shell",
    "name": "Explosive shell",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "military_only",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.arcane_charged_ammunition",
    "name": "Arcane-charged ammunition",
    "category": "ship_module",
    "subcategory": "gunnery",
    "originRegion": "common",
    "gameplayRoles": [
      "gunnery"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "military_only",
    "availabilityTags": [
      "common",
      "ship_module",
      "gunnery"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.manual_bilge_pump",
    "name": "Manual bilge pump",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.improved_chain_pump",
    "name": "Improved chain pump",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.industrial_pressure_pump",
    "name": "Industrial pressure pump",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.fire_buckets",
    "name": "Fire buckets",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.sand_barrels",
    "name": "Sand barrels",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.repair_timber",
    "name": "Repair timber",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.spare_sail_rigging",
    "name": "Spare sail/rigging",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.magazine_insulation",
    "name": "Magazine insulation",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.emergency_steering_rig",
    "name": "Emergency steering rig",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.medical_station",
    "name": "Medical station",
    "category": "ship_module",
    "subcategory": "damage_control",
    "originRegion": "common",
    "gameplayRoles": [
      "damage_control"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "damage_control"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.grappling_hooks",
    "name": "Grappling hooks",
    "category": "ship_module",
    "subcategory": "boarding",
    "originRegion": "common",
    "gameplayRoles": [
      "boarding"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "boarding"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.boarding_nets",
    "name": "Boarding nets",
    "category": "ship_module",
    "subcategory": "boarding",
    "originRegion": "common",
    "gameplayRoles": [
      "boarding"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "boarding"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.anti_boarding_rails",
    "name": "Anti-boarding rails",
    "category": "ship_module",
    "subcategory": "boarding",
    "originRegion": "common",
    "gameplayRoles": [
      "boarding"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "boarding"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.marine_weapon_rack",
    "name": "Marine weapon rack",
    "category": "ship_module",
    "subcategory": "boarding",
    "originRegion": "common",
    "gameplayRoles": [
      "boarding"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "boarding"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.boarding_bridge_plank",
    "name": "Boarding bridge/plank",
    "category": "ship_module",
    "subcategory": "boarding",
    "originRegion": "common",
    "gameplayRoles": [
      "boarding"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "boarding"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.smoke_pots",
    "name": "Smoke pots",
    "category": "ship_module",
    "subcategory": "boarding",
    "originRegion": "common",
    "gameplayRoles": [
      "boarding"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "boarding"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.shield_racks",
    "name": "Shield racks",
    "category": "ship_module",
    "subcategory": "boarding",
    "originRegion": "common",
    "gameplayRoles": [
      "boarding"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "boarding"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.auxiliary_steam_drive",
    "name": "Auxiliary steam drive",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.precision_rangefinder",
    "name": "Precision rangefinder",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.mechanical_gun_director",
    "name": "Mechanical gun director",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "military_only",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.powered_pump_system",
    "name": "Powered pump system",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.boiler_feed_system",
    "name": "Boiler feed system",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.pressure_safety_system",
    "name": "Pressure safety system",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.mechanical_loader_assist",
    "name": "Mechanical loader assist",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.industrial_steering_assist",
    "name": "Industrial steering assist",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.torpedo_prototype_underwater_weapon_system",
    "name": "Torpedo/prototype underwater weapon system",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "rare",
    "legalStatus": "military_only",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.advanced_ventilation",
    "name": "Advanced ventilation",
    "category": "ship_module",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.spirit_sail",
    "name": "Spirit Sail",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.windbinding_array",
    "name": "Windbinding array",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.hull_ward_lattice",
    "name": "Hull ward lattice",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.storm_ward",
    "name": "Storm ward",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.fire_ward",
    "name": "Fire ward",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.ritual_navigation_chamber",
    "name": "Ritual navigation chamber",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.living_resonant_figurehead",
    "name": "Living/resonant figurehead",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.arcane_boarding_veil",
    "name": "Arcane boarding veil",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.fog_calling_focus",
    "name": "Fog calling focus",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.resonance_dampener",
    "name": "Resonance dampener",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.ship_module.common.relic_mounting_shrine",
    "name": "Relic mounting shrine",
    "category": "ship_module",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "ship_chandler",
      "shipyard"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "ship_module",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.grain",
    "name": "Grain",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.flour",
    "name": "Flour",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.rice",
    "name": "Rice",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.salted_fish",
    "name": "Salted fish",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.salted_meat",
    "name": "Salted meat",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.dried_fruit",
    "name": "Dried fruit",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.cooking_oil",
    "name": "Cooking oil",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.beans_pulses",
    "name": "Beans/pulses",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.hard_cheese",
    "name": "Hard cheese",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.fresh_water_casks",
    "name": "Fresh water casks",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.salt",
    "name": "Salt",
    "category": "commodity",
    "subcategory": "staples",
    "originRegion": "common",
    "gameplayRoles": [
      "staples"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "staples"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.wool",
    "name": "Wool",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.linen",
    "name": "Linen",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.cotton",
    "name": "Cotton",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.hemp",
    "name": "Hemp",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.silk",
    "name": "Silk",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.canvas",
    "name": "Canvas",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.dyestuffs",
    "name": "Dyestuffs",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.leather",
    "name": "Leather",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.furs",
    "name": "Furs",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.rope_fiber",
    "name": "Rope fiber",
    "category": "commodity",
    "subcategory": "textiles_raw",
    "originRegion": "common",
    "gameplayRoles": [
      "textiles_raw"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "textiles_raw"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.timber",
    "name": "Timber",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.oak_ship_timber",
    "name": "Oak ship timber",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.iron_ore",
    "name": "Iron ore",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.pig_iron",
    "name": "Pig iron",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.steel_bars",
    "name": "Steel bars",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.copper",
    "name": "Copper",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.tin",
    "name": "Tin",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.coal",
    "name": "Coal",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.charcoal",
    "name": "Charcoal",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.pitch_tar",
    "name": "Pitch/tar",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.lime",
    "name": "Lime",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.glass",
    "name": "Glass",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.brass_fittings",
    "name": "Brass fittings",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.machine_parts",
    "name": "Machine parts",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.precision_tools",
    "name": "Precision tools",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.chemical_reagents",
    "name": "Chemical reagents",
    "category": "commodity",
    "subcategory": "construction_industry",
    "originRegion": "common",
    "gameplayRoles": [
      "construction_industry"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "construction_industry"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.wine",
    "name": "Wine",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.tea",
    "name": "Tea",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.coffee_like_imported_beverage",
    "name": "Coffee-like imported beverage",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.spices",
    "name": "Spices",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.sugar",
    "name": "Sugar",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.fine_ceramics",
    "name": "Fine ceramics",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.glassware",
    "name": "Glassware",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.perfume",
    "name": "Perfume",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.jewelry",
    "name": "Jewelry",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.fine_books",
    "name": "Fine books",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.paintings",
    "name": "Paintings",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.musical_instruments",
    "name": "Musical instruments",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.dyed_silk",
    "name": "Dyed silk",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.carved_ivory_substitute_bone_goods",
    "name": "Carved ivory-substitute/bone goods",
    "category": "commodity",
    "subcategory": "luxury",
    "originRegion": "common",
    "gameplayRoles": [
      "luxury"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "luxury"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.resonant_crystal",
    "name": "Resonant crystal",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.ritual_inks",
    "name": "Ritual inks",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.consecrated_oils",
    "name": "Consecrated oils",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.rare_herbs",
    "name": "Rare herbs",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.meteoric_strange_metal",
    "name": "Meteoric/strange metal",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "rare",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.spirit_wood",
    "name": "Spirit wood",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.relic_fragments",
    "name": "Relic fragments",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "rare",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.ward_cloth",
    "name": "Ward cloth",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.arcane_salts",
    "name": "Arcane salts",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.dream_incense",
    "name": "Dream incense",
    "category": "commodity",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "commodity",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.untaxed_spirits",
    "name": "Untaxed spirits",
    "category": "commodity",
    "subcategory": "controlled_illicit",
    "originRegion": "common",
    "gameplayRoles": [
      "controlled_illicit"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "contraband",
    "availabilityTags": [
      "common",
      "commodity",
      "controlled_illicit"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.stolen_naval_powder",
    "name": "Stolen naval powder",
    "category": "commodity",
    "subcategory": "controlled_illicit",
    "originRegion": "common",
    "gameplayRoles": [
      "controlled_illicit"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "contraband",
    "availabilityTags": [
      "common",
      "commodity",
      "controlled_illicit"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.forbidden_ritual_texts",
    "name": "Forbidden ritual texts",
    "category": "commodity",
    "subcategory": "controlled_illicit",
    "originRegion": "common",
    "gameplayRoles": [
      "controlled_illicit"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "contraband",
    "availabilityTags": [
      "common",
      "commodity",
      "controlled_illicit"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.smuggled_machine_schematics",
    "name": "Smuggled machine schematics",
    "category": "commodity",
    "subcategory": "controlled_illicit",
    "originRegion": "common",
    "gameplayRoles": [
      "controlled_illicit"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "contraband",
    "availabilityTags": [
      "common",
      "commodity",
      "controlled_illicit"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.counterfeit_seals",
    "name": "Counterfeit seals",
    "category": "commodity",
    "subcategory": "controlled_illicit",
    "originRegion": "common",
    "gameplayRoles": [
      "controlled_illicit"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "contraband",
    "availabilityTags": [
      "common",
      "commodity",
      "controlled_illicit"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.looted_temple_objects",
    "name": "Looted temple objects",
    "category": "commodity",
    "subcategory": "controlled_illicit",
    "originRegion": "common",
    "gameplayRoles": [
      "controlled_illicit"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "contraband",
    "availabilityTags": [
      "common",
      "commodity",
      "controlled_illicit"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.pirated_charts",
    "name": "Pirated charts",
    "category": "commodity",
    "subcategory": "controlled_illicit",
    "originRegion": "common",
    "gameplayRoles": [
      "controlled_illicit"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "contraband",
    "availabilityTags": [
      "common",
      "commodity",
      "controlled_illicit"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.restricted_weapons",
    "name": "Restricted weapons",
    "category": "commodity",
    "subcategory": "controlled_illicit",
    "originRegion": "common",
    "gameplayRoles": [
      "controlled_illicit"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "contraband",
    "availabilityTags": [
      "common",
      "commodity",
      "controlled_illicit"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.commodity.common.captured_military_uniforms",
    "name": "Captured military uniforms",
    "category": "commodity",
    "subcategory": "controlled_illicit",
    "originRegion": "common",
    "gameplayRoles": [
      "controlled_illicit"
    ],
    "marketTypes": [
      "merchant_exchange",
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "contraband",
    "availabilityTags": [
      "common",
      "commodity",
      "controlled_illicit"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.ship_biscuit",
    "name": "Ship biscuit",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.salt_meat_ration",
    "name": "Salt meat ration",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.dried_fish_ration",
    "name": "Dried fish ration",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.fresh_produce_ration",
    "name": "Fresh produce ration",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.water_ration",
    "name": "Water ration",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.tea_coffee_ration",
    "name": "Tea/coffee ration",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.medicinal_tonic",
    "name": "Medicinal tonic",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.bandage_kit",
    "name": "Bandage kit",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.field_medicine_kit",
    "name": "Field medicine kit",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.antiseptic_spirits",
    "name": "Antiseptic spirits",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.pain_draught",
    "name": "Pain draught",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.anti_nausea_sea_sickness_remedy",
    "name": "Anti-nausea/sea-sickness remedy",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.repair_patch_kit",
    "name": "Repair patch kit",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.gunpowder_cartridge",
    "name": "Gunpowder cartridge",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.pistol_ammunition",
    "name": "Pistol ammunition",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.musket_ammunition",
    "name": "Musket ammunition",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.cannon_powder_charge",
    "name": "Cannon powder charge",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.round_chain_grape_shot_bundle",
    "name": "Round/chain/grape shot bundle",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.ritual_incense",
    "name": "Ritual incense",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.ritual_chalk_ink",
    "name": "Ritual chalk/ink",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.arcane_stabilizing_salts",
    "name": "Arcane stabilizing salts",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.ward_repair_kit",
    "name": "Ward repair kit",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.lamp_oil",
    "name": "Lamp oil",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.torch",
    "name": "Torch",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.consumable.common.signal_flare_rocket",
    "name": "Signal flare/rocket",
    "category": "consumable",
    "subcategory": "consumable",
    "originRegion": "common",
    "gameplayRoles": [
      "consumable"
    ],
    "marketTypes": [
      "general_market",
      "ship_chandler",
      "apothecary"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "consumable",
      "consumable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.regional_chart",
    "name": "Regional chart",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.port_chart",
    "name": "Port chart",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.pilot_book",
    "name": "Pilot book",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.captains_log",
    "name": "Captain's log",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.crew_manifest",
    "name": "Crew manifest",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.cargo_manifest",
    "name": "Cargo manifest",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.bill_of_lading",
    "name": "Bill of lading",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.letter_of_credit",
    "name": "Letter of credit",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.insurance_policy",
    "name": "Insurance policy",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.privateering_letter_commission",
    "name": "Privateering letter / commission",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "restricted",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.naval_orders",
    "name": "Naval orders",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "restricted",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.arrest_warrant",
    "name": "Arrest warrant",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "restricted",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.customs_permit",
    "name": "Customs permit",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "restricted",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.pilgrimage_certificate",
    "name": "Pilgrimage certificate",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.guild_certificate",
    "name": "Guild certificate",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.marriage_contract",
    "name": "Marriage contract",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.will_and_testament",
    "name": "Will and testament",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.inheritance_deed",
    "name": "Inheritance deed",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.property_deed",
    "name": "Property deed",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.religious_scripture",
    "name": "Religious scripture",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.sermon_pamphlet",
    "name": "Sermon pamphlet",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.political_pamphlet",
    "name": "Political pamphlet",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.newspaper",
    "name": "Newspaper",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.personal_letter",
    "name": "Personal letter",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.encoded_intelligence_letter",
    "name": "Encoded intelligence letter",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.machine_schematic",
    "name": "Machine schematic",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.arcane_grimoire_notebook",
    "name": "Arcane grimoire/notebook",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.ritual_diagram",
    "name": "Ritual diagram",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.historical_chronicle",
    "name": "Historical chronicle",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.genealogical_roll",
    "name": "Genealogical roll",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.document.common.forged_papers",
    "name": "Forged papers",
    "category": "document",
    "subcategory": "information_object",
    "originRegion": "common",
    "gameplayRoles": [
      "information_object"
    ],
    "marketTypes": [
      "book_chart_seller",
      "merchant_exchange"
    ],
    "rarity": "common",
    "legalStatus": "restricted",
    "availabilityTags": [
      "common",
      "document",
      "information_object"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.relic.skeldra.veyrs_oath_ring",
    "name": "Veyr's Oath-Ring",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "skeldra",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Ancient royal oath object; legitimacy and memory are as important as any disputed supernatural effect.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.skeldra.hammer_of_storm_cape",
    "name": "Hammer of Storm Cape",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "skeldra",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Shipyard hammer used during repairs before a famous battle; an emerging sailor relic.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.skeldra.black_timber_of_njorel",
    "name": "Black Timber of Njorel",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "skeldra",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Timber recovered from a wreck repeatedly associated with impossible survivals.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.asteria.the_solon_lens",
    "name": "The Solon Lens",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "asteria",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "asteria",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Historic scholarly lens tied to early Arcane measurement.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.asteria.nethras_quiet_coin",
    "name": "Nethra's Quiet Coin",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "asteria",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "asteria",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Funerary coin with centuries of ritual history; effects around memory and death remain disputed.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.asteria.banner_of_the_seven_harbors",
    "name": "Banner of the Seven Harbors",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "asteria",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "asteria",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "League-era banner whose political meaning can outweigh magical resonance.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.serath.cup_of_ilyons_road",
    "name": "Cup of Ilyon's Road",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "serath",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "serath",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Pilgrimage relic attributed to early Covenant followers; authenticity debated.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.serath.ashars_seal",
    "name": "Ashar's Seal",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "serath",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "serath",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Royal seal connected to Ashar I's conversion and later state legitimacy.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.serath.the_white_lamp",
    "name": "The White Lamp",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "serath",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "serath",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Relief-hospital lamp associated with survival during an epidemic; now devotional.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.kaishin.shuns_measure",
    "name": "Shun's Measure",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "kaishin",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Standardizing ruler's reference measure; symbol of central authority and order.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.kaishin.mirror_of_returning_water",
    "name": "Mirror of Returning Water",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "kaishin",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Monastic object tied to memory, self-perception, and ambiguous Arcane phenomena.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.kaishin.broken_compass_of_reis_first_voyage",
    "name": "Broken Compass of Rei's First Voyage",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "kaishin",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Modern historical artifact whose fame may slowly create resonance.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.crossroads.key_of_the_golden_strait",
    "name": "Key of the Golden Strait",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "crossroads",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Ceremonial fort key passed between rulers; political and possible protective resonance.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.crossroads.the_concord_table_fragment",
    "name": "The Concord Table Fragment",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "crossroads",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "crossroads",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Claimed fragment of an early treaty table; multiple competing fragments exist.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.outer_isles.red_cape_shot",
    "name": "Red Cape Shot",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "politically_sensitive",
    "availabilityTags": [
      "outer_isles",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Cannonball fragment from Mara Voss's famous battle, already becoming pirate folklore.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.outer_isles.jessa_corvens_ledger",
    "name": "Jessa Corven's Ledger",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "politically_sensitive",
    "availabilityTags": [
      "outer_isles",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Commercial and political relic containing ransom norms, debts, and names.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.outer_isles.renard_vales_knife",
    "name": "Renard Vale's Knife",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "outer_isles",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "politically_sensitive",
    "availabilityTags": [
      "outer_isles",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Disputed ownership artifact from early Blackhaven succession history.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.cross_regional.the_drowned_bell",
    "name": "The Drowned Bell",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "cross_regional",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "cross_regional",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Recovered ship bell that rings under unusual weather conditions; provenance partly lost.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.cross_regional.glassworks_shard",
    "name": "Glassworks Shard",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "cross_regional",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "cross_regional",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Material from a major Arcane-Industrial disaster; dangerous research object.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.relic.unknown_western.unknown_western_idol",
    "name": "Unknown Western Idol",
    "category": "relic",
    "subcategory": "authored_relic",
    "originRegion": "unknown_western",
    "gameplayRoles": [
      "authored_relic"
    ],
    "marketTypes": [
      "arcane_dealer",
      "religious_vendor",
      "black_market"
    ],
    "rarity": "unique",
    "legalStatus": "sacred",
    "availabilityTags": [
      "unknown_western",
      "relic",
      "authored_relic"
    ],
    "attunement": "neutral",
    "artStatus": "missing",
    "description": "Exploration relic whose culture and age are unresolved.",
    "uniqueMarketStock": true,
    "provenanceRequired": true
  },
  {
    "id": "content.religious_object.skeldra.household_god_token",
    "name": "Household god token",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.skeldra.ardin_oath_ring",
    "name": "Ardin oath ring",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.skeldra.njorel_voyage_coin",
    "name": "Njorel voyage coin",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.skeldra.thoren_hammer_charm",
    "name": "Thoren hammer charm",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.skeldra.freyra_fertility_household_charm",
    "name": "Freyra fertility/household charm",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.skeldra.veyr_raven_token",
    "name": "Veyr raven token",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.skeldra.ancestor_tablet_board",
    "name": "Ancestor tablet/board",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.skeldra.rune_inscribed_memorial_stone_fragment",
    "name": "Rune-inscribed memorial stone fragment",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.skeldra.offering_bowl",
    "name": "Offering bowl",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.skeldra.priest_seer_staff_or_knife",
    "name": "Priest/seer staff or knife",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "skeldra",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "skeldra",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.household_shrine_figure",
    "name": "Household shrine figure",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.libation_bowl",
    "name": "Libation bowl",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.temple_oil_lamp",
    "name": "Temple oil lamp",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.asterion_civic_oath_token",
    "name": "Asterion civic oath token",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.thalassor_sailor_charm",
    "name": "Thalassor sailor charm",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.marena_craft_plaque",
    "name": "Marena craft plaque",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.velara_marriage_token",
    "name": "Velara marriage token",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.koros_athletic_war_votive",
    "name": "Koros athletic/war votive",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.solon_physician_scholar_amulet",
    "name": "Solon physician/scholar amulet",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.asteria.nethra_funerary_token",
    "name": "Nethra funerary token",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "asteria",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "asteria",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.scripture_codex",
    "name": "Scripture codex",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.prayer_beads_cord",
    "name": "Prayer beads/cord",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.pilgrim_badge",
    "name": "Pilgrim badge",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.simple_devotional_pendant",
    "name": "Simple devotional pendant",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.alms_box",
    "name": "Alms box",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.travel_prayer_book",
    "name": "Travel prayer book",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.hospital_token",
    "name": "Hospital token",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.relic_case",
    "name": "Relic case",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.consecrated_lamp",
    "name": "Consecrated lamp",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.serath.bishops_seal",
    "name": "Bishop's seal",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "serath",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "serath",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.prayer_teaching_scroll",
    "name": "Prayer/teaching scroll",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.ancestor_tablet",
    "name": "Ancestor tablet",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.meditation_beads",
    "name": "Meditation beads",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.temple_bell",
    "name": "Temple bell",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.incense_set",
    "name": "Incense set",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.monastic_begging_bowl",
    "name": "Monastic begging bowl",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.memorial_paper_tablet",
    "name": "Memorial paper/tablet",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.calligraphy_of_a_teaching",
    "name": "Calligraphy of a teaching",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.pilgrim_staff",
    "name": "Pilgrim staff",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.religious_object.kaishin.balance_turning_wheel_emblem",
    "name": "Balance/turning-wheel emblem",
    "category": "religious_object",
    "subcategory": "devotional",
    "originRegion": "kaishin",
    "gameplayRoles": [
      "devotional"
    ],
    "marketTypes": [
      "religious_vendor"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "kaishin",
      "religious_object",
      "devotional"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.novice_focus_ring",
    "name": "Novice focus ring",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.duelist_focus_bracer",
    "name": "Duelist focus bracer",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.ritual_lens",
    "name": "Ritual lens",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.ward_chalk_kit",
    "name": "Ward chalk kit",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.resonant_crystal",
    "name": "Resonant crystal",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.memory_vessel",
    "name": "Memory vessel",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.weather_focus",
    "name": "Weather focus",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.navigational_focus",
    "name": "Navigational focus",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.spirit_binding_cord",
    "name": "Spirit-binding cord",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.protective_ward_token",
    "name": "Protective ward token",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.arcane_physician_focus",
    "name": "Arcane physician focus",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.spellbook_ritual_notebook",
    "name": "Spellbook/ritual notebook",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.portable_ritual_board",
    "name": "Portable ritual board",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.enchanted_blade",
    "name": "Enchanted blade",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.warded_coat_clasp",
    "name": "Warded coat clasp",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.resonant_compass",
    "name": "Resonant compass",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.relic_sheath",
    "name": "Relic sheath",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.arcane_lamp",
    "name": "Arcane lamp",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.dreaming_incense_set",
    "name": "Dreaming incense set",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.arcane_equipment.common.high_order_ritual_anchor",
    "name": "High-order ritual anchor",
    "category": "arcane_equipment",
    "subcategory": "arcane",
    "originRegion": "common",
    "gameplayRoles": [
      "arcane"
    ],
    "marketTypes": [
      "arcane_dealer"
    ],
    "rarity": "rare",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "arcane_equipment",
      "arcane"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.precision_calipers",
    "name": "Precision calipers",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.pocket_pressure_gauge",
    "name": "Pocket pressure gauge",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.machinist_tool_roll",
    "name": "Machinist tool roll",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.surveyor_instrument",
    "name": "Surveyor instrument",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.improved_lock_mechanism",
    "name": "Improved lock mechanism",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.mechanical_chronometer",
    "name": "Mechanical chronometer",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.advanced_flintlock_repeating_prototype",
    "name": "Advanced flintlock/repeating prototype",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "rare",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.industrial_prosthetic_hand",
    "name": "Industrial prosthetic hand",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.industrial_prosthetic_leg",
    "name": "Industrial prosthetic leg",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.optical_rangefinder",
    "name": "Optical rangefinder",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.chemical_field_kit",
    "name": "Chemical field kit",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.portable_pump",
    "name": "Portable pump",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.valve_assembly",
    "name": "Valve assembly",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.gearbox_component",
    "name": "Gearbox component",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.steam_regulator",
    "name": "Steam regulator",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.mechanical_calculator_counting_device",
    "name": "Mechanical calculator/counting device",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.signal_lamp",
    "name": "Signal lamp",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.rocket_signal_kit",
    "name": "Rocket signal kit",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.protective_goggles",
    "name": "Protective goggles",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.industrial_equipment.common.boiler_safety_charm_token",
    "name": "Boiler safety charm-token",
    "category": "industrial_equipment",
    "subcategory": "industrial",
    "originRegion": "common",
    "gameplayRoles": [
      "industrial"
    ],
    "marketTypes": [
      "foundry",
      "outfitter"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "industrial_equipment",
      "industrial"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.cargo_crate",
    "name": "Cargo crate",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.barrel",
    "name": "Barrel",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.rope_coil",
    "name": "Rope coil",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.anchor",
    "name": "Anchor",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.capstan",
    "name": "Capstan",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.dock_bollard",
    "name": "Dock bollard",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.fish_basket",
    "name": "Fish basket",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.net_bundle",
    "name": "Net bundle",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.lantern",
    "name": "Lantern",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.cargo_scale",
    "name": "Cargo scale",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.harbor_notice_board",
    "name": "Harbor notice board",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.customs_desk",
    "name": "Customs desk",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.ship_bell",
    "name": "Ship bell",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.sail_bundle",
    "name": "Sail bundle",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.tankard",
    "name": "Tankard",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.bottle",
    "name": "Bottle",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.clay_cup",
    "name": "Clay cup",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.table",
    "name": "Table",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.bench",
    "name": "Bench",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.card_dice_set",
    "name": "Card/dice set",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.notice_board",
    "name": "Notice board",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.hearth_tools",
    "name": "Hearth tools",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.travel_chest",
    "name": "Travel chest",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.musical_instrument",
    "name": "Musical instrument",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.private_booth_screen",
    "name": "Private booth screen",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.anvil",
    "name": "Anvil",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.forge",
    "name": "Forge",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.workbench",
    "name": "Workbench",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.tool_rack",
    "name": "Tool rack",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.parts_bin",
    "name": "Parts bin",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.pressure_vessel",
    "name": "Pressure vessel",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "industrial",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.drafting_table",
    "name": "Drafting table",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.chemical_bench",
    "name": "Chemical bench",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.hoist",
    "name": "Hoist",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.scrap_pile",
    "name": "Scrap pile",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.altar",
    "name": "Altar",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.lamp",
    "name": "Lamp",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.offering_bowl",
    "name": "Offering bowl",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.incense_burner",
    "name": "Incense burner",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.prayer_bench_mat",
    "name": "Prayer bench/mat",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.memorial_tablets",
    "name": "Memorial tablets",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.votive_items",
    "name": "Votive items",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.ritual_basin",
    "name": "Ritual basin",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "arcane",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.archive_shelf",
    "name": "Archive shelf",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.trunk",
    "name": "Trunk",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.bedroll",
    "name": "Bedroll",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.wash_basin",
    "name": "Wash basin",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.cooking_pot",
    "name": "Cooking pot",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.storage_chest",
    "name": "Storage chest",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.family_portrait_icon",
    "name": "Family portrait/icon",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.writing_desk",
    "name": "Writing desk",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.candles",
    "name": "Candles",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.childrens_toy",
    "name": "Children's toy",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.utility.common.heirloom_display",
    "name": "Heirloom display",
    "category": "utility",
    "subcategory": "environmental_prop",
    "originRegion": "common",
    "gameplayRoles": [
      "environmental_prop"
    ],
    "marketTypes": [
      "general_market"
    ],
    "rarity": "common",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "utility",
      "environmental_prop"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.valuable.common.jewelry",
    "name": "Jewelry",
    "category": "valuable",
    "subcategory": "portable_valuable",
    "originRegion": "common",
    "gameplayRoles": [
      "portable_valuable"
    ],
    "marketTypes": [
      "general_market",
      "merchant_exchange"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "valuable",
      "portable_valuable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.valuable.common.fine_book",
    "name": "Fine book",
    "category": "valuable",
    "subcategory": "portable_valuable",
    "originRegion": "common",
    "gameplayRoles": [
      "portable_valuable"
    ],
    "marketTypes": [
      "general_market",
      "merchant_exchange"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "valuable",
      "portable_valuable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.valuable.common.painting",
    "name": "Painting",
    "category": "valuable",
    "subcategory": "portable_valuable",
    "originRegion": "common",
    "gameplayRoles": [
      "portable_valuable"
    ],
    "marketTypes": [
      "general_market",
      "merchant_exchange"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "valuable",
      "portable_valuable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.valuable.common.musical_instrument",
    "name": "Musical instrument",
    "category": "valuable",
    "subcategory": "portable_valuable",
    "originRegion": "common",
    "gameplayRoles": [
      "portable_valuable"
    ],
    "marketTypes": [
      "general_market",
      "merchant_exchange"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "valuable",
      "portable_valuable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  },
  {
    "id": "content.valuable.common.fine_glassware",
    "name": "Fine glassware",
    "category": "valuable",
    "subcategory": "portable_valuable",
    "originRegion": "common",
    "gameplayRoles": [
      "portable_valuable"
    ],
    "marketTypes": [
      "general_market",
      "merchant_exchange"
    ],
    "rarity": "uncommon",
    "legalStatus": "ordinary",
    "availabilityTags": [
      "common",
      "valuable",
      "portable_valuable"
    ],
    "attunement": "neutral",
    "artStatus": "missing"
  }
];

export const SHIP_CLASS_BY_ID = Object.fromEntries(SHIP_CLASS_DEFINITIONS.map((row) => [row.id, row])) as Record<EntityId, ShipClassDefinition>;
export const CONTENT_BY_ID = Object.fromEntries(CONTENT_DEFINITIONS.map((row) => [row.id, row])) as Record<EntityId, CanonicalContentDefinition>;

export function resolveShipClassId(id: EntityId): EntityId {
  return SHIP_CLASS_BY_ID[id] ? id : (LEGACY_SHIP_CLASS_ALIASES[id] ?? id);
}

export function shipClassDefinition(id: EntityId): ShipClassDefinition | undefined {
  return SHIP_CLASS_BY_ID[resolveShipClassId(id)];
}

export function contentDefinition(id: EntityId): CanonicalContentDefinition | undefined {
  return CONTENT_BY_ID[id];
}
