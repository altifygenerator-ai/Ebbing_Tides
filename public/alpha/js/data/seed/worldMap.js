import { WORLD_TERRAIN_MASK_V06D_LABELED, WORLD_TERRAIN_MASK_HEIGHT, WORLD_TERRAIN_MASK_WIDTH } from "./worldTerrainMask.js";
export const GLOBAL_ATLAS = {
    width: WORLD_TERRAIN_MASK_WIDTH,
    height: WORLD_TERRAIN_MASK_HEIGHT,
    cellScaleNm: 20,
    version: "WORLD_ATLAS_0.6D_LABELED_CANON1",
    projection: "illustrated_world_atlas_rectangular_grid",
    visualAssetId: "map.world_atlas.labeled_v06d"
};
export const NAVIGATION_ZOOMS = {
    // Far is the complete 120×80 strategic atlas. Default navigation is deliberately local.
    // Regional art is not magnified to fake detail; players zoom the chart, not the image file.
    far: { width: 120, height: 80, panStep: 20 },
    navigation: { width: 18, height: 12, panStep: 4 },
    close: { width: 12, height: 8, panStep: 3 }
};
// Backward-compatible default export; the production camera now opens on the pulled-back regional view.
export const NAVIGATION_VIEW = NAVIGATION_ZOOMS.far;
// The regional-layer architecture remains available, but Alpha 0.6D now uses the user-approved labeled world atlas as the sole active navigation painting.
// Future regional art is optional rather than required for baseline navigation; any later layer must still register to this same global coordinate system.
export const REGIONAL_MAP_LAYERS = [
    { id: "layer.world.labeled.v06d", name: "Labeled World Atlas — Alpha 0.6D", assetId: "map.world_atlas.labeled_v06d", globalBounds: { x: 0, y: 0, width: WORLD_TERRAIN_MASK_WIDTH, height: WORLD_TERRAIN_MASK_HEIGHT }, overlapCells: 0, priority: 0, development: "active" }
];
export function navigationViewForZoom(zoom) { return NAVIGATION_ZOOMS[zoom]; }
export function mapLayersForViewport(origin, zoom) {
    const view = navigationViewForZoom(zoom);
    return REGIONAL_MAP_LAYERS.filter((layer) => origin.x < layer.globalBounds.x + layer.globalBounds.width && origin.x + view.width > layer.globalBounds.x && origin.y < layer.globalBounds.y + layer.globalBounds.height && origin.y + view.height > layer.globalBounds.y).sort((a, b) => a.priority - b.priority);
}
// Canonical named settlement existence, category, and relative placement now come from settlementCanon.ts
// plus the shipped World Settlement & Maritime Geography Canon 0.1 images. These runtime atlas bounds and
// grid coordinates remain implementation geometry and must be reconciled to that canon when reserved regions activate.
// One continuous atlas. These are development/content windows, not separate maps or political borders.
// The illustrated world atlas and gameplay coordinates share the same 3:2 projection (120x80).
export const ATLAS_REGIONS = [
    { id: "great_western_ocean", name: "Great Western Ocean", x: 0, y: 0, width: 28, height: 80, development: "reserved" },
    { id: "northwestern_sea", name: "Northwestern Sea / Skeldra", x: 12, y: 1, width: 45, height: 31, development: "active" },
    { id: "ardaran_gate", name: "Ardaran Gate", x: 11, y: 27, width: 17, height: 24, development: "reserved" },
    { id: "asteria", name: "Asterian Sea", x: 21, y: 29, width: 43, height: 31, development: "reserved" },
    { id: "vesperan_strait", name: "Vesperan Strait", x: 63, y: 28, width: 19, height: 23, development: "reserved" },
    { id: "serath", name: "Serathi Coast", x: 62, y: 43, width: 31, height: 25, development: "reserved" },
    { id: "kaishin", name: "Eastern Approaches / Kaishin", x: 83, y: 24, width: 37, height: 43, development: "reserved" },
    { id: "outer_isles", name: "Outer Isles", x: 0, y: 52, width: 30, height: 28, development: "reserved" }
];
// Content-complete/navigation-enabled slice for current alpha. It lives inside GLOBAL_ATLAS.
export const SKELDRA_DEVELOPED_BOUNDS = { x: 14, y: 2, width: 42, height: 29 };
// Port markers must remain land while ships stop in water. Explicit overrides keep important
// authored destinations stable even when the provisional art-derived terrain mask is refined.
const LAND_OVERRIDES = new Set([
    "31,25", // Veyrholm
    "37,18", // Ironhaven
    "23,17", // Stormvik
    "34,5", // Thorenfjord — recalibrated to labeled atlas coastline
    "26,21" // Old Veyr Beacon POI marker
]);
const WATER_OVERRIDES = new Set([
    "32,25", // Veyrholm harbor approach
    "38,18", // Ironhaven harbor approach
    "24,17", // Stormvik harbor approach
    "33,5", // Thorenfjord harbor approach — labeled atlas water
    "27,21", // Old Veyr Beacon landing approach
    "18,22" // Greywater Wrecks sea POI
]);
const REEF_KEYS = new Set([
    "18,22", "19,22", "20,23", "27,22", "28,22", "34,27"
]);
function inAtlas(point) {
    return point.x >= 0 && point.y >= 0 && point.x < GLOBAL_ATLAS.width && point.y < GLOBAL_ATLAS.height;
}
function inBounds(point, bounds) {
    return point.x >= bounds.x && point.y >= bounds.y && point.x < bounds.x + bounds.width && point.y < bounds.y + bounds.height;
}
function terrainMaskIsWater(point) {
    if (!inAtlas(point))
        return false;
    const row = WORLD_TERRAIN_MASK_V06D_LABELED[point.y];
    return row?.[point.x] === ".";
}
function isWater(point) {
    const key = `${point.x},${point.y}`;
    if (WATER_OVERRIDES.has(key))
        return true;
    if (LAND_OVERRIDES.has(key))
        return false;
    return terrainMaskIsWater(point);
}
function regionForPoint(point) {
    if (point.x < 27 && point.y >= 52)
        return "outer_isles";
    if (point.x >= 83)
        return "kaishin";
    if (point.x >= 62 && point.y >= 43)
        return "serath";
    if (point.x >= 20 && point.y >= 29 && point.x < 66)
        return "asteria";
    if (point.x >= 12 && point.y < 32)
        return "skeldra";
    return "crossroads";
}
function developmentAt(point) {
    return inBounds(point, SKELDRA_DEVELOPED_BOUNDS) ? "active" : "reserved";
}
function neighboringLand(point) {
    for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0)
                continue;
            const next = { x: point.x + dx, y: point.y + dy };
            if (inAtlas(next) && !isWater(next))
                return true;
        }
    }
    return false;
}
export function getWorldCell(point) {
    if (!inAtlas(point)) {
        return { ...point, terrain: "void", navigable: false, movementCost: 999, region: "crossroads", hazards: ["outside_known_atlas"], development: "reserved" };
    }
    const development = developmentAt(point);
    const region = regionForPoint(point);
    if (!isWater(point)) {
        return { ...point, terrain: "land", navigable: false, movementCost: 999, region, hazards: [], development };
    }
    // The atlas already knows where future water is, but only authored/developed regions are enabled
    // for player/NPC pathfinding in the current alpha. Expanding a region does not replace the map.
    if (development === "reserved") {
        return { ...point, terrain: "deep_sea", navigable: false, movementCost: 1, region, hazards: ["region_not_enabled_in_alpha"], development };
    }
    const key = `${point.x},${point.y}`;
    if (REEF_KEYS.has(key)) {
        return { ...point, terrain: "reef", navigable: true, movementCost: 2.4, region, hazards: ["grounding"], development };
    }
    if (neighboringLand(point)) {
        return { ...point, terrain: "coastal_water", navigable: true, movementCost: 1.25, region, hazards: ["shoal_water"], development };
    }
    const terrain = "deep_sea";
    return { ...point, terrain, navigable: true, movementCost: 1, region, hazards: [], development };
}
export function isNavigableCell(point) {
    return getWorldCell(point).navigable;
}
export function isMappedWater(point) {
    return inAtlas(point) && isWater(point);
}
export function clampNavigationViewport(origin, zoom = "navigation") {
    const view = navigationViewForZoom(zoom);
    const maxX = GLOBAL_ATLAS.width - view.width;
    const maxY = GLOBAL_ATLAS.height - view.height;
    return {
        x: Math.max(0, Math.min(maxX, Math.round(origin.x))),
        y: Math.max(0, Math.min(maxY, Math.round(origin.y)))
    };
}
export function viewportAround(point, zoom = "navigation") {
    const view = navigationViewForZoom(zoom);
    return clampNavigationViewport({
        x: Math.floor(point.x - view.width / 2),
        y: Math.floor(point.y - view.height / 2)
    }, zoom);
}
export function cellKey(point) { return `${point.x},${point.y}`; }
export function parseCellKey(key) {
    const [x, y] = key.split(",").map(Number);
    return { x: x ?? 0, y: y ?? 0 };
}
//# sourceMappingURL=worldMap.js.map