import type { EntityId, RegionId } from "../../game/types.js";

export interface OriginSettlementDefinition {
  id: EntityId;
  name: string;
  region: RegionId;
  kind: "playable_port" | "origin_only";
  note: string;
}

// Character-creator origin choices are a deliberately smaller gameplay subset of the full world settlement canon.
// Settlement existence/category/geography is authoritative in settlementCanon.ts; adding a place there does not
// automatically expose it as a creator option or make its region playable.
// Identity-only settlements do not create playable regions.
export const ORIGIN_SETTLEMENTS: OriginSettlementDefinition[] = [
  { id:"port.veyrholm", name:"Veyrholm", region:"skeldra", kind:"playable_port", note:"Royal capital and naval headquarters." },
  { id:"port.ironhaven", name:"Ironhaven", region:"skeldra", kind:"playable_port", note:"Industrial metropolis and foundry port." },
  { id:"port.stormvik", name:"Stormvik", region:"skeldra", kind:"playable_port", note:"Mountain harbor and traditional maritime center." },
  { id:"port.thorenfjord", name:"Thorenfjord", region:"skeldra", kind:"playable_port", note:"Ancient sacred city of the Old Gods." },

  { id:"settlement.asterra", name:"Asterra", region:"asteria", kind:"origin_only", note:"Asterian intellectual and magical capital." },
  { id:"settlement.korinthos", name:"Korinthos", region:"asteria", kind:"origin_only", note:"Wealthy isthmus trade city." },
  { id:"settlement.rhadessa", name:"Rhadessa", region:"asteria", kind:"origin_only", note:"Fortified island and naval academy center." },
  { id:"settlement.aurelia", name:"Aurelia", region:"asteria", kind:"origin_only", note:"Former imperial capital and old magical center." },
  { id:"settlement.delphara", name:"Delphara", region:"asteria", kind:"origin_only", note:"Pantheon holy city and oracle center." },

  { id:"settlement.aurel", name:"Aurel", region:"serath", kind:"origin_only", note:"Great Covenant holy city." },
  { id:"settlement.antiochara", name:"Antiochara", region:"serath", kind:"origin_only", note:"Cosmopolitan trade and theology metropolis." },
  { id:"settlement.tyras", name:"Tyras", region:"serath", kind:"origin_only", note:"Ancient luxury-trade city on the Serathi coast." },
  { id:"settlement.japhra", name:"Japhra", region:"serath", kind:"origin_only", note:"Pilgrimage port serving Aurel." },

  { id:"settlement.kaishin", name:"Kaishin", region:"kaishin", kind:"origin_only", note:"Eastern imperial capital." },
  { id:"settlement.hanzhou", name:"Hanzhou", region:"kaishin", kind:"origin_only", note:"Eastern commercial canal and sea-trade center." },
  { id:"settlement.nagara", name:"Nagara", region:"kaishin", kind:"origin_only", note:"Controlled foreign-facing eastern port." },
  { id:"settlement.tenzan", name:"Tenzan", region:"kaishin", kind:"origin_only", note:"Eastern sacred mountain and monastery center." },

  { id:"settlement.vespera", name:"Vespera", region:"crossroads", kind:"origin_only", note:"Great strait crossroads and mixed imperial city." },
  { id:"settlement.ardaran", name:"Ardaran", region:"crossroads", kind:"origin_only", note:"Fortress at the western gate of the Inner Sea." },
  { id:"settlement.blackhaven", name:"Blackhaven", region:"outer_isles", kind:"origin_only", note:"Outer Isles pirate republic and black market." }
];

export const ORIGIN_SETTLEMENT_BY_ID = Object.fromEntries(ORIGIN_SETTLEMENTS.map((row)=>[row.id,row])) as Record<EntityId, OriginSettlementDefinition>;

export const HOMELAND_REGION_LABELS: Record<RegionId,string> = {
  skeldra:"Skeldra / Northwestern Realms",
  asteria:"Asterian / Central Pantheon World",
  serath:"Serathi Covenant Homelands",
  kaishin:"Eastern Empire / Kaishin",
  outer_isles:"Outer Isles",
  crossroads:"Crossroads / Strait & Western Gate"
};

export function originSettlementName(id: EntityId): string {
  return ORIGIN_SETTLEMENT_BY_ID[id]?.name ?? id;
}
