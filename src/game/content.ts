import type { CultureId, EntityId, RegionId } from "./types.js";

export type ContentCategory =
  | "weapon"
  | "firearm"
  | "armor"
  | "clothing"
  | "tool"
  | "arcane_equipment"
  | "industrial_equipment"
  | "religious_object"
  | "ship_module"
  | "consumable"
  | "commodity"
  | "document"
  | "valuable"
  | "relic"
  | "utility";

export type ContentRarity = "ubiquitous" | "common" | "uncommon" | "rare" | "unique";
export type ContentLegalStatus = "ordinary" | "licensed" | "restricted" | "military_only" | "contraband" | "stolen" | "sacred" | "politically_sensitive";
export type ContentArtStatus = "canonical" | "approved" | "provisional" | "placeholder" | "missing" | "deprecated";
export type MarketType =
  | "general_market"
  | "weaponsmith"
  | "armorer"
  | "outfitter"
  | "ship_chandler"
  | "shipyard"
  | "foundry"
  | "arcane_dealer"
  | "religious_vendor"
  | "black_market"
  | "merchant_exchange"
  | "apothecary"
  | "book_chart_seller";

export interface CanonicalContentDefinition {
  id: EntityId;
  name: string;
  category: ContentCategory;
  subcategory?: string;
  originRegion?: RegionId | "common" | "cross_regional" | "unknown_western";
  originCulture?: CultureId;
  makerOrigins?: string[];
  materials?: string[];
  gameplayRoles: string[];
  marketTypes: MarketType[];
  rarity: ContentRarity;
  legalStatus: ContentLegalStatus;
  baseValue?: number;
  weightBulk?: string;
  availabilityTags: string[];
  exportTags?: string[];
  importTags?: string[];
  attunement?: "neutral" | "arcane" | "industrial" | "hybrid_sensitive";
  iconAssetId?: EntityId;
  inspectionAssetId?: EntityId;
  wornReferenceAssetId?: EntityId;
  artStatus: ContentArtStatus;
  uniqueMarketStock?: boolean;
  provenanceRequired?: boolean;
  description?: string;
  maxRangeYards?: number;
  effectiveRangeYards?: number;
  preferredRangeYards?: number;
  accuracyFalloff?: "gentle" | "moderate" | "steep";
}

export type ShipClassRole =
  | "workboat" | "fast_coastal" | "merchant" | "naval_patrol" | "warship" | "capital_warship"
  | "industrial_special" | "coastal" | "arcane_special" | "capital_arcane" | "coastal_trader"
  | "passenger_merchant" | "pursuit" | "support" | "coastal_merchant" | "industrial_test"
  | "courier" | "naval" | "smuggler" | "raider" | "pirate" | "pirate_heavy" | "prestige_pirate"
  | "exploration";

export interface ShipClassDefinition {
  id: EntityId;
  name: string;
  region: RegionId | "common" | "explorer";
  role: ShipClassRole;
  doctrine: string;
  /** Physical base cruise speed used by player and NPC travel. */
  cruiseSpeedKnots: number;
  artNeed: string;
  availabilityTags: string[];
  buildTags: string[];
  attunement: "neutral" | "arcane" | "industrial" | "hybrid_sensitive";
  tokenAssetId?: EntityId;
  inspectionAssetId?: EntityId;
  artStatus: ContentArtStatus;
}

export type AvailabilityBand = "unavailable" | "restricted" | "rare_import" | "occasional" | "common" | "local_specialty";

export interface RegionalAvailability {
  definitionId: EntityId;
  regionId: RegionId;
  manufacturedLocally: boolean;
  commonality: AvailabilityBand;
  importDependency: "none" | "low" | "moderate" | "high" | "exclusive_import";
  legalStatus: ContentLegalStatus;
  priceModifier: number;
}

export interface SettlementAvailability {
  settlementId: EntityId;
  contentDefinitionId: EntityId;
  availability: AvailabilityBand;
  source: "local" | "regional" | "import" | "captured" | "surplus" | "smuggled" | "religious" | "state";
  priceModifier: number;
  stockWeight: number;
  restrictions: string[];
}

export type CapabilityLevel = 0 | 1 | 2 | 3 | 4;

export interface ShipyardCapabilityProfile {
  builds: EntityId[];
  commonlySells: EntityId[];
  sometimesSells: EntityId[];
  imports: EntityId[];
  repairs: CapabilityLevel;
  refits: CapabilityLevel;
  specialistCapabilities: string[];
}

export interface SettlementEconomicProfile {
  settlementId: EntityId;
  regionId: RegionId;
  primaryIndustries: string[];
  exports: string[];
  imports: string[];
  shipbuildingLevel: CapabilityLevel;
  repairCapability: CapabilityLevel;
  medicalCapability: CapabilityLevel;
  militarySupplyLevel: CapabilityLevel;
  arcaneServices: CapabilityLevel;
  industrialServices: CapabilityLevel;
  luxuryAvailability: CapabilityLevel;
  smugglingAvailability: CapabilityLevel;
  religiousGoods: CapabilityLevel;
  marketTypes: MarketType[];
  shipyard: ShipyardCapabilityProfile;
}
