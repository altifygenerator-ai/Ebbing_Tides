export type EntityId = string;
export type RegionId = "skeldra" | "asteria" | "serath" | "kaishin" | "outer_isles" | "crossroads";
export type ReligionId = "old_gods" | "covenant" | "pantheon" | "turning_wheel" | "unaffiliated";
export type AncestryId = "skeldran" | "asterian" | "serathi" | "kaishin" | "mixed";
export type CultureId = "skeldran" | "asterian" | "serathi" | "kaishin" | "vesperan" | "outer_isles";
export type SexId = "male" | "female";
export type CommodityCategory = "food" | "raw" | "textile" | "manufactured" | "military" | "medical" | "luxury" | "arcane" | "illicit" | "document";
export type SocialOriginId = "dockside_poor" | "artisan_household" | "merchant_family" | "naval_family" | "minor_nobility" | "clerical_household" | "rural_household" | "criminal_household";
export type BackgroundId = "former_naval_midshipman" | "foundry_child" | "raised_among_smugglers" | "shipwreck_survivor" | "temple_educated" | "disgraced_noble" | "raised_by_monks" | "engineers_apprentice";
export type ProfessionId = "sailor" | "merchant_clerk" | "dockworker" | "apprentice_engineer" | "navigator" | "marine" | "shipwright" | "healer" | "scholar" | "smuggler" | "priest" | "gunner";

export interface GridPoint { x: number; y: number }

export type TerrainType = "deep_sea" | "coastal_water" | "channel" | "reef" | "land" | "void";

export interface WorldMapCell extends GridPoint {
  terrain: TerrainType;
  navigable: boolean;
  movementCost: number;
  region: RegionId;
  hazards: string[];
  development: "active" | "reserved";
}

export interface NavigationTarget {
  type: "sea" | "port" | "poi";
  id: EntityId;
  name: string;
  point: GridPoint;
  markerPoint?: GridPoint;
}

export type PortActionId = "town" | "market" | "tavern" | "harbor" | "people" | "religion" | "government";
export type PoiActionId = "enter_site" | "observe" | "land_party" | "search" | "salvage";
export type DestinationActionId = PortActionId | PoiActionId;

export interface PortArrivalAction {
  id: DestinationActionId;
  label: string;
  description: string;
}

export interface GameClock {
  year: number;
  month: number;
  day: number;
  hour: number;
}

// Character System Bible v0.1 canonical attributes.
export interface Attributes {
  might: number;
  agility: number;
  perception: number;
  intellect: number;
  will: number;
  presence: number;
}

// Character System Bible v0.1 canonical compact skill list.
export type SkillId =
  | "blades" | "heavy_weapons" | "firearms" | "athletics"
  | "seamanship" | "navigation" | "gunnery" | "command"
  | "engineering" | "medicine" | "craft" | "arcana"
  | "scholarship" | "survival" | "commerce" | "persuasion"
  | "deception" | "streetwise";

export type CheckOutcome = "exceptional_success" | "clean_success" | "costly_success" | "failure" | "severe_failure";

export interface CheckResolution {
  checkId: EntityId;
  skillId: SkillId;
  attributeId: keyof Attributes;
  chance: number;
  roll: number;
  margin: number;
  outcome: CheckOutcome;
  modifiers: Array<{ source: string; value: number }>;
  specialistCharacterId?: EntityId;
}

export interface SkillSpecialization {
  id: EntityId;
  skillId: SkillId;
  name: string;
  rating: number;
  source: string;
  learnedAtHour: number;
}

export interface ProgressionCadenceEntry {
  key: string;
  useHours: number[];
}

export interface SkillPracticeProgress {
  skillId: SkillId;
  progress: number;
  /** @deprecated A0.2B: retained only for save compatibility; time-based cadence is authoritative. */
  recentPracticeKeys: string[];
  /** Rolling time/context cadence. Each key tracks only the few most recent uses needed for damping. */
  cadence?: ProgressionCadenceEntry[];
  lastMeaningfulUseAtHour?: number;
}

export type AbilityType = "arcane_practice" | "technical_technique" | "talent" | "professional_ability";
export type AbilityScale = "immediate" | "operational" | "ship" | "ritual";

export interface AbilityDefinition {
  id: EntityId;
  name: string;
  type: AbilityType;
  discipline: string;
  scale: AbilityScale;
  requiredSkillId?: SkillId;
  requiredSkillRating?: number;
  recommendedSpecialization?: string;
  requiredSystemTags?: string[];
  requiredItemTags?: string[];
  strainCost?: number;
  description: string;
  worldUses: string[];
  failureProfile: string;
  artAssetId?: EntityId;
  iconAssetId?: EntityId;
}

export interface CharacterAbility {
  abilityId: EntityId;
  learnedAtHour: number;
  source: string;
  mastery: number;
  status: "known" | "restricted" | "inactive";
}

export type PreparedAbilityTrigger = "navigation_departure" | "naval_fire" | "personal_defense";

