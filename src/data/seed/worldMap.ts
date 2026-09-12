import type { GridPoint, RegionId, TerrainType, WorldMapCell } from "../../game/types.js";
import { WORLD_TERRAIN_MASK_V06D_LABELED, WORLD_TERRAIN_MASK_HEIGHT, WORLD_TERRAIN_MASK_WIDTH } from "./worldTerrainMask.js";

export const GLOBAL_ATLAS = {
  width: WORLD_TERRAIN_MASK_WIDTH,
  height: WORLD_TERRAIN_MASK_HEIGHT,
  cellScaleNm: 20,
  version: "WORLD_ATLAS_0.6D_LABELED_CANON1_WORLD_EXPANSION",
  projection: "illustrated_world_atlas_rectangular_grid",
  visualAssetId: "map.world_atlas.labeled_v06d"
} as const;

export const NAVIGATION_ZOOMS = {
  far:{width:120,height:80,panStep:20},
  navigation:{width:18,height:12,panStep:4},
  close:{width:12,height:8,panStep:3}
} as const;
export type NavigationZoom = keyof typeof NAVIGATION_ZOOMS;
export const NAVIGATION_VIEW = NAVIGATION_ZOOMS.far;

export interface RegionalMapLayer {
  id:string; name:string; assetId:string;
  globalBounds:{x:number;y:number;width:number;height:number};
  overlapCells:number; priority:number; development:"active"|"reserved";
}
export const REGIONAL_MAP_LAYERS: RegionalMapLayer[] = [
  {id:"layer.world.labeled.v06d",name:"Labeled World Atlas — Alpha 0.6D",assetId:"map.world_atlas.labeled_v06d",globalBounds:{x:0,y:0,width:WORLD_TERRAIN_MASK_WIDTH,height:WORLD_TERRAIN_MASK_HEIGHT},overlapCells:0,priority:0,development:"active"}
];
export function navigationViewForZoom(zoom:NavigationZoom){return NAVIGATION_ZOOMS[zoom];}
export function mapLayersForViewport(origin:GridPoint,zoom:NavigationZoom):RegionalMapLayer[]{
  const view=navigationViewForZoom(zoom);
  return REGIONAL_MAP_LAYERS.filter(layer=>origin.x<layer.globalBounds.x+layer.globalBounds.width&&origin.x+view.width>layer.globalBounds.x&&origin.y<layer.globalBounds.y+layer.globalBounds.height&&origin.y+view.height>layer.globalBounds.y).sort((a,b)=>a.priority-b.priority);
}

export interface AtlasRegionBounds {
  id:RegionId|"northwestern_sea"|"vesperan_strait"|"ardaran_gate"|"great_western_ocean";
  name:string;x:number;y:number;width:number;height:number;development:"active"|"reserved";
}

// Alpha 0.6D world-expansion pass: one continuous world atlas, with all canonical regional windows enabled for traversal.
export const ATLAS_REGIONS: AtlasRegionBounds[] = [
  {id:"great_western_ocean",name:"Great Western Ocean",x:0,y:0,width:28,height:80,development:"active"},
  {id:"northwestern_sea",name:"Northwestern Sea / Skeldra",x:12,y:1,width:45,height:31,development:"active"},
  {id:"ardaran_gate",name:"Ardaran Gate",x:11,y:27,width:17,height:24,development:"active"},
  {id:"asteria",name:"Asterian Sea",x:21,y:29,width:43,height:31,development:"active"},
  {id:"vesperan_strait",name:"Vesperan Strait",x:63,y:28,width:19,height:23,development:"active"},
  {id:"serath",name:"Serathi Coast",x:62,y:43,width:31,height:25,development:"active"},
  {id:"kaishin",name:"Eastern Approaches / Kaishin",x:83,y:24,width:37,height:43,development:"active"},
  {id:"outer_isles",name:"Outer Isles",x:0,y:52,width:30,height:28,development:"active"}
];

// Retained for compatibility with existing UI/tests; it remains the original Skeldra proving-ground rectangle.
export const SKELDRA_DEVELOPED_BOUNDS={x:14,y:2,width:42,height:29} as const;
export const WORLD_DEVELOPED_BOUNDS={x:0,y:0,width:WORLD_TERRAIN_MASK_WIDTH,height:WORLD_TERRAIN_MASK_HEIGHT} as const;

