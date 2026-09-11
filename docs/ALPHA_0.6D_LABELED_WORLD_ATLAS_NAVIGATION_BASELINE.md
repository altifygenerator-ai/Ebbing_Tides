# Alpha 0.6D — Labeled World Atlas Navigation Baseline

## Purpose
Replace the provisional navigation paintings with the user-approved labeled world map while preserving the locked physical navigation model.

## Canonical runtime geometry
- World grid: **120 × 80**
- Physical scale: **20 nautical miles per cell**
- Coordinate system: unchanged
- Save schema: unchanged
- Player/NPC travel continues to use authoritative grid pathfinding, not raster pixels.

## Atlas art
Source: `ChatGPT Image Sep 8, 2026, 02_03_54 PM.png` supplied by the user.

Runtime files:
- Native source copy: `public/art/maps/world_atlas_labeled_v06d_source.png` (1448×1086)
- High-resolution runtime master: `public/art/maps/world_atlas_labeled_v06d_master.webp` (6000×4000)

The runtime master is a deterministic resampling/projection normalization of the exact supplied map. No generated geography, labels, islands, coastlines, or decorative content were substituted. The 3:2 runtime projection matches the locked 120×80 gameplay coordinate space and prevents per-frame browser stretching.

## Regional layers
The regional-layer architecture remains in code for future use, but **no regional painting currently overrides the labeled atlas**. The labeled world atlas is the sole active navigation painting in this baseline. The older Skeldra chart remains reference-only in the asset registry.

## Terrain/passability recalibration
`WORLD_TERRAIN_MASK_V06D_LABELED` is a new 120×80 land/water mask derived from this exact atlas. It is versioned with the painting.

- `.` = water-like cell
- `#` = land-like cell
- visible coast/island classification is sampled from the atlas
- authored micro-landmarks smaller than one cell may still use explicit marker overrides
- active player pathfinding remains restricted to developed Skeldra during 0.6D

## Active Skeldran port registration
| Port | Land marker | Harbor approach | Atlas check |
|---|---:|---:|---|
| Veyrholm | 31,25 | 32,25 | land -> water |
| Ironhaven | 37,18 | 38,18 | land -> water |
| Stormvik | 23,17 | 24,17 | land -> water |
| Thorenfjord | **34,5** | **33,5** | recalibrated from old registration; land -> water |

Thorenfjord was the only active port whose old approach no longer matched visible water on the new atlas, so it was moved one cell west/northward onto the actual northern coastal/fjord edge instead of forcing a water exception through visible land.

## Route verification
All six active Skeldran port-pair routes were recomputed across the new mask and verified to contain only navigable cells. Approximate physical path lengths from the calibrated grid are:

- Veyrholm ↔ Ironhaven: **~253 nm**
- Veyrholm ↔ Stormvik: **~226 nm**
- Veyrholm ↔ Thorenfjord: **~672 nm**
- Ironhaven ↔ Stormvik: **~479 nm**
- Ironhaven ↔ Thorenfjord: **~926 nm**
- Stormvik ↔ Thorenfjord: **~446 nm**

These are route distances, not straight-line measurements. ETA continues to derive from route distance, ship speed, and travel modifiers.

## POIs
Greywater Wrecks and Old Veyr Beacon remain reachable from Veyrholm. Old Veyr Beacon remains an authored tiny-islet marker with a water approach because the landmark is smaller than the 20-nm collision cell.

## QA artifact
`docs/visual-qa/map-calibration/skeldra_route_alignment_labeled_atlas.png` overlays the active Skeldran ports and path routes on the supplied atlas for manual geography review.

## Permanent rule
Any future geography/settlement relocation or replacement world painting must update and revalidate **both** the visual atlas and its 120×80 terrain/passability calibration. Never move one without the other.