/**
 * A successful preparation is active state, not inferred from historical ability-use events.
 * remainingUses makes "the next check/exchange" literal and contextEntityId prevents ship-bound
 * preparations from silently following the captain onto another vessel.
 */
export interface PreparedAbilityEffect {
  abilityId: EntityId;
  trigger: PreparedAbilityTrigger;
  preparedAtHour: number;
  expiresAtHour: number;
  bonus: number;
  remainingUses: number;
  contextEntityId?: EntityId;
}

export interface CharacterSchematic {
  schematicId: EntityId;
  learnedAtHour: number;
  source: string;
  access: "known" | "owned" | "institutional";
}

export interface AttunementState {
  // -100 Arcane ... 0 mixed/neutral ... +100 Industrial
  value: number;
  arcaneStrain: number;
  arcaneExposure: number;
  industrialExposure: number;
}

export interface CharacterCondition {
  health: number;
  healthMax: number;
  fatigue: number;
  stress: number;
  pain: number;
  arcaneStrain: number;
}

export type AdvancementHistoryKind = "life_experience" | "level" | "skill_rank" | "development_focus" | "general_perk" | "attribute_growth";

export interface AdvancementHistoryEntry {
  id: EntityId;
  kind: AdvancementHistoryKind;
  atHour: number;
  source: string;
  detail: string;
  amount?: number;
  skillId?: SkillId;
}

export interface CharacterAdvancementState {
  level: number;
  lifeExperience: number;
  developmentPoints: number;
  generalPerkPoints: number;
  generalPerks: EntityId[];
  history: AdvancementHistoryEntry[];
  /** @deprecated A0.2B: retained only for save compatibility; time-based cadence is authoritative. */
  recentExperienceKeys: string[];
  /** Rolling time/context cadence for recurring life-experience sources. */
  experienceCadence?: ProgressionCadenceEntry[];
}

export interface TrainingHistoryEntry {
  id: EntityId;
  subjectType: "skill" | "specialization" | "ability" | "schematic";
  subjectId: EntityId;
  teacherOrSource: string;
  startedAtHour: number;
  completedAtHour: number;
  costCrowns: number;
  result: string;
}

/** @deprecated A0.2A: legacy character-capability knowledge container. Campaign knowledge is authoritative in PlayerState.knowledge. */
export interface CharacterKnowledgeEntry {
  id: EntityId;
  domain: "geographic" | "economic" | "historical" | "religious" | "professional" | "social" | "linguistic" | "rumor";
  subjectId?: EntityId;
  claim: string;
  source: string;
  confidence: number;
  learnedAtHour: number;
  lastConfirmedAtHour?: number;
  status: "fact" | "belief" | "rumor" | "outdated" | "contradiction";
}

export interface VisualDNA {
  sex: SexId;
  ancestryPrimary: Exclude<AncestryId, "mixed">;
  ancestrySecondary?: Exclude<AncestryId, "mixed">;
  birthYear: number;
  apparentAge: number;
  skinTone: string;
  faceFamily: string;
  eyeColor: string;
  hairColor: string;
  hairTexture: string;
  hairStyle: string;
  facialHair: string;
  build: string;
  permanentMarks: string[];
  clothingCulture: CultureId;
  occupationPresentation: string;
  rankPresentation: string;
  wealthPresentation: string;
  religionPresentation: ReligionId;
  visibleSymbols: string[];
  industrialAffinity: string;
  arcaneAffinity: string;
  prosthetics: string[];
  corruptionMarks: string[];
  tattoos: string[];
  ceremonialMarks: string[];
  appearanceSeed: string;
}

// Backward-compatible export name retained so older imports compile; this is now the full canonical DNA.
export type AppearanceDNA = VisualDNA;

export interface PortraitChoice {
  portraitId: EntityId;
  assetId: EntityId;
  ancestryTags: AncestryId[];
  cultureTags: CultureId[];
  religionTags: ReligionId[];
  homelandRegionTags?: RegionId[];
  homeSettlementTags?: EntityId[];
  sex: SexId;
  ageBand: "young_adult" | "adult" | "mature";
  professionTags: ProfessionId[];
  socialTags: SocialOriginId[];
  backgroundTags?: BackgroundId[];
  presentationTags?: string[];
  poseTags?: string[];
  environmentTags?: string[];
  lightingTags?: string[];
  visualDna: VisualDNA;
  status: "PROVISIONAL" | "APPROVED" | "REVISE" | "REJECTED";
}

export interface CustomPortraitRequest {
  enabled: boolean;
  ancestryPrimary: Exclude<AncestryId, "mixed">;
  ancestrySecondary?: Exclude<AncestryId, "mixed">;
  sex: SexId;
  ageBand: "young_adult" | "adult" | "mature";
  homelandRegion?: RegionId;
  homeSettlementId?: EntityId;
  startingLocationId?: EntityId;
  culture?: CultureId;
  religion?: ReligionId;
  profession?: string;
  socialOrigin?: string;
  build: string;
  complexion: string;
  faceCharacter: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  facialHair: string;
  marks: string[];
}

