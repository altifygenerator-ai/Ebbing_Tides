import { NPC_SEEDS } from "../data/seed/characters.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { validateAttributes } from "./skills.js";
import { buildCapabilityState, visualDnaFromChoices } from "./characterSystem.js";
import { createNpcFromSeed, ensureNpcPlan } from "./npcBrain.js";
import { initializeStartingKnowledge } from "./knowledge.js";
import { clockFromAbsoluteHour } from "./clock.js";
import { refreshMarketPrices } from "./economy.js";
import { generateContracts } from "./contracts.js";
import { startingInventory } from "../data/seed/items.js";
import { COMPANION_EQUIPMENT_SLOTS, PLAYER_EQUIPMENT_SLOTS, defaultEquipmentState } from "./inventory.js";
import { routePoint } from "../data/seed/routes.js";
import { ORIGIN_SETTLEMENT_BY_ID, originSettlementName } from "../data/seed/origins.js";
import { buildInitialPortMarkets } from "./marketGeneration.js";
import { normalizeKnowledgeOwnership } from "./information.js";
const DEFAULT_CORE_SKILLS = ["seamanship", "navigation", "commerce", "blades", "survival"];
export function startingShipOriginImpact(choices) {
    if (choices.shipOrigin === "naval_surplus")
        return { hullBonus: 8, crownAdjustment: 0, cargo: [], fameTags: ["Former Naval Surplus"] };
    if (choices.shipOrigin === "prize_share")
        return { hullBonus: 5, crownAdjustment: 0, cargo: [], fameTags: [] };
    if (choices.shipOrigin === "purchased_on_debt")
        return { hullBonus: 0, crownAdjustment: -40, cargo: [{ commodityId: "good.grain", quantity: 4 }], fameTags: [] };
    return { hullBonus: 0, crownAdjustment: 0, cargo: [], fameTags: [] };
}
export function startingCrownsForChoices(choices) {
    const originCrowns = choices.socialOrigin === "merchant_family" ? 320 : choices.socialOrigin === "naval_family" ? 270 : 230;
    return originCrowns + startingShipOriginImpact(choices).crownAdjustment;
}
export const DEFAULT_CHARACTER_CHOICES = {
    name: "",
    age: 27,
    sex: "male",
    ancestry: "skeldran",
    homelandRegion: "skeldra",
    homeSettlementId: "port.veyrholm",
    startingLocationId: "port.veyrholm",
    culture: "skeldran",
    socialOrigin: "dockside_poor",
    background: "shipwreck_survivor",
    religion: "old_gods",
    devotion: "cultural",
    attributes: { might: 5, agility: 6, perception: 7, intellect: 6, will: 6, presence: 6 },
    coreSkills: DEFAULT_CORE_SKILLS,
    trait: "sea_legs",
    birthOmen: "great_storm",
    recentProfession: "sailor",
    shipOrigin: "inherited",
    startingAttunement: 0,
    portraitId: "portrait.skeldra.male.weathered_sailor.01"
};
function playerShip(choices) {
    const start = PORT_BY_ID[choices.startingLocationId];
    const originImpact = startingShipOriginImpact(choices);
    return {
        id: "ship.player.flagship",
        name: "Tideworn",
        classId: "ship_class.skeldra.fjord_cutter",
        region: start.region,
        ownerCharacterId: "character.player",
        artAssetId: "ship.named.tideworn.token",
        tokenAssetId: "ship.named.tideworn.token",
        position: { ...start.approachPoint },
        dockedAtPortId: start.id,
        speed: 4,
        maneuverability: 3,
        firepower: 3,
        seaworthiness: 5,
        cargoCapacity: 24,
        cargo: structuredClone(originImpact.cargo),
        supplies: 18,
        crewWelfare: { averageHealth: 100, zeroSupplyHours: 0, shortageEpisodes: 0, shortageActive: false, currentEpisodeMoraleLoss: 0, currentEpisodeHealthLoss: 0 },
        crewCommunity: { experience: 42, discipline: 55, loyalty: 58, seamanship: 48, gunnery: 42, boarding: 44, paySatisfaction: 60, foodSatisfaction: 72, fatigue: 12, outstandingPrizeShare: 0, victories: 0, casualtiesRemembered: 0, dangerousOrdersRemembered: 0, recruitsHired: 0, desertions: 0, historyTags: [] },
        systems: {
            hull: 54 + originImpact.hullBonus,
            hullMax: 60 + originImpact.hullBonus,
            sails: 40,
            sailsMax: 40,
            rigging: 35,
            riggingMax: 35,
            crew: 8,
            crewMax: 10,
            morale: 62,
            fire: 0,
            flooding: 0
        },
        disposition: "player",
        fameTags: [...originImpact.fameTags],
        refits: [],
        systemTags: ["wooden_hull", "sailing_rig", "naval_battery", "damage_control_kit"],
        attunementLoad: { arcane: 0, industrial: 3, sensitivity: 0.25, mitigationTags: ["ordinary_mechanics"] }
    };
}
function npcShips() {
    const ships = {
        "ship.stormcrow": {
            id: "ship.stormcrow",
            name: "Stormcrow",
            classId: "ship_class.skeldra.skeldran_frigate",
            region: "skeldra",
            ownerCharacterId: "character.ingrid_skar",
            position: { x: 4.4, y: 4.4 },
            route: { fromPortId: "port.veyrholm", toPortId: "port.stormvik", progress: 0.18, direction: 1 },
            speed: 6,
            maneuverability: 4,
            firepower: 8,
            seaworthiness: 8,
            cargoCapacity: 42,
            cargo: [{ commodityId: "good.gunpowder", quantity: 5 }],
            supplies: 35,
            systems: { hull: 120, hullMax: 120, sails: 72, sailsMax: 72, rigging: 68, riggingMax: 68, crew: 64, crewMax: 64, morale: 86, fire: 0, flooding: 0 },
            disposition: "navy",
            fameTags: ["Royal Navy", "Recognizable Captain"],
            artAssetId: "ship.named.stormcrow.token",
            tokenAssetId: "ship.named.stormcrow.token",
            refits: ["refit.navy_standard_rig"]
        },
        "ship.providence": {
            id: "ship.providence",
            name: "Providence",
            classId: "ship_class.skeldra.north_sea_trader",
            region: "skeldra",
            ownerCharacterId: "character.henrik_vossar",
            position: { x: 7.8, y: 5 },
            route: { fromPortId: "port.veyrholm", toPortId: "port.ironhaven", progress: 0.7, direction: -1 },
            speed: 4,
            maneuverability: 2,
            firepower: 4,
            seaworthiness: 6,
            cargoCapacity: 50,
            cargo: [{ commodityId: "good.grain", quantity: 5 }, { commodityId: "good.medicine", quantity: 3 }],
            supplies: 30,
            systems: { hull: 76, hullMax: 76, sails: 52, sailsMax: 52, rigging: 46, riggingMax: 46, crew: 22, crewMax: 24, morale: 68, fire: 0, flooding: 0 },
            disposition: "privateer",
            fameTags: ["Merchant/Privateer"],
            artAssetId: "ship.named.providence.token",
            tokenAssetId: "ship.named.providence.token",
            refits: []
        },
        "ship.ash_gull": {
            id: "ship.ash_gull",
            name: "Ash Gull",
            classId: "ship_class.outer_isles.privateer_sloop",
            region: "outer_isles",
            ownerCharacterId: "character.seed_raider_captain",
            position: { x: 5.8, y: 3.1 },
            route: { fromPortId: "port.thorenfjord", toPortId: "port.veyrholm", progress: 0.45, direction: 1 },
            speed: 5,
            maneuverability: 4,
            firepower: 3,
            seaworthiness: 4,
            cargoCapacity: 22,
            cargo: [{ commodityId: "good.salted_fish", quantity: 3 }, { commodityId: "good.gunpowder", quantity: 1 }],
            supplies: 14,
            systems: { hull: 42, hullMax: 42, sails: 34, sailsMax: 34, rigging: 31, riggingMax: 31, crew: 10, crewMax: 12, morale: 57, fire: 0, flooding: 0 },
            disposition: "pirate",
            fameTags: ["Unregistered Raider"],
            artAssetId: "ship.named.ash_gull.token",
            tokenAssetId: "ship.named.ash_gull.token",
            refits: ["refit.lightened_rig"]
        },
        "ship.iron_finch": {
            id: "ship.iron_finch", name: "Iron Finch", classId: "ship_class.skeldra.north_sea_trader", region: "skeldra", ownerCharacterId: "character.odel_braegson",
            position: { x: 7.1, y: 5.4 }, route: { fromPortId: "port.ironhaven", toPortId: "port.veyrholm", progress: 0.31, direction: -1 },
            speed: 3, maneuverability: 2, firepower: 2, seaworthiness: 5, cargoCapacity: 38, cargo: [{ commodityId: "good.iron_ingots", quantity: 10 }], supplies: 21,
            systems: { hull: 65, hullMax: 65, sails: 44, sailsMax: 44, rigging: 41, riggingMax: 41, crew: 15, crewMax: 18, morale: 61, fire: 0, flooding: 0 },
            disposition: "merchant", fameTags: ["Ironhaven Coaster"], artAssetId: "ship.named.iron_finch.token", tokenAssetId: "ship.named.iron_finch.token", refits: []
        },
        "ship.freyras_grace": {
            id: "ship.freyras_grace", name: "Freyra's Grace", classId: "ship_class.common.coastal_fishing_boat", region: "skeldra", ownerCharacterId: "character.astrid_kell",
            position: { x: 4.1, y: 2.8 }, route: { fromPortId: "port.stormvik", toPortId: "port.veyrholm", progress: 0.36, direction: 1 },
            speed: 4, maneuverability: 4, firepower: 1, seaworthiness: 6, cargoCapacity: 18, cargo: [{ commodityId: "good.salted_fish", quantity: 8 }], supplies: 16,
            systems: { hull: 39, hullMax: 39, sails: 31, sailsMax: 31, rigging: 29, riggingMax: 29, crew: 7, crewMax: 9, morale: 70, fire: 0, flooding: 0 },
            disposition: "merchant", fameTags: ["Fishing Cutter"], artAssetId: "ship.named.freyras_grace.token", tokenAssetId: "ship.named.freyras_grace.token", refits: []
        },
        "ship.hearthward": {
            id: "ship.hearthward", name: "Hearthward", classId: "ship_class.skeldra.north_sea_trader", region: "skeldra", ownerCharacterId: "character.erik_toren",
            position: { x: 3.4, y: 5.8 }, route: { fromPortId: "port.thorenfjord", toPortId: "port.stormvik", progress: 0.58, direction: -1 },
            speed: 4, maneuverability: 3, firepower: 2, seaworthiness: 5, cargoCapacity: 28, cargo: [{ commodityId: "good.wool", quantity: 5 }, { commodityId: "good.medicine", quantity: 2 }], supplies: 19,
            systems: { hull: 51, hullMax: 51, sails: 37, sailsMax: 37, rigging: 34, riggingMax: 34, crew: 11, crewMax: 13, morale: 67, fire: 0, flooding: 0 },
            disposition: "merchant", fameTags: ["Pilgrim Packet"], artAssetId: "ship.named.hearthward.token", tokenAssetId: "ship.named.hearthward.token", refits: []
        }
    };
    for (const ship of Object.values(ships)) {
        ship.lifecycle ??= { status: "active" };
        ship.systemTags ??= ["wooden_hull", "sailing_rig", "naval_battery", "damage_control_kit"];
        ship.attunementLoad ??= { arcane: 0, industrial: ship.classId.includes("industrial") ? 18 : 3, sensitivity: ship.classId.includes("industrial") ? 0.8 : 0.25, mitigationTags: [] };
        if (ship.route)
            ship.position = routePoint(ship.route.fromPortId, ship.route.toPortId, ship.route.progress);
    }
    return ships;
}
export function createGame(choices, seed) {
    const name = choices.name.trim();
    if (!name)
        throw new Error("Captain name is required.");
    if (choices.age < 18 || choices.age > 45)
        throw new Error("Starting age must be 18-45.");
    if (!validateAttributes(choices.attributes))
        throw new Error("Attributes must remain 1-10 and total exactly 36.");
    if (choices.coreSkills.length !== 5)
        throw new Error("Choose exactly five core skills.");
    const homeSettlement = ORIGIN_SETTLEMENT_BY_ID[choices.homeSettlementId];
    if (!homeSettlement)
        throw new Error("Unknown home settlement.");
    if (homeSettlement.region !== choices.homelandRegion)
        throw new Error("Home settlement must belong to the selected homeland region.");
    const startingPort = PORT_BY_ID[choices.startingLocationId];
    if (!startingPort)
        throw new Error("Unknown starting location.");
    const worldSeed = seed?.trim() || `ebb-${Date.now().toString(36)}`;
    const capability = buildCapabilityState(choices);
    const initialCrowns = startingCrownsForChoices(choices);
    const player = {
        id: "character.player",
        ...structuredClone(choices),
        ...capability,
        name,
        visualDna: visualDnaFromChoices(choices),
        crowns: initialCrowns,
        reputation: { "faction.skeldra": choices.socialOrigin === "naval_family" ? 8 : 0 },
        historyTags: [choices.background, choices.recentProfession, choices.shipOrigin, `origin:${choices.homeSettlementId}`, `campaign_start:${choices.startingLocationId}`]
    };
    const extraSeeds = [
        { id: "character.seed_raider_captain", name: "Sela Marr", age: 35, sex: "female", ancestry: "mixed", homelandRegion: "outer_isles", culture: "outer_isles", religion: "unaffiliated", profession: "pirate_captain", role: "Captain of Ash Gull", shipId: "ship.ash_gull", socialTier: 3, personality: { courage: 64, aggression: 67, greed: 72, patience: 37, pragmatism: 71, riskTolerance: 74 }, values: { profit: 78, crew_survival: 82 }, goals: ["Take valuable cargo without losing Ash Gull."], beliefs: ["A live prize is worth more than a heroic wreck."], knownFacts: [], speakingStyle: "Brief, wary, practical.", relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 20 } },
        { id: "character.odel_braegson", name: "Odel Braegson", age: 44, sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods", profession: "merchant_captain", role: "Master of Iron Finch", shipId: "ship.iron_finch", socialTier: 2, personality: { courage: 45, aggression: 18, greed: 58, patience: 61, pragmatism: 79, riskTolerance: 38 }, goals: ["Keep the foundries supplied and the ship solvent."], beliefs: ["A schedule kept is worth more than a tavern boast."], knownFacts: [], speakingStyle: "Practical, workmanlike, impatient with waste.", relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 8 } },
        { id: "character.astrid_kell", name: "Astrid Kell", age: 38, sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods", profession: "fishing_captain", role: "Master of Freyra's Grace", shipId: "ship.freyras_grace", socialTier: 2, personality: { courage: 59, aggression: 21, greed: 35, patience: 66, pragmatism: 72, riskTolerance: 45 }, goals: ["Bring fish home alive through bad northern weather."], beliefs: ["The sea does not care how important you think you are."], knownFacts: [], speakingStyle: "Dry, concise, sailor's humor.", relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 5 } },
        { id: "character.erik_toren", name: "Erik Toren", age: 51, sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods", profession: "packet_captain", role: "Master of Hearthward", shipId: "ship.hearthward", socialTier: 2, personality: { courage: 48, aggression: 12, greed: 30, patience: 74, pragmatism: 65, riskTolerance: 30 }, goals: ["Carry pilgrims and letters safely between northern ports."], beliefs: ["A ship earns its name by bringing people home."], knownFacts: [], speakingStyle: "Measured, courteous, observant.", relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 4 } },
        { id: "character.ulf_brenn", name: "Ulf Brenn", age: 36, sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods", profession: "gunner", role: "Master Gunner aboard Tideworn", socialTier: 2, personality: { courage: 66, patience: 42, pragmatism: 62 }, goals: ["Keep Tideworn's battery ready."], beliefs: ["Powder kept dry wins arguments."], knownFacts: [], speakingStyle: "Short, technical, dry.", relationshipToPlayer: { trust: 25, respect: 38, fear: 0, affection: 5, suspicion: 8 } },
        { id: "character.elsa_tarn", name: "Elsa Tarn", age: 34, sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods", profession: "shipwright", role: "Carpenter aboard Tideworn", socialTier: 2, personality: { courage: 48, patience: 70, pragmatism: 82 }, goals: ["Keep the hull sound."], beliefs: ["Wood tells you before it breaks if you listen."], knownFacts: [], speakingStyle: "Practical and exact.", relationshipToPlayer: { trust: 30, respect: 35, fear: 0, affection: 4, suspicion: 5 } },
        { id: "character.nils_orr", name: "Nils Orr", age: 29, sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods", profession: "navigator", role: "Navigator aboard Tideworn", socialTier: 2, personality: { courage: 44, patience: 72, curiosity: 68, pragmatism: 61 }, goals: ["Become a navigator trusted in any weather."], beliefs: ["A chart is a witness, not an oracle."], knownFacts: ["fact.skeldra.local_routes"], speakingStyle: "Quiet, observant, careful with claims.", relationshipToPlayer: { trust: 28, respect: 32, fear: 0, affection: 3, suspicion: 6 } }
    ];
    const npcs = Object.fromEntries([...NPC_SEEDS, ...extraSeeds].map((npc) => [npc.id, createNpcFromSeed(npc)]));
    const state = {
        schemaVersion: 12,
        saveId: `save.${worldSeed}`,
        worldSeed,
        clock: clockFromAbsoluteHour(0),
        absoluteHour: 0,
        player: {
            character: player,
            shipId: "ship.player.flagship",
            firstMateId: "character.mira_holst",
            currentPortId: choices.startingLocationId,
            knownPortIds: ["port.veyrholm", "port.ironhaven", "port.stormvik", "port.thorenfjord"],
            knownPoiIds: ["poi.greywater_wrecks", "poi.old_veyr_beacon"],
            knowledge: initializeStartingKnowledge(choices),
            observedPrices: {},
            acceptedContractIds: [],
            inventory: startingInventory(choices.background, choices.recentProfession),
            equipment: defaultEquipmentState(PLAYER_EQUIPMENT_SLOTS),
            injuries: [],
            shipIntel: {},
            crew: [
                { id: "crew.mira_holst", name: "Mira Holst", role: "first_mate", skill: 58, morale: 72, loyalty: 81, health: 100, npcId: "character.mira_holst" },
                { id: "crew.ulf_brenn", name: "Ulf Brenn", role: "gunner", skill: 54, morale: 61, loyalty: 55, health: 100, npcId: "character.ulf_brenn" },
                { id: "crew.elsa_tarn", name: "Elsa Tarn", role: "carpenter", skill: 52, morale: 64, loyalty: 58, health: 100, npcId: "character.elsa_tarn" },
                { id: "crew.nils_orr", name: "Nils Orr", role: "navigator", skill: 48, morale: 59, loyalty: 52, health: 100, npcId: "character.nils_orr" }
            ],
            portStanding: Object.fromEntries(["port.veyrholm", "port.ironhaven", "port.stormvik", "port.thorenfjord"].map((id) => [id, 0])),
            legal: {},
            crimes: [],
            warrants: [],
            legalReports: [],
            tradeCredentials: []
        },
        ships: { "ship.player.flagship": playerShip(choices), ...npcShips() },
        npcs,
        markets: buildInitialPortMarkets(),
        worldCauses: [],
        worldEvents: [{
                id: "event.campaign.begin",
                type: "campaign_begin",
                atHour: 0,
                locationId: choices.startingLocationId,
                participants: ["character.player", "ship.player.flagship", "character.mira_holst"],
                summary: choices.homeSettlementId === choices.startingLocationId
                    ? `${name} begins the campaign at ${startingPort.name}, their home settlement.`
                    : `${name}, from ${originSettlementName(choices.homeSettlementId)}, begins the campaign at ${startingPort.name}.`,
                canonicalData: { worldSeed, shipOrigin: choices.shipOrigin, background: choices.background, homelandRegion: choices.homelandRegion, homeSettlementId: choices.homeSettlementId, startingLocationId: choices.startingLocationId },
                importance: 3
            }],
        simulationEvents: [],
        contracts: [],
        settings: { firstUseTips: "minimal", journalMode: "advanced", audioEnabled: true, masterVolume: 0.32, navigationZoom: "navigation" },
        createdAtIso: new Date().toISOString(),
        updatedAtIso: new Date().toISOString()
    };
    for (const npc of Object.values(state.npcs))
        ensureNpcPlan(state, npc);
    const mainHand = state.player.inventory.find((item) => item.definitionId === "item.weapon.skeldran_naval_saber");
    const offHand = state.player.inventory.find((item) => item.definitionId === "item.weapon.skeldran_naval_pistol");
    const armor = state.player.inventory.find((item) => item.definitionId === "item.armor.common_reinforced_jack");
    state.player.equipment = {
        ...defaultEquipmentState(PLAYER_EQUIPMENT_SLOTS),
        ...(mainHand ? { mainHand: mainHand.id } : {}),
        ...(offHand ? { offHand: offHand.id } : {}),
        ...(armor ? { chest: armor.id } : {})
    };
    const equipNpcLoadout = (npcId, inventory, equip) => {
        const npc = state.npcs[npcId];
        if (!npc)
            return;
        npc.inventory = inventory.map((item, index) => ({ ...item, id: `${npcId}.instance.${index}.${item.definitionId.replaceAll(".", "_")}` }));
        npc.equipment = { ...defaultEquipmentState(COMPANION_EQUIPMENT_SLOTS), ...equip };
    };
    const miraInventory = startingInventory("shipwreck_survivor", "first_mate");
    const miraBlade = miraInventory.find((item) => item.definitionId === "item.weapon.skeldran_naval_saber");
    const miraArmor = miraInventory.find((item) => item.definitionId === "item.armor.common_reinforced_jack");
    equipNpcLoadout("character.mira_holst", miraInventory, {
        ...(miraBlade ? { mainHand: `${"character.mira_holst"}.instance.${miraInventory.indexOf(miraBlade)}.${miraBlade.definitionId.replaceAll(".", "_")}` } : {}),
        ...(miraArmor ? { chest: `${"character.mira_holst"}.instance.${miraInventory.indexOf(miraArmor)}.${miraArmor.definitionId.replaceAll(".", "_")}` } : {})
    });
    refreshMarketPrices(state);
    const market = state.markets[choices.startingLocationId];
    if (market) {
        for (const [commodityId, row] of Object.entries(market.goods)) {
            state.player.observedPrices[`${choices.startingLocationId}:${commodityId}`] = { price: row.lastPrice, observedAtHour: 0 };
        }
    }
    generateContracts(state);
    normalizeKnowledgeOwnership(state);
    return state;
}
//# sourceMappingURL=createGame.js.map