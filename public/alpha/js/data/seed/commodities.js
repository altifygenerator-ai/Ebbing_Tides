// Exact prices are alpha balance data, not lore canon.
export const COMMODITIES = [
    { id: "good.grain", name: "Grain", basePrice: 26, cargoUnits: 1, category: "food" },
    { id: "good.salted_fish", name: "Salted Fish", basePrice: 22, cargoUnits: 1, category: "food" },
    { id: "good.timber", name: "Timber", basePrice: 34, cargoUnits: 2, category: "raw" },
    { id: "good.coal", name: "Coal", basePrice: 30, cargoUnits: 2, category: "raw" },
    { id: "good.iron", name: "Iron", basePrice: 47, cargoUnits: 2, category: "raw" },
    { id: "good.gunpowder", name: "Gunpowder", basePrice: 78, cargoUnits: 1, category: "military" },
    { id: "good.machinery", name: "Machinery", basePrice: 112, cargoUnits: 3, category: "manufactured" },
    { id: "good.medicine", name: "Medicine", basePrice: 63, cargoUnits: 1, category: "medical" }
];
export const COMMODITY_BY_ID = Object.fromEntries(COMMODITIES.map((good) => [good.id, good]));
export const PORT_MARKET_PROFILES = {
    "port.veyrholm": {
        "good.grain": { stock: 58, target: 60, multiplier: 1.02 },
        "good.salted_fish": { stock: 74, target: 60, multiplier: 0.88 },
        "good.timber": { stock: 48, target: 55, multiplier: 1.02 },
        "good.coal": { stock: 43, target: 50, multiplier: 1.08 },
        "good.iron": { stock: 52, target: 50, multiplier: 1.04 },
        "good.gunpowder": { stock: 42, target: 40, multiplier: 1.0 },
        "good.machinery": { stock: 36, target: 35, multiplier: 1.02 },
        "good.medicine": { stock: 34, target: 40, multiplier: 1.12 }
    },
    "port.ironhaven": {
        "good.grain": { stock: 22, target: 65, multiplier: 1.42 },
        "good.salted_fish": { stock: 31, target: 55, multiplier: 1.23 },
        "good.timber": { stock: 46, target: 58, multiplier: 1.08 },
        "good.coal": { stock: 83, target: 60, multiplier: 0.78 },
        "good.iron": { stock: 78, target: 60, multiplier: 0.82 },
        "good.gunpowder": { stock: 61, target: 50, multiplier: 0.92 },
        "good.machinery": { stock: 82, target: 50, multiplier: 0.72 },
        "good.medicine": { stock: 28, target: 48, multiplier: 1.28 }
    },
    "port.stormvik": {
        "good.grain": { stock: 34, target: 50, multiplier: 1.16 },
        "good.salted_fish": { stock: 91, target: 55, multiplier: 0.7 },
        "good.timber": { stock: 79, target: 55, multiplier: 0.8 },
        "good.coal": { stock: 28, target: 35, multiplier: 1.1 },
        "good.iron": { stock: 24, target: 35, multiplier: 1.15 },
        "good.gunpowder": { stock: 26, target: 30, multiplier: 1.08 },
        "good.machinery": { stock: 18, target: 26, multiplier: 1.22 },
        "good.medicine": { stock: 27, target: 32, multiplier: 1.12 }
    },
    "port.thorenfjord": {
        "good.grain": { stock: 46, target: 50, multiplier: 1.04 },
        "good.salted_fish": { stock: 63, target: 48, multiplier: 0.9 },
        "good.timber": { stock: 39, target: 42, multiplier: 1.0 },
        "good.coal": { stock: 20, target: 28, multiplier: 1.18 },
        "good.iron": { stock: 23, target: 28, multiplier: 1.14 },
        "good.gunpowder": { stock: 18, target: 25, multiplier: 1.16 },
        "good.machinery": { stock: 13, target: 20, multiplier: 1.26 },
        "good.medicine": { stock: 37, target: 38, multiplier: 1.0 }
    }
};
//# sourceMappingURL=commodities.js.map