import type { CommodityDefinition } from "../../game/types.js";
import { CONTENT_DEFINITIONS } from "./contentRegistry.js";

// Exact legacy balance rows are preserved so Alpha 0.6B saves/tests keep their familiar baseline.
const LEGACY_COMMODITIES: CommodityDefinition[] = [
  { id: "good.grain", name: "Grain", basePrice: 26, cargoUnits: 1, category: "food", contentDefinitionId: "content.commodity.common.grain", legalStatus: "ordinary", originRegion: "common" },
  { id: "good.salted_fish", name: "Salted Fish", basePrice: 22, cargoUnits: 1, category: "food", contentDefinitionId: "content.commodity.common.salted_fish", legalStatus: "ordinary", originRegion: "common" },
  { id: "good.timber", name: "Timber", basePrice: 34, cargoUnits: 2, category: "raw", contentDefinitionId: "content.commodity.common.timber", legalStatus: "ordinary", originRegion: "common" },
  { id: "good.coal", name: "Coal", basePrice: 30, cargoUnits: 2, category: "raw", contentDefinitionId: "content.commodity.common.coal", legalStatus: "ordinary", originRegion: "common" },
  { id: "good.iron", name: "Iron", basePrice: 47, cargoUnits: 2, category: "raw", legalStatus: "ordinary", originRegion: "common" },
  { id: "good.gunpowder", name: "Gunpowder", basePrice: 78, cargoUnits: 1, category: "military", legalStatus: "licensed", originRegion: "common" },
  { id: "good.machinery", name: "Machinery", basePrice: 112, cargoUnits: 3, category: "manufactured", legalStatus: "ordinary", originRegion: "skeldra" },
  { id: "good.medicine", name: "Medicine", basePrice: 63, cargoUnits: 1, category: "medical", legalStatus: "ordinary", originRegion: "common" },
  // These two IDs already existed in live ship cargo before they had market definitions.
  { id: "good.iron_ingots", name: "Iron Ingots", basePrice: 55, cargoUnits: 2, category: "raw", legalStatus: "ordinary", originRegion: "skeldra" },
  { id: "good.wool", name: "Wool", basePrice: 38, cargoUnits: 1, category: "textile", contentDefinitionId: "content.commodity.common.wool", legalStatus: "ordinary", originRegion: "common" }
];

type CommodityCategory = CommodityDefinition["category"];

function categoryFor(subcategory: string | undefined, legalStatus: string): CommodityCategory {
  if (legalStatus === "contraband" || legalStatus === "stolen") return "illicit";
  switch (subcategory) {
    case "staples": return "food";
    case "textiles_raw": return "textile";
    case "raw_materials": return "raw";
    case "industrial": return "manufactured";
    case "luxury": return "luxury";
    case "arcane": return "arcane";
    case "controlled_illicit": return "illicit";
    default: return "manufactured";
  }
}

function hashUnit(input: string): number {
  let h = 2166136261;
  for (const ch of input) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return (h % 1000) / 999;
}

function generatedPrice(category: CommodityCategory, id: string): number {
  const ranges: Record<CommodityCategory, [number, number]> = {
    food:[18,44], raw:[28,72], textile:[35,90], manufactured:[55,130], military:[65,150], medical:[55,120],
    luxury:[85,190], arcane:[115,260], illicit:[95,220], document:[45,120]
  };
  const [lo, hi] = ranges[category];
  return Math.round(lo + (hi - lo) * hashUnit(id));
}

function generatedCargoUnits(category: CommodityCategory): number {
  if (category === "raw" || category === "manufactured") return 2;
  return 1;
}

const legacyIds = new Set(LEGACY_COMMODITIES.map((good) => good.id));
const GENERATED_CANON_COMMODITIES: CommodityDefinition[] = CONTENT_DEFINITIONS
  .filter((definition) => definition.category === "commodity")
  .map((definition) => {
    const slug = definition.id.split(".").at(-1) ?? definition.id;
    const id = `good.${slug}`;
    const category = categoryFor(definition.subcategory, definition.legalStatus);
    const row: CommodityDefinition = {
      id,
      name: definition.name,
      basePrice: generatedPrice(category, id),
      cargoUnits: generatedCargoUnits(category),
      category,
      contentDefinitionId: definition.id,
      legalStatus: definition.legalStatus,
      ...(definition.originRegion ? { originRegion: definition.originRegion } : {})
    };
    return row;
  })
  .filter((definition) => !legacyIds.has(definition.id));

export const COMMODITIES: CommodityDefinition[] = [...LEGACY_COMMODITIES, ...GENERATED_CANON_COMMODITIES];
export const COMMODITY_BY_ID = Object.fromEntries(COMMODITIES.map((good) => [good.id, good])) as Record<string, CommodityDefinition>;

// Exact 0.6B market rows remain the seed for the original eight traded goods. 0.6C augments
// these per settlement from regional availability instead of assuming one universal inventory.
export const PORT_MARKET_PROFILES: Record<string, Record<string, { stock: number; target: number; multiplier: number }>> = {
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
