/**
 * Rules for successful abilities whose text promises a later check/exchange.
 * This is the sole runtime owner of pending preparation. WorldEvent remains history only.
 */
export const PREPARED_ABILITY_RULES = {
    "arcane.wind_weather.read_wind": { trigger: "navigation_departure", durationHours: 8, bonus: 6, context: "ship" },
    "tech.instruments.calibrated_sextant_method": { trigger: "navigation_departure", durationHours: 12, bonus: 8, context: "ship" },
    "tech.precision_weapons.precision_bore_sighting": { trigger: "naval_fire", durationHours: 8, bonus: 8, context: "ship" },
    "arcane.warding.personal_ward": { trigger: "personal_defense", durationHours: 2, bonus: 10, context: "character" }
};
function contextForRule(state, rule) {
    return rule.context === "ship" ? state.player.shipId : state.player.character.id;
}
function cleanCharacterPreparedEffects(character, currentHour) {
    const raw = Array.isArray(character.preparedEffects) ? character.preparedEffects : [];
    const byAbility = new Map();
    for (const row of raw) {
        const rule = PREPARED_ABILITY_RULES[row?.abilityId ?? ""];
        if (!rule)
            continue;
        const preparedAtHour = Number.isFinite(row.preparedAtHour) ? Math.max(0, Math.floor(row.preparedAtHour)) : currentHour;
        const expiresAtHour = Number.isFinite(row.expiresAtHour) ? Math.max(preparedAtHour, Math.floor(row.expiresAtHour)) : preparedAtHour + rule.durationHours;
        const remainingUses = Number.isFinite(row.remainingUses) ? Math.max(0, Math.floor(row.remainingUses)) : 1;
        if (remainingUses <= 0 || expiresAtHour <= currentHour)
            continue;
        const normalized = {
            abilityId: row.abilityId,
            trigger: rule.trigger,
            preparedAtHour,
            expiresAtHour,
            bonus: rule.bonus,
            remainingUses: Math.min(1, remainingUses),
            ...(row.contextEntityId ? { contextEntityId: row.contextEntityId } : {})
        };
        const prior = byAbility.get(normalized.abilityId);
        if (!prior || normalized.preparedAtHour >= prior.preparedAtHour)
            byAbility.set(normalized.abilityId, normalized);
    }
    character.preparedEffects = [...byAbility.values()];
}
function latestLegacySuccessfulUse(state, abilityId, durationHours) {
    return [...state.worldEvents].reverse().find(event => event.type === "character_ability_use" &&
        event.canonicalData.abilityId === abilityId &&
        state.absoluteHour - event.atHour >= 0 &&
        state.absoluteHour - event.atHour < durationHours &&
        ["clean_success", "exceptional_success", "costly_success"].includes(String(event.canonicalData.outcome)));
}
/**
 * A0.2C save-compat normalization. Old v12 saves did not have preparedEffects and inferred them
 * from recent historical ability events. We preserve at most one still-recent use per ability,
 * then future runtime behavior is owned exclusively by explicit one-shot state.
 */
export function normalizePreparedAbilityEffects(state) {
    const player = state.player.character;
    const hadPreparedField = Array.isArray(player.preparedEffects);
    cleanCharacterPreparedEffects(player, state.absoluteHour);
    if (!hadPreparedField) {
        for (const [abilityId, rule] of Object.entries(PREPARED_ABILITY_RULES)) {
            const event = latestLegacySuccessfulUse(state, abilityId, rule.durationHours);
            if (!event)
                continue;
            player.preparedEffects.push({
                abilityId,
                trigger: rule.trigger,
                preparedAtHour: event.atHour,
                expiresAtHour: event.atHour + rule.durationHours,
                bonus: rule.bonus,
                remainingUses: 1,
                contextEntityId: contextForRule(state, rule)
            });
        }
        cleanCharacterPreparedEffects(player, state.absoluteHour);
    }
    for (const npc of Object.values(state.npcs ?? {}))
        cleanCharacterPreparedEffects(npc, state.absoluteHour);
}
export function prepareAbilityEffect(state, abilityId) {
    const rule = PREPARED_ABILITY_RULES[abilityId];
    if (!rule)
        return undefined;
    cleanCharacterPreparedEffects(state.player.character, state.absoluteHour);
    const effect = {
        abilityId,
        trigger: rule.trigger,
        preparedAtHour: state.absoluteHour,
        expiresAtHour: state.absoluteHour + rule.durationHours,
        bonus: rule.bonus,
        remainingUses: 1,
        contextEntityId: contextForRule(state, rule)
    };
    state.player.character.preparedEffects = [
        ...(state.player.character.preparedEffects ?? []).filter(row => row.abilityId !== abilityId),
        effect
    ];
    return effect;
}
export function preparedAbilityEffect(state, abilityId, trigger, contextEntityId) {
    cleanCharacterPreparedEffects(state.player.character, state.absoluteHour);
    return state.player.character.preparedEffects?.find(row => row.abilityId === abilityId &&
        row.trigger === trigger &&
        row.remainingUses > 0 &&
        row.expiresAtHour > state.absoluteHour &&
        (!row.contextEntityId || row.contextEntityId === contextEntityId));
}
export function preparedAbilityBonus(state, abilityId, trigger, contextEntityId) {
    return preparedAbilityEffect(state, abilityId, trigger, contextEntityId)?.bonus ?? 0;
}
/** Consume exactly one promised later use. Preview/read-only callers must use preparedAbilityBonus. */
export function consumePreparedAbilityEffect(state, abilityId, trigger, contextEntityId) {
    const effect = preparedAbilityEffect(state, abilityId, trigger, contextEntityId);
    if (!effect)
        return undefined;
    effect.remainingUses = Math.max(0, effect.remainingUses - 1);
    cleanCharacterPreparedEffects(state.player.character, state.absoluteHour);
    return effect;
}
//# sourceMappingURL=preparedEffects.js.map