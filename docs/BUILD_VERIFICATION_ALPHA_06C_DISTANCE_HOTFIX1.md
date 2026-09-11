# Alpha 0.6C Physical Distance Hotfix 1 — Build Verification

Verification date: **2026-09-07**

Checkpoint: **Alpha 0.6C — Physical Distance / Navigation / Naval Combat Hotfix 1**

Package version: `0.6.0-alpha.c.distance1`

Save schema: **v9**

Atlas: **120 × 80 cells at 20 nm/cell**

## Verification results

- `npm run typecheck:alpha` — **PASS**
- `npm run alpha:build` — **PASS**
- `npm run alpha:registry` — **PASS**
  - 33 ship classes
  - 565 content definitions
  - 23,730 settlement availability rows
- `npm test` — **137 / 137 PASS**
- `git diff --check` — **PASS**
- Standalone `scripts/serve-alpha.mjs` served smoke — **PASS**
  - `/alpha/` served successfully
  - physical-distance compiled module served successfully
  - ship-speed compiled module served successfully
  - HTML reports `Alpha 0.6C Physical Distance Hotfix 1`

## Regression accounting

The accepted pre-hotfix Alpha 0.6C checkpoint had **124 / 124** tests passing.

This hotfix retains those inherited behavioral checks and adds **13 targeted physical-distance tests**, bringing the suite to **137 / 137**. Older tests that intentionally asserted the former current package/save version were updated to expect the new `0.6.0-alpha.c.distance1` / schema-v9 checkpoint; their underlying structural and migration assertions were preserved.

New targeted coverage verifies:

- 120×80 atlas remains unchanged while scale becomes 20 nm/cell;
- orthogonal and diagonal physical distance;
- route geometry remains separate from A* movement cost;
- unchanged Skeldran port coordinates/pathfinding;
- class-level cruise speeds and speed-sensitive ETA;
- shared player/NPC distance and ETA utilities;
- sub-cell same-cell separation;
- visibility envelopes in nautical miles and removal of the old 1.35-cell contact trigger;
- exact-yard range boundaries;
- nautical-mile/yard conversion and five-minute maneuver math;
- v8 → v9 active-voyage/range migration without geographic movement;
- legacy grapple vs secured boarding-state distinction;
- physical nm/knots/yd UI plumbing.

## Migration verification

The v8 → v9 migration was exercised with an active voyage and legacy naval encounter.

Verified behavior:

- existing ship geographic coordinates remain unchanged;
- active-voyage progress percentage is preserved;
- `routeDistanceNm` is recomputed from the existing stored path;
- `distanceTravelledNm` is reconstructed from existing progress;
- planned speed and remaining ETA are recalculated from physical knots;
- legacy exact range seeds are applied;
- `boarding` migrates as secured/alongside;
- `grapple` migrates to 25 yd without falsely becoming a secured boarding state;
- all saved ships obtain valid physical cruise speed from canonical class data or fallback;
- existing 0.6C market-stock compatibility remains intact.

## Representative route check

Using the current default Veyrholm start and current Skeldran passability geometry, the verification build reports for Veyrholm → Ironhaven:

- straight-line distance: **184.39 nm**;
- routed distance: **300 nm**;
- default verification-captain planned average speed: **4.61 kn**;
- estimated voyage: **66 hours**.

The larger routed value reflects the actual existing water path around coastline/blocked cells. The physical miles are calculated from path geometry; terrain movement cost is not multiplied into distance.

## Source-spec discrepancy retained in the record

The implementation specification provides an explicit tactical maneuver formula using `YARDS_PER_NM = 2025.3718285`, but its prose examples for 2 kn and 4 kn over five minutes are exactly half the values produced by that formula.

The implementation follows the explicit formula and canonical unit constant:

- 2 kn for 5 minutes → approximately **337.6 yd**;
- 4 kn for 5 minutes → approximately **675.1 yd**.

This discrepancy is documented rather than silently changing either the conversion constant or the formula.

## Scope confirmation

The hotfix does not unlock new traversable regions and does not add a full wind/current/oceanography simulator, final cannon-family ballistics, full dynamic economy, or Alpha 0.7 art-production sweep.
