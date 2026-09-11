const ROLE_SKILLS = {
    navigation: ["navigator"],
    seamanship: ["first_mate", "navigator"],
    gunnery: ["gunner"],
    command: ["first_mate"],
    engineering: ["carpenter", "engineer"],
    craft: ["carpenter", "engineer"],
    medicine: ["surgeon"],
    commerce: ["purser", "first_mate"],
    arcana: ["ship_mage"]
};
export function effectiveSpecialist(state, skillId) {
    let best = { characterId: state.player.character.id, name: state.player.character.name, skillId, rating: state.player.character.skills[skillId], source: "captain" };
    const allowedRoles = ROLE_SKILLS[skillId] ?? [];
    for (const assignment of state.player.crew) {
        if (!allowedRoles.includes(assignment.role) || !assignment.npcId)
            continue;
        const npc = state.npcs[assignment.npcId];
        if (!npc)
            continue;
        const rating = npc.skills[skillId];
        if (rating > best.rating)
            best = { characterId: npc.id, name: npc.name, skillId, rating, source: "officer" };
    }
    return best;
}
//# sourceMappingURL=delegation.js.map