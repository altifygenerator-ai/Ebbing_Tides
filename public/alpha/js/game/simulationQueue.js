/**
 * SimulationEvents are an operational wake-up queue, not historical truth.
 * Canonical history belongs in worldEvents. Keeping retired queue rows forever
 * causes multi-year saves to grow without adding meaningful history.
 */
export function upsertSimulationEvent(state, row) {
    const index = state.simulationEvents.findIndex((event) => event.id === row.id);
    if (index >= 0)
        state.simulationEvents[index] = row;
    else
        state.simulationEvents.push(row);
}
export function removePlanCheckpoints(state, planId) {
    state.simulationEvents = state.simulationEvents.filter((event) => String(event.payload.planId ?? "") !== planId);
}
/**
 * Keep only live operational wakeups. Stale/processed/cancelled rows are discarded,
 * and NPC checkpoints are valid only for that NPC's currently active plan.
 */
export function compactSimulationEvents(state) {
    const seen = new Set();
    state.simulationEvents = (state.simulationEvents ?? []).filter((event) => {
        if (event.status !== "scheduled")
            return false;
        if (!Number.isFinite(event.scheduledAtHour))
            return false;
        if (seen.has(event.id))
            return false;
        if (event.eventType === "npc_plan_checkpoint") {
            const npc = state.npcs[event.entityId];
            const plan = npc?.brain.currentPlan;
            const eventPlanId = String(event.payload.planId ?? "");
            if (!plan || plan.status !== "active" || plan.id !== eventPlanId)
                return false;
        }
        seen.add(event.id);
        return true;
    });
}
//# sourceMappingURL=simulationQueue.js.map