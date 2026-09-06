export const NPC_SEEDS = [
    {
        id: "character.pastor_elias_korr",
        name: "Pastor Elias Korr",
        age: 43,
        culture: "Skeldran",
        religion: "covenant",
        role: "Covenant preacher, hospital and kitchen organizer",
        locationPortId: "port.ironhaven",
        personality: { compassion: 82, patience: 76, courage: 62, pride: 28, suspicion: 36, religiosity: 78, tolerance: 84, pragmatism: 67 },
        goals: [
            "Keep Ironhaven workers fed and treated during shortages.",
            "Prevent religious violence between Covenant converts and Old Gods traditionalists.",
            "Protect lawful worship without forced conversion."
        ],
        beliefs: [
            "Mercy and charity are obligations, not ornaments.",
            "Forced conversion corrupts faith.",
            "Religious violence will make Ironhaven poorer and crueler."
        ],
        knownFacts: ["fact.ironhaven.food_pressure", "fact.ironhaven.covenant_growth", "fact.braeg_industrial_presence"],
        speakingStyle: "Calm, plainspoken, compassionate, cautious; avoids theatrical preaching.",
        relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 5 }
    },
    {
        id: "character.ingrid_skar",
        name: "Captain Ingrid Skar",
        age: 39,
        culture: "Skeldran",
        religion: "old_gods",
        role: "Captain of Stormcrow, Royal Navy",
        shipId: "ship.stormcrow",
        personality: { courage: 92, aggression: 61, compassion: 55, pride: 63, suspicion: 48, religiosity: 67, tolerance: 52, pragmatism: 71 },
        goals: ["Protect Skeldran waters.", "Keep Stormcrow and her crew battle-ready."],
        beliefs: ["A captain earns loyalty by sharing danger.", "Omens matter, even when officers pretend otherwise."],
        knownFacts: ["fact.skeldra.naval_patrols"],
        speakingStyle: "Blunt, dryly funny, sailor-first, confident and unsentimental.",
        relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 10 }
    },
    {
        id: "character.henrik_vossar",
        name: "Captain Henrik Vossar",
        age: 46,
        culture: "Skeldran",
        religion: "covenant",
        role: "Merchant/privateer captain of Providence",
        shipId: "ship.providence",
        personality: { courage: 61, aggression: 34, compassion: 52, pride: 46, suspicion: 58, religiosity: 73, tolerance: 68, pragmatism: 82 },
        goals: ["Keep Providence profitable.", "Maintain legal access to Skeldran ports despite religious suspicion."],
        beliefs: ["Courtesy costs less than cannon fire.", "A contract should survive the mood of the person who signed it."],
        knownFacts: ["fact.ironhaven.food_pressure", "fact.veyrholm.finance"],
        speakingStyle: "Courteous, measured, calculating, quietly devout.",
        relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 8 }
    },
    {
        id: "character.mira_holst",
        name: "Mira Holst",
        age: 32,
        culture: "Skeldran",
        religion: "old_gods",
        role: "First mate",
        personality: { courage: 67, patience: 63, loyalty: 81, suspicion: 44, pragmatism: 74, superstition: 51 },
        goals: ["Keep the ship afloat and the crew paid.", "Build a reputation worth inheriting."],
        beliefs: ["A good captain hears bad news before it becomes disaster."],
        knownFacts: ["fact.skeldra.local_routes"],
        speakingStyle: "Practical, concise, dry humor, little patience for posturing.",
        relationshipToPlayer: { trust: 48, respect: 42, fear: 0, affection: 18, suspicion: 8 }
    }
];
export const NPC_BY_ID = Object.fromEntries(NPC_SEEDS.map((npc) => [npc.id, npc]));
//# sourceMappingURL=characters.js.map