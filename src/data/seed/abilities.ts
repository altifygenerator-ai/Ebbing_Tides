import type { AbilityDefinition } from "../../game/types.js";

// Alpha 0.5 vertical slice: intentionally small, data-driven subset from the Character System Bible v0.1.
export const ABILITY_DEFINITIONS: AbilityDefinition[] = [
  {
    id: "arcane.wind_weather.read_wind",
    name: "Read Wind",
    type: "arcane_practice",
    discipline: "wind_weather",
    scale: "immediate",
    requiredSkillId: "arcana",
    requiredSkillRating: 20,
    recommendedSpecialization: "Wind & Weather",
    strainCost: 2,
    description: "Interpret local wind, current shifts, and Arcane disturbance without creating weather from nothing.",
    worldUses: ["navigation", "ship_combat", "weather_appraisal"],
    failureProfile: "Weak or misleading impression; minor strain increase under poor conditions.",
    iconAssetId: "ability.arcane.read_wind"
  },
  {
    id: "arcane.warding.personal_ward",
    name: "Personal Ward",
    type: "arcane_practice",
    discipline: "warding",
    scale: "immediate",
    requiredSkillId: "arcana",
    requiredSkillRating: 25,
    recommendedSpecialization: "Warding",
    strainCost: 4,
    description: "Brief protective barrier that reduces incoming harm without replacing armor or positioning.",
    worldUses: ["personal_combat", "boarding", "dangerous_exploration"],
    failureProfile: "Ward flicker, reduced protection, or extra strain; severe backlash only under dangerous interference.",
    iconAssetId: "ability.arcane.personal_ward"
  },
  {
    id: "arcane.sight_divination.sense_resonance",
    name: "Sense Resonance",
    type: "arcane_practice",
    discipline: "sight_divination",
    scale: "immediate",
    requiredSkillId: "arcana",
    requiredSkillRating: 20,
    recommendedSpecialization: "Divination",
    strainCost: 2,
    description: "Detect strong Arcane presence, active wards, or disturbed resonance without revealing facts the character could not infer.",
    worldUses: ["relic_appraisal", "cargo", "poi_investigation", "interference_diagnosis"],
    failureProfile: "No clear reading or ambiguous resonance; does not invent hidden truth.",
    iconAssetId: "ability.arcane.sense_resonance"
  },
  {
    id: "tech.naval_engineering.emergency_hull_shoring",
    name: "Emergency Hull Shoring",
    type: "technical_technique",
    discipline: "naval_engineering",
    scale: "ship",
    requiredSkillId: "engineering",
    requiredSkillRating: 25,
    requiredSystemTags: ["wooden_hull", "damage_control_kit"],
    description: "Use materials, crew time, and structural judgment to slow worsening hull damage and flooding.",
    worldUses: ["ship_combat", "storms", "voyage_emergency"],
    failureProfile: "Consumes time/materials without full stabilization; poor execution can worsen a damaged section.",
    iconAssetId: "ability.industrial.emergency_hull_shoring"
  },
  {
    id: "tech.instruments.calibrated_sextant_method",
    name: "Calibrated Sextant Method",
    type: "technical_technique",
    discipline: "instruments_optics",
    scale: "operational",
    requiredSkillId: "navigation",
    requiredSkillRating: 25,
    requiredItemTags: ["navigation_instrument"],
    description: "Use a calibrated optical instrument and visibility to improve position fixing and route confidence.",
    worldUses: ["navigation", "chart_appraisal", "exploration"],
    failureProfile: "Poor fix or detected calibration error; requires a real compatible instrument.",
    iconAssetId: "ability.industrial.calibrated_sextant_method"
  },
  {
    id: "tech.precision_weapons.precision_bore_sighting",
    name: "Precision Bore Sighting",
    type: "technical_technique",
    discipline: "precision_weapons",
    scale: "ship",
    requiredSkillId: "gunnery",
    requiredSkillRating: 30,
    requiredSystemTags: ["naval_battery"],
    description: "Prepare compatible guns and sighting references for improved first-fire accuracy and reveal obvious wear.",
    worldUses: ["ship_combat", "artillery_appraisal", "trade"],
    failureProfile: "No useful calibration or misread wear state; cannot be used without a real battery.",
    iconAssetId: "ability.industrial.precision_bore_sighting"
  }
];

export const ABILITY_BY_ID = Object.fromEntries(ABILITY_DEFINITIONS.map((ability) => [ability.id, ability])) as Record<string, AbilityDefinition>;
