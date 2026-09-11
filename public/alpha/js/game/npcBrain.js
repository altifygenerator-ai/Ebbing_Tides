import { PORT_BY_ID } from "../data/seed/ports.js";
import { isNavigableCell } from "../data/seed/worldMap.js";
import { findSeaPath } from "./navigation.js";
import { pointAlongPathDistance, routeDistanceNm } from "./physicalDistance.js";
import { advanceRouteDistanceByHours, estimateRemainingRouteHours, estimateRouteTravelHours, plannedAverageSpeedKnots } from "./shipSpeed.js";
import { deterministicUnit } from "./rng.js";
import { ALL_SKILLS } from "./skills.js";
import { recordMeaningfulPractice, startingAdvancement, startingLevelFromAge } from "./progression.js";
import { isShipOperational } from "./vesselLifecycle.js";
import { removePlanCheckpoints, upsertSimulationEvent } from "./simulationQueue.js";
import { loadNpcTradeCargo, provisionNpcAtPort, settleNpcCargoAtPort, tradeOpportunityScore } from "./economySimulation.js";
import { worldCauseInfluenceForRoute } from "./worldCauses.js";
function defaultAttributes(seed) {
    const officer = /captain|master|mate|officer/i.test(seed.role);
    const preacher = /preacher|pastor|priest/i.test(seed.role);
    return {
        might: 5,
        agility: officer ? 6 : 5,
        perception: officer ? 7 : 5,
        intellect: preacher ? 7 : 6,
        will: preacher || officer ? 7 : 5,
        presence: officer || preacher ? 7 : 5
    };
}
function defaultSkills(seed) {
    const skills = Object.fromEntries(ALL_SKILLS.map((id) => [id, 5]));
    const role = `${seed.profession ?? ""} ${seed.role}`.toLowerCase();
    const set = (id, value) => { skills[id] = Math.max(skills[id], value); };
    if (/captain|master|mate/.test(role)) {
        set("seamanship", 58);
        set("navigation", 48);
        set("command", 52);
        set("commerce", 30);
    }
    if (/navy|stormcrow/.test(role)) {
        set("gunnery", 60);
        set("command", 64);
        set("blades", 48);
        set("firearms", 44);
    }
    if (/gunner/.test(role)) {
        set("gunnery", 62);
        set("firearms", 48);
        set("craft", 36);
    }
    if (/navigator/.test(role)) {
        set("navigation", 64);
        set("seamanship", 54);
        set("survival", 42);
    }
    if (/shipwright|carpenter/.test(role)) {
        set("engineering", 58);
        set("craft", 62);
        set("seamanship", 38);
    }
    if (/merchant|privateer/.test(role)) {
        set("commerce", 58);
        set("persuasion", 46);
        set("streetwise", 34);
    }
    if (/pirate|raider/.test(role)) {
        set("seamanship", 62);
        set("command", 55);
        set("blades", 55);
        set("streetwise", 58);
        set("deception", 44);
    }
    if (/preacher|pastor|priest/.test(role)) {
        set("scholarship", 62);
        set("persuasion", 58);
        set("medicine", 40);
    }
    if (/engineer|foundry/.test(role)) {
        set("engineering", 60);
        set("craft", 50);
    }
    return skills;
}
function dnaForSeed(seed) {
    const ancestry = seed.ancestry ?? "skeldran";
    const primary = ancestry === "mixed" ? "skeldran" : ancestry;
    return {
        sex: seed.sex ?? "male",
        ancestryPrimary: primary,
        birthYear: 628 - seed.age,
        apparentAge: seed.age,
        skinTone: primary === "skeldran" ? "light" : "regionally_grounded",
        faceFamily: `${primary}.seed`,
        eyeColor: primary === "skeldran" ? "gray_blue" : "brown",
        hairColor: primary === "skeldran" ? "light_brown" : "dark_brown",
        hairTexture: primary === "kaishin" ? "straight" : "natural",
        hairStyle: "profession_appropriate",
        facialHair: seed.sex === "female" ? "none" : "variable",
        build: "average",
        permanentMarks: [],
        clothingCulture: seed.culture ?? "skeldran",
        occupationPresentation: seed.profession ?? seed.role,
        rankPresentation: /captain|master|officer/i.test(seed.role) ? "officer" : "professional",
        wealthPresentation: "role_appropriate",
        religionPresentation: seed.religion,
        visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [],
        appearanceSeed: seed.id
    };
}
function defaultNeeds(seed) {
    return { foodDays: 12, waterDays: 12, moneyReserve: /merchant/.test(seed.role.toLowerCase()) ? 450 : 220, ammunition: /navy|pirate|privateer/.test(seed.role.toLowerCase()) ? 20 : 8, medicalSupplies: 4, crewFatigue: 10, wageArrearsDays: 0, hullSafety: 100, moraleSafety: 65 };
}
export function createNpcFromSeed(seed) {
    const skills = defaultSkills(seed);
    const goals = seed.goals.map((description, index) => ({ id: `goal.${seed.id}.${index}`, type: "role_goal", description, priority: Math.max(30, 80 - index * 12), status: "active", createdAtHour: 0 }));
    const brain = {
        simulationLod: seed.shipId ? "moderate" : "coarse",
        simulationPriority: seed.shipId ? 55 : 35,
        lastHighResolutionAtHour: 0,
        needs: defaultNeeds(seed),
        fastState: { stress: 5, fear: 5, confidence: 55, fatigue: 5, anger: 0, health: 100 },
        learnedPatterns: [], habits: [], memories: []
    };
    return {
        id: seed.id, name: seed.name, age: seed.age, sex: seed.sex ?? "male", ancestry: seed.ancestry ?? "skeldran", homelandRegion: seed.homelandRegion ?? "skeldra", culture: seed.culture ?? "skeldran", religion: seed.religion,
        profession: seed.profession ?? seed.role, role: seed.role, socialTier: seed.socialTier ?? 2,
        ...(seed.locationPortId ? { locationPortId: seed.locationPortId } : {}), ...(seed.shipId ? { shipId: seed.shipId } : {}),
        visualDna: dnaForSeed(seed), attributes: defaultAttributes(seed), skills, specializations: [], abilities: [], preparedEffects: [], schematics: [],
        attunement: { value: 0, arcaneStrain: 0, arcaneExposure: 0, industrialExposure: 0 },
        condition: { health: 100, healthMax: 100, fatigue: 0, stress: 0, pain: 0, arcaneStrain: 0 }, advancement: startingAdvancement(Math.min(10, startingLevelFromAge(seed.age) + ((seed.socialTier ?? 2) >= 3 ? 1 : 0))), trainingHistory: [], practice: {}, knowledgeEntries: [],
        personality: structuredClone(seed.personality), values: structuredClone(seed.values ?? {}), goals, beliefs: structuredClone(seed.beliefs), knownFacts: structuredClone(seed.knownFacts), speakingStyle: seed.speakingStyle,
        relationshipToPlayer: { ...seed.relationshipToPlayer, hatred: 0, obligation: 0 }, brain
    };
}
function schedulePlanCheckpoint(state, npc, plan) {
    if (plan.nextDecisionAtHour === undefined)
        return;
    const eventId = `sim.plan_checkpoint.${plan.id}`;
    const row = {
        id: eventId,
        scheduledAtHour: plan.nextDecisionAtHour,
        eventType: "npc_plan_checkpoint",
        entityId: npc.id,
        priority: npc.brain.simulationPriority,
        payload: { planId: plan.id, planType: plan.type },
        status: "scheduled"
    };
    upsertSimulationEvent(state, row);
}
function createPortDutiesPlan(state, npc, reason) {
    const plan = {
        id: `plan.${npc.id}.port_duties.${state.absoluteHour}`,
        type: "port_duties", status: "active", createdAtHour: state.absoluteHour,
        expectedCompletionHour: state.absoluteHour + 8, nextDecisionAtHour: state.absoluteHour + 8,
        progress: 0, step: "port_duties", reason
    };
    schedulePlanCheckpoint(state, npc, plan);
    return plan;
}
function survivalReserveProblemsForPlan(state, npc, plan) {
    if (!plan || plan.type !== "travel")
        return [];
    const etaDays = plan.expectedCompletionHour ? Math.max(0, plan.expectedCompletionHour - state.absoluteHour) / 24 : 0;
    const reasons = [];
    if (npc.brain.needs.foodDays < etaDays + 2)
        reasons.push("food reserve forecast below destination ETA + safety reserve");
    if (npc.brain.needs.waterDays < etaDays + 2)
        reasons.push("water reserve forecast below destination ETA + safety reserve");
    return reasons;
}
function nearestNavigablePoint(point) {
    const rounded = { x: Math.round(point.x), y: Math.round(point.y) };
    if (isNavigableCell(rounded))
        return rounded;
    for (let radius = 1; radius <= 3; radius += 1) {
        for (let dy = -radius; dy <= radius; dy += 1) {
            for (let dx = -radius; dx <= radius; dx += 1) {
                if (Math.abs(dx) !== radius && Math.abs(dy) !== radius)
                    continue;
                const candidate = { x: rounded.x + dx, y: rounded.y + dy };
                if (isNavigableCell(candidate))
                    return candidate;
            }
        }
    }
    return undefined;
}
function nearestReachablePort(point) {
    const start = nearestNavigablePoint(point);
    if (!start)
        return undefined;
    const candidates = Object.values(PORT_BY_ID)
        .map((port) => ({ port, distance: Math.hypot(port.approachPoint.x - start.x, port.approachPoint.y - start.y) }))
        .sort((a, b) => a.distance - b.distance);
    for (const { port } of candidates) {
        const path = findSeaPath(start, port.approachPoint);
        if (path.length >= 2)
            return { portId: port.id, path };
    }
    return undefined;
}
function travelPlanFromPath(state, npc, path, destinationPortId, reason, fromPortId, survivalRecovery = false) {
    const ship = npc.shipId ? state.ships[npc.shipId] : undefined;
    if (!ship || path.length < 2)
        return undefined;
    const distanceNm = routeDistanceNm(path);
    const exactHours = estimateRouteTravelHours(path, ship, npc.skills.seamanship);
    const hours = Math.max(1, Math.ceil(exactHours));
    const plan = {
        id: `plan.${npc.id}.${state.absoluteHour}.${destinationPortId}`,
        type: "travel", status: "active", createdAtHour: state.absoluteHour,
        expectedCompletionHour: state.absoluteHour + hours, nextDecisionAtHour: state.absoluteHour + hours,
        ...(fromPortId ? { fromPortId } : {}), destinationPortId, path,
        routeDistanceNm: distanceNm, distanceTravelledNm: 0, plannedAverageSpeedKnots: plannedAverageSpeedKnots(path, ship, npc.skills.seamanship),
        progress: 0, step: survivalRecovery ? "survival_return" : "sail_to_destination", reason,
        ...(survivalRecovery ? { survivalRecovery: true } : {})
    };
    schedulePlanCheckpoint(state, npc, plan);
    return plan;
}
export function planTravel(state, npc, fromPortId, destinationPortId, reason) {
    const ship = npc.shipId ? state.ships[npc.shipId] : undefined;
    const from = PORT_BY_ID[fromPortId];
    const to = PORT_BY_ID[destinationPortId];
    if (!ship || !from || !to)
        return undefined;
    if (worldCauseInfluenceForRoute(state, fromPortId, destinationPortId).trafficMultiplier <= 0.01)
        return undefined;
    const path = findSeaPath(from.approachPoint, to.approachPoint);
    return travelPlanFromPath(state, npc, path, destinationPortId, reason, fromPortId);
}
function chooseRoutineDestination(state, npc, currentPortId) {
    const ship = npc.shipId ? state.ships[npc.shipId] : undefined;
    const from = PORT_BY_ID[currentPortId];
    if (!ship || !from)
        return undefined;
    const day = Math.floor(state.absoluteHour / 24);
    const merchantLike = ship.disposition === "merchant" || ship.disposition === "privateer";
    const candidates = Object.values(PORT_BY_ID).flatMap((port) => {
        if (port.id === currentPortId)
            return [];
        const path = findSeaPath(from.approachPoint, port.approachPoint);
        if (path.length < 2)
            return [];
        const distanceNm = routeDistanceNm(path);
        const routeCause = worldCauseInfluenceForRoute(state, currentPortId, port.id);
        if (routeCause.trafficMultiplier <= 0.01)
            return [];
        const tradeScore = merchantLike ? tradeOpportunityScore(state, currentPortId, port.id) : 0;
        const economic = Number.isFinite(tradeScore) ? tradeScore : 0;
        const variety = deterministicUnit(state.worldSeed, `npc-destination:${npc.id}:${currentPortId}:${port.id}:${day}`) * 12;
        const trafficBias = Math.log2(Math.max(0.125, routeCause.trafficMultiplier)) * 14;
        // Economic opportunity leads merchant routing. A0.3C alters route desirability/availability as
        // one causal input; it does not teleport vessels or maintain a parallel traffic state.
        const score = (merchantLike ? economic : 0) - distanceNm * (merchantLike ? 0.025 : 0.05) + variety + trafficBias;
        return [{ portId: port.id, score }];
    });
    candidates.sort((a, b) => b.score - a.score || a.portId.localeCompare(b.portId));
    return candidates[0]?.portId;
}
export function ensureNpcPlan(state, npc) {
    if (!npc.shipId)
        return;
    const ship = state.ships[npc.shipId];
    if (!ship)
        return;
    if (!isShipOperational(ship)) {
        if (npc.brain.currentPlan?.status === "active") {
            npc.brain.currentPlan.status = "invalid";
            npc.brain.currentPlan.interruptReason = "VESSEL_TERMINAL_STATE";
        }
        return;
    }
    if (npc.brain.currentPlan?.status === "active") {
        schedulePlanCheckpoint(state, npc, npc.brain.currentPlan);
        return;
    }
    // Migrate the pre-0.5 moving-route state into the same persistent plan architecture rather than
    // teleporting the actor back to a port. This keeps old campaigns/history continuous.
    if (ship.route) {
        const legacy = ship.route;
        const plan = planTravel(state, npc, legacy.fromPortId, legacy.toPortId, "Legacy route adopted into Plan Until Interrupted.");
        if (plan) {
            plan.progress = Math.max(0, Math.min(1, legacy.progress));
            plan.routeDistanceNm ??= routeDistanceNm(plan.path ?? []);
            plan.distanceTravelledNm = plan.routeDistanceNm * plan.progress;
            const remaining = Math.max(1, Math.ceil(estimateRemainingRouteHours(plan.path ?? [], plan.distanceTravelledNm, ship, npc.skills.seamanship)));
            plan.expectedCompletionHour = state.absoluteHour + remaining;
            plan.nextDecisionAtHour = plan.expectedCompletionHour;
            ship.position = pointAlongPathDistance(plan.path ?? [], plan.distanceTravelledNm);
            npc.brain.currentPlan = plan;
            npc.brain.nextDecisionAtHour = plan.nextDecisionAtHour;
            schedulePlanCheckpoint(state, npc, plan);
            delete ship.route;
            delete ship.dockedAtPortId;
            delete npc.locationPortId;
            return;
        }
    }
    const currentPortId = ship.dockedAtPortId ?? npc.locationPortId;
    if (!currentPortId) {
        const recovery = nearestReachablePort(ship.position);
        if (!recovery)
            return;
        const interruptedForSurvival = npc.brain.currentPlan?.status === "interrupted" && String(npc.brain.currentPlan.interruptReason ?? "").startsWith("SURVIVAL_RESOURCE_SHORTFALL:");
        const plan = travelPlanFromPath(state, npc, recovery.path, recovery.portId, interruptedForSurvival
            ? "Emergency return to the nearest reachable port after a survival-resource shortfall."
            : npc.brain.currentPlan?.status === "interrupted"
                ? "At-sea replanning after a meaningful interruption."
                : "Migrated at-sea state scheduled for the nearest safe port review.", undefined, interruptedForSurvival);
        if (plan) {
            npc.brain.currentPlan = plan;
            if (plan.nextDecisionAtHour !== undefined)
                npc.brain.nextDecisionAtHour = plan.nextDecisionAtHour;
            delete ship.dockedAtPortId;
            delete npc.locationPortId;
        }
        return;
    }
    const destination = chooseRoutineDestination(state, npc, currentPortId);
    if (!destination)
        return;
    const plan = planTravel(state, npc, currentPortId, destination, "Routine role travel chosen from reachable ports and current world/economic context.");
    if (plan) {
        const reserveProblems = survivalReserveProblemsForPlan(state, npc, plan);
        if (reserveProblems.length) {
            removePlanCheckpoints(state, plan.id);
            const servicePlan = createPortDutiesPlan(state, npc, `Departure held for port service: ${reserveProblems[0]}.`);
            npc.brain.currentPlan = servicePlan;
            if (servicePlan.nextDecisionAtHour !== undefined)
                npc.brain.nextDecisionAtHour = servicePlan.nextDecisionAtHour;
            ship.dockedAtPortId = currentPortId;
            npc.locationPortId = currentPortId;
            return;
        }
        // Once the voyage is viable, merchant/privateer cargo is loaded from actual source-market stock
        // for this actual destination. The planner never creates cargo.
        loadNpcTradeCargo(state, npc, currentPortId, destination);
        npc.brain.currentPlan = plan;
        if (plan.nextDecisionAtHour !== undefined)
            npc.brain.nextDecisionAtHour = plan.nextDecisionAtHour;
        delete ship.dockedAtPortId;
        delete npc.locationPortId;
    }
}
export function forecastNpcNeeds(state, npc) {
    const needs = npc.brain.needs;
    const reasons = [];
    const plan = npc.brain.currentPlan;
    reasons.push(...survivalReserveProblemsForPlan(state, npc, plan));
    if (needs.moneyReserve < 30)
        reasons.push("money reserve below operating threshold");
    if (needs.hullSafety < 45)
        reasons.push("ship condition below safe voyage threshold");
    if (needs.moraleSafety < 30 || needs.wageArrearsDays > 20)
        reasons.push("crew morale/wage state threatens discipline");
    return reasons;
}
export function interruptNpcPlan(state, npc, reason) {
    const plan = npc.brain.currentPlan;
    if (!plan || plan.status !== "active")
        return;
    plan.status = "interrupted";
    plan.interruptReason = reason;
    npc.brain.nextDecisionAtHour = state.absoluteHour;
    removePlanCheckpoints(state, plan.id);
    state.worldEvents.push({ id: `event.npc_plan_interrupt.${npc.id}.${state.absoluteHour}`, type: "npc_plan_interrupted", atHour: state.absoluteHour, participants: [npc.id, ...(npc.shipId ? [npc.shipId] : [])], summary: `${npc.name}'s plan was interrupted: ${reason}.`, canonicalData: { npcId: npc.id, planId: plan.id, reason }, importance: 1 });
}
export function advanceNpcPlan(state, npc, hours) {
    ensureNpcPlan(state, npc);
    const plan = npc.brain.currentPlan;
    const ship = npc.shipId ? state.ships[npc.shipId] : undefined;
    if (!plan || plan.status !== "active" || !ship)
        return;
    if (plan.type === "travel" && plan.fromPortId && plan.destinationPortId && !plan.survivalRecovery) {
        const routeCause = worldCauseInfluenceForRoute(state, plan.fromPortId, plan.destinationPortId);
        if (routeCause.trafficMultiplier <= 0.01) {
            interruptNpcPlan(state, npc, "WORLD_ROUTE_RESTRICTION");
            return;
        }
    }
    schedulePlanCheckpoint(state, npc, plan);
    if (!isShipOperational(ship)) {
        plan.status = "invalid";
        plan.interruptReason = "VESSEL_TERMINAL_STATE";
        return;
    }
    const survivalProblems = survivalReserveProblemsForPlan(state, npc, plan);
    // Only actual food/water voyage safety can trigger the survival-return state. Money, hull and
    // morale concerns remain decision inputs and cannot masquerade as a provisioning emergency.
    if (plan.type === "travel" && survivalProblems.length && !plan.survivalRecovery) {
        interruptNpcPlan(state, npc, `SURVIVAL_RESOURCE_SHORTFALL: ${survivalProblems[0]}`);
        ensureNpcPlan(state, npc);
        return;
    }
    if (plan.type === "port_duties" && plan.expectedCompletionHour) {
        const total = Math.max(1, plan.expectedCompletionHour - plan.createdAtHour);
        plan.progress = Math.max(0, Math.min(1, plan.progress + hours / total));
        npc.brain.needs.foodDays = Math.min(18, npc.brain.needs.foodDays + hours / 12);
        npc.brain.needs.waterDays = Math.min(18, npc.brain.needs.waterDays + hours / 12);
        npc.brain.needs.crewFatigue = Math.max(0, npc.brain.needs.crewFatigue - hours * 1.5);
        if (plan.progress >= 1 || state.absoluteHour >= plan.expectedCompletionHour) {
            plan.status = "completed";
            removePlanCheckpoints(state, plan.id);
            const portId = ship.dockedAtPortId ?? npc.locationPortId;
            if (portId) {
                // Arrival cargo, ship stores and the next export cargo all use the same settlement market.
                // Ordinary trade is not duplicated as a separate synthetic merchant economy.
                settleNpcCargoAtPort(state, npc, portId);
                provisionNpcAtPort(state, npc, portId, 18);
            }
            npc.brain.needs.crewFatigue = Math.max(0, npc.brain.needs.crewFatigue - 12);
            delete npc.brain.currentPlan;
            npc.brain.nextDecisionAtHour = state.absoluteHour;
            ensureNpcPlan(state, npc);
        }
        return;
    }
    if (plan.type !== "travel" || !plan.path?.length || !plan.expectedCompletionHour)
        return;
    plan.routeDistanceNm ??= routeDistanceNm(plan.path);
    plan.distanceTravelledNm ??= plan.routeDistanceNm * Math.max(0, Math.min(1, plan.progress));
    plan.plannedAverageSpeedKnots ??= plannedAverageSpeedKnots(plan.path, ship, npc.skills.seamanship);
    const movement = advanceRouteDistanceByHours(plan.path, plan.distanceTravelledNm, hours, ship, npc.skills.seamanship);
    plan.distanceTravelledNm = Math.min(plan.routeDistanceNm, movement.distanceTravelledNm);
    plan.progress = plan.routeDistanceNm <= 0 ? 1 : Math.max(0, Math.min(1, plan.distanceTravelledNm / plan.routeDistanceNm));
    ship.position = pointAlongPathDistance(plan.path, plan.distanceTravelledNm);
    const remainingEta = estimateRemainingRouteHours(plan.path, plan.distanceTravelledNm, ship, npc.skills.seamanship);
    plan.expectedCompletionHour = state.absoluteHour + Math.max(0, Math.ceil(remainingEta));
    plan.nextDecisionAtHour = plan.expectedCompletionHour;
    npc.brain.nextDecisionAtHour = plan.nextDecisionAtHour;
    const scheduled = state.simulationEvents.find((event) => event.payload.planId === plan.id && event.status === "scheduled");
    if (scheduled)
        scheduled.scheduledAtHour = plan.expectedCompletionHour;
    npc.brain.needs.foodDays = Math.max(0, npc.brain.needs.foodDays - hours / 24);
    npc.brain.needs.waterDays = Math.max(0, npc.brain.needs.waterDays - hours / 24);
    npc.brain.needs.crewFatigue = Math.min(100, npc.brain.needs.crewFatigue + hours * .2);
    if (plan.progress >= 1 && plan.destinationPortId) {
        const port = PORT_BY_ID[plan.destinationPortId];
        if (port)
            ship.position = { ...port.approachPoint };
        ship.dockedAtPortId = plan.destinationPortId;
        npc.locationPortId = plan.destinationPortId;
        plan.status = "completed";
        const completedPlanId = plan.id;
        removePlanCheckpoints(state, completedPlanId);
        npc.brain.currentPlan = createPortDutiesPlan(state, npc, "Arrival checkpoint: resupply, trade, orders, and crew needs are reviewed.");
        if (npc.brain.currentPlan.nextDecisionAtHour !== undefined)
            npc.brain.nextDecisionAtHour = npc.brain.currentPlan.nextDecisionAtHour;
        recordMeaningfulPractice(state, npc.id, "navigation", `route:${plan.fromPortId}:${plan.destinationPortId}`, 35);
        recordMeaningfulPractice(state, npc.id, "seamanship", `voyage:${plan.fromPortId}:${plan.destinationPortId}`, 32);
        state.worldEvents.push({ id: `event.npc_arrival.${npc.id}.${state.absoluteHour}`, type: "npc_arrival", atHour: state.absoluteHour, locationId: plan.destinationPortId, participants: [npc.id, ship.id], summary: `${npc.name} arrived at ${port?.name ?? plan.destinationPortId}.`, canonicalData: { npcId: npc.id, shipId: ship.id, planId: plan.id, routeDistanceNm: Number((plan.routeDistanceNm ?? 0).toFixed(3)), plannedAverageSpeedKnots: Number((plan.plannedAverageSpeedKnots ?? 0).toFixed(3)) }, importance: 1 });
    }
}
export function evaluateImmediateUtility(state, npc, action) {
    const c = [];
    const push = (source, value) => { c.push({ source, value }); return value; };
    const p = npc.personality;
    const n = npc.brain.needs;
    let total = 0;
    if (action === "attack")
        total += push("aggression", (p.aggression ?? 40) * .25) + push("risk_tolerance", (p.riskTolerance ?? p.courage ?? 40) * .18) + push("desperation", Math.max(0, 6 - n.foodDays) * 4);
    if (action === "flee")
        total += push("fear", npc.brain.fastState.fear * .35) + push("survival", Math.max(0, 55 - n.hullSafety) * .8) - push("courage", (p.courage ?? 40) * .12);
    if (action === "trade")
        total += push("commerce_role", npc.skills.commerce * .25) + push("money_need", Math.max(0, 150 - n.moneyReserve) * .08);
    if (action === "resupply")
        total += push("food_need", Math.max(0, 8 - n.foodDays) * 8) + push("water_need", Math.max(0, 8 - n.waterDays) * 8) + push("wage_pressure", n.wageArrearsDays * .8);
    total += (deterministicUnit(state.worldSeed, `utility:${npc.id}:${action}:${Math.floor(state.absoluteHour / 6)}`) - .5) * 4;
    npc.brain.lastDecisionExplanation = c.map(row => `${row.source} ${row.value >= 0 ? "+" : ""}${row.value.toFixed(1)}`);
    return { total: Math.round(total), contributions: c };
}
export function updateNpcSimulationLod(state, npc) {
    const playerShip = state.ships[state.player.shipId];
    const npcShip = npc.shipId ? state.ships[npc.shipId] : undefined;
    if (!playerShip || !npcShip) {
        npc.brain.simulationLod = npc.locationPortId === state.player.currentPortId ? "moderate" : "coarse";
        return;
    }
    const dx = npcShip.position.x - playerShip.position.x, dy = npcShip.position.y - playerShip.position.y;
    const distance = Math.hypot(dx, dy);
    const sameRegion = Math.floor(npcShip.position.x / 24) === Math.floor(playerShip.position.x / 24);
    npc.brain.simulationLod = distance <= 4 ? "detailed" : sameRegion ? "moderate" : "coarse";
    if (npc.brain.simulationLod === "detailed")
        npc.brain.lastHighResolutionAtHour = state.absoluteHour;
}
export function mutinyPressure(npc) {
    const n = npc.brain.needs;
    const leadership = npc.skills.command;
    const loyalty = Math.max(0, Math.min(100, 50 + (npc.personality.loyalty ?? 0) * .25));
    return Math.max(0, Math.min(100, Math.round(Math.max(0, 5 - n.foodDays) * 7 + Math.max(0, 5 - n.waterDays) * 7 + n.wageArrearsDays * 1.4 + n.crewFatigue * .25 + Math.max(0, 50 - n.moraleSafety) * .6 - leadership * .22 - loyalty * .08)));
}
//# sourceMappingURL=npcBrain.js.map