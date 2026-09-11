const r = (id, type, x, y, width, height, extra = {}) => ({ id, type, x, y, width, height, ...extra });
export const journalLayout = {
    layoutId: "ui.journal.intelligence", assetId: "ui.journal.intelligence.runtime", referenceAssetId: "ui.reference.consistency_collage", runtimeBaseAssetId: "ui.journal.intelligence.runtime",
    nativeWidth: 492, nativeHeight: 288, shellMode: "main_content", fitMode: "contain", screenScroll: "none", minimumReadableScale: 1, provisionalArt: true,
    notes: "Journal spread re-authored for Hotfix 10 with clean page wells and footer placement so dynamic entries sit inside the intended book layout.",
    regions: {
        tabs: r("tabs", "button", .0813, .1563, .1341, .6840, { label: "Journal tabs" }),
        leftPage: r("leftPage", "text_area", .2200, .1701, .2120, .6111, { label: "Left journal page", scroll: "paged" }),
        rightPage: r("rightPage", "text_area", .6037, .1701, .2907, .6111, { label: "Right journal page", scroll: "paged" }),
        pager: r("pager", "button", .6120, .8125, .2140, .0625, { label: "Journal pager" })
    }
};
//# sourceMappingURL=journal.js.map