export interface CharacterCreationChoices {
  name: string;
  age: number;
  sex: SexId;
  ancestry: AncestryId;
  secondaryAncestry?: Exclude<AncestryId, "mixed">;
  homelandRegion: RegionId;
  homeSettlementId: EntityId;
  startingLocationId: EntityId;
  culture: CultureId;
  socialOrigin: SocialOriginId;
  background: BackgroundId;
  religion: ReligionId;
  devotion: "cultural" | "moderate" | "devout";
  attributes: Attributes;
  coreSkills: SkillId[];
  trait: "sea_legs" | "silver_tongue" | "superstitious" | "bookworm" | "calm_under_fire" | "old_salt";
  birthOmen: "great_storm" | "high_tide" | "first_snow";
  recentProfession: ProfessionId;
  shipOrigin: "inherited" | "purchased_on_debt" | "naval_surplus" | "prize_share";
  startingAttunement: number;
  portraitId: EntityId;
  customPortrait?: CustomPortraitRequest;
  /** Runtime-generated portraits are written by the local server and persist by stable relative path. */
  customPortraitAssetPath?: string;
}

export interface CharacterCapabilityState {
  attributes: Attributes;
  skills: Record<SkillId, number>;
  specializations: SkillSpecialization[];
  abilities: CharacterAbility[];
  /** Active one-shot/timed preparations. Historical ability uses remain in WorldEvent. */
  preparedEffects?: PreparedAbilityEffect[];
  schematics: CharacterSchematic[];
  attunement: AttunementState;
  condition: CharacterCondition;
  advancement: CharacterAdvancementState;
  trainingHistory: TrainingHistoryEntry[];
  practice: Partial<Record<SkillId, SkillPracticeProgress>>;
  /** @deprecated A0.2A compatibility field. New/runtime campaign knowledge belongs in PlayerState.knowledge. */
  knowledgeEntries: CharacterKnowledgeEntry[];
}

export interface PlayerCharacter extends CharacterCreationChoices, CharacterCapabilityState {
  id: EntityId;
  visualDna: VisualDNA;
  crowns: number;
  reputation: Record<string, number>;
  historyTags: string[];
}

export interface KnowledgeRecord {
  id: EntityId;
  /** Stable semantic identity for a claim. Refreshes update this claim instead of duplicating it forever. */
  claimKey?: EntityId;
  category: "trade" | "local" | "danger" | "personal" | "political" | "religious" | "maritime";
  subjectId?: EntityId;
  text: string;
  source: string;
  /** First time the captain learned this claim. */
  learnedAtHour: number;
  /** Time represented by the observation/report, when known. */
  observedAtHour?: number;
  /** Most recent time the claim was re-observed or refreshed. */
  refreshedAtHour?: number;
  /** Omit for durable facts; otherwise the claim becomes stale after this many world hours. */
  staleAfterHours?: number;
  confidence: number;
  truthStatus: "unknown" | "confirmed" | "disproved";
  /** Contradiction/supersession is distinct from ordinary age-based staleness. */
  informationState?: "current" | "contradicted" | "superseded";
  hardRumor: boolean;
  sourceEventId?: EntityId;
  originLocationId?: EntityId;
}

export interface ShipIntelRecord {
  shipId: EntityId;
  identified: boolean;
  confidence: number;
  lastKnownPosition: GridPoint;
  lastKnownAtHour: number;
  source: string;
  disposition?: ShipEntity["disposition"];
  name?: string;
}

export interface AttunementLoad {
  arcane: number;
  industrial: number;
  sensitivity: number;
  mitigationTags: string[];
}

export interface PortDefinition {
  id: EntityId;
  name: string;
  region: RegionId;
  role: string;
  description: string;
  point: GridPoint;
  approachPoint: GridPoint;
  governmentName: string;
  religionName: string;
  arrivalActions: PortArrivalAction[];
  artAssetId?: EntityId;
  knownByDefault: boolean;
  attunementLoad: AttunementLoad;
}

export interface PointOfInterestDefinition {
  id: EntityId;
  name: string;
  region: RegionId;
  type: "wreck_site" | "landfall" | "ruin" | "anchorage" | "natural";
  role: string;
  description: string;
  point: GridPoint;
  approachPoint: GridPoint;
  arrivalActions: PortArrivalAction[];
  artAssetId?: EntityId;
  knownByDefault: boolean;
  attunementLoad: AttunementLoad;
}

export interface CommodityDefinition {
  id: EntityId;
  name: string;
  basePrice: number;
  cargoUnits: number;
  category: CommodityCategory;
  contentDefinitionId?: EntityId;
  legalStatus?: "ordinary" | "licensed" | "restricted" | "military_only" | "contraband" | "stolen" | "sacred" | "politically_sensitive";
  originRegion?: RegionId | "common" | "cross_regional" | "unknown_western";
}

