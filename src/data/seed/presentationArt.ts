import type { EntityId } from "../../game/types.js";

/**
 * Presentation-critical art mapping.
 * These paths are stable runtime aliases copied from the user's approved/canonical art packages.
 * Presence here does not unlock a settlement or POI for traversal.
 */
export const LOCATION_PRESENTATION_ART: Record<EntityId, string> = {
  "port.veyrholm": "/art/location/ports/veyrholm.png",
  "port.ironhaven": "/art/location/ports/ironhaven.png",
  "port.stormvik": "/art/location/ports/stormvik.png",
  "poi.old_veyr_beacon": "/art/location/pois/old_veyr_beacon.png",
  "poi.greywater_wrecks": "/art/location/pois/greywater_wrecks.png",

  "settlement.greywater": "/art/location/ports/greywater.png",
  "settlement.port_meridian": "/art/location/ports/port_meridian.png",
  "settlement.blackhaven": "/art/location/ports/blackhaven.png",
  "settlement.ardaran": "/art/location/ports/ardaran.png",
  "settlement.saltwake": "/art/location/ports/saltwake.png",
  "settlement.saint_corren": "/art/location/ports/saint_corren.png",
  "settlement.redhook": "/art/location/ports/redhook.png",
  "settlement.gullreach": "/art/location/ports/gullreach.png",
  "poi.black_cape": "/art/location/pois/black_cape.png",
  "poi.western_deep": "/art/location/pois/western_deep.png",
  "poi.widows_passage": "/art/location/pois/widow_s_passage.png",

  "settlement.asterra": "/art/location/ports/asterra.png",
  "settlement.thalassa": "/art/location/ports/thalassa.png",
  "settlement.aurelia": "/art/location/ports/aurelia.png",
  "settlement.korinthos": "/art/location/ports/korinthos.png",
  "settlement.delphara": "/art/location/ports/delphara.png",
  "settlement.rhadessa": "/art/location/ports/rhadessa.png",
  "settlement.myrine": "/art/location/ports/myrine.png",
  "settlement.eirenos": "/art/location/ports/eirenos.png",
  "poi.thalassors_teeth": "/art/location/pois/thalassor_s_teeth.png",

  "settlement.vespera": "/art/location/ports/vespera.png",
  "settlement.tyras": "/art/location/ports/tyras.png",
  "settlement.nagara": "/art/location/ports/nagara.png"
};


export type ContextLocationSceneKind = "arrival_port" | "market" | "tavern" | "harbor" | "royal_palace" | "temple" | "people";

/**
 * Alpha 0.6D contextual-location presentation art.
 * Static category identity is intentionally baked into these paintings; dynamic port/entity names
 * and every interactive control remain code-owned underneath the art.
 */
export const CONTEXT_LOCATION_SCENE_ART: Record<string, Record<ContextLocationSceneKind, string>> = {
  skeldra: {
    arrival_port: "/art/location/context/skeldra/arrival_port.png",
    market: "/art/location/context/skeldra/market.png",
    tavern: "/art/location/context/skeldra/tavern.png",
    harbor: "/art/location/context/skeldra/harbor.png",
    royal_palace: "/art/location/context/skeldra/royal_palace.png",
    temple: "/art/location/context/skeldra/temple.png",
    people: "/art/location/context/skeldra/people.png"
  }
};

export const PRESENTATION_BASE_ART = {
  characterCreator: "/art/ui/presentation/character_creator_base.png",
  crewRoster: "/art/ui/presentation/crew_roster_base.png",
  journal: "/art/ui/presentation/journal_base.png",
  market: "/art/ui/presentation/market_base.png",
  navalEncounter: "/art/ui/presentation/naval_encounter_base.png",
  shipManagement: "/art/ui/presentation/ship_management_base.png"
} as const;

export const PRESENTATION_ART_GAPS = [
  "Playable Thorenfjord has no dedicated establishing artwork in the supplied canonical/approved packages.",
  "Named NPC portrait coverage is still incomplete; companion roster/people screens fall back to identity plates where no portrait asset exists.",
  "Skeldra now has approved reusable contextual scene art for Arrival at Port, Market, Tavern, Harbor, Royal Palace, Temple, and People. Other regions still require their own regional contextual scene sets before activation.",
  "Personal/boarding combat is intentionally still treated as development presentation until its mechanics stabilize enough to author a final combat composition."
] as const;
