import type { NpcSeedDefinition } from "../../game/npcBrain.js";

export const NPC_SEEDS: NpcSeedDefinition[] = [
  {
    id: "character.pastor_elias_korr", name: "Pastor Elias Korr", age: 43, sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "covenant", profession: "priest",
    role: "Covenant preacher, hospital and kitchen organizer", locationPortId: "port.ironhaven", socialTier: 2,
    personality: { compassion: 82, patience: 76, courage: 62, pride: 28, suspicion: 36, religiosity: 78, tolerance: 84, pragmatism: 67 },
    values: { mercy: 90, charity: 88, tolerance: 82, order: 55 },
    goals: ["Keep Ironhaven workers fed and treated during shortages.", "Prevent religious violence between Covenant converts and Old Gods traditionalists.", "Protect lawful worship without forced conversion."],
    beliefs: ["Mercy and charity are obligations, not ornaments.", "Forced conversion corrupts faith.", "Religious violence will make Ironhaven poorer and crueler."],
    knownFacts: ["fact.ironhaven.food_pressure", "fact.ironhaven.covenant_growth", "fact.braeg_industrial_presence"], speakingStyle: "Calm, plainspoken, compassionate, cautious; avoids theatrical preaching.",
    relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 5 }
  },
  {
    id: "character.ingrid_skar", name: "Captain Ingrid Skar", age: 39, sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods", profession: "naval_captain",
    role: "Captain of Stormcrow, Royal Navy", shipId: "ship.stormcrow", socialTier: 3,
    personality: { courage: 92, aggression: 61, compassion: 55, pride: 63, suspicion: 48, religiosity: 67, tolerance: 52, pragmatism: 71, riskTolerance: 68 },
    values: { duty: 88, crew_loyalty: 86, honor: 70, survival: 68 },
    goals: ["Protect Skeldran waters.", "Keep Stormcrow and her crew battle-ready."], beliefs: ["A captain earns loyalty by sharing danger.", "Omens matter, even when officers pretend otherwise."], knownFacts: ["fact.skeldra.naval_patrols"], speakingStyle: "Blunt, dryly funny, sailor-first, confident and unsentimental.", relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 10 }
  },
  {
    id: "character.henrik_vossar", name: "Captain Henrik Vossar", age: 46, sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "covenant", profession: "merchant_captain",
    role: "Merchant/privateer captain of Providence", shipId: "ship.providence", socialTier: 3,
    personality: { courage: 61, aggression: 34, compassion: 52, pride: 46, suspicion: 58, religiosity: 73, tolerance: 68, pragmatism: 82, riskTolerance: 45 }, values: { contract: 85, profit: 72, faith: 70, survival: 76 },
    goals: ["Keep Providence profitable.", "Maintain legal access to Skeldran ports despite religious suspicion."], beliefs: ["Courtesy costs less than cannon fire.", "A contract should survive the mood of the person who signed it."], knownFacts: ["fact.ironhaven.food_pressure", "fact.veyrholm.finance"], speakingStyle: "Courteous, measured, calculating, quietly devout.", relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 8 }
  },
  {
    id: "character.mira_holst", name: "Mira Holst", age: 32, sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods", profession: "first_mate",
    role: "First mate", socialTier: 2,
    personality: { courage: 67, patience: 63, loyalty: 81, suspicion: 44, pragmatism: 74, superstition: 51 }, values: { ship: 88, crew: 82, reputation: 65 },
    goals: ["Keep the ship afloat and the crew paid.", "Build a reputation worth inheriting."], beliefs: ["A good captain hears bad news before it becomes disaster."], knownFacts: ["fact.skeldra.local_routes"], speakingStyle: "Practical, concise, dry humor, little patience for posturing.", relationshipToPlayer: { trust: 48, respect: 42, fear: 0, affection: 18, suspicion: 8 }
  }
];
