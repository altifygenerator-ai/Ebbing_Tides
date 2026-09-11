export function recordShipIntel(state, ship, identified, source, confidence = 100) {
    const existing = state.player.shipIntel[ship.id];
    const resolvedIdentity = identified || existing?.identified || false;
    state.player.shipIntel[ship.id] = {
        shipId: ship.id,
        identified: resolvedIdentity,
        confidence: Math.max(existing?.confidence ?? 0, confidence),
        lastKnownPosition: { ...ship.position },
        lastKnownAtHour: state.absoluteHour,
        source,
        ...(resolvedIdentity ? { name: ship.name, disposition: ship.disposition } : {})
    };
}
export function intelAgeHours(state, shipId) {
    const intel = state.player.shipIntel[shipId];
    return intel ? Math.max(0, state.absoluteHour - intel.lastKnownAtHour) : undefined;
}
export function intelFreshnessLabel(state, shipId) {
    const age = intelAgeHours(state, shipId);
    if (age === undefined)
        return "unknown";
    if (age <= 4)
        return "fresh";
    if (age <= 18)
        return "recent";
    if (age <= 48)
        return "aging";
    return "stale";
}
//# sourceMappingURL=intelligence.js.map