import type { PointOfInterestDefinition } from "../../game/types.js";

export const POINTS_OF_INTEREST: PointOfInterestDefinition[] = [
  {
    id:"poi.greywater_wrecks", name:"Greywater Wrecks", region:"outer_isles", type:"wreck_site", role:"Ship graveyard / salvage hazard",
    description:"A dangerous stretch of wreck-water off the Greywater coast where broken hulls, shoals, currents, and old cargo draw salvagers despite the risk.",
    point:{x:14,y:39}, approachPoint:{x:14,y:39},
    arrivalActions:[
      {id:"enter_site",label:"Enter the Wreck Site",description:"Bring Tideworn into the wreck-water and begin a closer investigation."},
      {id:"observe",label:"Observe from Ship",description:"Use the lookout and spyglass before risking boats or crew."},
      {id:"salvage",label:"Lower Boats / Salvage",description:"Send a working party among visible wreckage if conditions permit."},
      {id:"search",label:"Search the Water",description:"Spend time looking for debris, survivors, cargo, or signs of what happened."}
    ], artAssetId:"poi.greywater_wrecks.establishing", knownByDefault:true,
    attunementLoad:{arcane:10,industrial:0,sensitivity:0.6,mitigationTags:[]}
  },
  {
    id:"poi.old_veyr_beacon", name:"Old Veyr Beacon", region:"skeldra", type:"landfall", role:"Ancient coastal navigation shrine / landmark",
    description:"A weather-blackened beacon and rune-marked stone on a small Skeldran islet. Sailors still use it as a practical landmark even as its older ritual purpose fades from common memory.",
    point:{x:26,y:21}, approachPoint:{x:27,y:21},
    arrivalActions:[
      {id:"enter_site",label:"Land at the Beacon",description:"Anchor off the islet and put a small party ashore."},
      {id:"observe",label:"Circle and Observe",description:"Inspect the shore, currents, and beacon from the ship."},
      {id:"land_party",label:"Send a Shore Party",description:"Put crew ashore to examine the structure and surrounding rocks."},
      {id:"search",label:"Search the Islet",description:"Spend time searching the beacon, shoreline, and old carved stones."}
    ], artAssetId:"poi.old_veyr_beacon.establishing", knownByDefault:true,
    attunementLoad:{arcane:16,industrial:0,sensitivity:0.7,mitigationTags:["old_ritual_stone"]}
  },
  {
    id:"poi.western_deep", name:"Western Deep", region:"crossroads", type:"natural", role:"Deep-sea danger region",
    description:"A remote deep-water stretch west of the Greywater Coast, far from easy shelter and ordinary coastal traffic.",
    point:{x:6,y:37}, approachPoint:{x:6,y:37},
    arrivalActions:[
      {id:"observe",label:"Read the Water",description:"Observe swell, weather, birds, and distant traffic before committing farther west."},
      {id:"enter_site",label:"Enter the Deep",description:"Sail deeper into the exposed water."},
      {id:"search",label:"Search the Horizon",description:"Spend time looking for ships, debris, weather signs, or anything unusual."}
    ], knownByDefault:true, attunementLoad:{arcane:1,industrial:0,sensitivity:0.25,mitigationTags:[]}
  },
  {
    id:"poi.black_cape", name:"Black Cape", region:"outer_isles", type:"landfall", role:"Dangerous headland",
    description:"A dark, reef-fringed headland marking a dangerous turn along the Outer Isles coast.",
    point:{x:11,y:55}, approachPoint:{x:11,y:54},
    arrivalActions:[
      {id:"observe",label:"Stand Off & Observe",description:"Study the headland, surf, and reef line from safe water."},
      {id:"enter_site",label:"Approach the Cape",description:"Bring the ship closer to the headland and its difficult water."},
      {id:"land_party",label:"Put a Party Ashore",description:"Attempt a landing where the coast permits."},
      {id:"search",label:"Search the Coast",description:"Look for wreckage, tracks, anchorages, and signs of recent visitors."}
    ], knownByDefault:true, attunementLoad:{arcane:2,industrial:0,sensitivity:0.3,mitigationTags:[]}
  },
  {
    id:"poi.widows_passage", name:"Widow's Passage", region:"outer_isles", type:"natural", role:"Hazardous strait",
    description:"A narrow and hazardous Outer Isles passage where reefs, current, and bad visibility punish careless navigation.",
    point:{x:12,y:53}, approachPoint:{x:12,y:53},
    arrivalActions:[
      {id:"observe",label:"Sound the Passage",description:"Read the current, depth, and visible hazards before entering."},
      {id:"enter_site",label:"Enter Widow's Passage",description:"Take Tideworn into the narrow water."},
      {id:"search",label:"Survey the Strait",description:"Spend time charting hazards, shore signs, and safe water."}
    ], knownByDefault:true, attunementLoad:{arcane:1,industrial:0,sensitivity:0.35,mitigationTags:[]}
  },
  {
    id:"poi.thalassors_teeth", name:"Thalassor's Teeth", region:"asteria", type:"natural", role:"Hazardous reef chain",
    description:"A jagged Asterian reef chain where shoals and exposed rock force ships onto careful lines through otherwise busy southern waters.",
    point:{x:56,y:60}, approachPoint:{x:56,y:60},
    arrivalActions:[
      {id:"observe",label:"Observe the Reef",description:"Study breakers, current, and visible channels before approaching."},
      {id:"enter_site",label:"Enter the Reef Water",description:"Bring Tideworn into the broken water between the Teeth."},
      {id:"search",label:"Survey the Channels",description:"Spend time charting passages, wreck signs, and safe lines."},
      {id:"salvage",label:"Search for Wreckage",description:"Look for recoverable debris where ships have come to grief on the reef."}
    ], knownByDefault:true, attunementLoad:{arcane:4,industrial:0,sensitivity:0.4,mitigationTags:[]}
  },
  {
    id:"poi.spiral_maw", name:"Spiral Maw", region:"kaishin", type:"natural", role:"Dangerous whirlpool region",
    description:"A feared whirlpool region beyond the southeastern approaches, recognizable by disturbed water and the way local traffic gives it distance.",
    point:{x:107,y:72}, approachPoint:{x:107,y:72},
    arrivalActions:[
      {id:"observe",label:"Observe from Distance",description:"Study the current and movement of the water without closing dangerously."},
      {id:"enter_site",label:"Approach the Maw",description:"Bring Tideworn closer to the disturbed water."},
      {id:"search",label:"Survey the Perimeter",description:"Spend time charting the edge of the danger and looking for debris or unusual signs."}
    ], knownByDefault:true, attunementLoad:{arcane:6,industrial:0,sensitivity:0.55,mitigationTags:[]}
  }
];

export const POI_BY_ID = Object.fromEntries(POINTS_OF_INTEREST.map((poi)=>[poi.id,poi])) as Record<string,PointOfInterestDefinition>;
