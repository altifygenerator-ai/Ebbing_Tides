import type { GridPoint, RangeState } from "./types.js";

/**
 * Alpha 0.6C Physical Distance Hotfix 1.
 * The measured distance underneath the presentation grid is authoritative.
 */
export const NM_PER_CELL = 20;
export const YARDS_PER_NM = 2025.3718285;
export const KM_PER_NM = 1.852;
export const STATUTE_MILES_PER_NM = 1.150779448;
export const MAX_TACTICAL_RANGE_YARDS = 6000;
export const TACTICAL_ROUND_MINUTES = 5;

export function gridSeparationCells(a: GridPoint, b: GridPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function straightLineDistanceNm(a: GridPoint, b: GridPoint): number {
  return gridSeparationCells(a, b) * NM_PER_CELL;
}

export function routeDistanceNm(path: GridPoint[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    total += straightLineDistanceNm(path[i - 1]!, path[i]!);
  }
  return total;
}

export function nmToYards(nm: number): number {
  return nm * YARDS_PER_NM;
}

export function yardsToNm(yards: number): number {
  return yards / YARDS_PER_NM;
}

/** Derived UX label. Exact rangeYards remains authoritative. */
export function rangeBandFromYards(rangeYards: number, boarding = false): RangeState {
  if (boarding) return "boarding";
  const yards = Math.max(0, rangeYards);
  if (yards <= 50) return "grapple";
  if (yards <= 300) return "close";
  if (yards <= 800) return "medium";
  if (yards <= 1500) return "long";
  return "distant";
}

export function legacyRangeSeedYards(range: RangeState): number {
  switch (range) {
    case "distant": return 3000;
    case "long": return 1150;
    case "medium": return 550;
    case "close": return 150;
    case "grapple": return 25;
    case "boarding": return 0;
  }
}

export function rangeChangeYards(relativeClosingKnots: number, roundMinutes = TACTICAL_ROUND_MINUTES): number {
  return relativeClosingKnots * (roundMinutes / 60) * YARDS_PER_NM;
}

/**
 * Place an entity an exact physical distance along a grid path. This preserves sub-cell position.
 */
export function pointAlongPathDistance(path: GridPoint[], distanceTravelledNm: number): GridPoint {
  if (!path.length) return { x: 0, y: 0 };
  if (path.length === 1) return { ...path[0]! };
  const total = routeDistanceNm(path);
  if (total <= 0) return { ...path[0]! };
  let remaining = Math.max(0, Math.min(total, distanceTravelledNm));
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const segmentNm = straightLineDistanceNm(a, b);
    if (remaining <= segmentNm) {
      const t = segmentNm <= 0 ? 0 : remaining / segmentNm;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= segmentNm;
  }
  return { ...path[path.length - 1]! };
}

/** Return how many nautical miles of the route have been completed by the closest segment projection. */
export function distanceAlongPathForPoint(path: GridPoint[], point: GridPoint): number {
  if (path.length < 2) return 0;
  let bestDistanceSq = Infinity;
  let bestAlongNm = 0;
  let priorNm = 0;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const lengthSq = vx * vx + vy * vy;
    const t = lengthSq <= 0 ? 0 : Math.max(0, Math.min(1, ((point.x - a.x) * vx + (point.y - a.y) * vy) / lengthSq));
    const px = a.x + vx * t;
    const py = a.y + vy * t;
    const dSq = (point.x - px) ** 2 + (point.y - py) ** 2;
    if (dSq < bestDistanceSq) {
      bestDistanceSq = dSq;
      bestAlongNm = priorNm + straightLineDistanceNm(a, b) * t;
    }
    priorNm += straightLineDistanceNm(a, b);
  }
  return bestAlongNm;
}
