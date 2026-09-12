import type { EntityId, RegionId } from "../../game/types.js";
/**
 * WORLD SETTLEMENT & MARITIME GEOGRAPHY CANON 0.1
 * World-expansion registration: all canonical settlements and maritime POIs now carry gameplay IDs.
 * Runtime grid coordinates remain implementation geometry registered in ports.ts / pois.ts / worldMap.ts.
 */
export const WORLD_SETTLEMENT_GEOGRAPHY_CANON_VERSION="0.1" as const;
export const WORLD_SETTLEMENT_GEOGRAPHY_CANON_MAP_ASSET_ID="canon.world_settlement_maritime_geography.0_1.map" as const;
export const WORLD_SETTLEMENT_GEOGRAPHY_CANON_RECORD_ASSET_ID="canon.world_settlement_maritime_geography.0_1.settlement_record" as const;
export type CanonGeographyRegionId="skeldra"|"outer_isles_greywater_coast"|"asterian_sea"|"vesperan_strait"|"serath"|"eastern_approaches_kaishin";
export type CanonLocationCategory="major_capital_great_port"|"city_regional_port"|"sacred_city_fortress"|"poi_danger_geography";
export interface CanonLocationRecord{
  id:EntityId;name:string;aliases?:string[];canonicalRegion:CanonGeographyRegionId;runtimeRegion:RegionId;category:CanonLocationCategory;role:string;kind:"settlement"|"poi";playableInCurrentAlpha:boolean;gameplayEntityId?:EntityId;
}
export const SETTLEMENT_GEOGRAPHY_RULES=[
  "Ports belong on coasts, bays, river mouths, islands, fjords, and straits.",
  "Inland cities must have visible river or gulf access.",
  "Named cities must make maritime sense in their location, culture, and function.",
  "Major capitals and great ports anchor trade, religion, and politics across the world."
] as const;
const playable=<T extends Omit<CanonLocationRecord,"playableInCurrentAlpha"|"gameplayEntityId">>(row:T):CanonLocationRecord=>({...row,playableInCurrentAlpha:true,gameplayEntityId:row.id});
export const CANON_WORLD_LOCATIONS:CanonLocationRecord[]=[
  // Skeldra
  playable({id:"port.veyrholm",name:"Veyrholm",canonicalRegion:"skeldra",runtimeRegion:"skeldra",category:"major_capital_great_port",role:"capital / great port",kind:"settlement"}),
  playable({id:"port.ironhaven",name:"Ironhaven",canonicalRegion:"skeldra",runtimeRegion:"skeldra",category:"city_regional_port",role:"industrial port",kind:"settlement"}),
  playable({id:"port.stormvik",name:"Stormvik",canonicalRegion:"skeldra",runtimeRegion:"skeldra",category:"city_regional_port",role:"storm-coast harbor",kind:"settlement"}),
  playable({id:"port.thorenfjord",name:"Thorenfjord",canonicalRegion:"skeldra",runtimeRegion:"skeldra",category:"sacred_city_fortress",role:"sacred fjord city",kind:"settlement"}),
  playable({id:"settlement.hrafnvik",name:"Hrafnvik",canonicalRegion:"skeldra",runtimeRegion:"skeldra",category:"city_regional_port",role:"northern whaling harbor",kind:"settlement"}),
  playable({id:"settlement.kaldstrand",name:"Kaldstrand",canonicalRegion:"skeldra",runtimeRegion:"skeldra",category:"city_regional_port",role:"cold eastern port",kind:"settlement"}),
  playable({id:"settlement.bjornhavn",name:"Bjornhavn",canonicalRegion:"skeldra",runtimeRegion:"skeldra",category:"city_regional_port",role:"ore and timber export port",kind:"settlement"}),
  playable({id:"settlement.runeskar",name:"Runeskar",canonicalRegion:"skeldra",runtimeRegion:"skeldra",category:"sacred_city_fortress",role:"watch-fort island harbor",kind:"settlement"}),
  playable({id:"poi.old_veyr_beacon",name:"Old Veyr Beacon",canonicalRegion:"skeldra",runtimeRegion:"skeldra",category:"poi_danger_geography",role:"navigational landmark",kind:"poi"}),
  // Outer Isles / Greywater Coast
  playable({id:"settlement.greywater",name:"Greywater",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"city_regional_port",role:"marsh trade port",kind:"settlement"}),
  playable({id:"settlement.port_meridian",name:"Port Meridian",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"city_regional_port",role:"merchant harbor",kind:"settlement"}),
  playable({id:"settlement.blackhaven",name:"Blackhaven",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"city_regional_port",role:"freeport",kind:"settlement"}),
  playable({id:"settlement.ardaran",name:"Ardaran",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"crossroads",category:"city_regional_port",role:"channel customs port",kind:"settlement"}),
  playable({id:"settlement.saltwake",name:"Saltwake",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"city_regional_port",role:"smuggling harbor",kind:"settlement"}),
  playable({id:"settlement.saint_corren",name:"Saint Corren",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"city_regional_port",role:"island mission port",kind:"settlement"}),
  playable({id:"settlement.redhook",name:"Redhook",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"city_regional_port",role:"fishing / raider port",kind:"settlement"}),
  playable({id:"settlement.gullreach",name:"Gullreach",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"city_regional_port",role:"outer market port",kind:"settlement"}),
  playable({id:"poi.black_cape",name:"Black Cape",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"poi_danger_geography",role:"dangerous headland",kind:"poi"}),
  playable({id:"poi.western_deep",name:"Western Deep",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"crossroads",category:"poi_danger_geography",role:"deep-sea region",kind:"poi"}),
  playable({id:"poi.greywater_wrecks",name:"Greywater Wrecks",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"poi_danger_geography",role:"ship graveyard",kind:"poi"}),
  playable({id:"poi.widows_passage",name:"Widow's Passage",canonicalRegion:"outer_isles_greywater_coast",runtimeRegion:"outer_isles",category:"poi_danger_geography",role:"hazardous strait",kind:"poi"}),
  // Asterian Sea
  playable({id:"settlement.asterra",name:"Asterra",canonicalRegion:"asterian_sea",runtimeRegion:"asteria",category:"major_capital_great_port",role:"capital / great port",kind:"settlement"}),
  playable({id:"settlement.thalassa",name:"Thalassa",canonicalRegion:"asterian_sea",runtimeRegion:"asteria",category:"city_regional_port",role:"southern harbor city",kind:"settlement"}),
  playable({id:"settlement.aurelia",name:"Aurelia",aliases:["Aurellia"],canonicalRegion:"asterian_sea",runtimeRegion:"asteria",category:"city_regional_port",role:"southern trade coast",kind:"settlement"}),
  playable({id:"settlement.korinthos",name:"Korinthos",canonicalRegion:"asterian_sea",runtimeRegion:"asteria",category:"city_regional_port",role:"regional strait hub",kind:"settlement"}),
  playable({id:"settlement.delphara",name:"Delphara",canonicalRegion:"asterian_sea",runtimeRegion:"asteria",category:"sacred_city_fortress",role:"shrine island port",kind:"settlement"}),
  playable({id:"settlement.rhadessa",name:"Rhadessa",canonicalRegion:"asterian_sea",runtimeRegion:"asteria",category:"city_regional_port",role:"eastern merchant port",kind:"settlement"}),
  playable({id:"settlement.myrine",name:"Myrine",canonicalRegion:"asterian_sea",runtimeRegion:"asteria",category:"city_regional_port",role:"market harbor",kind:"settlement"}),
  playable({id:"settlement.eirenos",name:"Eirenos",canonicalRegion:"asterian_sea",runtimeRegion:"asteria",category:"city_regional_port",role:"shipwright town",kind:"settlement"}),
  playable({id:"poi.thalassors_teeth",name:"Thalassor's Teeth",canonicalRegion:"asterian_sea",runtimeRegion:"asteria",category:"poi_danger_geography",role:"hazardous reef chain",kind:"poi"}),
  // Vesperan Strait
  playable({id:"settlement.vespera",name:"Vespera",canonicalRegion:"vesperan_strait",runtimeRegion:"crossroads",category:"major_capital_great_port",role:"great gateway port",kind:"settlement"}),
  playable({id:"settlement.pelasion",name:"Pelasion",canonicalRegion:"vesperan_strait",runtimeRegion:"crossroads",category:"city_regional_port",role:"western approach port",kind:"settlement"}),
  playable({id:"settlement.southwatch",name:"Southwatch",canonicalRegion:"vesperan_strait",runtimeRegion:"crossroads",category:"city_regional_port",role:"customs harbor",kind:"settlement"}),
  playable({id:"settlement.lantern_key",name:"Lantern Key",canonicalRegion:"vesperan_strait",runtimeRegion:"crossroads",category:"city_regional_port",role:"pilot isle harbor",kind:"settlement"}),
  // Serath
  playable({id:"settlement.aurel",name:"Aurel",canonicalRegion:"serath",runtimeRegion:"serath",category:"major_capital_great_port",role:"great capital / great port",kind:"settlement"}),
  playable({id:"settlement.antiochara",name:"Antiochara",canonicalRegion:"serath",runtimeRegion:"serath",category:"city_regional_port",role:"eastern gulf city",kind:"settlement"}),
  playable({id:"settlement.tyras",name:"Tyras",canonicalRegion:"serath",runtimeRegion:"serath",category:"city_regional_port",role:"northern strait port",kind:"settlement"}),
  playable({id:"settlement.japhra",name:"Japhra",canonicalRegion:"serath",runtimeRegion:"serath",category:"city_regional_port",role:"western caravan harbor",kind:"settlement"}),
  playable({id:"settlement.qasirah",name:"Qasirah",canonicalRegion:"serath",runtimeRegion:"serath",category:"city_regional_port",role:"southeastern pearl port",kind:"settlement"}),
  playable({id:"settlement.safir",name:"Safir",canonicalRegion:"serath",runtimeRegion:"serath",category:"city_regional_port",role:"southern coast town",kind:"settlement"}),
  // Eastern Approaches / Kaishin
  playable({id:"settlement.kaishin",name:"Kaishin",canonicalRegion:"eastern_approaches_kaishin",runtimeRegion:"kaishin",category:"major_capital_great_port",role:"great capital",kind:"settlement"}),
  playable({id:"settlement.tenzan",name:"Tenzan",canonicalRegion:"eastern_approaches_kaishin",runtimeRegion:"kaishin",category:"city_regional_port",role:"northern mountain city with river access",kind:"settlement"}),
  playable({id:"settlement.nagara",name:"Nagara",canonicalRegion:"eastern_approaches_kaishin",runtimeRegion:"kaishin",category:"city_regional_port",role:"western trade port",kind:"settlement"}),
  playable({id:"settlement.hanzhou",name:"Hanzhou",canonicalRegion:"eastern_approaches_kaishin",runtimeRegion:"kaishin",category:"city_regional_port",role:"river city",kind:"settlement"}),
  playable({id:"settlement.ryosen",name:"Ryosen",canonicalRegion:"eastern_approaches_kaishin",runtimeRegion:"kaishin",category:"city_regional_port",role:"shipbuilding port",kind:"settlement"}),
  playable({id:"settlement.shido",name:"Shido",canonicalRegion:"eastern_approaches_kaishin",runtimeRegion:"kaishin",category:"city_regional_port",role:"eastern archipelago port",kind:"settlement"}),
  playable({id:"settlement.linhai",name:"Linhai",canonicalRegion:"eastern_approaches_kaishin",runtimeRegion:"kaishin",category:"city_regional_port",role:"southern coast market",kind:"settlement"}),
  playable({id:"settlement.kuroseki",name:"Kuroseki",canonicalRegion:"eastern_approaches_kaishin",runtimeRegion:"kaishin",category:"sacred_city_fortress",role:"southwestern fortress harbor",kind:"settlement"}),
  playable({id:"poi.spiral_maw",name:"Spiral Maw",canonicalRegion:"eastern_approaches_kaishin",runtimeRegion:"kaishin",category:"poi_danger_geography",role:"dangerous whirlpool region",kind:"poi"})
];
export const CANON_SETTLEMENTS=CANON_WORLD_LOCATIONS.filter(row=>row.kind==="settlement");
export const CANON_MARITIME_POIS=CANON_WORLD_LOCATIONS.filter(row=>row.kind==="poi");
export const CANON_WORLD_LOCATION_BY_ID=Object.fromEntries(CANON_WORLD_LOCATIONS.map(row=>[row.id,row])) as Record<EntityId,CanonLocationRecord>;
export function canonLocationsForRegion(region:CanonGeographyRegionId):CanonLocationRecord[]{return CANON_WORLD_LOCATIONS.filter(row=>row.canonicalRegion===region);}
export function canonicalLocationName(id:EntityId):string{return CANON_WORLD_LOCATION_BY_ID[id]?.name??id;}
