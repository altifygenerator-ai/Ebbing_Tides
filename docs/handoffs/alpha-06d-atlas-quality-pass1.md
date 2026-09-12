# Ebbing Tides Alpha 0.6D — Atlas Quality Pass 1

## Purpose

Improve close-camera atlas presentation and finish the whole-world navigation integration without moving canonical geography or changing travel/economy/combat mechanics.

## Locked registration

The atlas remains authoritative at:

- 120 × 80 world cells
- 20 nautical miles per cell
- 42 ports / settlements
- 7 maritime POIs
- 49 total registered locations

`tests/fixtures/atlas-registration-v06d.json` locks every location's `point` and `approachPoint`. Atlas work must fail regression testing rather than silently move gameplay coordinates.

## Whole-world chart interaction repair

The world-expansion pass activated the full atlas, but the chart hit-cell generator still used the old `SKELDRA_DEVELOPED_BOUNDS` proving-ground rectangle. Port and POI markers outside Skeldra could still be selected directly, but generic sea-cell interaction was limited to the old Skeldran window.

Pass 1 changes the chart hit-grid to `WORLD_DEVELOPED_BOUNDS` (0,0 → 120,80) in both source and emitted alpha runtime. This is an integration correction, not a navigation-rule change.

## Atlas LOD runtime

`public/alpha/atlas-lod.js` reads `public/alpha/atlas-lod-manifest.json` and chooses an active raster level from the actual SVG camera view, CSS width, and device pixel ratio.

The existing 6000 × 4000 atlas remains the always-valid fallback. Higher registered levels are tiled so close navigation never needs to load one enormous image.

### Level 0 — canonical fallback

- 6000 × 4000
- 50 pixels per world cell
- single WebP
- always active

### Level 1 — 2× registered navigation sampling

- 12000 × 8000 logical raster
- 100 pixels per world cell
- 6 × 4 tiles
- each tile covers exactly 20 × 20 world cells
- each tile is 2000 × 2000 pixels
- generated from the locked canonical master with overscanned Lanczos resampling and restrained sharpening

This level is deliberately described as **derived sampling**, not new geographic art. The current 6000 × 4000 master was itself projection-normalized from the approved lower-resolution source, so repeatedly enlarging it must not be presented as invented detail.

### Level 2 — reserved genuine close-detail tier

- 24000 × 16000 logical registration
- 200 pixels per cell
- reserved / planned only

Do not generate this by repeatedly enlarging the current atlas. Activate it only when a genuine detail-enhanced master or exact registered regional overlays exist.

## Generation

Run:

```bash
npm run atlas:prepare
npm run atlas:generate
npm run atlas:test
```

`atlas:generate` produces Level 1 tiles, verifies every tile dimension, writes SHA-256 data to `public/art/maps/lod/atlas-lod-generation-report.json`, and activates the Level 1 manifest entry.

`atlas:prepare` applies the narrowly scoped whole-world hit-grid correction to source and emitted alpha runtime. It is idempotent and aborts if its expected source text has drifted.

The branch also includes a GitHub Actions workflow that runs the preparation, deterministic tile generation, atlas regression tests, and focused navigation/POI tests, then commits generated raster output back to `atlas-quality-pass1` when repository Actions are enabled.

## Non-goals

This pass does not:

- move coastlines, ports, POIs, or approach coordinates
- alter the 20 nm/cell scale
- change routefinding or terrain costs
- change travel time, encounters, economy, law, NPC simulation, or combat
- claim resampling creates new painted geographic information
- activate the reserved 24k tier

## Acceptance

Pass 1 is acceptable when:

1. all 49 locations exactly match the registration lock;
2. all approach points remain navigable;
3. generic sea-cell selection works across the full 120 × 80 world rather than only Skeldra;
4. the 6000 atlas remains a safe fallback;
5. generated 12k tiles cover the atlas exactly with no registration gaps;
6. close-camera LOD selection works without changing canonical geometry;
7. atlas-specific regression tests and JavaScript syntax checks pass.
