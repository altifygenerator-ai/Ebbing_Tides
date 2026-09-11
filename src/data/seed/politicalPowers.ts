import type { EntityId, RegionId, ShipEntity } from "../../game/types.js";

export interface PoliticalPowerDefinition {
  factionId: EntityId;
  jurisdictionId: EntityId;
  region: RegionId;
  label: string;
  jurisdictionLabel: string;
}

/**
 * R1 deliberately keeps the political registry broad. Only Skeldra is an active proving-ground
 * jurisdiction in Alpha 0.6D; the remaining rows give future regions stable IDs without inventing
 * detailed wars, alliances, offices, or commission rules before those regions are activated.
 */
export const POLITICAL_POWERS: PoliticalPowerDefinition[] = [
  { factionId:"faction.skeldra", jurisdictionId:"jurisdiction.skeldra", region:"skeldra", label:"Crown of Skeldra", jurisdictionLabel:"Skeldran law" },
  { factionId:"faction.asteria", jurisdictionId:"jurisdiction.asteria", region:"asteria", label:"Asterian Powers", jurisdictionLabel:"Asterian law" },
  { factionId:"faction.serath", jurisdictionId:"jurisdiction.serath", region:"serath", label:"Serathi Dominion", jurisdictionLabel:"Serathi law" },
  { factionId:"faction.kaishin", jurisdictionId:"jurisdiction.kaishin", region:"kaishin", label:"Kaishin Realms", jurisdictionLabel:"Kaishin law" },
  { factionId:"faction.outer_isles", jurisdictionId:"jurisdiction.outer_isles", region:"outer_isles", label:"Outer Isles", jurisdictionLabel:"Outer Isles authority" },
  { factionId:"faction.crossroads", jurisdictionId:"jurisdiction.crossroads", region:"crossroads", label:"Crossroads Powers", jurisdictionLabel:"Crossroads law" }
];

export const POLITICAL_POWER_BY_FACTION = Object.fromEntries(POLITICAL_POWERS.map((row)=>[row.factionId,row])) as Record<EntityId, PoliticalPowerDefinition>;
export const POLITICAL_POWER_BY_JURISDICTION = Object.fromEntries(POLITICAL_POWERS.map((row)=>[row.jurisdictionId,row])) as Record<EntityId, PoliticalPowerDefinition>;
export const POLITICAL_POWER_BY_REGION = Object.fromEntries(POLITICAL_POWERS.map((row)=>[row.region,row])) as Record<RegionId, PoliticalPowerDefinition>;

export function politicalPowerForRegion(region: RegionId): PoliticalPowerDefinition {
  return POLITICAL_POWER_BY_REGION[region];
}

export function factionIdForRegion(region: RegionId): EntityId {
  return politicalPowerForRegion(region).factionId;
}

export function jurisdictionIdForRegion(region: RegionId): EntityId {
  return politicalPowerForRegion(region).jurisdictionId;
}

/** Ship flag/region is the stable R1 authority hook. Commission/flag-changing rules arrive in R2. */
export function politicalPowerForShip(ship: ShipEntity): PoliticalPowerDefinition {
  return politicalPowerForRegion(ship.region);
}
