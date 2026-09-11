const r = (id, type, x, y, width, height, extra = {}) => ({ id, type, x, y, width, height, ...extra });
export const navalEncounterLayout = {
    layoutId: "ui.combat.naval_encounter", assetId: "ui.combat.naval_encounter.runtime", referenceAssetId: "ui.reference.consistency_collage", runtimeBaseAssetId: "ui.combat.naval_encounter.runtime",
    nativeWidth: 492, nativeHeight: 289, shellMode: "full_screen", fitMode: "contain", screenScroll: "region_only", minimumReadableScale: 1, provisionalArt: true,
    notes: "Low-resolution sea-combat base is provisional. Only the mapped combat log is allowed to scroll.",
    regions: {
        player: r("player", "ship_slot", .023, .13, .17, .30, { label: "Player ship" }),
        enemy: r("enemy", "ship_slot", .807, .13, .17, .30, { label: "Enemy ship" }),
        range: r("range", "text_area", .395, .09, .21, .15, { label: "Range" }),
        log: r("log", "text_area", .02, .63, .96, .17, { label: "Combat log", scroll: "auto" }),
        actions: r("actions", "button", .02, .84, .96, .12, { label: "Combat actions" })
    }
};
//# sourceMappingURL=navalEncounter.js.map