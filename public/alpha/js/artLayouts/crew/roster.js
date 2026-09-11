const r = (id, type, x, y, width, height, extra = {}) => ({ id, type, x, y, width, height, ...extra });
export const crewRosterLayout = {
    layoutId: "ui.crew.roster", assetId: "ui.crew.roster.runtime", referenceAssetId: "ui.reference.consistency_collage", runtimeBaseAssetId: "ui.crew.roster.runtime",
    nativeWidth: 494, nativeHeight: 270, shellMode: "main_content", fitMode: "contain", screenScroll: "none", minimumReadableScale: 1, provisionalArt: true,
    notes: "Roster ledger re-authored for Hotfix 10 so all row content, initials, numeric columns, and footer controls align to clean painted guide lines.",
    regions: {
        roster: r("roster", "text_area", .0486, .1481, .8927, .6148, { label: "Crew roster ledger", scroll: "none" }),
        pager: r("pager", "button", .0486, .7778, .8927, .0963, { label: "Roster footer controls" })
    }
};
//# sourceMappingURL=roster.js.map