import { startingInventory } from "../data/seed/items.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { navigationTargetForPort, navigationTargetForSea, findSeaPath } from "../game/navigation.js";
import { getWorldCell } from "../data/seed/worldMap.js";
import { routePoint } from "../data/seed/routes.js";
import { buildCapabilityState, visualDnaFromChoices } from "../game/characterSystem.js";
import { createNpcFromSeed, ensureNpcPlan } from "../game/npcBrain.js";
import { normalizeProgressionCadence, startingAdvancement, startingLevelFromAge } from "../game/progression.js";
import { clockFromAbsoluteHour } from "../game/clock.js";
import { shipClassDefinition, resolveShipClassId } from "../data/seed/contentRegistry.js";
import { legacyRangeSeedYards, routeDistanceNm } from "../game/physicalDistance.js";
import { estimateRemainingRouteHours, legacyCruiseSpeedKnots, plannedAverageSpeedKnots } from "../game/shipSpeed.js";
import { buildInitialPortMarkets } from "../game/marketGeneration.js";
import { COMPANION_EQUIPMENT_SLOTS, PLAYER_EQUIPMENT_SLOTS, defaultEquipmentState } from "../game/inventory.js";
import { compactSimulationEvents } from "../game/simulationQueue.js";
import { normalizeKnowledgeOwnership } from "../game/information.js";
import { normalizeArcaneStrain } from "../game/attunement.js";
import { normalizePreparedAbilityEffects } from "../game/preparedEffects.js";
import { compactLegalReports, normalizeLawInformationState } from "../game/reputationLaw.js";
import { compactWorldCauses, normalizeWorldCauseState } from "../game/worldCauses.js";
import { normalizeTradeLawState } from "../game/tradeLaw.js";
const KEY = "ebbing-tides.alpha.save";
const LEGACY_KEY = "ebbing-tides.alpha-0.1.save";
const LEGACY_EQUIPMENT_SLOT_MAP = {
    armor: "chest",
    sidearm: "offHand",
    utility: "tool",
    mainHand: "mainHand"
};
function normalizeEquipment(raw, slots) {
    const next = defaultEquipmentState(slots);
    if (!raw || typeof raw !== "object")
        return next;
    for (const [key, value] of Object.entries(raw)) {
        const slot = slots.includes(key) ? key : LEGACY_EQUIPMENT_SLOT_MAP[key];
        if (!slot || !slots.includes(slot))
            continue;
        next[slot] = typeof value === "string" ? value : undefined;
    }
    return next;
}
export function saveLocal(state) {
    compactSimulationEvents(state);
    compactLegalReports(state);
    compactWorldCauses(state);
    normalizeTradeLawState(state);
    localStorage.setItem(KEY, JSON.stringify(state));
}
function migrateV1ToV2(parsed) {
    const inventory = startingInventory(parsed.player?.character?.background ?? "shipwreck_survivor", parsed.player?.character?.recentProfession ?? "sailor");
    const find = (definitionId) => inventory.find((item) => item.definitionId === definitionId)?.id;
    parsed.schemaVersion = 2;
    parsed.player.character.appearance ??= { presentation: "masculine", build: "average", hair: "light_brown", eyes: "gray", complexion: "weathered_fair", distinguishingMark: "none" };
    parsed.player.inventory ??= inventory;
    parsed.player.equipment ??= {
        ...(find("item.weapon.skeldran_naval_saber") ? { mainHand: find("item.weapon.skeldran_naval_saber") } : {}),
        ...(find("item.weapon.skeldran_naval_pistol") ? { sidearm: find("item.weapon.skeldran_naval_pistol") } : {}),
        ...(find("item.armor.common_reinforced_jack") ? { armor: find("item.armor.common_reinforced_jack") } : {}),
        ...(find("item.weapon.common_utility_dagger") ? { utility: find("item.weapon.common_utility_dagger") } : {})
    };
    parsed.player.injuries ??= [];
    parsed.player.shipIntel ??= {};
    parsed.player.crew ??= [
        { id: "crew.mira_holst", name: "Mira Holst", role: "first_mate", skill: 6, morale: 72, loyalty: 81, npcId: "character.mira_holst" },
        { id: "crew.ulf_brenn", name: "Ulf Brenn", role: "gunner", skill: 4, morale: 61, loyalty: 55 },
        { id: "crew.elsa_tarn", name: "Elsa Tarn", role: "carpenter", skill: 4, morale: 64, loyalty: 58 },
        { id: "crew.nils_orr", name: "Nils Orr", role: "navigator", skill: 3, morale: 59, loyalty: 52 }
    ];
    for (const ship of Object.values(parsed.ships ?? {}))
        ship.refits ??= [];
    parsed.settings.audioEnabled ??= true;
    parsed.settings.masterVolume ??= 0.32;
    return parsed;
}
function migrateV2ToV3(parsed) {
    parsed.schemaVersion = 3;
    // Docked ships now occupy navigable harbor approach cells rather than painted land markers.
    for (const ship of Object.values(parsed.ships ?? {})) {
        if (ship.dockedAtPortId) {
            const port = PORT_BY_ID[ship.dockedAtPortId];
            if (port)
                ship.position = { ...port.approachPoint };
        }
    }
    if (parsed.voyage && !parsed.voyage.destination) {
        const old = parsed.voyage;
        const fromPort = PORT_BY_ID[old.fromPortId];
        const target = navigationTargetForPort(old.toPortId);
        if (fromPort && target) {
            const path = findSeaPath(fromPort.approachPoint, target.point);
            parsed.voyage = {
                originPoint: { ...fromPort.approachPoint },
                destination: target,
                path,
                routeId: old.routeId ?? `migrated.${old.fromPortId}.${old.toPortId}`,
                totalHours: old.totalHours,
                elapsedHours: old.elapsedHours,
                startHour: old.startHour,
                progress: old.progress,
                fromPortId: old.fromPortId,
                toPortId: old.toPortId
            };
            const playerShip = parsed.ships?.[parsed.player?.shipId];
            if (playerShip && path.length) {
                const idx = Math.min(path.length - 1, Math.round((path.length - 1) * old.progress));
                playerShip.position = { ...path[idx] };
            }
        }
        else {
            delete parsed.voyage;
        }
    }
    parsed.arrival ??= undefined;
    return parsed;
}
function nearestNavigable(point) {
    const base = { x: Math.round(point.x), y: Math.round(point.y) };
    if (getWorldCell(base).navigable)
        return base;
    for (let radius = 1; radius <= 8; radius += 1) {
        for (let dy = -radius; dy <= radius; dy += 1) {
            for (let dx = -radius; dx <= radius; dx += 1) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius)
                    continue;
                const candidate = { x: base.x + dx, y: base.y + dy };
                if (getWorldCell(candidate).navigable)
                    return candidate;
            }
        }
    }
    return { ...PORT_BY_ID["port.veyrholm"].approachPoint };
}
function remapV03Point(point) {
    // Alpha 0.3 used a temporary hand-drawn 33x25 Skeldra surface. Alpha 0.4 aligns the same
    // region to the 3:2 illustrated atlas. Preserve approximate sea position, then snap to valid water.
    const x = 14 + ((point.x - 8) / 33) * 42;
    const y = 2 + ((point.y - 2) / 25) * 29;
    return nearestNavigable({ x, y });
}
function migrateV3ToV4(parsed) {
    parsed.schemaVersion = 4;
    parsed.player.knownPoiIds ??= ["poi.greywater_wrecks", "poi.old_veyr_beacon"];
    delete parsed.player.currentPoiId;
    for (const ship of Object.values(parsed.ships ?? {})) {
        if (ship.dockedAtPortId) {
            const port = PORT_BY_ID[ship.dockedAtPortId];
            if (port)
                ship.position = { ...port.approachPoint };
        }
        else if (ship.route) {
            try {
                ship.position = routePoint(ship.route.fromPortId, ship.route.toPortId, ship.route.progress ?? 0);
            }
            catch {
                ship.position = remapV03Point(ship.position ?? { x: 24, y: 18 });
            }
        }
        else if (ship.position) {
            ship.position = remapV03Point(ship.position);
        }
    }
    if (parsed.voyage) {
        const ship = parsed.ships?.[parsed.player?.shipId];
        const start = nearestNavigable(ship?.position ?? PORT_BY_ID["port.veyrholm"].approachPoint);
        let target;
        if (parsed.voyage.destination?.type === "port")
            target = navigationTargetForPort(parsed.voyage.destination.id);
        else if (parsed.voyage.destination?.type === "sea")
            target = navigationTargetForSea(remapV03Point(parsed.voyage.destination.point));
        if (!target) {
            delete parsed.voyage;
        }
        else {
            const path = findSeaPath(start, target.point);
            if (path.length < 2)
                delete parsed.voyage;
            else {
                parsed.voyage.originPoint = { ...start };
                parsed.voyage.destination = target;
                parsed.voyage.path = path;
                const progress = Math.max(0, Math.min(1, parsed.voyage.progress ?? 0));
                const idx = Math.min(path.length - 1, Math.round((path.length - 1) * progress));
                if (ship)
                    ship.position = { ...path[idx] };
            }
        }
    }
    delete parsed.arrival;
    return parsed;
}
function migrateV4ToV5(parsed) {
    parsed.schemaVersion = 5;
    const old = parsed.player?.character ?? {};
    const oldAttrs = old.attributes ?? {};
    const attributes = {
        might: Number(oldAttrs.might ?? oldAttrs.strength ?? 5), agility: Number(oldAttrs.agility ?? oldAttrs.dexterity ?? 5), perception: Number(oldAttrs.perception ?? 5),
        intellect: Number(oldAttrs.intellect ?? oldAttrs.intelligence ?? 5), will: Number(oldAttrs.will ?? oldAttrs.willpower ?? 5), presence: Number(oldAttrs.presence ?? oldAttrs.charisma ?? 5)
    };
    const skillMap = { sailing: "seamanship", seamanship: "seamanship", navigation: "navigation", gunnery: "gunnery", ship_command: "command", leadership: "command", command: "command", ship_repair: "engineering", engineering: "engineering", repair: "craft", blades: "blades", pistols: "firearms", firearms: "firearms", defense: "athletics", athletics: "athletics", persuasion: "persuasion", trading: "commerce", appraisal: "commerce", commerce: "commerce", streetwise: "streetwise", smuggling: "deception", deception: "deception", religion: "scholarship", investigation: "scholarship", scholarship: "scholarship", survival: "survival", medicine: "medicine", arcana: "arcana", craft: "craft", heavy_weapons: "heavy_weapons" };
    const mappedCore = [];
    for (const key of (old.coreSkills ?? Object.keys(old.skills ?? {}))) {
        const mapped = skillMap[String(key)];
        if (mapped && !mappedCore.includes(mapped))
            mappedCore.push(mapped);
    }
    for (const fallback of ["seamanship", "navigation", "commerce", "blades", "survival"])
        if (mappedCore.length < 5 && !mappedCore.includes(fallback))
            mappedCore.push(fallback);
    const sex = old.sex ?? (old.appearance?.presentation === "feminine" ? "female" : "male");
    const legacyHomePortId = old.homePortId ?? parsed.player?.currentPortId ?? "port.veyrholm";
    const choices = {
        name: old.name ?? "Captain", age: Number(old.age ?? 27), sex, ancestry: old.ancestry ?? "skeldran", homelandRegion: old.homelandRegion ?? "skeldra", homeSettlementId: old.homeSettlementId ?? legacyHomePortId, startingLocationId: old.startingLocationId ?? legacyHomePortId, culture: old.culture ?? "skeldran",
        socialOrigin: old.socialOrigin ?? "dockside_poor", background: old.background ?? "shipwreck_survivor", religion: old.religion ?? "old_gods", devotion: old.devotion ?? "cultural", attributes, coreSkills: mappedCore.slice(0, 5), trait: old.trait ?? "sea_legs", birthOmen: old.birthOmen ?? "great_storm", recentProfession: old.recentProfession ?? "sailor", shipOrigin: old.shipOrigin ?? "inherited", startingAttunement: Number(old.startingAttunement ?? old.aptitude ?? 0), portraitId: old.portraitId ?? (sex === "male" ? "portrait.skeldra.male.weathered_sailor.01" : "portrait.pending.skeldra")
    };
    const capability = buildCapabilityState(choices);
    // Preserve meaningful prior competence by mapping old skill values into the new canonical 0-100 scale.
    for (const [oldId, value] of Object.entries(old.skills ?? {})) {
        const mapped = skillMap[oldId];
        if (!mapped)
            continue;
        const n = Number(value);
        capability.skills[mapped] = Math.max(capability.skills[mapped], n <= 10 ? Math.round(n * 10) : Math.round(n));
    }
    parsed.player.character = { id: old.id ?? "character.player", ...choices, ...capability, visualDna: visualDnaFromChoices(choices), crowns: Number(old.crowns ?? 0), reputation: old.reputation ?? {}, historyTags: old.historyTags ?? [] };
    parsed.player.knownPoiIds ??= ["poi.greywater_wrecks", "poi.old_veyr_beacon"];
    parsed.simulationEvents ??= [];
    parsed.settings ??= {};
    parsed.settings.navigationZoom ??= "far";
    parsed.settings.audioEnabled ??= true;
    parsed.settings.masterVolume ??= .32;
    parsed.settings.firstUseTips ??= "minimal";
    parsed.settings.journalMode ??= "advanced";
    for (const ship of Object.values(parsed.ships ?? {})) {
        ship.systemTags ??= ["wooden_hull", "sailing_rig", "naval_battery", "damage_control_kit"];
        ship.attunementLoad ??= { arcane: 0, industrial: ship.classId?.includes("industrial") ? 18 : 3, sensitivity: ship.classId?.includes("industrial") ? .8 : .25, mitigationTags: [] };
    }
    const migratedNpcs = {};
    for (const npc of Object.values(parsed.npcs ?? {})) {
        const seed = { id: npc.id, name: npc.name, age: Number(npc.age ?? 35), sex: npc.sex ?? "male", ancestry: npc.ancestry ?? "skeldran", homelandRegion: npc.homelandRegion ?? "skeldra", culture: npc.culture ?? "skeldran", religion: npc.religion ?? "unaffiliated", profession: npc.profession ?? npc.role, role: npc.role ?? npc.profession ?? "resident", socialTier: npc.socialTier ?? 2, ...(npc.locationPortId ? { locationPortId: npc.locationPortId } : {}), ...(npc.shipId ? { shipId: npc.shipId } : {}), personality: npc.personality ?? {}, values: npc.values ?? {}, goals: (npc.goals ?? []).map((g) => typeof g === "string" ? g : g.description).filter(Boolean), beliefs: npc.beliefs ?? [], knownFacts: npc.knownFacts ?? [], speakingStyle: npc.speakingStyle ?? "Plainspoken.", relationshipToPlayer: npc.relationshipToPlayer ?? { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 0 } };
        const next = createNpcFromSeed(seed);
        if (npc.relationshipToPlayer)
            next.relationshipToPlayer = { ...next.relationshipToPlayer, ...npc.relationshipToPlayer };
        migratedNpcs[next.id] = next;
    }
    parsed.npcs = migratedNpcs;
    const state = parsed;
    for (const npc of Object.values(state.npcs))
        ensureNpcPlan(state, npc);
    return state;
}
function migrateV5ToV6(parsed) {
    parsed.schemaVersion = 6;
    parsed.player ??= {};
    parsed.player.character ??= {};
    parsed.player.character.advancement ??= startingAdvancement(startingLevelFromAge(Number(parsed.player.character.age ?? 27)));
    for (const npc of Object.values(parsed.npcs ?? {}))
        npc.advancement ??= startingAdvancement(Math.min(10, startingLevelFromAge(Number(npc.age ?? 35)) + (Number(npc.socialTier ?? 2) >= 3 ? 1 : 0)));
    return parsed;
}
function migrateV6ToV7(parsed) {
    parsed.player ??= {};
    parsed.player.character ??= {};
    const character = parsed.player.character;
    const legacyHomePortId = character.homePortId ?? parsed.player.currentPortId ?? parsed.ships?.[parsed.player.shipId]?.dockedAtPortId ?? "port.veyrholm";
    character.homeSettlementId ??= legacyHomePortId;
    character.startingLocationId ??= legacyHomePortId;
    delete character.homePortId;
    if (character.customPortrait) {
        character.customPortrait.homeSettlementId ??= character.customPortrait.homePortId ?? character.homeSettlementId;
        character.customPortrait.startingLocationId ??= character.startingLocationId;
        delete character.customPortrait.homePortId;
    }
    parsed.schemaVersion = 7;
    return parsed;
}
function migrateV7ToV8(parsed) {
    const absoluteHour = Number(parsed.absoluteHour ?? 0);
    parsed.absoluteHour = Number.isFinite(absoluteHour) ? Math.max(0, Math.floor(absoluteHour)) : 0;
    // v7 stored a legacy {year, day-of-year, hour} clock. absoluteHour is the canonical migration source.
    parsed.clock = clockFromAbsoluteHour(parsed.absoluteHour);
    parsed.schemaVersion = 8;
    return parsed;
}
function bestSavedSeamanship(parsed) {
    let best = Number(parsed.player?.character?.skills?.seamanship ?? 50);
    for (const assignment of parsed.player?.crew ?? []) {
        if (!assignment?.npcId || !["first_mate", "navigator"].includes(String(assignment.role)))
            continue;
        const rating = Number(parsed.npcs?.[assignment.npcId]?.skills?.seamanship ?? 0);
        if (Number.isFinite(rating))
            best = Math.max(best, rating);
    }
    return Math.max(0, Math.min(100, best));
}
function migrateV8ToV9(parsed) {
    // 0.6C Physical Distance Hotfix 1: geometry stays fixed while miles/knots and exact combat range become persistent truth.
    for (const ship of Object.values(parsed.ships ?? {})) {
        if (typeof ship?.classId === "string")
            ship.classId = resolveShipClassId(ship.classId);
        const classSpeed = shipClassDefinition(String(ship.classId ?? ""))?.cruiseSpeedKnots;
        ship.cruiseSpeedKnots = Number(ship.cruiseSpeedKnots ?? classSpeed ?? legacyCruiseSpeedKnots(Number(ship.speed ?? 4)));
    }
    // Preserve existing market stock exactly, but seed newly registered 0.6C goods into old campaigns.
    const registryMarkets = buildInitialPortMarkets();
    parsed.markets ??= {};
    for (const [portId, seedMarket] of Object.entries(registryMarkets)) {
        parsed.markets[portId] ??= structuredClone(seedMarket);
        parsed.markets[portId].goods ??= {};
        for (const [commodityId, row] of Object.entries(seedMarket.goods))
            parsed.markets[portId].goods[commodityId] ??= structuredClone(row);
    }
    const seamanship = bestSavedSeamanship(parsed);
    const playerShip = parsed.ships?.[parsed.player?.shipId];
    if (parsed.voyage?.path?.length && playerShip) {
        const voyage = parsed.voyage;
        const progress = Math.max(0, Math.min(1, Number(voyage.progress ?? 0)));
        voyage.routeDistanceNm = routeDistanceNm(voyage.path);
        voyage.distanceTravelledNm = voyage.routeDistanceNm * progress;
        voyage.plannedAverageSpeedKnots = plannedAverageSpeedKnots(voyage.path, playerShip, seamanship);
        const remaining = estimateRemainingRouteHours(voyage.path, voyage.distanceTravelledNm, playerShip, seamanship);
        voyage.totalHours = Math.max(Number(voyage.elapsedHours ?? 0), Number(voyage.elapsedHours ?? 0) + Math.ceil(remaining));
    }
    for (const npc of Object.values(parsed.npcs ?? {})) {
        const plan = npc?.brain?.currentPlan;
        const ship = npc?.shipId ? parsed.ships?.[npc.shipId] : undefined;
        if (!plan || plan.type !== "travel" || !plan.path?.length || !ship)
            continue;
        const progress = Math.max(0, Math.min(1, Number(plan.progress ?? 0)));
        plan.routeDistanceNm = routeDistanceNm(plan.path);
        plan.distanceTravelledNm = plan.routeDistanceNm * progress;
        plan.plannedAverageSpeedKnots = plannedAverageSpeedKnots(plan.path, ship, Number(npc.skills?.seamanship ?? 50));
        const remaining = estimateRemainingRouteHours(plan.path, plan.distanceTravelledNm, ship, Number(npc.skills?.seamanship ?? 50));
        plan.expectedCompletionHour = Number(parsed.absoluteHour ?? 0) + Math.ceil(remaining);
        plan.nextDecisionAtHour = plan.expectedCompletionHour;
        npc.brain.nextDecisionAtHour = plan.nextDecisionAtHour;
    }
    if (parsed.encounter) {
        parsed.encounter.rangeYards = Number(parsed.encounter.rangeYards ?? legacyRangeSeedYards(parsed.encounter.range ?? "distant"));
        parsed.encounter.elapsedMinutes = Number(parsed.encounter.elapsedMinutes ?? 0);
        parsed.encounter.shipsSecured = Boolean(parsed.encounter.shipsSecured ?? (parsed.encounter.range === "boarding"));
    }
    parsed.schemaVersion = 9;
    return parsed;
}
function migrateV9ToV10(parsed) {
    parsed.player ??= {};
    parsed.player.inventory ??= [];
    parsed.player.equipment = normalizeEquipment(parsed.player.equipment, PLAYER_EQUIPMENT_SLOTS);
    for (const npc of Object.values(parsed.npcs ?? {})) {
        if (npc?.inventory || npc?.equipment)
            npc.equipment = normalizeEquipment(npc.equipment, COMPANION_EQUIPMENT_SLOTS);
    }
    parsed.schemaVersion = 10;
    return parsed;
}
function migrateV10ToV11(parsed) {
    const playerShip = parsed.ships?.[parsed.player?.shipId];
    if (playerShip) {
        playerShip.crewWelfare ??= { averageHealth: 100, zeroSupplyHours: 0, shortageEpisodes: 0, shortageActive: false, currentEpisodeMoraleLoss: 0, currentEpisodeHealthLoss: 0 };
        playerShip.crewCommunity ??= {
            experience: 42, discipline: 55, loyalty: Math.max(0, Math.min(100, Math.round(48 + Number(playerShip.systems?.morale ?? 62) * .16))),
            seamanship: 48, gunnery: 42, boarding: 44, paySatisfaction: 60, foodSatisfaction: 72, fatigue: 12,
            outstandingPrizeShare: 0, victories: 0, casualtiesRemembered: 0, dangerousOrdersRemembered: 0, recruitsHired: 0, desertions: 0, historyTags: []
        };
    }
    // Generic hands remain aggregate population. Older generated deckhands without persistent NPC identity
    // are removed from the named/officer roster without changing total ship crew count.
    parsed.player ??= {};
    const legacyOfficerIds = {
        "crew.mira_holst": "character.mira_holst",
        "crew.ulf_brenn": "character.ulf_brenn",
        "crew.elsa_tarn": "character.elsa_tarn",
        "crew.nils_orr": "character.nils_orr"
    };
    for (const member of parsed.player.crew ?? []) {
        member.npcId ??= legacyOfficerIds[String(member.id ?? "")];
    }
    parsed.player.crew = (parsed.player.crew ?? []).filter((member) => Boolean(member?.npcId));
    for (const member of parsed.player.crew) {
        member.health ??= 100;
    }
    parsed.schemaVersion = 11;
    return parsed;
}
function migrateV11ToV12(parsed) {
    parsed.player ??= {};
    parsed.player.character ??= {};
    parsed.player.character.reputation ??= {};
    parsed.player.portStanding ??= Object.fromEntries((parsed.player.knownPortIds ?? []).map((id) => [id, 0]));
    for (const portId of parsed.player.knownPortIds ?? [])
        parsed.player.portStanding[portId] ??= 0;
    parsed.player.legal ??= {};
    parsed.player.crimes ??= [];
    parsed.player.warrants ??= [];
    parsed.player.legalReports ??= [];
    parsed.player.tradeCredentials ??= [];
    if (parsed.encounter) {
        parsed.encounter.playerIdentityKnown ??= false;
        parsed.encounter.authorityDemanded ??= false;
    }
    parsed.schemaVersion = 12;
    return parsed;
}
export function migrateSaveData(parsed) {
    if (parsed.schemaVersion === 1)
        parsed = migrateV1ToV2(parsed);
    if (parsed.schemaVersion === 2)
        parsed = migrateV2ToV3(parsed);
    if (parsed.schemaVersion === 3)
        parsed = migrateV3ToV4(parsed);
    if (parsed.schemaVersion === 4)
        parsed = migrateV4ToV5(parsed);
    if (parsed.schemaVersion === 5)
        parsed = migrateV5ToV6(parsed);
    if (parsed.schemaVersion === 6)
        parsed = migrateV6ToV7(parsed);
    if (parsed.schemaVersion === 7)
        parsed = migrateV7ToV8(parsed);
    if (parsed.schemaVersion === 8)
        parsed = migrateV8ToV9(parsed);
    if (parsed.schemaVersion === 9)
        parsed = migrateV9ToV10(parsed);
    if (parsed.schemaVersion === 10)
        parsed = migrateV10ToV11(parsed);
    if (parsed.schemaVersion === 11)
        parsed = migrateV11ToV12(parsed);
    if (parsed.schemaVersion === 12) {
        parsed.simulationEvents ??= [];
        const state = parsed;
        normalizeKnowledgeOwnership(state);
        normalizePreparedAbilityEffects(state);
        normalizeLawInformationState(state);
        normalizeWorldCauseState(state);
        normalizeTradeLawState(state);
        normalizeArcaneStrain(state.player.character);
        normalizeProgressionCadence(state.player.character, state.absoluteHour);
        for (const npc of Object.values(state.npcs ?? {})) {
            normalizeArcaneStrain(npc);
            normalizeProgressionCadence(npc, state.absoluteHour);
        }
        compactSimulationEvents(state);
        for (const npc of Object.values(parsed.npcs ?? {}))
            ensureNpcPlan(state, npc);
        compactSimulationEvents(state);
        return state;
    }
    throw new Error("Unsupported save schema version.");
}
export function loadLocal() {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw)
        return undefined;
    return migrateSaveData(JSON.parse(raw));
}
export function clearLocalSave() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
}
export function hasLocalSave() {
    return Boolean(localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY));
}
//# sourceMappingURL=localSave.js.map