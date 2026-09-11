import { deterministicUnit } from "./rng.js";
import { attributeModifier } from "./skills.js";
export function resolveCheck(request) {
    const modifiers = [];
    const add = (source, value = 0) => { if (value)
        modifiers.push({ source, value }); return value; };
    const specialization = request.specializationName
        ? request.specializations?.find((row) => row.skillId === request.skillId && row.name.toLowerCase() === request.specializationName.toLowerCase())
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
    let outcome;
    if (margin >= 30 || roll <= 3)
        outcome = "exceptional_success";
    else if (margin >= 0)
        outcome = margin <= 8 ? "costly_success" : "clean_success";
    else if (margin <= -30 || roll >= 98)
        outcome = "severe_failure";
    else
        outcome = "failure";
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
//# sourceMappingURL=checks.js.map