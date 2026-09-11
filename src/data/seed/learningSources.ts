import type { BackgroundId, ProfessionId, ReligionId, SkillId, SocialOriginId } from "../../game/types.js";

export type LearningSourceKind = "teacher" | "book" | "officer" | "institution" | "discovery";
export type LearningSourceVenue = "people" | "government" | "religion" | "poi";

export interface LearningAccessPath {
  label: string;
  skillMinimums?: Partial<Record<SkillId, number>>;
  religions?: ReligionId[];
  backgrounds?: BackgroundId[];
  professions?: ProfessionId[];
  socialOrigins?: SocialOriginId[];
  shipOrigins?: Array<"inherited" | "purchased_on_debt" | "naval_surplus" | "prize_share">;
  relationship?: { npcId: string; minTrust?: number; minRespect?: number };
}

export interface LearningSourceDefinition {
  id: string;
  name: string;
  kind: LearningSourceKind;
  venue: LearningSourceVenue;
  description: string;
  sourceLabel: string;
  portId?: string;
  poiId?: string;
  onboardNpcId?: string;
  requiredPoiActions?: string[];
  subject:
    | { type: "ability"; abilityId: string }
    | { type: "specialization"; skillId: SkillId; name: string; rating: number; requiredSkillRating: number };
  accessPaths: LearningAccessPath[];
  hours: number;
  costCrowns: number;
  tags: string[];
}

/**
 * A0.3B source data. The engine below this file is intentionally location/person
 * agnostic: future regions add records here (or equivalent canonical data) rather
 * than adding named-port branches to progression code.
 */