export interface MarketCommodityState {
  commodityId: EntityId;
  stock: number;
  targetStock: number;
  localMultiplier: number;
  lastPrice: number;
}

export interface PortMarketState {
  portId: EntityId;
  goods: Record<EntityId, MarketCommodityState>;
  lastUpdatedHour: number;
}

export interface CargoStack {
  commodityId: EntityId;
  quantity: number;
}

export interface ShipSystems {
  hull: number;
  hullMax: number;
  sails: number;
  sailsMax: number;
  rigging: number;
  riggingMax: number;
  crew: number;
  crewMax: number;
  morale: number;
  fire: number;
  flooding: number;
}


export type CrewExperienceBand = "green" | "regular" | "seasoned" | "veteran" | "elite";

export interface ShipCrewCommunityState {
  /** Aggregate quality of the ordinary ship's company. Named officers remain persistent characters. */
  experience: number;
  discipline: number;
  loyalty: number;
  seamanship: number;
  gunnery: number;
  boarding: number;
  paySatisfaction: number;
  foodSatisfaction: number;
  fatigue: number;
  outstandingPrizeShare: number;
  victories: number;
  casualtiesRemembered: number;
  dangerousOrdersRemembered: number;
  recruitsHired: number;
  desertions: number;
  lastShoreLeaveHour?: number;
  lastPrizeShareHour?: number;
  lastDesertionCheckKey?: string;
  historyTags: string[];
}

export interface ShipCrewWelfareState {
  /** Aggregate crew wellness foundation for Alpha 0.6D; individual crew depth expands in the Crew Mechanics pass. */
  averageHealth: number;
  zeroSupplyHours: number;
  shortageEpisodes: number;
  shortageActive: boolean;
  currentEpisodeMoraleLoss: number;
  currentEpisodeHealthLoss: number;
}

export type ShipLifecycleStatus = "active" | "disabled" | "captured" | "sunk";

export interface ShipLifecycleState {
  /** Authoritative campaign state for whether this vessel can still act as ordinary traffic. */
  status: ShipLifecycleStatus;
  resolvedAtHour?: number;
  resolvedEncounterId?: EntityId;
  resolvedByShipId?: EntityId;
  resolutionMethod?: "naval" | "boarding";
  prizeClaimed?: boolean;
  prizeValue?: number;
}

export interface ShipEntity {
  id: EntityId;
  name: string;
  classId: string;
  region: RegionId;
  ownerCharacterId: EntityId;
  artAssetId?: EntityId;
  tokenAssetId?: EntityId;
  position: GridPoint;
  dockedAtPortId?: EntityId;
  // Legacy route is retained through Alpha 0.5 migration. NPC brain plans are authoritative for new state.
  route?: { fromPortId: EntityId; toPortId: EntityId; progress: number; direction: 1 | -1 };
  speed: number;
  /** Physical cruise speed. Canonical class definition is preferred; this field supports migrated/modified individual ships. */
  cruiseSpeedKnots?: number;
  maneuverability: number;
  firepower: number;
  seaworthiness: number;
  cargoCapacity: number;
  cargo: CargoStack[];
  supplies: number;
  crewWelfare?: ShipCrewWelfareState;
  crewCommunity?: ShipCrewCommunityState;
  systems: ShipSystems;
  disposition: "player" | "navy" | "merchant" | "privateer" | "pirate";
  /** Optional on legacy v12 saves; absence means active. Terminal outcomes persist here. */
  lifecycle?: ShipLifecycleState;
  fameTags: string[];
  refits: EntityId[];
  systemTags?: string[];
  attunementLoad?: AttunementLoad;
}

export type SimulationLod = "detailed" | "moderate" | "coarse" | "statistical";
export type NpcPlanType = "travel" | "resupply" | "trade" | "avoid_danger" | "pursue_opportunity" | "hold_position" | "port_duties";
export type NpcPlanStatus = "active" | "completed" | "interrupted" | "invalid";

export interface NpcGoal {
  id: EntityId;
  type: string;
  description: string;
  targetId?: EntityId;
  priority: number;
  status: "active" | "completed" | "abandoned";
  createdAtHour: number;
}

export interface NpcPlan {
  id: EntityId;
  goalId?: EntityId;
  type: NpcPlanType;
  status: NpcPlanStatus;
  createdAtHour: number;
  expectedCompletionHour?: number;
  nextDecisionAtHour?: number;
  fromPortId?: EntityId;
  destinationPortId?: EntityId;
  path?: GridPoint[];
  routeDistanceNm?: number;
  distanceTravelledNm?: number;
  plannedAverageSpeedKnots?: number;
  progress: number;
  step: string;
  reason: string;
  interruptReason?: string;
  /** Emergency at-sea return created after a survival-resource interruption. */
  survivalRecovery?: boolean;
}

