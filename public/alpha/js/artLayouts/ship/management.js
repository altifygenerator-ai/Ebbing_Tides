const r = (id, type, x, y, width, height, extra = {}) => ({ id, type, x, y, width, height, ...extra });
export const shipManagementLayout = {
    layoutId: "ui.ship.management",
    assetId: "ui.ship.management.runtime",
    referenceAssetId: "ui.reference.consistency_collage",
    runtimeBaseAssetId: "ui.ship.management.runtime",
    nativeWidth: 1672, nativeHeight: 941, shellMode: "main_content", fitMode: "contain", screenScroll: "none", minimumReadableScale: .55,
    regions: {
        shipViewport: r("shipViewport", "viewport", .036, .070, .590, .470, { label: "Ship presentation" }),
        status: r("status", "text_area", .683, .083, .260, .235, { label: "Ship status" }),
        refits: r("refits", "ship_slot", .050, .646, .420, .254, { label: "Refits / modules" }),
        cargo: r("cargo", "inventory_area", .520, .646, .420, .254, { label: "Cargo hold" }),
        command: r("command", "button", .528, .845, .415, .040, { label: "Command rail" })
    }
};
//# sourceMappingURL=management.js.map