export const LEARNING_SOURCES: LearningSourceDefinition[] = [
  {
    id: "learning.officer.nils_sextant",
    name: "Nils Orr: Sextant Method",
    kind: "officer",
    venue: "people",
    description: "Cross-train with Tideworn's navigator on a disciplined instrument method for open-water fixes.",
    sourceLabel: "Nils Orr aboard Tideworn",
    onboardNpcId: "character.nils_orr",
    subject: { type:"ability", abilityId:"tech.instruments.calibrated_sextant_method" },
    accessPaths: [{ label:"Navigation 25", skillMinimums:{navigation:25} }],
    hours: 6,
    costCrowns: 0,
    tags: ["maritime","officer"]
  },
  {
    id: "learning.officer.ulf_bore_sighting",
    name: "Ulf Brenn: Bore Sighting",
    kind: "officer",
    venue: "people",
    description: "Work through battery alignment and disciplined sighting with Tideworn's master gunner.",
    sourceLabel: "Ulf Brenn aboard Tideworn",
    onboardNpcId: "character.ulf_brenn",
    subject: { type:"ability", abilityId:"tech.precision_weapons.precision_bore_sighting" },
    accessPaths: [{ label:"Gunnery 30", skillMinimums:{gunnery:30} }],
    hours: 8,
    costCrowns: 0,
    tags: ["maritime","naval","officer"]
  },
  {
    id: "learning.officer.elsa_hull_shoring",
    name: "Elsa Tarn: Emergency Shoring",
    kind: "officer",
    venue: "people",
    description: "Learn how to stabilize damaged timber and framing well enough to keep a hurt ship alive until a real yard can finish the work.",
    sourceLabel: "Elsa Tarn aboard Tideworn",
    onboardNpcId: "character.elsa_tarn",
    subject: { type:"ability", abilityId:"tech.naval_engineering.emergency_hull_shoring" },
    accessPaths: [{ label:"Engineering 25", skillMinimums:{engineering:25} }],
    hours: 8,
    costCrowns: 0,
    tags: ["industrial","maritime","officer"]
  },
  {
    id: "learning.teacher.korr_hospital_triage",
    name: "Elias Korr: Harbor Triage",
    kind: "teacher",
    venue: "people",
    description: "Spend a working shift in the Covenant hospital learning how dockside injuries are sorted, stabilized, and handed on to stronger care.",
    sourceLabel: "Pastor Elias Korr and the Ironhaven hospital staff",
    portId: "port.ironhaven",
    subject: { type:"specialization", skillId:"medicine", name:"Harbor Triage", rating:3, requiredSkillRating:20 },
    accessPaths: [{ label:"Medicine 20 and a conversation with Elias Korr", skillMinimums:{medicine:20}, relationship:{npcId:"character.pastor_elias_korr",minTrust:1} }],
    hours: 8,
    costCrowns: 12,
    tags: ["medicine","covenant","teacher"]
  },
  {
    id: "learning.book.veyrholm_sailing_directions",
    name: "Admiralty Sailing Directions",
    kind: "book",
    venue: "government",
    description: "Study the capital's current pilot notes, coastal bearings, and open-water corrections as a working navigator rather than memorizing a chart by rote.",
    sourceLabel: "Veyrholm Admiralty sailing-room manual",
    portId: "port.veyrholm",
    subject: { type:"specialization", skillId:"navigation", name:"Open Sea", rating:3, requiredSkillRating:25 },
    accessPaths: [{ label:"Navigation 25", skillMinimums:{navigation:25} }],
    hours: 6,
    costCrowns: 18,
    tags: ["book","admiralty","maritime"]
  },
  {
    id: "learning.institution.ironhaven_yard_diagnostics",
    name: "Ironhaven Yard Diagnostics",
    kind: "institution",
    venue: "government",
    description: "Join a supervised yard session on tracing failures through hull fittings, pumps, machinery, and repair sequences.",
    sourceLabel: "Ironhaven shipwright and engineering yards",
    portId: "port.ironhaven",
    subject: { type:"specialization", skillId:"engineering", name:"Yard Diagnostics", rating:3, requiredSkillRating:30 },
    accessPaths: [
      { label:"Engineering 35", skillMinimums:{engineering:35} },
      { label:"Engineering 30 plus technical background", skillMinimums:{engineering:30}, backgrounds:["foundry_child","engineers_apprentice"] },
      { label:"Engineering 30 plus technical profession", skillMinimums:{engineering:30}, professions:["apprentice_engineer","shipwright"] }
    ],
    hours: 10,
    costCrowns: 36,
    tags: ["industrial","institution"]
  },
  {
    id: "learning.institution.thoren_warding",
    name: "Great Hall Warding Practice",
    kind: "institution",
    venue: "religion",
    description: "Study a guarded old protective rite as practiced at Thorenfjord, with its ritual context left intact rather than reduced to an abstract spell purchase.",
    sourceLabel: "Keepers of the Great Hall of Thoren",
    portId: "port.thorenfjord",
    subject: { type:"ability", abilityId:"arcane.warding.personal_ward" },
    accessPaths: [
      { label:"Old Gods participant with Arcana 25", religions:["old_gods"], skillMinimums:{arcana:25} },
      { label:"Scholarship 35 and Arcana 25", skillMinimums:{scholarship:35,arcana:25} },
      { label:"Persuasion 40 and Arcana 25", skillMinimums:{persuasion:40,arcana:25} }
    ],
    hours: 12,
    costCrowns: 24,
    tags: ["religious","old_gods","institution","arcane"]
  },
  {
    id: "learning.discovery.old_veyr_beacon_weather_lore",
    name: "Old Veyr Beacon Weather-Lore",
    kind: "discovery",
    venue: "poi",
    description: "Compare the beacon's old marks with the water, prevailing winds, and later sailor use until a practical weather-reading method emerges from the site.",
    sourceLabel: "Field study at the Old Veyr Beacon",
    poiId: "poi.old_veyr_beacon",
    requiredPoiActions: ["search","land_party"],
    subject: { type:"specialization", skillId:"navigation", name:"Beacon Weather-Lore", rating:3, requiredSkillRating:20 },
    accessPaths: [
      { label:"Navigation 25", skillMinimums:{navigation:25} },
      { label:"Navigation 20 plus Scholarship 20", skillMinimums:{navigation:20,scholarship:20} },
      { label:"Navigation 20 plus Arcana 20", skillMinimums:{navigation:20,arcana:20} }
    ],
    hours: 4,
    costCrowns: 0,
    tags: ["discovery","maritime","old_gods"]
  }
];

export const LEARNING_SOURCE_BY_ID = Object.fromEntries(LEARNING_SOURCES.map(source=>[source.id,source])) as Record<string, LearningSourceDefinition>;

export interface ReligiousInstitutionContext {
  portId: string;
  name: string;
  representedReligions: ReligionId[];
  tradition: ReligionId;
}

export const RELIGIOUS_INSTITUTIONS: ReligiousInstitutionContext[] = [
  { portId:"port.veyrholm", name:"Temple Quarter", representedReligions:["old_gods","covenant"], tradition:"old_gods" },
  { portId:"port.ironhaven", name:"Old Gods Halls & Covenant Hospital Quarter", representedReligions:["old_gods","covenant"], tradition:"old_gods" },
  { portId:"port.stormvik", name:"Old Gods Harbor Temple", representedReligions:["old_gods"], tradition:"old_gods" },
  { portId:"port.thorenfjord", name:"Great Hall of Thoren", representedReligions:["old_gods"], tradition:"old_gods" }
];

export const RELIGIOUS_INSTITUTION_BY_PORT = Object.fromEntries(RELIGIOUS_INSTITUTIONS.map(row=>[row.portId,row])) as Record<string, ReligiousInstitutionContext>;