export interface NpcNeeds {
  foodDays: number;
  waterDays: number;
  moneyReserve: number;
  ammunition: number;
  medicalSupplies: number;
  crewFatigue: number;
  wageArrearsDays: number;
  hullSafety: number;
  moraleSafety: number;
}

export interface LearnedPattern {
  id: EntityId;
  subjectType: string;
  subjectId: EntityId;
  encounters: number;
  successes: number;
  failures: number;
  perceivedRisk: number;
  preference: number;
  updatedAtHour: number;
}

export interface NpcFastState {
  stress: number;
  fear: number;
  confidence: number;
  fatigue: number;
  anger: number;
  health: number;
}

export interface NpcBrainState {
  simulationLod: SimulationLod;
  simulationPriority: number;
  currentPlan?: NpcPlan;
  nextSimulationAtHour?: number;
  nextDecisionAtHour?: number;
  lastHighResolutionAtHour: number;
  needs: NpcNeeds;
  fastState: NpcFastState;
  learnedPatterns: LearnedPattern[];
  habits: string[];
  memories: EntityId[];
  lastDecisionExplanation?: string[];
}

export interface NpcCharacter extends CharacterCapabilityState {
  id: EntityId;
  name: string;
  age: number;
  sex: SexId;
  ancestry: AncestryId;
  homelandRegion: RegionId;
  culture: CultureId;
  religion: ReligionId;
  profession: string;
  role: string;
  socialTier: number;
  locationPortId?: EntityId;
  shipId?: EntityId;
  visualDna: VisualDNA;
  personality: Record<string, number>;
  values: Record<string, number>;
  goals: NpcGoal[];
  beliefs: string[];
  knownFacts: EntityId[];
  inventory?: ItemInstance[];
  equipment?: EquipmentState;
  speakingStyle: string;
  relationshipToPlayer: { trust: number; respect: number; fear: number; affection: number; suspicion: number; hatred: number; obligation: number };
  brain: NpcBrainState;
}

export interface CrewAssignment {
  id: EntityId;
  name: string;
  role: "first_mate" | "gunner" | "carpenter" | "navigator" | "deckhand" | "engineer" | "surgeon" | "purser" | "ship_mage";
  skill: number;
  morale: number;
  loyalty: number;
  health?: number;
  npcId?: EntityId;
}

export type WorldCauseKind = "war" | "embargo" | "famine" | "emergency_decree" | "religious_policy" | "ruler_change" | "economic_disruption";
export type WorldCauseStatus = "active" | "resolved";

export interface WorldCauseScope {
  regionIds?: RegionId[];
  jurisdictionIds?: EntityId[];
  factionIds?: EntityId[];
  portIds?: EntityId[];
}

/**
 * Causal inputs only. Consumers translate these into their own authoritative state.
 * A0.3C deliberately does not carry direct price/standing/heat modifiers here.
 */
export interface WorldCauseEffects {
  productionMultiplier?: number;
  externalSupplyMultiplier?: number;
  consumptionMultiplier?: number;
  categoryProductionMultipliers?: Partial<Record<CommodityCategory, number>>;
  categoryExternalSupplyMultipliers?: Partial<Record<CommodityCategory, number>>;
  categoryConsumptionMultipliers?: Partial<Record<CommodityCategory, number>>;
  /** 0 closes the affected routine route; values below/above 1 suppress/encourage ordinary traffic. */
  trafficMultiplier?: number;
  /** Multiplies physical/institutional legal-report transit after ordinary sailing distance is calculated. */
  legalReportTransitMultiplier?: number;
  /** Institutional procurement urgency, separate from market price/stock itself. */
  contractDemandMultiplier?: number;
}

export interface WorldCausePublicInformation {
  category: KnowledgeRecord["category"];
  source: string;
  confidence: number;
  staleAfterHours?: number;
}

/**
 * Minimal authoritative live kingdom/policy/religion/economic cause state. Historical start/end
 * announcements remain WorldEvents; this row answers what is actually in force right now.
 */
export interface WorldCauseRecord {
  id: EntityId;
  kind: WorldCauseKind;
  title: string;
  summary: string;
  reason: string;
  startedAtHour: number;
  status: WorldCauseStatus;
  scope: WorldCauseScope;
  effects: WorldCauseEffects;
  policyTags: string[];
  originPortId?: EntityId;
  publicInformation?: WorldCausePublicInformation;
  scheduledEndAtHour?: number;
  resolvedAtHour?: number;
  resolutionSummary?: string;
}

export interface WorldEvent {
  id: EntityId;
  type: string;
  atHour: number;
  locationId?: EntityId;
  participants: EntityId[];
  summary: string;
  canonicalData: Record<string, string | number | boolean>;
  importance: number;
  roll?: { key: string; value: number; threshold?: number };
}

export interface SimulationEvent {
  id: EntityId;
  scheduledAtHour: number;
  eventType: string;
  entityId: EntityId;
  priority: number;
  payload: Record<string, string | number | boolean>;
  status: "scheduled" | "processed" | "cancelled";
}

