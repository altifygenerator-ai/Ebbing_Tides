import type { AncestryId, CultureId, EntityId, RegionId, ReligionId, SexId } from "../game/types.js";

export type HistoricalDatePrecision = "exact" | "month" | "year" | "approximate" | "range" | "unknown";

/**
 * Canonical historical date representation. Ancient/uncertain records are allowed to remain uncertain;
 * missing precision must never be fabricated by the caller.
 */
export interface HistoricalDate {
  precision: HistoricalDatePrecision;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  endYear?: number;
}

export type HistoryOrigin = "authored" | "simulated";
export type CanonicalStatus = "canonical" | "canonical_uncertain" | "disputed" | "traditional" | "provisional";
export type HistoricalCharacterLifecycle = "historical_only" | "living_persistent";

export interface HistoricalCharacterRecord {
  id: EntityId;
  name: string;
  sex: SexId | "unknown";
  ancestry: AncestryId | "unknown";
  homelandRegion: RegionId | "unknown";
  culture: CultureId | "unknown";
  religion: ReligionId | "unknown";
  birthDate: HistoricalDate;
  deathDate: HistoricalDate;
  socialStatus?: string;
  houseId?: EntityId;
  notes?: string;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
  lifecycle: HistoricalCharacterLifecycle;
  /** When present, the active simulation uses the same world identity rather than a duplicate person. */
  runtimeCharacterId?: EntityId;
}

export type HistoricalRelationshipType =
  | "parent" | "child" | "spouse" | "sibling" | "guardian" | "adoptive_parent" | "betrothed";

