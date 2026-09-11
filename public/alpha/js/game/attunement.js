import { ABILITY_BY_ID } from "../data/seed/abilities.js";
/**
 * Player-facing wording for the derived specialization state.
 * Exact values remain simulation data and are intentionally not a normal UI meter.
 */
export function attunementBand(value) {
    if (value <= -70)
        return "Strongly Arcane";
    if (value <= -40)
        return "Moderately Arcane";
    if (value <= -20)
        return "Slightly Arcane";
    if (value < 20)
        return "Neutral";
    if (value < 40)
        return "Slightly Industrial";
    if (value < 70)
        return "Moderately Industrial";
    return "Strongly Industrial";
}
/**
 * Alpha 0.6D prototype: Attunement is derived from committed practice rather than assigned.
 * Ordinary shared technology/magic does not move the value by itself. Known specialized abilities,
 * accumulated use exposure, technical schematics, and Arcana specializations provide the signal.
 */
export function deriveAttunementValue(character) {
    let arcane = Math.max(0, character.attunement.arcaneExposure) * 0.22;
    let industrial = Math.max(0, character.attunement.industrialExposure) * 0.22;
    for (const learned of character.abilities) {
        if (learned.status !== "known")
            continue;
        const definition = ABILITY_BY_ID[learned.abilityId];
        if (!definition)
            continue;
        const mastery = Math.max(1, learned.mastery || 1);
        if (definition.type === "arcane_practice")
            arcane += 9 * mastery;
        if (definition.type === "technical_technique")
            industrial += 8 * mastery;
    }
    industrial += character.schematics.filter((row) => row.access !== "institutional").length * 3;
    arcane += character.specializations.filter((row) => row.skillId === "arcana").reduce((sum, row) => sum + Math.min(6, row.rating / 10), 0);
    return Math.max(-100, Math.min(100, Math.round(industrial - arcane)));
}
export function refreshDerivedAttunement(character) {
    const value = deriveAttunementValue(character);
    character.attunement.value = value;
    return value;
}
export function calculateInterference(character, loads) {
    const arcaneLoad = loads.reduce((sum, row) => sum + row.arcane * Math.max(0.1, row.sensitivity), 0);
    const industrialLoad = loads.reduce((sum, row) => sum + row.industrial * Math.max(0.1, row.sensitivity), 0);
    const personalArcane = Math.max(0, -character.value);
    const personalIndustrial = Math.max(0, character.value);
    // Conflict is caused by high-order opposing commitments, not ordinary knives, rope, sails, or simple pistols.
    const conflict = (personalArcane * industrialLoad + personalIndustrial * arcaneLoad + arcaneLoad * industrialLoad * 0.35) / 100;
    const score = Math.max(0, Math.round(conflict));
    const severity = score >= 70 ? "extreme" : score >= 45 ? "high" : score >= 25 ? "moderate" : score >= 10 ? "low" : "none";
    const symptoms = [];
    if (industrialLoad && (personalArcane >= 20 || arcaneLoad >= 20))
        symptoms.push("precision drift, timing noise, or pressure irregularity in sensitive machinery");
    if (arcaneLoad && (personalIndustrial >= 20 || industrialLoad >= 20))
        symptoms.push("ward flicker, damped resonance, or increased Arcane strain");
    if (severity === "none")
        symptoms.push("no meaningful high-order interference");
    return {
        severity,
        score,
        symptoms,
        arcaneReliabilityModifier: Math.min(0, -Math.round(Math.max(0, personalIndustrial + industrialLoad - 35) / 4)),
        industrialReliabilityModifier: Math.min(0, -Math.round(Math.max(0, personalArcane + arcaneLoad - 35) / 4))
    };
}
export const ARCANE_STRAIN_RECOVERY_INTERVAL_HOURS = 6;
export function applyArcaneStrain(attunement, amount) {
    attunement.arcaneStrain = Math.max(0, Math.min(100, attunement.arcaneStrain + Math.max(0, amount)));
}
/**
 * Strain is its own pressure loop, separate from Arcane/Industrial interference.
 * It makes repeated Arcane practice less reliable until enough world time has passed.
 */
export function arcaneStrainReliabilityModifier(value) {
    const strain = Math.max(0, Math.min(100, value));
    if (strain < 20)
        return 0;
    if (strain < 45)
        return -2;
    if (strain < 75)
        return -5;
    return -9;
}
/**
 * Recover one strain per six crossed world-clock hours. Using absolute boundaries rather than
 * per-call rounding makes recovery identical whether time advances in one large step or many small ones.
 * AttunementState is authoritative; CharacterCondition.arcaneStrain is a compatibility/display mirror.
 */
export function advanceArcaneStrainRecovery(character, fromHour, toHour) {
    const before = Math.max(0, Math.min(100, Number(character.attunement.arcaneStrain) || 0));
    const start = Math.max(0, Math.floor(fromHour));
    const end = Math.max(start, Math.floor(toHour));
    const ticks = Math.max(0, Math.floor(end / ARCANE_STRAIN_RECOVERY_INTERVAL_HOURS) - Math.floor(start / ARCANE_STRAIN_RECOVERY_INTERVAL_HOURS));
    const after = Math.max(0, before - ticks);
    character.attunement.arcaneStrain = after;
    character.condition.arcaneStrain = after;
    return before - after;
}
export function normalizeArcaneStrain(character) {
    const strain = Math.max(0, Math.min(100, Number(character.attunement?.arcaneStrain) || 0));
    character.attunement.arcaneStrain = strain;
    character.condition.arcaneStrain = strain;
}
export function strainBand(value) {
    if (value < 20)
        return "Low";
    if (value < 45)
        return "Moderate";
    if (value < 75)
        return "High";
    return "Extreme";
}
//# sourceMappingURL=attunement.js.map