export interface Contract {
  id: EntityId;
  type: "delivery";
  issuerName: string;
  sourcePortId: EntityId;
  destinationPortId: EntityId;
  commodityId: EntityId;
  quantity: number;
  reward: number;
  deadlineHour: number;
  reason: string;
  status: "available" | "accepted" | "completed" | "expired" | "resolved_without_you";
  createdAtHour: number;
}

export type EncounterPhase = "sighting" | "combat" | "resolved";
export type RangeState = "distant" | "long" | "medium" | "close" | "grapple" | "boarding";

export interface ActiveEncounter {
  id: EntityId;
  phase: EncounterPhase;
  otherShipId: EntityId;
  /** Derived compatibility/UI label. rangeYards is authoritative. */
  range: RangeState;
  rangeYards: number;
  sightingRangeNm?: number;
  shipsSecured?: boolean;
  elapsedMinutes: number;
  identified: boolean;
  /** Whether the other vessel has positively identified the player ship/captain for legal reporting. */
  playerIdentityKnown?: boolean;
  /** Set once a lawful vessel has formally ordered the player to heave to / answer authority. */
  authorityDemanded?: boolean;
  playerEscaped: boolean;
  log: string[];
  round: number;
}

export interface VoyageTelemetry {
  startingSupplies: number;
  startingCrewMorale?: number;
  startingCrewHealth?: number;
  startingZeroSupplyHours?: number;
  startingHull: number;
  startingSails: number;
  startingRigging: number;
}

export interface VoyageReport {
  distanceTravelledNm: number;
  elapsedHours: number;
  suppliesUsed: number;
  suppliesRemaining: number;
  suppliesExhausted: boolean;
  zeroSupplyHours?: number;
  crewMoraleLoss?: number;
  crewHealthLoss?: number;
  hullDamage: number;
  sailsDamage: number;
  riggingDamage: number;
}

export interface VoyageNavigationQuality {
  outcome: CheckOutcome;
  margin: number;
  chance: number;
  preparationBonus: number;
  /** Applied to consequences of route/weather hazards; it does not create or erase weather. */
  hazardDamageModifier: number;
}

export interface VoyageState {
  originPoint: GridPoint;
  destination: NavigationTarget;
  path: GridPoint[];
  routeId: EntityId;
  totalHours: number;
  elapsedHours: number;
  startHour: number;
  routeDistanceNm: number;
  distanceTravelledNm: number;
  plannedAverageSpeedKnots: number;
  progress: number;
  navigationQuality?: VoyageNavigationQuality;
  telemetry?: VoyageTelemetry;
  fromPortId?: EntityId;
  toPortId?: EntityId;
}

export type CustomsInspectionStatus = "pending" | "cleared" | "evaded" | "detected";
export interface CustomsInspectionState {
  id: EntityId;
  portId: EntityId;
  createdAtHour: number;
  status: CustomsInspectionStatus;
  intensity: number;
  controlledCommodityIds: EntityId[];
  prohibitedCommodityIds: EntityId[];
  reason: string;
  resolvedAtHour?: number;
}

export interface ArrivalState {
  destination: NavigationTarget;
  arrivedAtHour: number;
  voyageReport?: VoyageReport;
  /** R2: only present when actual customs policy/risk has opened an arrival inspection. */
  customsInspection?: CustomsInspectionState;
}

export type ItemCategory = "weapon" | "firearm" | "armor" | "clothing" | "tool" | "document" | "book" | "relic" | "trinket" | "consumable" | "misc";
export type EquipmentSlot = "head" | "chest" | "hands" | "legs" | "feet" | "mainHand" | "offHand" | "neck" | "ring1" | "ring2" | "relic" | "tool" | "back";
export type ItemQuality = "poor" | "standard" | "fine" | "exceptional" | "masterwork";
export type ItemCondition = "new" | "worn" | "salt_weathered" | "repaired" | "patched" | "damaged";

export interface ItemDefinition {
  id: EntityId;
  name: string;
  category: ItemCategory;
  slot?: EquipmentSlot;
  allowedSlots?: EquipmentSlot[];
  baseValue: number;
  attack: number;
  defense: number;
  apCost: number;
  tags: string[];
  description: string;
  artAssetId?: EntityId;
  attunementLoad?: AttunementLoad;
  region?: RegionId;
  legalStatus?: "ordinary" | "licensed" | "restricted" | "contraband" | "stolen" | "sacred";
}

export interface ItemInstance {
  id: EntityId;
  definitionId: EntityId;
  quality: ItemQuality;
  condition: ItemCondition;
  origin: string;
  acquiredAtHour: number;
  history: string[];
}

