import { deterministicUnit } from "./rng.js";
import { attributeModifier } from "./skills.js";
import type { Attributes, CheckResolution, EntityId, SkillId, SkillSpecialization } from "./types.js";

export interface CheckRequest {
  worldSeed: string;
  checkId: EntityId;
  skillId: SkillId;
  skillRating: number;
  attributeId: keyof Attributes;
  attributeRating: number;
  difficulty?: number;
  specializationName?: string;
  specializations?: SkillSpecialization[];
  equipmentModifier?: number;
  conditionModifier?: number;
  assistanceModifier?: number;
  environmentModifier?: number;
  knowledgeModifier?: number;
  perkModifier?: number;
  perkSources?: string[];
  specialistCharacterId?: EntityId;
}

export function resolveCheck(request: CheckRequest): CheckResolution {
  const modifiers: Array<{ source: string; value: number }> = [];
  const add = (source: string, value = 0) => { if (value) modifiers.push({ source, value }); return value; };
  const specialization = request.specializationName
    ? request.specializations?.find((row) => row.skillId === request.skillId && row.name.toLowerCase() === request.specializationName!.toLowerCase())
    : undefined;
  const specializationModifier = specialization ? Math.min(12, Math.max(2, Math.round(specialization.rating))) : 0;
  const rawChance = request.skillRating
    + add(`attribute:${request.attributeId}`, attributeModifier(request.attributeRating))
    + add(`specialization:${specialization?.name ?? "none"}`, specializationModifier)
    + add("equipment", request.equipmentModifier)
    + add("condition", request.conditionModifier)
    + add("assistance", request.assistanceModifier)
    + add("environment", request.environmentModifier)
    + add(`talent:${request.perkSources?.join(", ") ?? "none"}`, request.perkModifier)
    + add("knowledge", request.knowledgeModifier)
    - add("difficulty", request.difficulty ?? 0);
  const chance = Math.max(2, Math.min(98, Math.round(rawChance)));
  const roll = Math.max(1, Math.min(100, Math.floor(deterministicUnit(request.worldSeed, `check:${request.checkId}`) * 100) + 1));
  const margin = chance - roll;
  let outcome: CheckResolution["outcome"];
  if (margin >= 30 || roll <= 3) outcome = "exceptional_success";
  else if (margin >= 0) outcome = margin <= 8 ? "costly_success" : "clean_success";
  else if (margin <= -30 || roll >= 98) outcome = "severe_failure";
  else outcome = "failure";
  return {
    checkId: request.checkId,
    skillId: request.skillId,
    attributeId: request.attributeId,
    chance,
    roll,
    margin,
    outcome,
    modifiers,
    ...(request.specialistCharacterId ? { specialistCharacterId: request.specialistCharacterId } : {})
  };
}
