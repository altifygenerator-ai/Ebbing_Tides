import type { Attributes, SkillId } from "./types.js";

export const ATTRIBUTE_DESCRIPTIONS: Record<keyof Attributes,string> = {
  might:"Strength, endurance, and bodily force. Supports heavy melee, grappling, hauling, exhaustion resistance, and some injury checks.",
  agility:"Coordination, balance, speed, and fine movement. Supports blades, firearms handling, deck balance, evasive movement, and delicate manual work.",
  perception:"Observation, spatial awareness, and aim. Supports navigation, gunnery, spotting ships, reading weather, ranged combat, and noticing deception cues.",
  intellect:"Learning, analysis, technical reasoning, and organized memory. Supports engineering, medicine, scholarship, Arcane theory, decoding, and planning.",
  will:"Discipline, courage, and sustained intention. Supports Arcane control, stress resistance, morale, pain tolerance, fear resistance, and concentration.",
  presence:"Persuasion, leadership, intimidation, and social weight. Supports command, negotiation, recruiting, interrogation, diplomacy, and crowd influence."
};

export const SKILL_DESCRIPTIONS: Record<SkillId,string> = {
  blades:"Training with swords, sabers, knives, and rapiers. Used in personal combat, duels, boarding, weapon appraisal, and martial training.",
  heavy_weapons:"Axes, polearms, hammers, and heavy boarding weapons. Used for combat, breaching, intimidation, and some demanding labor.",
  firearms:"Pistols, muskets, carbines, and advanced personal firearms. Used for combat, boarding fire, weapon maintenance, appraisal, and intimidation.",
  athletics:"Climbing, swimming, running, grappling, and physical recovery. Used during boarding, storms, escapes, rescues, exploration, and endurance events.",
  seamanship:"Rigging, sails, deck work, and ship-handling fundamentals. Used in storms, travel, emergency response, maneuvers, and evaluating sailors.",
  navigation:"Charts, celestial methods, currents, and route planning. Used for travel, exploration, pursuit, chart appraisal, and recognizing navigational anomalies.",
  gunnery:"Naval artillery, ammunition, range, and battery control. Used in ship combat, gun inspection, crew drills, and artillery purchasing.",
  command:"Leadership, discipline, crew coordination, and authority. Used for morale, boarding, surrender, mutiny, crisis response, and officer coordination.",
  engineering:"Machinery, pumps, engines, mechanisms, and industrial diagnostics. Used with ship systems, repairs, technical appraisal, and Industrial techniques.",
  medicine:"Trauma, disease, surgery, treatment, and sanitation. Used after combat, during illness, on voyages, and in medical services and trade.",
  craft:"General maintenance, fabrication, tools, and field repair. Used for weapon upkeep, shipboard improvisation, item repair, and workmanship appraisal.",
  arcana:"Arcane theory, control, resonance, and ritual understanding. Used for practices, relics, magical cargo, anomalies, interference, and ritual dialogue.",
  scholarship:"History, religion, law, literature, languages, and institutions. Used with archives, inscriptions, political context, dialogue, and document authentication.",
  survival:"Weather, wilderness, food and water, and natural hazards. Used in exploration, provisioning, disaster response, coastal travel, and resource events.",
  commerce:"Markets, bargaining, contracts, cargo value, and credit. Used in trading, contracts, ship purchases, economic inference, and fraud detection.",
  persuasion:"Reasoned negotiation, diplomacy, and rapport. Used in dialogue, contracts, recruitment, peacemaking, and political influence.",
  deception:"Lying, bluffing, disguise, cover stories, and misdirection. Used in smuggling, inspections, scams, tactical misinformation, and social play.",
  streetwise:"Rumor networks, black markets, criminals, and informal power. Used for finding people, contraband, local information, and underworld deals."
};

export const SYSTEM_DESCRIPTIONS = {
  attunement:"Your position between Arcane and Industrial commitment. Ordinary equipment remains broadly usable, but deep alignment increasingly interferes with advanced systems of the opposite paradigm.",
  arcaneStrain:"Mental and spiritual pressure created by repeated Arcane practice. High strain reduces Arcane reliability and naturally eases as world time passes.",
  lifeExperience:"Overall breadth of lived experience. It rises from meaningful voyages, contracts, battles, discoveries, training, and major life events; it does not make the world level-scale around you.",
  developmentPoints:"Focused advancement earned at level milestones. They can accelerate development only where your character has a believable foundation through recent use, training, or formative experience.",
  generalPerks:"Infrequent life talents earned from broad experience. They require a plausible build and history, and affect specific situations or options rather than acting as anonymous universal bonuses.",
  specializations:"Focused expertise inside a broader skill. Specializations come from practice, teachers, institutions, manuals, backgrounds, or repeated focused use and do not replace the base skill."
} as const;
