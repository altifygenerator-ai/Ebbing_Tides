const r = (id, type, x, y, width, height, extra = {}) => ({ id, type, x, y, width, height, ...extra });
export const marketLayout = {
    layoutId: "ui.market.ledger", assetId: "ui.market.ledger.runtime", referenceAssetId: "ui.reference.consistency_collage", runtimeBaseAssetId: "ui.market.ledger.runtime",
    nativeWidth: 494, nativeHeight: 288, shellMode: "main_content", fitMode: "contain", screenScroll: "none", minimumReadableScale: 1, provisionalArt: true,
    notes: "Market ledger columns, summary card and pager recalibrated in Hotfix 10 so the table aligns to painted lines and controls no longer float.",
    regions: {
        ledger: r("ledger", "text_area", .0628, .1806, .6883, .5800, { label: "Market rows", scroll: "none" }),
        pager: r("pager", "button", .2945, .7920, .2950, .0640, { label: "Market pager" }),
        summary: r("summary", "text_area", .7976, .1100, .1480, .7450, { label: "Ship and purse summary", scroll: "none" })
    }
};
//# sourceMappingURL=market.js.map