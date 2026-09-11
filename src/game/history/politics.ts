import type { ClaimRecord, HistoricalCharacterRecord, HistoricalDatabaseSeed, HistoricalDate, OfficeRecord, OfficeTermRecord } from "../../types/history.js";
import { historicalDateSortKey } from "../time/calendar.js";

export interface OfficeSnapshot {
  office: OfficeRecord;
  currentTerm?: OfficeTermRecord;
  currentHolder?: HistoricalCharacterRecord;
  activeClaims: ClaimRecord[];
}

function atOrBefore(date: HistoricalDate, target: HistoricalDate): boolean {
  const d = historicalDateSortKey(date), t = historicalDateSortKey(target);
  return d === undefined || t === undefined || d <= t;
}

function atOrAfter(date: HistoricalDate, target: HistoricalDate): boolean {
  const d = historicalDateSortKey(date), t = historicalDateSortKey(target);
  return d === undefined || t === undefined || d >= t;
}

/**
 * Returns terms that can contain the requested date. Unknown boundaries stay open rather than being
 * fabricated. If several remain possible because history is incomplete, the most recently known
 * start is preferred; validation separately catches contradictory open current terms.
 */
export function officeTermAt(seed: HistoricalDatabaseSeed, officeId: string, date: HistoricalDate): OfficeTermRecord | undefined {
  const candidates = seed.officeTerms.filter((row) => row.officeId === officeId && atOrBefore(row.startDate, date) && atOrAfter(row.endDate, date));
  return candidates.sort((a, b) => (historicalDateSortKey(b.startDate) ?? Number.NEGATIVE_INFINITY) - (historicalDateSortKey(a.startDate) ?? Number.NEGATIVE_INFINITY))[0];
}

export function activeClaimsForOffice(seed: HistoricalDatabaseSeed, officeId: string): ClaimRecord[] {
  return seed.claims
    .filter((row) => row.targetOfficeId === officeId && row.active)
    .sort((a, b) => {
      const ap = a.priority ?? Number.POSITIVE_INFINITY, bp = b.priority ?? Number.POSITIVE_INFINITY;
      if (ap !== bp) return ap - bp;
      const as = a.strength ?? Number.NEGATIVE_INFINITY, bs = b.strength ?? Number.NEGATIVE_INFINITY;
      if (as !== bs) return bs - as;
      return a.id.localeCompare(b.id);
    });
}

export function officeSnapshotAt(seed: HistoricalDatabaseSeed, officeId: string, date: HistoricalDate): OfficeSnapshot | undefined {
  const office = seed.offices.find((row) => row.id === officeId);
  if (!office) return undefined;
  const currentTerm = officeTermAt(seed, officeId, date);
  const currentHolder = currentTerm ? seed.characters.find((row) => row.id === currentTerm.holderCharacterId) : undefined;
  return { office, ...(currentTerm ? { currentTerm } : {}), ...(currentHolder ? { currentHolder } : {}), activeClaims: activeClaimsForOffice(seed, officeId) };
}

/**
 * Claims are intentionally not resolved into a future ruler here. 0.6B exposes the authored legal
 * and political bases; later succession simulation may combine those with law, support, religion,
 * military power, foreign backing, personality, and live events.
 */
export function claimIsHereditaryBasis(claim: ClaimRecord): boolean {
  return ["direct_descent", "collateral_descent", "marriage", "adoption"].includes(claim.basis);
}
