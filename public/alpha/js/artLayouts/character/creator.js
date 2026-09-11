const r = (id, type, x, y, width, height, extra = {}) => ({ id, type, x, y, width, height, ...extra });
export const characterCreatorLayout = {
    layoutId: "ui.character.creator", assetId: "ui.character.creator.runtime", referenceAssetId: "ui.reference.consistency_collage", runtimeBaseAssetId: "ui.character.creator.runtime",
    nativeWidth: 1672, nativeHeight: 941, shellMode: "full_screen", fitMode: "contain", screenScroll: "none", minimumReadableScale: .55,
    regions: {
        stepNav: r("stepNav", "button", .054, .108, .134, .763, { label: "Creation steps" }),
        form: r("form", "text_area", .237, .118, .360, .736, { label: "Creation form page", scroll: "none" }),
        portrait: r("portrait", "portrait", .669, .154, .207, .474, { label: "Portrait area" }),
        footer: r("footer", "button", .667, .756, .287, .119, { label: "Creation navigation" })
    }
};
//# sourceMappingURL=creator.js.map