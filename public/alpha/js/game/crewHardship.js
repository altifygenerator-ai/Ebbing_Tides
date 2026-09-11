import { hasGeneralPerk } from "./progression.js";
import { ensureCrewCommunity } from "./crewState.js";
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function average(values, fallback) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback; }
export function ensureCrewWelfare(ship) {
    if (!ship.crewWelfare) {
        ship.crewWelfare = {
            averageHealth: 100,
            zeroSupplyHours: 0,
            shortageEpisodes: 0,
            shortageActive: false,
            currentEpisodeMoraleLoss: 0,
            currentEpisodeHealthLoss: 0
        };
    }
    ship.crewWelfare.averageHealth = clamp(ship.crewWelfare.averageHealth, 0, 100);
    return ship.crewWelfare;
}
export function crewLeadershipProfile(state) {
    const pc = state.player.character;
    const ship = state.ships[state.player.shipId];
    const command = clamp(pc.skills.command, 0, 100);
    const presence = clamp(((pc.attributes.presence - 1) / 9) * 100, 0, 100);
    const community = ship ? ensureCrewCommunity(ship) : undefined;
    const namedLoyalty = average(state.player.crew.map(member => clamp(member.loyalty, 0, 100)), 50);
    const loyalty = community ? community.loyalty * .65 + namedLoyalty * .35 : namedLoyalty;
    const relationships = state.player.crew
        .map(member => member.npcId ? state.npcs[member.npcId] : undefined)
        .filter((npc) => Boolean(npc))
        .map(npc => clamp(50 + npc.relationshipToPlayer.respect * .32 + npc.relationshipToPlayer.trust * .18 - npc.relationshipToPlayer.suspicion * .10, 0, 100));
    const crewRespect = average(relationships, 50);
    const firstMateMember = state.player.crew.find(member => member.npcId === state.player.firstMateId);
    const firstMateNpc = state.npcs[state.player.firstMateId];
    const firstMateCommand = clamp(firstMateNpc?.skills.command ?? firstMateMember?.skill ?? 50, 0, 100);
    const firstMateLoyalty = clamp(firstMateMember?.loyalty ?? 50, 0, 100);
    const firstMateRespect = clamp(50 + (firstMateNpc?.relationshipToPlayer.respect ?? 0) * .4 + (firstMateNpc?.relationshipToPlayer.trust ?? 0) * .2 - (firstMateNpc?.relationshipToPlayer.suspicion ?? 0) * .15, 0, 100);
    const firstMateInfluence = clamp(firstMateCommand * .45 + firstMateLoyalty * .30 + firstMateRespect * .25, 0, 100);
    const regionalRep = ship ? (pc.reputation[`faction.${ship.region}`] ?? 0) : 0;
    const reputation = clamp(50 + regionalRep * 1.5, 0, 100);
    const perk = hasGeneralPerk(pc, "perk.commanding_presence") ? 100 : 0;
    const discipline = community?.discipline ?? 50;
    const experience = community?.experience ?? 45;
    const score = clamp(command * .25 + presence * .16 + loyalty * .16 + crewRespect * .13 + firstMateInfluence * .10 + discipline * .08 + experience * .04 + reputation * .04 + perk * .04, 0, 100);
    const moraleLossFactor = clamp(1.15 - score * .0062, .58, 1.15);
    const healthLossFactor = clamp(.96 + (moraleLossFactor - .75) * .24, .88, 1.08);
    const episodes = ship ? ensureCrewWelfare(ship).shortageEpisodes : 0;
    const repeatedNeglectFactor = 1 + Math.min(.35, Math.max(0, episodes - 1) * .07);
    return {
        score: Number(score.toFixed(2)),
        moraleLossFactor: Number(moraleLossFactor.toFixed(3)),
        healthLossFactor: Number(healthLossFactor.toFixed(3)),
        repeatedNeglectFactor: Number(repeatedNeglectFactor.toFixed(3)),
        sources: [
            { source: "Command", value: Number(command.toFixed(1)) },
            { source: "Presence", value: Number(presence.toFixed(1)) },
            { source: "Crew loyalty", value: Number(loyalty.toFixed(1)) },
            { source: "Crew respect", value: Number(crewRespect.toFixed(1)) },
            { source: "First Mate", value: Number(firstMateInfluence.toFixed(1)) },
            { source: "Discipline", value: Number(discipline.toFixed(1)) },
            { source: "Experience", value: Number(experience.toFixed(1)) },
            { source: "Reputation", value: Number(reputation.toFixed(1)) },
            ...(perk ? [{ source: "Commanding Presence", value: 100 }] : [])
        ]
    };
}
function cumulativeMoralePressure(hours) {
    const h = Math.max(0, hours);
    const first = Math.min(h, 24) / 24 * 1.2;
    const second = Math.min(Math.max(h - 24, 0), 48) / 24 * 2.5;
    const third = Math.min(Math.max(h - 72, 0), 48) / 24 * 5;
    const severe = Math.max(h - 120, 0) / 24 * 8;
    return first + second + third + severe;
}
function cumulativeHealthPressure(hours) {
    const h = Math.max(0, hours);
    if (h <= 72)
        return 0;
    const early = Math.min(h - 72, 48) / 24 * 1.2;
    const severe = Math.max(h - 120, 0) / 24 * 3;
    return early + severe;
}
export function crewHardshipStage(hours) {
    if (hours < 24)
        return "none";
    if (hours < 72)
        return "strained";
    if (hours < 120)
        return "serious";
    return "severe";
}
function rememberHardship(state, eventId) {
    for (const member of state.player.crew) {
        if (!member.npcId)
            continue;
        const npc = state.npcs[member.npcId];
        if (!npc)
            continue;
        if (!npc.brain.memories.includes(eventId))
            npc.brain.memories.push(eventId);
    }
}
function recordThreshold(state, ship, hours, threshold, summary) {
    const welfare = ensureCrewWelfare(ship);
    const eventId = `event.crew.shortage.${threshold}h.episode${welfare.shortageEpisodes}.${state.absoluteHour}`;
    state.worldEvents.push({
        id: eventId,
        type: "crew_supply_hardship",
        atHour: state.absoluteHour,
        participants: [state.player.character.id, ship.id, ...state.player.crew.flatMap(member => member.npcId ? [member.npcId] : [])],
        summary,
        canonicalData: { zeroSupplyHours: Number(hours.toFixed(2)), thresholdHours: threshold, shortageEpisode: welfare.shortageEpisodes, crewMorale: ship.systems.morale, crewAverageHealth: Number(welfare.averageHealth.toFixed(2)) },
        importance: threshold >= 120 ? 2 : 1
    });
    rememberHardship(state, eventId);
}
export function markSupplyExhausted(state) {
    const ship = state.ships[state.player.shipId];
    if (!ship)
        return;
    const welfare = ensureCrewWelfare(ship);
    if (welfare.shortageActive)
        return;
    welfare.shortageActive = true;
    welfare.shortageEpisodes += 1;
    welfare.zeroSupplyHours = 0;
    welfare.currentEpisodeMoraleLoss = 0;
    welfare.currentEpisodeHealthLoss = 0;
}
export function resetSupplyHardshipIfProvisioned(state) {
    const ship = state.ships[state.player.shipId];
    if (!ship || ship.supplies <= 0)
        return;
    const welfare = ensureCrewWelfare(ship);
    if (!welfare.shortageActive && welfare.zeroSupplyHours <= 0)
        return;
    const completedHours = welfare.zeroSupplyHours;
    const moraleLost = welfare.currentEpisodeMoraleLoss;
    const healthLost = welfare.currentEpisodeHealthLoss;
    welfare.shortageActive = false;
    welfare.zeroSupplyHours = 0;
    welfare.currentEpisodeMoraleLoss = 0;
    welfare.currentEpisodeHealthLoss = 0;
    state.worldEvents.push({
        id: `event.crew.shortage.ended.${state.absoluteHour}.${state.worldEvents.length}`,
        type: "crew_supply_hardship_ended",
        atHour: state.absoluteHour,
        participants: [state.player.character.id, ship.id],
        summary: `Fresh stores end ${Math.round(completedHours)} hours of shortage aboard ${ship.name}.`,
        canonicalData: { zeroSupplyHours: Number(completedHours.toFixed(2)), moraleLost, healthLost, shortageEpisode: welfare.shortageEpisodes },
        importance: 0
    });
}
export function applyZeroSupplyHardship(state, hoursWithoutSupplies) {
    const ship = state.ships[state.player.shipId];
    if (!ship || hoursWithoutSupplies <= 0 || ship.supplies > 0) {
        if (ship?.supplies && ship.supplies > 0)
            resetSupplyHardshipIfProvisioned(state);
        return { zeroSupplyHours: ship ? ensureCrewWelfare(ship).zeroSupplyHours : 0, moraleLoss: 0, healthLoss: 0, stage: "none", leadership: crewLeadershipProfile(state) };
    }
    markSupplyExhausted(state);
    const welfare = ensureCrewWelfare(ship);
    const beforeHours = welfare.zeroSupplyHours;
    welfare.zeroSupplyHours += hoursWithoutSupplies;
    const leadership = crewLeadershipProfile(state);
    const targetMoraleLoss = Math.floor(cumulativeMoralePressure(welfare.zeroSupplyHours) * leadership.moraleLossFactor * leadership.repeatedNeglectFactor);
    const targetHealthLoss = Math.floor(cumulativeHealthPressure(welfare.zeroSupplyHours) * leadership.healthLossFactor * leadership.repeatedNeglectFactor);
    const moraleLoss = Math.max(0, targetMoraleLoss - welfare.currentEpisodeMoraleLoss);
    const healthLoss = Math.max(0, targetHealthLoss - welfare.currentEpisodeHealthLoss);
    if (moraleLoss > 0) {
        ship.systems.morale = clamp(ship.systems.morale - moraleLoss, 0, 100);
        const community = ensureCrewCommunity(ship);
        community.foodSatisfaction = clamp(community.foodSatisfaction - moraleLoss * 2, 0, 100);
        for (const member of state.player.crew)
            member.morale = clamp(member.morale - moraleLoss, 0, 100);
        welfare.currentEpisodeMoraleLoss += moraleLoss;
    }
    if (healthLoss > 0) {
        welfare.averageHealth = clamp(welfare.averageHealth - healthLoss, 0, 100);
        for (const member of state.player.crew) {
            member.health = clamp((member.health ?? 100) - healthLoss, 0, 100);
            if (member.npcId) {
                const npc = state.npcs[member.npcId];
                if (npc)
                    npc.brain.fastState.health = clamp(npc.brain.fastState.health - healthLoss, 0, 100);
            }
        }
        welfare.currentEpisodeHealthLoss += healthLoss;
    }
    for (const threshold of [24, 72, 120]) {
        if (beforeHours < threshold && welfare.zeroSupplyHours >= threshold) {
            const community = ensureCrewCommunity(ship);
            if (threshold === 72)
                community.loyalty = clamp(community.loyalty - 2, 0, 100);
            if (threshold === 120)
                community.loyalty = clamp(community.loyalty - 4, 0, 100);
            const summary = threshold === 24
                ? `A full day without ship stores has begun to wear on ${ship.name}'s crew.`
                : threshold === 72
                    ? `${ship.name}'s crew is suffering from prolonged lack of food and water.`
                    : `${ship.name}'s crew is in severe deprivation after five days without stores.`;
            recordThreshold(state, ship, welfare.zeroSupplyHours, threshold, summary);
        }
    }
    return { zeroSupplyHours: welfare.zeroSupplyHours, moraleLoss, healthLoss, stage: crewHardshipStage(welfare.zeroSupplyHours), leadership };
}
//# sourceMappingURL=crewHardship.js.map