export interface HistoricalRelationshipRecord {
  id: EntityId;
  fromCharacterId: EntityId;
  toCharacterId: EntityId;
  relationshipType: HistoricalRelationshipType;
  startDate: HistoricalDate;
  endDate: HistoricalDate;
  endReason?: string;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface HouseRecord {
  id: EntityId;
  name: string;
  culture: CultureId;
  region: RegionId;
  foundedDate: HistoricalDate;
  endedDate: HistoricalDate;
  founderCharacterId?: EntityId;
  parentHouseId?: EntityId;
  cadetBranchOfHouseId?: EntityId;
  notes?: string;
  status: "active" | "ended" | "traditional" | "disputed";
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export type OfficeSelectionMode = "hereditary" | "elected" | "appointed" | "religious" | "military" | "civic" | "customary";

export interface OfficeRecord {
  id: EntityId;
  name: string;
  institutionId?: EntityId;
  region?: RegionId;
  selectionMode: OfficeSelectionMode;
  hereditaryByDefault: boolean;
  notes?: string;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface OfficeTermRecord {
  id: EntityId;
  officeId: EntityId;
  holderCharacterId: EntityId;
  startDate: HistoricalDate;
  endDate: HistoricalDate;
  endReason?: string;
  interim: boolean;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export type ClaimBasis =
  | "direct_descent" | "collateral_descent" | "marriage" | "adoption" | "appointment" | "election"
  | "conquest" | "treaty" | "religious_recognition" | "customary_law" | "disputed_document";

export interface ClaimRecord {
  id: EntityId;
  claimantCharacterId: EntityId;
  targetOfficeId: EntityId;
  basis: ClaimBasis;
  strength?: number;
  priority?: number;
  legalBasis?: string;
  genealogicalPath?: EntityId[];
  disputed: boolean;
  active: boolean;
  startDate: HistoricalDate;
  endDate: HistoricalDate;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export type HistoricalEventType =
  | "birth" | "death" | "marriage" | "coronation" | "election" | "appointment" | "deposition"
  | "conversion" | "war_declaration" | "battle" | "treaty" | "rebellion" | "assassination" | "voyage"
  | "shipwreck" | "religious_council" | "institution_founding" | "succession_dispute" | "discovery"
  | "disaster" | "economic_crisis" | "campaign_begin" | "arrival" | "combat" | "other";

export interface HistoricalEventRecord {
  id: EntityId;
  eventType: HistoricalEventType;
  title: string;
  date: HistoricalDate;
  locationId?: EntityId;
  participantCharacterIds: EntityId[];
  factionIds: EntityId[];
  description: string;
  canonicalStatus: CanonicalStatus;
  origin: HistoryOrigin;
  sourceConfidence?: number;
  createdAtIso?: string;
  createdBySystem?: string;
  importedFromSeed?: string;
  simulationEventId?: EntityId;
}

export type EventLinkRelation =
  | "caused" | "contributed_to" | "reaction_to" | "enabled" | "ended" | "accelerated" | "triggered" | "consequence_of";

export interface HistoricalEventLinkRecord {
  id: EntityId;
  sourceEventId: EntityId;
  targetEventId: EntityId;
  relationType: EventLinkRelation;
  notes?: string;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface InstitutionRecord {
  id: EntityId;
  name: string;
  founderCharacterId?: EntityId;
  foundedDate: HistoricalDate;
  endedDate: HistoricalDate;
  region?: RegionId;
  religion?: ReligionId;
  culture?: CultureId;
  purpose: string;
  headquartersLocationId?: EntityId;
  parentInstitutionId?: EntityId;
  status: "active" | "ended" | "dormant" | "disputed";
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface WarRecord {
  id: EntityId;
  name: string;
  participantFactionIds: EntityId[];
  startDate: HistoricalDate;
  endDate: HistoricalDate;
  causeEventIds: EntityId[];
  goals: string[];
  outcome?: string;
  linkedEventIds: EntityId[];
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface BattleRecord {
  id: EntityId;
  name: string;
  warId?: EntityId;
  date: HistoricalDate;
  locationId?: EntityId;
  commanderCharacterIds: EntityId[];
  forceFactionIds: EntityId[];
  result: string;
  casualties?: string;
  linkedShipIds: EntityId[];
  eventId?: EntityId;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface TreatyRecord {
  id: EntityId;
  name: string;
  participantFactionIds: EntityId[];
  date: HistoricalDate;
  provisions: string[];
  effect: string;
  modifiedWarIds: EntityId[];
  eventId?: EntityId;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface HistoricalShipRecord {
  id: EntityId;
  name: string;
  shipClass?: string;
  builtDate: HistoricalDate;
  builderInstitutionId?: EntityId;
  builderName?: string;
  portBuiltId?: EntityId;
  lossDate: HistoricalDate;
  fameTags: string[];
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface HistoricalShipOwnershipRecord {
  id: EntityId;
  shipId: EntityId;
  ownerCharacterId?: EntityId;
  ownerInstitutionId?: EntityId;
  ownerName?: string;
  ownershipStatus: "known" | "unknown" | "disputed";
  startDate: HistoricalDate;
  endDate: HistoricalDate;
  acquisitionMethod?: string;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface HistoricalShipCommandRecord {
  id: EntityId;
  shipId: EntityId;
  captainCharacterId: EntityId;
  startDate: HistoricalDate;
  endDate: HistoricalDate;
  endReason?: string;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface HistoricalShipRefitRecord {
  id: EntityId;
  shipId: EntityId;
  date: HistoricalDate;
  description: string;
  locationId?: EntityId;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface HistoricalShipRenameRecord {
  id: EntityId;
  shipId: EntityId;
  oldName: string;
  newName: string;
  date: HistoricalDate;
  reason?: string;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface HistoricalSourceRecord {
  id: EntityId;
  title: string;
  authorCharacterId?: EntityId;
  authorName?: string;
  dateWritten: HistoricalDate;
  culture?: CultureId;
  institutionId?: EntityId;
  sourceType: "chronicle" | "letter" | "pamphlet" | "official_record" | "journal" | "oral_tradition" | "artifact" | "other";
  reliability: number;
  biasTags: string[];
  summary: string;
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface HistoricalInterpretationRecord {
  id: EntityId;
  sourceId: EntityId;
  eventId: EntityId;
  interpretation: string;
  confidence: number;
  disagreementWithInterpretationIds: EntityId[];
  origin: HistoryOrigin;
  canonicalStatus: CanonicalStatus;
}

export interface HistoricalDatabaseSeed {
  characters: HistoricalCharacterRecord[];
  relationships: HistoricalRelationshipRecord[];
  houses: HouseRecord[];
  offices: OfficeRecord[];
  officeTerms: OfficeTermRecord[];
  claims: ClaimRecord[];
  events: HistoricalEventRecord[];
  eventLinks: HistoricalEventLinkRecord[];
  institutions: InstitutionRecord[];
  wars: WarRecord[];
  battles: BattleRecord[];
  treaties: TreatyRecord[];
  ships: HistoricalShipRecord[];
  shipOwnership: HistoricalShipOwnershipRecord[];
  shipCommands: HistoricalShipCommandRecord[];
  shipRefits: HistoricalShipRefitRecord[];
  shipRenames: HistoricalShipRenameRecord[];
  sources: HistoricalSourceRecord[];
  interpretations: HistoricalInterpretationRecord[];
}
