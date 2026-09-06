import type { Attributes, CharacterCreationChoices, SkillId } from "./types.js";

export const ALL_SKILLS: SkillId[] = [
  "sailing", "navigation", "gunnery", "ship_command", "ship_repair",
  "blades", "pistols", "defense", "persuasion", "leadership",
  "trading", "appraisal", "streetwise", "smuggling", "engineering",
  "religion", "investigation"
];

export function attributeModifier(value: number): number {
  return value - 5;
}

export function buildStartingSkills(choices: CharacterCreationChoices): Record<SkillId, number> {
  const skills = Object.fromEntries(ALL_SKILLS.map((skill) => [skill, 0])) as Record<SkillId, number>;
  for (const skill of choices.coreSkills) skills[skill] += 3;

  switch (choices.socialOrigin) {
    case "dockside_poor": skills.sailing += 1; skills.streetwise += 2; break;
    case "artisan_household": skills.appraisal += 1; skills.engineering += 2; break;
    case "merchant_family": skills.trading += 2; skills.appraisal += 2; break;
    case "naval_family": skills.sailing += 1; skills.gunnery += 1; skills.ship_command += 1; break;
  }

  switch (choices.background) {
    case "former_naval_midshipman": skills.sailing += 2; skills.gunnery += 2; skills.ship_command += 1; break;
    case "foundry_child": skills.engineering += 3; skills.appraisal += 1; skills.ship_repair += 1; break;
    case "raised_among_smugglers": skills.streetwise += 2; skills.smuggling += 3; break;
    case "shipwreck_survivor": skills.sailing += 1; skills.navigation += 2; skills.defense += 1; break;
  }

  switch (choices.recentProfession) {
    case "sailor": skills.sailing += 2; skills.navigation += 1; break;
    case "merchant_clerk": skills.trading += 2; skills.appraisal += 1; break;
    case "dockworker": skills.ship_repair += 1; skills.streetwise += 1; break;
    case "apprentice_engineer": skills.engineering += 2; skills.ship_repair += 1; break;
  }

  if (choices.trait === "sea_legs") skills.sailing += 1;
  if (choices.trait === "silver_tongue") skills.persuasion += 1;
  if (choices.trait === "bookworm") skills.investigation += 1;
  if (choices.religion !== "unaffiliated") skills.religion += 1;

  return skills;
}

export function validateAttributes(attributes: Attributes): boolean {
  const values = Object.values(attributes);
  if (values.some((value) => value < 1 || value > 10)) return false;
  return values.reduce((sum, value) => sum + value, 0) <= 36;
}