export interface EquipmentState {
  head?: EntityId | undefined;
  chest?: EntityId | undefined;
  hands?: EntityId | undefined;
  legs?: EntityId | undefined;
  feet?: EntityId | undefined;
  mainHand?: EntityId | undefined;
  offHand?: EntityId | undefined;
  neck?: EntityId | undefined;
  ring1?: EntityId | undefined;
  ring2?: EntityId | undefined;
  relic?: EntityId | undefined;
  tool?: EntityId | undefined;
  back?: EntityId | undefined;
}

export type BodyPart = "head" | "torso" | "left_arm" | "right_arm" | "left_leg" | "right_leg";
export type InjuryType = "cut" | "puncture" | "bruise" | "fracture" | "concussion" | "burn";

export interface Injury {
  id: EntityId;
  bodyPart: BodyPart;
  type: InjuryType;
  severity: 1 | 2 | 3;
  acquiredAtHour: number;
  source: string;
  treated: boolean;
}

export type PersonalCombatStance = "aggressive" | "balanced" | "defensive";
export interface PersonalCombatState {
  id: EntityId;
  source: "boarding" | "deck_drill";
  opponentId: EntityId;
  opponentName: string;
  opponentSkill: number;
  opponentArmor: number;
  playerHealth: number;
  playerHealthMax: number;
  opponentHealth: number;
  opponentHealthMax: number;
  playerAP: number;
  opponentAP: number;
  playerStance: PersonalCombatStance;
  opponentStance: PersonalCombatStance;
  pistolLoaded: boolean;
  round: number;
  log: string[];
  resolved: boolean;
  outcome?: "victory" | "defeat" | "drill_complete";
}


export type LegalStatus = "clear" | "watched" | "wanted" | "outlawed";
export type CrimeType =
  | "unlawful_attack" | "attack_government_vessel" | "piracy" | "resisting_authority"
  | "murder" | "theft" | "smuggling" | "customs_evasion" | "illegal_salvage" | "aiding_enemy";

export type CrimeEvidenceKind = "eyewitness" | "official_witness" | "physical";
export type CrimeEvidenceStatus = "potential" | "available" | "submitted" | "lost";
export interface CrimeEvidenceRecord {
  id: EntityId;
  kind: CrimeEvidenceKind;
  createdAtHour: number;
  sourceShipId?: EntityId;
  sourceCharacterId?: EntityId;
  playerIdentified: boolean;
  status: CrimeEvidenceStatus;
  summary: string;
}

export type CrimeLegalMatterStatus = "unreported" | "report_in_transit" | "active" | "satisfied" | "pardoned" | "dismissed";
export type LegalReportChannel = "survivor_delivery" | "direct_authority" | "institutional_courier";
export type LegalReportStatus = "in_transit" | "validated" | "rejected";

export interface LegalReportRecord {
  id: EntityId;
  crimeId: EntityId;
  jurisdictionId: EntityId;
  factionId: EntityId;
  createdAtHour: number;
  deliveryAtHour: number;
  targetPortId?: EntityId;
  sourceShipId?: EntityId;
  sourceCharacterId?: EntityId;
  evidenceIds: EntityId[];
  channel: LegalReportChannel;
  status: LegalReportStatus;
  receivedAtHour?: number;
  validatedAtHour?: number;
  reason: string;
}

export interface CrimeRecord {
  id: EntityId;
  type: CrimeType;
  jurisdictionId: EntityId;
  factionId: EntityId;
  atHour: number;
  encounterId?: EntityId;
  locationId?: EntityId;
  victimShipId?: EntityId;
  victimCharacterId?: EntityId;
  severity: 1 | 2 | 3 | 4 | 5;
  playerIdentified: boolean;
  witnessed: boolean;
  /** Legacy compatibility: true only after a valid report has reached and been accepted by authority. */
  reported: boolean;
  evidence?: CrimeEvidenceRecord[];
  legalMatterStatus?: CrimeLegalMatterStatus;
  authorityReceivedAtHour?: number;
  resolvedAtHour?: number;
  resolutionNote?: string;
  bountyValue: number;
  summary: string;
}

export interface WarrantRecord {
  id: EntityId;
  jurisdictionId: EntityId;
  factionId: EntityId;
  issuedAtHour: number;
  crimeIds: EntityId[];
  bounty: number;
  status: "active" | "satisfied" | "pardoned";
  reason: string;
}

export interface JurisdictionLegalState {
  jurisdictionId: EntityId;
  factionId: EntityId;
  status: LegalStatus;
  heat: number;
  bounty: number;
  activeWarrantIds: EntityId[];
  lastIncidentAtHour?: number;
}

export type TradeCredentialKind = "customs_permit" | "letter_of_marque";
export type TradeCredentialStatus = "active" | "expired" | "revoked";
export interface TradeCredentialRecord {
  id: EntityId;
  kind: TradeCredentialKind;
  jurisdictionId: EntityId;
  factionId: EntityId;
  issuerPortId: EntityId;
  issuedAtHour: number;
  expiresAtHour?: number;
  status: TradeCredentialStatus;
  authorizedEnemyFactionIds: EntityId[];
  reason: string;
}

