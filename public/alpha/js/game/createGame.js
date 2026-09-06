import { PORT_MARKET_PROFILES } from "../data/seed/commodities.js";
import { NPC_SEEDS } from "../data/seed/characters.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { buildStartingSkills, validateAttributes } from "./skills.js";
import { initializeStartingKnowledge } from "./knowledge.js";
import { clockFromAbsoluteHour } from "./clock.js";
import { refreshMarketPrices } from "./economy.js";
import { generateContracts } from "./contracts.js";
const DEFAULT_CORE_SKILLS = ["sailing", "navigation", "trading", "blades", "ship_repair"];
export const DEFAULT_CHARACTER_CHOICES = {
    name: "",
    age: 27,
    homePortId: "port.veyrholm",
    socialOrigin: "dockside_poor",
    background: "shipwreck_survivor",
    religion: "old_gods",
    devotion: "cultural",
    attributes: { strength: 5, dexterity: 6, intelligence: 5, willpower: 5, charisma: 5, perception: 6 },
    coreSkills: DEFAULT_CORE_SKILLS,
    trait: "sea_legs",
    birthOmen: "great_storm",
    recentProfession: "sailor",
    shipOrigin: "inherited",
    aptitude: 0
};
function buildMarkets() {
    const markets = {};
    for (const [portId, profile] of Object.entries(PORT_MARKET_PROFILES)) {
        markets[portId] = {
            portId,
            lastUpdatedHour: 0,
            goods: Object.fromEntries(Object.entries(profile).map(([commodityId, row]) => [commodityId, {
                    commodityId,
                    stock: row.stock,
                    targetStock: row.target,
                    localMultiplier: row.multiplier,
                    lastPrice: 0
                }]))
        };
    }
    return markets;
}
function playerShip(choices) {
    const home = PORT_BY_ID[choices.homePortId];
    const originBonus = choices.shipOrigin === "naval_surplus" ? 8 : choices.shipOrigin === "prize_share" ? 5 : 0;
    const debtCargo = choices.shipOrigin === "purchased_on_debt" ? [{ commodityId: "good.grain", quantity: 4 }] : [];
    return {
        id: "ship.player.flagship",
        name: "Tideworn",
        classId: "ship_class.skeldran_coastal_sloop",
        region: "skeldra",
        ownerCharacterId: "character.player",
        artAssetId: "ship.skeldra.coastal_sloop.reference",
        tokenAssetId: "ship.skeldra.coastal_sloop.token",
        position: { ...home.point },
        dockedAtPortId: home.id,
        speed: 4,
        maneuverability: 3,
        firepower: 3,
        seaworthiness: 5,
        cargoCapacity: 24,
        cargo: debtCargo,
        supplies: 18,
        systems: {
            hull: 54 + originBonus,
            hullMax: 60 + originBonus,
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
        fameTags: choices.shipOrigin === "naval_surplus" ? ["Former Naval Surplus"] : []
    };
}
function npcShips() {
    return {
        "ship.stormcrow": {
            id: "ship.stormcrow",
            name: "Stormcrow",
            classId: "ship_class.skeldran_modern_battle_frigate",
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
            fameTags: ["Royal Navy", "Recognizable Captain"]
        },
        "ship.providence": {
            id: "ship.providence",
            name: "Providence",
            classId: "ship_class.skeldran_armed_merchant",
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
            fameTags: ["Merchant/Privateer"]
        },
        "ship.ash_gull": {
            id: "ship.ash_gull",
            name: "Ash Gull",
            classId: "ship_class.refitted_coastal_raider",
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
            fameTags: ["Unregistered Raider"]
        }
    };
}
export function createGame(choices, seed) {
    const name = choices.name.trim();
    if (!name)
        throw new Error("Captain name is required.");
    if (choices.age < 18 || choices.age > 45)
        throw new Error("Starting age must be 18-45.");
    if (!validateAttributes(choices.attributes))
        throw new Error("Attributes must remain 1-10 and total no more than 36 in Alpha 0.1.");
    if (choices.coreSkills.length !== 5)
        throw new Error("Choose exactly five core skills.");
    if (!PORT_BY_ID[choices.homePortId])
        throw new Error("Unknown home port.");
    const worldSeed = seed?.trim() || `ebb-${Date.now().toString(36)}`;
    const skills = buildStartingSkills(choices);
    const initialCrowns = choices.socialOrigin === "merchant_family" ? 320 : choices.socialOrigin === "naval_family" ? 270 : 230;
    const player = {
        id: "character.player",
        ...structuredClone(choices),
        name,
        culture: "skeldran",
        skills,
        crowns: initialCrowns - (choices.shipOrigin === "purchased_on_debt" ? 40 : 0),
        reputation: { "faction.skeldra": choices.socialOrigin === "naval_family" ? 8 : 0 }
    };
    const npcs = Object.fromEntries(NPC_SEEDS.map((npc) => [npc.id, structuredClone(npc)]));
    npcs["character.seed_raider_captain"] = {
        id: "character.seed_raider_captain",
        name: "Sela Marr",
        age: 35,
        culture: "Outer Isles mixed",
        religion: "unaffiliated",
        role: "Captain of Ash Gull",
        shipId: "ship.ash_gull",
        personality: { courage: 64, aggression: 67, greed: 72, patience: 37, pragmatism: 71 },
        goals: ["Take valuable cargo without losing Ash Gull."],
        beliefs: ["A live prize is worth more than a heroic wreck."],
        knownFacts: [],
        speakingStyle: "Brief, wary, practical.",
        relationshipToPlayer: { trust: 0, respect: 0, fear: 0, affection: 0, suspicion: 20 }
    };
    const state = {
        schemaVersion: 1,
        saveId: `save.${worldSeed}`,
        worldSeed,
        clock: clockFromAbsoluteHour(0),
        absoluteHour: 0,
        player: {
            character: player,
            shipId: "ship.player.flagship",
            firstMateId: "character.mira_holst",
            currentPortId: choices.homePortId,
            knownPortIds: ["port.veyrholm", "port.ironhaven", "port.stormvik", "port.thorenfjord"],
            knowledge: initializeStartingKnowledge(choices),
            observedPrices: {},
            acceptedContractIds: []
        },
        ships: { "ship.player.flagship": playerShip(choices), ...npcShips() },
        npcs,
        markets: buildMarkets(),
        worldEvents: [{
                id: "event.campaign.begin",
                type: "campaign_begin",
                atHour: 0,
                locationId: choices.homePortId,
                participants: ["character.player", "ship.player.flagship", "character.mira_holst"],
                summary: `${name} begins the campaign at ${PORT_BY_ID[choices.homePortId].name}.`,
                canonicalData: { worldSeed, shipOrigin: choices.shipOrigin, background: choices.background },
                importance: 3
            }],
        contracts: [],
        settings: { firstUseTips: "minimal", journalMode: "advanced" },
        createdAtIso: new Date().toISOString(),
        updatedAtIso: new Date().toISOString()
    };
    refreshMarketPrices(state);
    const market = state.markets[choices.homePortId];
    if (market) {
        for (const [commodityId, row] of Object.entries(market.goods)) {
            state.player.observedPrices[`${choices.homePortId}:${commodityId}`] = { price: row.lastPrice, observedAtHour: 0 };
        }
    }
    generateContracts(state);
    return state;
}
//# sourceMappingURL=createGame.js.map