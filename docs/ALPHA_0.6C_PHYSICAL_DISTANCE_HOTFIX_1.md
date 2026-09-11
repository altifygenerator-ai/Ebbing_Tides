# Alpha 0.6C — Physical Distance / Navigation / Naval Combat Hotfix 1

## Status

Implemented on top of the accepted **Alpha 0.6C World Content Registry & Regional Availability Foundation** checkpoint.

Package version: `0.6.0-alpha.c.distance1`

Save schema: **v9**

The implementation authority is **Ebbing Tides — Physical Distance, Navigation & Naval Combat Range Specification v1.0 (2026-09-07)**.

## Canonical physical scale

The world atlas remains **120 × 80 cells** and all existing grid coordinates remain unchanged. Its physical scale is now canonically **20 nautical miles per grid cell**, yielding an atlas approximately **2,400 nm east-west × 1,600 nm north-south**.

Strategic distance is stored/displayed in nautical miles. Ship speed is measured in knots. Tactical naval separation is stored in yards.

The core implementation rule is that measured physical distance is authoritative. Grid cells, pathfinding weights, and named combat bands are presentation/decision layers over that physical state.

## Shared physical-distance foundation

New shared modules:

- `src/game/physicalDistance.ts`
- `src/game/shipSpeed.ts`

They provide:

- 20 nm/cell geometry;
- orthogonal and diagonal physical distance;
- route distance from path geometry;
- nautical-mile ↔ yard conversion;
- exact tactical range-band derivation;
- distance-proportional sub-cell interpolation;
- class/ship cruise speed in knots;
- terrain, condition, load, and crew speed factors;
- route ETA and physical route advancement.

Pathfinding `movementCost` remains useful for deciding which route is preferable, but it no longer changes the physical number of miles between route points.

## Ship cruise speeds

All **33 canonical ship classes** now have a `cruiseSpeedKnots` value. These values are initial Alpha balance values derived from the already-established class doctrines and remain tunable without changing the 20 nm world scale or distance architecture.

Legacy ships without a class-defined physical speed use the specification fallback:

`2.25 + (0.75 × legacy speed rating)` knots.

## Player voyages

`plotCourse()` now exposes:

- routed distance in nm;
- straight-line distance in nm;
- planned average speed in knots;
- physical ETA from distance / effective speed;
- pathfinding cost separately.

Active voyages persist:

- `routeDistanceNm`;
- `distanceTravelledNm`;
- `plannedAverageSpeedKnots`.

Advancing time moves the ship an actual physical distance along the plotted path. Sub-cell positions remain valid, so a ship can travel a fraction of a 20 nm visible cell.

Terrain changes effective speed rather than faking extra distance. The initial factors are intentionally simple so future wind, current, weather, and sea-state systems can plug into `effectiveSpeedKnots` without changing geography.

## NPC voyages

Persistent NPC travel now calls the same route-distance and ETA utilities used by the player. `Plan Until Interrupted` travel plans can store/derive physical route distance, distance travelled, planned speed, and expected completion from the same world geometry.

This removes the prior separate `path.length × 2.3` NPC travel clock.

## Sighting and encounter staging

The previous automatic `<= 1.35 grid cells` encounter search is removed.

Ship contact is now evaluated from exact sub-cell separation in nautical miles against a visibility envelope. Initial deterministic envelopes are:

- clear daylight: 8 nm baseline, up to 10 nm for large rigs;
- excellent visibility: 12 nm baseline, up to 15 nm for large rigs;
- haze/rain: 4 nm;
- fog: 1 nm;
- night: 2 nm.

Detection and identification remain separate. A contact can be visible without its identity being known.

Contacts outside tactical range remain in a sighting/approach state. Approach, observation, signaling/hailing, avoidance, and pursuit can occur before tactical combat begins.

## Exact tactical naval range

`ActiveEncounter.rangeYards` is authoritative. The familiar UI labels remain derived shorthand:

| State | Exact separation |
| --- | ---: |
| Out of tactical | > 6,000 yd |
| Distant | > 1,500 to 6,000 yd |
| Long | > 800 to 1,500 yd |
| Medium | > 300 to 800 yd |
| Close | > 50 to 300 yd |
| Grapple | > 0 to 50 yd |
| Boarding | ships successfully secured/alongside |

Boarding is not inferred merely from a zero-distance label. `shipsSecured` is a separate state.

Tactical maneuver rounds use a **5-minute baseline**. Close/open/flee actions change exact range in yards from relative closing speed in knots, and the UI range label changes only when the exact separation crosses a boundary.

## Gunnery range foundation

Physical content definitions can now carry:

- `maxRangeYards`;
- `effectiveRangeYards`;
- `preferredRangeYards`;
- `accuracyFalloff`.

The present generic naval battery uses exact separation for firing eligibility and modifiers. Detailed historical ballistics and final per-weapon range balance remain deferred to the naval-combat content pass.

## Save migration: v8 → v9

The hotfix intentionally bumps the current save schema from **v8 to v9** because physical voyage and combat-range state can now be persistent.

Migration behavior:

- existing world/grid coordinates are never moved;
- canonical ship-class aliases still resolve;
- cruise speed is added from canonical class data or the legacy fallback;
- an active voyage recomputes physical route distance from its stored path;
- existing voyage progress percentage is preserved;
- `distanceTravelledNm` is reconstructed from that percentage;
- remaining ETA is recalculated under the physical speed model;
- NPC travel plans receive the same treatment;
- legacy encounter range bands receive exact yard seeds;
- only legacy `boarding` implies the ships are already secured; legacy `grapple` migrates to 25 yd without falsely creating a boarding state.

Legacy range seeds:

- distant → 3,000 yd
- long → 1,150 yd
- medium → 550 yd
- close → 150 yd
- grapple → 25 yd
- boarding → 0 yd + secured state

## UI changes

Navigation now presents real quantities instead of cell count alone:

- map scale: `20 nm / cell`;
- routed course distance;
- straight-line distance;
- planned average knots;
- estimated voyage time;
- active voyage miles travelled / total miles and dynamic ETA;
- sighting separation in nm outside tactical range;
- tactical separation in exact yards plus the derived range label.

The earlier 0.6C toast-position hotfix remains intact.

## Specification discrepancy recorded

The source specification gives the explicit formula:

`rangeChangeYards = relativeClosingKnots × (roundMinutes / 60) × YARDS_PER_NM`

and separately gives examples stating that 2 knots over 5 minutes closes ~169 yd and 4 knots closes ~338 yd. Those examples conflict with the specification's own `YARDS_PER_NM = 2025.3718285` constant and formula: the formula yields approximately **337.6 yd at 2 kn** and **675.1 yd at 4 kn** over five minutes.

This hotfix follows the explicit formula and canonical unit conversion rather than silently adopting the contradictory example values. The discrepancy is documented here for future canon review; no alternate hidden conversion was introduced.

## Scope guardrails preserved

This hotfix does **not** implement:

- a complete wind simulator;
- full current/oceanography simulation;
- historically exhaustive cannon ballistics;
- a redesigned naval-combat game;
- new traversable regions;
- the Alpha 0.7 visual/content sweep.

Those systems can now build on one physically measured world rather than replacing the navigation foundation later.