export interface PlayerState {
  character: PlayerCharacter;
  shipId: EntityId;
  firstMateId: EntityId;
  currentPortId?: EntityId;
  currentPoiId?: EntityId;
  knownPortIds: EntityId[];
  knownPoiIds: EntityId[];
  knowledge: KnowledgeRecord[];
  observedPrices: Record<string, { price: number; observedAtHour: number }>;
  acceptedContractIds: EntityId[];
  inventory: ItemInstance[];
  equipment: EquipmentState;
  injuries: Injury[];
  shipIntel: Record<EntityId, ShipIntelRecord>;
  crew: CrewAssignment[];
  /** Local civic/port standing is separate from regional political reputation. */
  portStanding: Record<EntityId, number>;
  /** Persistent jurisdictional law state. */
  legal: Record<EntityId, JurisdictionLegalState>;
  crimes: CrimeRecord[];
  warrants: WarrantRecord[];
  /** A0.2D operational legal-information queue. CrimeRecord remains canonical crime truth. */
  legalReports: LegalReportRecord[];
  /** R2 trade papers/commissions. Dynamic policy authorization still comes from A0.3C world causes. */
  tradeCredentials: TradeCredentialRecord[];
}

export interface GameSettings {
  firstUseTips: "on" | "minimal" | "off";
  journalMode: "casual" | "advanced";
  audioEnabled: boolean;
  masterVolume: number;
  navigationZoom: "far" | "navigation" | "close";
}

export interface GameState {
  schemaVersion: 12;
  saveId: EntityId;
  worldSeed: string;
  clock: GameClock;
  absoluteHour: number;
  player: PlayerState;
  ships: Record<EntityId, ShipEntity>;
  npcs: Record<EntityId, NpcCharacter>;
  markets: Record<EntityId, PortMarketState>;
  /** A0.3C current live causes; WorldEvent remains historical truth. */
  worldCauses: WorldCauseRecord[];
  worldEvents: WorldEvent[];
  simulationEvents: SimulationEvent[];
  contracts: Contract[];
  voyage?: VoyageState;
  arrival?: ArrivalState;
  encounter?: ActiveEncounter;
  personalCombat?: PersonalCombatState;
  settings: GameSettings;
  createdAtIso: string;
  updatedAtIso: string;
}

export type AssetType = "PORT_ESTABLISHING" | "SHIP_REFERENCE" | "SHIP_TOKEN" | "PORTRAIT" | "ITEM_ICON" | "ABILITY_ICON" | "WORN_REFERENCE" | "UI_REFERENCE" | "MAP_REFERENCE" | "MAP_REGION_LAYER" | "DOCUMENT" | "GENERIC";
export type AssetStatus = "APPROVED_ANCHOR" | "APPROVED_DIRECTION" | "CURATED_REFERENCE" | "PROVISIONAL_REFERENCE" | "PLACEHOLDER" | "PROVISIONAL" | "APPROVED" | "REVISE" | "REJECTED";
export type AssetTier = "A_UNIQUE" | "B_REGIONAL_FAMILY" | "C_SHARED_FUNCTIONAL" | "D_DATA_ONLY";
export type ArtUsage = "reference" | "runtime_base" | "runtime_component" | "runtime_overlay" | "content_art" | "environment" | "provisional";

export interface AssetRegistryEntry {
  assetId: EntityId;
  displayName?: string;
  type: AssetType;
  category?: string;
  subcategory?: string;
  region?: RegionId;
  culture?: CultureId;
  /** Optional portrait-facing registry metadata; canonical character sex remains in Visual DNA. */
  sex?: SexId;
  makerOrigin?: string;
  status: AssetStatus;
  artStyleVersion: string;
  regionalStyleVersion?: string;
  era: string;
  introductionDate?: string;
  gameplayRole?: string[];
  materialFamily?: string[];
  qualityTier?: string[];
  conditionStates?: string[];
  rarityAvailability?: string;
  baseValueTags?: string[];
  weightBulk?: string;
  legalStatus?: string[];
  attunementCompatibility?: string;
  skillRequirements?: string[];
  variantHooks?: string[];
  provenance?: string[];
  iconRequired?: boolean;
  tokenRequired?: boolean;
  inspectionArtRequired?: boolean;
  equippedReferenceRequired?: boolean;
  visualAnchor?: string;
  alphaPriority?: string;
  tier?: AssetTier;
  /** Presentation contract: reference art guides composition but is not necessarily legal as a live runtime base. */
  artUsage?: ArtUsage;
  path: string;
  sourceMaster: string;
  notes: string;
  fallback?: string;
  mapRegistration?: {
    globalBounds: { x: number; y: number; width: number; height: number };
    nativePixelWidth: number;
    nativePixelHeight: number;
    overlapCells: number;
    zoomMin: "far" | "navigation" | "close";
    zoomMax: "far" | "navigation" | "close";
  };
}
