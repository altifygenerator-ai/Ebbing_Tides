export type EntityId = string;
export type RegionId = "skeldra" | "asteria" | "serath" | "kaishin" | "outer_isles" | "crossroads";
export type ReligionId = "old_gods" | "covenant" | "pantheon" | "turning_wheel" | "unaffiliated";

export interface GridPoint { x: number; y: number }

export interface GameClock {
  year: 628;
  day: number;
  hour: number;
}

export interface Attributes {
  strength: number;
  dexterity: number;
  intelligence: number;
  willpower: number;
  charisma: number;
  perception: number;
}

export type SkillId =
  | "sailing" | "navigation" | "gunnery" | "ship_command" | "ship_repair"
  | "blades" | "pistols" | "defense"
  | "persuasion" | "leadership" | "trading" | "appraisal"
  | "streetwise" | "smuggling" | "engineering" | "religion" | "investigation";

export interface CharacterCreationChoices {
  name: string;
  age: number;
  homePortId: EntityId;
  socialOrigin: "dockside_poor" | "artisan_household" | "merchant_family" | "naval_family";
  background: "former_naval_midshipman" | "foundry_child" | "raised_among_smugglers" | "shipwreck_survivor";
  religion: ReligionId;
  devotion: "cultural" | "moderate" | "devout";
  attributes: Attributes;
  coreSkills: SkillId[];
  trait: "sea_legs" | "silver_tongue" | "superstitious" | "bookworm";
  birthOmen: "great_storm" | "high_tide" | "first_snow";
  recentProfession: "sailor" | "merchant_clerk" | "dockworker" | "apprentice_engineer";
  shipOrigin: "inherited" | "purchased_on_debt" | "naval_surplus" | "prize_share";
  aptitude: number;
}

export interface PlayerCharacter extends CharacterCreationChoices {
  id: EntityId;
  culture: "skeldran";
  skills: Record<SkillId, number>;
  crowns: number;
  reputation: Record<string, number>;
}

export interface KnowledgeRecord {
  id: EntityId;
  category: "trade" | "local" | "danger" | "personal" | "political" | "religious" | "maritime";
  subjectId?: EntityId;
  text: string;
  source: string;
  learnedAtHour: number;
  confidence: number;
  truthStatus: "unknown" | "confirmed" | "disproved";
  hardRumor: boolean;
}

export interface PortDefinition {
  id: EntityId;
  name: string;
  region: RegionId;
  role: string;
  description: string;
  point: GridPoint;
  artAssetId?: EntityId;
  knownByDefault: boolean;
}

export interface CommodityDefinition {
  id: EntityId;
  name: string;
  basePrice: number;
  cargoUnits: number;
  category: "food" | "raw" | "manufactured" | "military" | "medical";
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
  route?: { fromPortId: EntityId; toPortId: EntityId; progress: number; direction: 1 | -1 };
  speed: number;
  maneuverability: number;
  firepower: number;
  seaworthiness: number;
  cargoCapacity: number;
  cargo: CargoStack[];
  supplies: number;
  systems: ShipSystems;
  disposition: "player" | "navy" | "merchant" | "privateer" | "pirate";
  fameTags: string[];
}

export interface NpcCharacter {
  id: EntityId;
  name: string;
  age: number;
  culture: string;
  religion: ReligionId;
  role: string;
  locationPortId?: EntityId;
  shipId?: EntityId;
  personality: Record<string, number>;
  goals: string[];
  beliefs: string[];
  knownFacts: EntityId[];
  speakingStyle: string;
  relationshipToPlayer: { trust: number; respect: number; fear: number; affection: number; suspicion: number };
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
  range: RangeState;
  identified: boolean;
  playerEscaped: boolean;
  log: string[];
  round: number;
}

export interface VoyageState {
  fromPortId: EntityId;
  toPortId: EntityId;
  routeId: EntityId;
  totalHours: number;
  elapsedHours: number;
  startHour: number;
  progress: number;
}

export interface PlayerState {
  character: PlayerCharacter;
  shipId: EntityId;
  firstMateId: EntityId;
  currentPortId?: EntityId;
  knownPortIds: EntityId[];
  knowledge: KnowledgeRecord[];
  observedPrices: Record<string, { price: number; observedAtHour: number }>;
  acceptedContractIds: EntityId[];
}

export interface GameSettings {
  firstUseTips: "on" | "minimal" | "off";
  journalMode: "casual" | "advanced";
}

export interface GameState {
  schemaVersion: 1;
  saveId: EntityId;
  worldSeed: string;
  clock: GameClock;
  absoluteHour: number;
  player: PlayerState;
  ships: Record<EntityId, ShipEntity>;
  npcs: Record<EntityId, NpcCharacter>;
  markets: Record<EntityId, PortMarketState>;
  worldEvents: WorldEvent[];
  contracts: Contract[];
  voyage?: VoyageState;
  encounter?: ActiveEncounter;
  settings: GameSettings;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface AssetRegistryEntry {
  assetId: EntityId;
  type: "PORT_ESTABLISHING" | "SHIP_REFERENCE" | "SHIP_TOKEN" | "PORTRAIT" | "ITEM_ICON" | "UI_REFERENCE";
  region?: RegionId;
  status: "APPROVED_ANCHOR" | "APPROVED_DIRECTION" | "CURATED_REFERENCE" | "PLACEHOLDER";
  artStyleVersion: string;
  regionalStyleVersion?: string;
  era: string;
  path: string;
  sourceMaster: string;
  notes: string;
  fallback?: string;
}
