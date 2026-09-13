import type { EntityId } from "../../game/types.js";

/**
 * Presentation-critical art mapping.
 * Paths are stable runtime aliases copied from the user's approved/canonical art packages.
 * When a settlement has no unique establishing painting yet, the nearest valid regional painting
 * is used as an explicit fallback so no non-Skeldran port displays Skeldran contextual art.
 */
export const LOCATION_PRESENTATION_ART: Record<EntityId,string> = {
  // Skeldra
  "port.veyrholm":"/art/location/ports/veyrholm.png",
  "port.ironhaven":"/art/location/ports/ironhaven.png",
  "port.stormvik":"/art/location/ports/stormvik.png",
  "port.thorenfjord":"/art/location/context/skeldra/arrival_port.png",
  "settlement.hrafnvik":"/art/location/ports/stormvik.png",
  "settlement.bjornhavn":"/art/location/ports/ironhaven.png",
  "settlement.kaldstrand":"/art/location/ports/veyrholm.png",
  "settlement.runeskar":"/art/location/ports/stormvik.png",
  "poi.old_veyr_beacon":"/art/location/pois/old_veyr_beacon.png",

  // Outer Isles / Greywater Coast
  "settlement.greywater":"/art/location/ports/greywater.png",
  "settlement.port_meridian":"/art/location/ports/port_meridian.png",
  "settlement.blackhaven":"/art/location/ports/blackhaven.png",
  "settlement.ardaran":"/art/location/ports/ardaran.png",
  "settlement.saltwake":"/art/location/ports/saltwake.png",
  "settlement.saint_corren":"/art/location/ports/saint_corren.png",
  "settlement.redhook":"/art/location/ports/redhook.png",
  "settlement.gullreach":"/art/location/ports/gullreach.png",
  "poi.black_cape":"/art/location/pois/black_cape.png",
  "poi.western_deep":"/art/location/pois/western_deep.png",
  "poi.greywater_wrecks":"/art/location/pois/greywater_wrecks.png",
  "poi.widows_passage":"/art/location/pois/widow_s_passage.png",

  // Asterian Sea
  "settlement.asterra":"/art/location/ports/asterra.png",
  "settlement.thalassa":"/art/location/ports/thalassa.png",
  "settlement.aurelia":"/art/location/ports/aurelia.png",
  "settlement.korinthos":"/art/location/ports/korinthos.png",
  "settlement.delphara":"/art/location/ports/delphara.png",
  "settlement.rhadessa":"/art/location/ports/rhadessa.png",
  "settlement.myrine":"/art/location/ports/myrine.png",
  "settlement.eirenos":"/art/location/ports/eirenos.png",
  "poi.thalassors_teeth":"/art/location/pois/thalassor_s_teeth.png",

  // Vesperan Strait / crossroads. Vespera remains the main establishing anchor for the strait.
  "settlement.vespera":"/art/location/ports/vespera.png",
  "settlement.pelasion":"/art/location/ports/vespera.png",
  "settlement.southwatch":"/art/location/ports/vespera.png",
  "settlement.lantern_key":"/art/location/ports/vespera.png",

  // Serath. Tyras is the supplied regional anchor for ports without a unique establishing painting yet.
  "settlement.aurel":"/art/location/ports/tyras.png",
  "settlement.antiochara":"/art/location/ports/tyras.png",
  "settlement.tyras":"/art/location/ports/tyras.png",
  "settlement.japhra":"/art/location/ports/tyras.png",
  "settlement.qasirah":"/art/location/ports/tyras.png",
  "settlement.safir":"/art/location/ports/tyras.png",

  // Kaishin / Eastern Approaches. Nagara is the supplied regional anchor for the remaining eastern ports.
  "settlement.kaishin":"/art/location/ports/nagara.png",
  "settlement.tenzan":"/art/location/ports/nagara.png",
  "settlement.nagara":"/art/location/ports/nagara.png",
  "settlement.hanzhou":"/art/location/ports/nagara.png",
  "settlement.ryosen":"/art/location/ports/nagara.png",
  "settlement.shido":"/art/location/ports/nagara.png",
  "settlement.linhai":"/art/location/ports/nagara.png",
  "settlement.kuroseki":"/art/location/ports/nagara.png",
  "poi.spiral_maw":"/art/location/ports/nagara.png"
};

export type ContextLocationSceneKind = "arrival_port" | "market" | "tavern" | "harbor" | "royal_palace" | "temple" | "people";

