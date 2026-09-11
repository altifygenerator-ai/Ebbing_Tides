# Alpha 0.6D — Navigation Feel Gate Correction 1

Status: **FUNCTIONAL PASS / VISUAL + FEEL PENDING MANUAL APPROVAL**

This correction pass responds directly to the first manual Alpha 0.6D navigation feel review. It does **not** start Phase C.

## 1. Destination selection correction

The navigation UI no longer preselects Ironhaven in code.

Changes:

- `selectedMapTarget` now begins empty.
- new campaigns no longer assign Ironhaven as a hidden/default destination.
- loaded campaigns no longer assign an arbitrary opposite port.
- successful arrival clears the previous destination selection.
- when a player opens the chart at a known Skeldran port with no active target, the initial camera frames the known core Skeldran ports in a regional overview.
- known port markers receive a larger invisible pointer hit area without changing the visible marker geometry.

The normal flow is now genuinely:

`OPEN CHART -> CHOOSE ANY KNOWN DESTINATION -> ROUTE -> SAIL`

rather than beginning from an implicit Ironhaven route.

## 2. Supply exhaustion correction

Supply depletion remains simulated but no longer stops `Sail Until Interrupted`.

When supplies reach zero:

- the world event is recorded,
- the voyage continues,
- no player decision is demanded solely because stores reached zero.

An end-of-voyage report now records:

- physical nautical miles travelled,
- elapsed voyage time,
- supplies used,
- supplies remaining / exhausted state,
- net hull damage,
- net sail damage,
- net rigging damage.

The compact report is surfaced at port/POI arrival and in the completion toast. This keeps supplies consequential without turning them into a simulation-tick interruption.

No save-schema bump was required. Voyage telemetry is optional for backward compatibility with schema-v10 active voyages.

## 3. Map clarity correction

The global and Skeldra runtime raster layers were promoted to new lossless presentation masters without changing gameplay coordinates.

### Global atlas

Runtime asset:

`public/art/maps/world_atlas_visual_dna_v06d_crisp.png`

- **3600×2400 px**
- pre-projected to the canonical 120×80 / 3:2 runtime atlas shape
- Lanczos resampling performed once offline instead of continuous browser stretching
- restrained non-generative sharpening
- lossless PNG runtime delivery

### Skeldra regional chart

Runtime asset:

`public/art/maps/skeldra_regional_chart_v06d_crisp.png`

- **4096×2926 px**
- identical 49×35 global-coordinate registration
- lossless PNG runtime delivery
- restrained non-generative sharpening

The SVG color-dimming filter was removed from raster map layers and the atlas wash was reduced substantially. Functional markers, routes, grid, labels and tokens remain separate sharp overlays.

These changes improve clarity without inventing new geography or allowing reference/sample-state art to own runtime coordinates.

The Skeldra regional painting remains **PROVISIONAL**. If this corrected runtime master still does not meet manual close-zoom sharpness expectations, the correct next art action is a new native high-resolution registered Skeldra chart, not increasingly aggressive sharpening.

## Regression additions

Added coverage for:

- regional overview framing of all currently known Skeldran core ports,
- removal of hard-coded Ironhaven selection,
- supply exhaustion continuing in the background,
- voyage-report creation after supply exhaustion.

## Gate

Phase C remains blocked until manual review confirms:

- destination switching feels natural,
- the regional overview is useful rather than intrusive,
- supply depletion no longer creates tedious interruptions,
- arrival reporting communicates voyage consequences clearly,
- global and regional chart clarity is acceptable.