// Authored settlement markers are land; every approach marker is forced to navigable water.
const LAND_OVERRIDES=new Set([
  // Skeldra
  "31,25","37,18","23,17","34,5","27,7","47,4","52,13","59,13","26,21",
  // Greywater / Outer Isles
  "16,36","20,41","24,47","12,56","9,55","14,54","18,55","23,57","11,55",
  // Asteria
  "42,44","31,56","41,57","51,45","52,53","57,54","34,51","39,49",
  // Vesperan Strait
  "70,33","66,36","75,40","68,46",
  // Serath
  "83,57","88,53","75,47","72,56","80,64","88,65",
  // Kaishin / East
  "95,34","91,29","86,39","96,43","111,43","112,50","107,58","91,53"
]);
const WATER_OVERRIDES=new Set([
  // Skeldra approaches
  "32,25","38,18","24,17","33,5","28,7","48,5","53,14","59,14","27,21",
  // Greywater / Outer Isles approaches + sea POIs
  "17,36","21,41","25,47","10,55","10,54","15,53","19,54","24,56","11,54","6,37","14,39","12,53",
  // Asteria approaches + reef POI
  "43,44","32,56","42,57","50,44","51,54","58,54","35,51","40,50","56,60",
  // Vesperan Strait
  "71,33","67,36","76,40","69,46",
  // Serath
  "84,57","89,53","76,47","73,56","81,64","89,65",
  // Kaishin / East + Spiral Maw
  "94,34","90,30","87,39","97,43","112,43","113,50","108,58","90,54","107,72"
]);

const REEF_KEYS=new Set([
  "14,39","15,39","13,40", // Greywater Wrecks
  "12,53","13,53", // Widow's Passage
  "56,60","55,60","57,60", // Thalassor's Teeth
  "107,72","106,72" // Spiral Maw perimeter
]);

function inAtlas(point:GridPoint):boolean{return point.x>=0&&point.y>=0&&point.x<GLOBAL_ATLAS.width&&point.y<GLOBAL_ATLAS.height;}
function terrainMaskIsWater(point:GridPoint):boolean{
  if(!inAtlas(point))return false;
  const row=WORLD_TERRAIN_MASK_V06D_LABELED[point.y];
  return row?.[point.x]===".";
}
function isWater(point:GridPoint):boolean{
  const key=`${point.x},${point.y}`;
  if(WATER_OVERRIDES.has(key))return true;
  if(LAND_OVERRIDES.has(key))return false;
  return terrainMaskIsWater(point);
}
function regionForPoint(point:GridPoint):RegionId|"crossroads"{
  if(point.x<27&&point.y>=52)return"outer_isles";
  if(point.x>=83)return"kaishin";
  if(point.x>=62&&point.y>=43)return"serath";
  if(point.x>=20&&point.y>=29&&point.x<66)return"asteria";
  if(point.x>=12&&point.y<32)return"skeldra";
  return"crossroads";
}
function neighboringLand(point:GridPoint):boolean{
  for(let dy=-1;dy<=1;dy+=1){for(let dx=-1;dx<=1;dx+=1){
    if(dx===0&&dy===0)continue;
    const next={x:point.x+dx,y:point.y+dy};
    if(inAtlas(next)&&!isWater(next))return true;
  }}
  return false;
}

export function getWorldCell(point:GridPoint):WorldMapCell{
  if(!inAtlas(point))return{...point,terrain:"void",navigable:false,movementCost:999,region:"crossroads",hazards:["outside_known_atlas"],development:"reserved"};
  const development:"active"="active";
  const region=regionForPoint(point);
  if(!isWater(point))return{...point,terrain:"land",navigable:false,movementCost:999,region,hazards:[],development};
  const key=`${point.x},${point.y}`;
  if(REEF_KEYS.has(key))return{...point,terrain:"reef",navigable:true,movementCost:2.4,region,hazards:["grounding"],development};
  if(neighboringLand(point))return{...point,terrain:"coastal_water",navigable:true,movementCost:1.25,region,hazards:["shoal_water"],development};
  const terrain:TerrainType="deep_sea";
  return{...point,terrain,navigable:true,movementCost:1,region,hazards:[],development};
}
export function isNavigableCell(point:GridPoint):boolean{return getWorldCell(point).navigable;}
export function isMappedWater(point:GridPoint):boolean{return inAtlas(point)&&isWater(point);}
export function clampNavigationViewport(origin:GridPoint,zoom:NavigationZoom="navigation"):GridPoint{
  const view=navigationViewForZoom(zoom);const maxX=GLOBAL_ATLAS.width-view.width;const maxY=GLOBAL_ATLAS.height-view.height;
  return{x:Math.max(0,Math.min(maxX,Math.round(origin.x))),y:Math.max(0,Math.min(maxY,Math.round(origin.y)))};
}
export function viewportAround(point:GridPoint,zoom:NavigationZoom="navigation"):GridPoint{
  const view=navigationViewForZoom(zoom);return clampNavigationViewport({x:Math.floor(point.x-view.width/2),y:Math.floor(point.y-view.height/2)},zoom);
}
export function cellKey(point:GridPoint):string{return`${point.x},${point.y}`;}
export function parseCellKey(key:string):GridPoint{const[x,y]=key.split(",").map(Number);return{x:x??0,y:y??0};}
