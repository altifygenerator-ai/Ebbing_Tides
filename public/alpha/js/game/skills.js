export const ATTRIBUTE_IDS = ["might", "agility", "perception", "intellect", "will", "presence"];
export const ALL_SKILLS = [
    "blades", "heavy_weapons", "firearms", "athletics",
    "seamanship", "navigation", "gunnery", "command",
    "engineering", "medicine", "craft", "arcana",
    "scholarship", "survival", "commerce", "persuasion",
    "deception", "streetwise"
];
export const SKILL_LABELS = {
    blades: "Blades",
    heavy_weapons: "Heavy Weapons",
    firearms: "Firearms",
    athletics: "Athletics",
    seamanship: "Seamanship",
    navigation: "Navigation",
    gunnery: "Gunnery",
    command: "Command",
    engineering: "Engineering",
    medicine: "Medicine",
    craft: "Craft",
    arcana: "Arcana",
    scholarship: "Scholarship",
    survival: "Survival",
    commerce: "Commerce",
    persuasion: "Persuasion",
    deception: "Deception",
    streetwise: "Streetwise"
};
export const SPECIALIZATION_LIBRARY = {
    blades: ["Sabers", "Rapiers", "Knives", "Boarding Blades", "Eastern Swords"],
    firearms: ["Pistols", "Long Guns", "Naval Boarding Firearms", "Precision Mechanisms"],
    seamanship: ["Square Rig", "Lateen/Mixed Rig", "Heavy Weather", "Damage Control Deckwork"],
    navigation: ["Open Sea", "Coastal", "Storm", "Arcane Navigation", "Eastern Charts"],
    gunnery: ["Long-Range", "Chain Shot", "Grapeshot", "Heavy Batteries", "Precision Fire"],
    command: ["Naval Discipline", "Boarding", "Merchant Crews", "Mercenaries", "Crisis Leadership"],
    engineering: ["Steam", "Pumps", "Firearms", "Precision Instruments", "Naval Machinery"],
    medicine: ["Trauma", "Surgery", "Disease", "Herbal/Field Medicine", "Prosthetics"],
    arcana: ["Warding", "Restoration", "Wind & Weather", "Divination", "Binding"],
    scholarship: ["History", "Theology", "Law", "Languages", "Antiquities", "Political Institutions"],
    commerce: ["Bulk Commodities", "Luxury Goods", "Ships", "Arcane Goods", "Industrial Goods"],
    streetwise: ["Pirate Ports", "Smuggling", "Urban Crime", "Dock Networks", "Forgery Markets"]
};
export function attributeModifier(value) {
    // Character System Bible v0.1 provisional balance: about +/-3 per point from ordinary baseline 5.
    return (value - 5) * 3;
}
function add(skills, id, value) {
    skills[id] = Math.max(0, Math.min(100, skills[id] + value));
}
const SOCIAL_ORIGIN_SKILL_BONUSES = {
    dockside_poor: { seamanship: 6, streetwise: 10, athletics: 4 },
    artisan_household: { craft: 9, engineering: 7, commerce: 3 },
    merchant_family: { commerce: 12, scholarship: 5, persuasion: 4 },
    naval_family: { seamanship: 7, gunnery: 6, command: 6 },
    minor_nobility: { scholarship: 8, persuasion: 7, command: 4 },
    clerical_household: { scholarship: 9, medicine: 4, persuasion: 4 },
    rural_household: { survival: 11, athletics: 6, medicine: 3 },
    criminal_household: { streetwise: 10, deception: 8, firearms: 3 }
};
const BACKGROUND_SKILL_BONUSES = {
    former_naval_midshipman: { seamanship: 11, gunnery: 9, command: 7 },
    foundry_child: { engineering: 13, craft: 8, commerce: 3 },
    raised_among_smugglers: { streetwise: 10, deception: 9, navigation: 5 },
    shipwreck_survivor: { seamanship: 6, navigation: 8, survival: 9 },
    temple_educated: { scholarship: 11, arcana: 6, persuasion: 4 },
    disgraced_noble: { persuasion: 8, scholarship: 7, deception: 5 },
    raised_by_monks: { scholarship: 9, medicine: 6 },
    engineers_apprentice: { engineering: 13, craft: 7, scholarship: 4 }
};
const PROFESSION_SKILL_BONUSES = {
    sailor: { seamanship: 12, navigation: 5, athletics: 4 },
    merchant_clerk: { commerce: 12, scholarship: 5, persuasion: 4 },
    dockworker: { craft: 8, streetwise: 6, athletics: 7 },
    apprentice_engineer: { engineering: 14, craft: 7 },
    navigator: { navigation: 16, seamanship: 8, scholarship: 4 },
    marine: { blades: 12, firearms: 10, athletics: 8 },
    shipwright: { craft: 14, engineering: 10, seamanship: 5 },
    healer: { medicine: 16, scholarship: 5 },
    scholar: { scholarship: 16, arcana: 6 },
    smuggler: { streetwise: 12, deception: 10, navigation: 6 },
    priest: { scholarship: 11, persuasion: 8, medicine: 4 },
    gunner: { gunnery: 16, engineering: 5, firearms: 5 }
};
const TRAIT_SKILL_BONUSES = {
    sea_legs: { seamanship: 5 },
    silver_tongue: { persuasion: 5 },
    superstitious: {},
    bookworm: { scholarship: 5 },
    calm_under_fire: { command: 4 },
    old_salt: { survival: 4 }
};
export function startingSkillContributions(choices) {
    const coreBonuses = Object.fromEntries(choices.coreSkills.map((skillId) => [skillId, 15]));
    return [
        { source: "core_training", choiceId: "core_training", bonuses: coreBonuses },
        { source: "social_origin", choiceId: choices.socialOrigin, bonuses: SOCIAL_ORIGIN_SKILL_BONUSES[choices.socialOrigin] },
        { source: "background", choiceId: choices.background, bonuses: BACKGROUND_SKILL_BONUSES[choices.background] },
        { source: "profession", choiceId: choices.recentProfession, bonuses: PROFESSION_SKILL_BONUSES[choices.recentProfession] },
        { source: "trait", choiceId: choices.trait, bonuses: TRAIT_SKILL_BONUSES[choices.trait] }
    ];
}
export function buildStartingSkills(choices) {
    // Everyone has tiny everyday familiarity; named creation sources carry the real competence.
    const skills = Object.fromEntries(ALL_SKILLS.map((skill) => [skill, 5]));
    for (const contribution of startingSkillContributions(choices)) {
        for (const [skillId, value] of Object.entries(contribution.bonuses))
            add(skills, skillId, value ?? 0);
    }
    return skills;
}
export function buildStartingSpecializations(choices) {
    const out = [];
    const push = (skillId, name, rating, source) => out.push({
        id: `spec.${skillId}.${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
        skillId, name, rating, source, learnedAtHour: 0
    });
    if (choices.recentProfession === "navigator")
        push("navigation", "Coastal", 8, "Recent profession: navigator");
    if (choices.recentProfession === "gunner")
        push("gunnery", "Long-Range", 8, "Recent profession: gunner");
    if (choices.recentProfession === "apprentice_engineer" || choices.background === "foundry_child" || choices.background === "engineers_apprentice")
        push("engineering", "Naval Machinery", 7, "Industrial upbringing/training");
    if (choices.background === "former_naval_midshipman")
        push("command", "Naval Discipline", 7, "Former naval service");
    if (choices.background === "raised_among_smugglers" || choices.recentProfession === "smuggler")
        push("streetwise", "Smuggling", 7, "Smuggling background");
    if (choices.recentProfession === "sailor" || choices.socialOrigin === "naval_family")
        push("seamanship", "Heavy Weather", 6, "Northern maritime experience");
    if (choices.coreSkills.includes("arcana"))
        push("arcana", choices.culture === "skeldran" ? "Warding" : "Divination", 5, "Creation focus");
    return out;
}
export function validateAttributes(attributes) {
    const values = Object.values(attributes);
    if (values.some((value) => !Number.isFinite(value) || value < 1 || value > 10))
        return false;
    return values.reduce((sum, value) => sum + value, 0) === 36;
}
export function skillRatingLabel(value) {
    if (value < 10)
        return "Untrained";
    if (value < 25)
        return "Novice";
    if (value < 40)
        return "Competent";
    if (value < 60)
        return "Professional";
    if (value < 75)
        return "Veteran / Expert";
    if (value < 90)
        return "Elite Specialist";
    return "Exceptional Mastery";
}
//# sourceMappingURL=skills.js.map