/**
 * Contextual scene sets own only the painted scene above the existing mechanics.
 * Skeldra retains its dedicated fully bespoke set.
 * Other activated regions now use curated region-fitting contextual scene sets built from the
 * approved/canonical port paintings and regional anchors, so taverns, markets, governments,
 * temples, and people pages no longer re-use the same generic establishing image.
 */
export const CONTEXT_LOCATION_SCENE_ART: Record<string,Partial<Record<ContextLocationSceneKind,string>>> = {
  skeldra:{
    arrival_port:"/art/location/context/skeldra/arrival_port.png",
    market:"/art/location/context/skeldra/market.png",
    tavern:"/art/location/context/skeldra/tavern.png",
    harbor:"/art/location/context/skeldra/harbor.png",
    royal_palace:"/art/location/context/skeldra/royal_palace.png",
    temple:"/art/location/context/skeldra/temple.png",
    people:"/art/location/context/skeldra/people.png"
  },
  asteria:{
    arrival_port:"/art/location/context/asteria/arrival_port.png",
    market:"/art/location/context/asteria/market.png",
    tavern:"/art/location/context/asteria/tavern.png",
    harbor:"/art/location/context/asteria/harbor.png",
    royal_palace:"/art/location/context/asteria/royal_palace.png",
    temple:"/art/location/context/asteria/temple.png",
    people:"/art/location/context/asteria/people.png"
  },
  outer_isles:{
    arrival_port:"/art/location/context/outer_isles/arrival_port.png",
    market:"/art/location/context/outer_isles/market.png",
    tavern:"/art/location/context/outer_isles/tavern.png",
    harbor:"/art/location/context/outer_isles/harbor.png",
    royal_palace:"/art/location/context/outer_isles/royal_palace.png",
    temple:"/art/location/context/outer_isles/temple.png",
    people:"/art/location/context/outer_isles/people.png"
  },
  crossroads:{
    arrival_port:"/art/location/context/crossroads/arrival_port.png",
    market:"/art/location/context/crossroads/market.png",
    tavern:"/art/location/context/crossroads/tavern.png",
    harbor:"/art/location/context/crossroads/harbor.png",
    royal_palace:"/art/location/context/crossroads/royal_palace.png",
    temple:"/art/location/context/crossroads/temple.png",
    people:"/art/location/context/crossroads/people.png"
  },
  serath:{
    arrival_port:"/art/location/context/serath/arrival_port.png",
    market:"/art/location/context/serath/market.png",
    tavern:"/art/location/context/serath/tavern.png",
    harbor:"/art/location/context/serath/harbor.png",
    royal_palace:"/art/location/context/serath/royal_palace.png",
    temple:"/art/location/context/serath/temple.png",
    people:"/art/location/context/serath/people.png"
  },
  kaishin:{
    arrival_port:"/art/location/context/kaishin/arrival_port.png",
    market:"/art/location/context/kaishin/market.png",
    tavern:"/art/location/context/kaishin/tavern.png",
    harbor:"/art/location/context/kaishin/harbor.png",
    royal_palace:"/art/location/context/kaishin/royal_palace.png",
    temple:"/art/location/context/kaishin/temple.png",
    people:"/art/location/context/kaishin/people.png"
  }
};

export const PRESENTATION_BASE_ART = {
  characterCreator:"/art/ui/presentation/character_creator_base.png",
  crewRoster:"/art/ui/presentation/crew_roster_base.png",
  journal:"/art/ui/presentation/journal_base.png",
  market:"/art/ui/presentation/market_base.png",
  navalEncounter:"/art/ui/presentation/naval_encounter_base.png",
  shipManagement:"/art/ui/presentation/ship_management_base.png"
} as const;

export const PRESENTATION_ART_GAPS = [
  "Skeldra retains the fully bespoke contextual scene set (Arrival, Market, Tavern, Harbor, Government, Temple, People).",
  "Asteria, the Outer Isles, the Vesperan crossroads, Serath, and Kaishin now use region-fitting contextual scene sets for subpages instead of reusing a single establishing image.",
  "Several regions still rely on curated page-scene derivatives from a smaller supplied art pool rather than one unique bespoke painting per port and per page.",
  "Vespera/Ardaran, Tyras, and Nagara remain the visual anchors for the crossroads, Serath, and Kaishin contextual sets until more dedicated page paintings are supplied.",
  "Named NPC portrait coverage and personal/boarding-combat presentation remain outside this location-expansion pass."
] as const;
