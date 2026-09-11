import type { HistoricalDatabaseSeed } from "../../types/history.js";
import { HISTORICAL_FOUNDATION_SEED } from "./seed.js";
import { HISTORICAL_DYNASTIES_06B_SEED } from "./dynasties.js";

type IdRecord = { id: string };

function mergeById<T extends IdRecord>(...groups: T[][]): T[] {
  const byId = new Map<string, T>();
  for (const group of groups) for (const row of group) byId.set(row.id, row);
  return [...byId.values()];
}

/**
 * Canonical authored world-history seed currently available to the Alpha.
 * Later passes append new authored seed layers rather than rewriting the historical foundation.
 */
export function mergeHistoricalSeeds(...seeds: HistoricalDatabaseSeed[]): HistoricalDatabaseSeed {
  return {
    characters: mergeById(...seeds.map((s) => s.characters)),
    relationships: mergeById(...seeds.map((s) => s.relationships)),
    houses: mergeById(...seeds.map((s) => s.houses)),
    offices: mergeById(...seeds.map((s) => s.offices)),
    officeTerms: mergeById(...seeds.map((s) => s.officeTerms)),
    claims: mergeById(...seeds.map((s) => s.claims)),
    events: mergeById(...seeds.map((s) => s.events)),
    eventLinks: mergeById(...seeds.map((s) => s.eventLinks)),
    institutions: mergeById(...seeds.map((s) => s.institutions)),
    wars: mergeById(...seeds.map((s) => s.wars)),
    battles: mergeById(...seeds.map((s) => s.battles)),
    treaties: mergeById(...seeds.map((s) => s.treaties)),
    ships: mergeById(...seeds.map((s) => s.ships)),
    shipOwnership: mergeById(...seeds.map((s) => s.shipOwnership)),
    shipCommands: mergeById(...seeds.map((s) => s.shipCommands)),
    shipRefits: mergeById(...seeds.map((s) => s.shipRefits)),
    shipRenames: mergeById(...seeds.map((s) => s.shipRenames)),
    sources: mergeById(...seeds.map((s) => s.sources)),
    interpretations: mergeById(...seeds.map((s) => s.interpretations))
  };
}

export const HISTORICAL_WORLD_SEED = mergeHistoricalSeeds(HISTORICAL_FOUNDATION_SEED, HISTORICAL_DYNASTIES_06B_SEED);
