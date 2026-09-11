/**
 * Current proving-ground production/consumption ratios for legacy commodities.
 * Values are DATA, not economy logic: 1.0 means local production roughly matches ordinary
 * local consumption, >1 creates exportable surplus, <1 creates recurring import demand.
 * Future settlements should prefer canonical settlement availability/industry data; these rows
 * preserve the authored Skeldran economic identities of the original Alpha market seeds.
 */
export const PORT_COMMODITY_PRODUCTION_FACTORS = {
    "port.veyrholm": {
        "good.grain": 0.92,
        "good.salted_fish": 1.10,
        "good.timber": 1.04,
        "good.coal": 0.92,
        "good.iron": 0.95,
        "good.gunpowder": 1.02,
        "good.machinery": 1.04,
        "good.medicine": 0.78
    },
    "port.ironhaven": {
        "good.grain": 0.30,
        "good.salted_fish": 0.42,
        "good.timber": 0.92,
        "good.coal": 1.34,
        "good.iron": 1.36,
        "good.gunpowder": 1.20,
        "good.machinery": 1.42,
        "good.medicine": 0.50
    },
    "port.stormvik": {
        "good.grain": 0.52,
        "good.salted_fish": 1.45,
        "good.timber": 1.34,
        "good.coal": 0.78,
        "good.iron": 0.62,
        "good.gunpowder": 0.58,
        "good.machinery": 0.38,
        "good.medicine": 0.72
    },
    "port.thorenfjord": {
        "good.grain": 0.78,
        "good.salted_fish": 1.26,
        "good.timber": 0.96,
        "good.coal": 0.46,
        "good.iron": 0.44,
        "good.gunpowder": 0.30,
        "good.machinery": 0.24,
        "good.medicine": 0.92
    }
};
//# sourceMappingURL=economyFlows.js.map