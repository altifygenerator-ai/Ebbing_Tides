# Ebbing Tides — Native Atlas Zoom-Cap Fix

This removes the experimental 12k/24k atlas upscale system and stops zooming the 6000×4000 canonical atlas far beyond its real detail.

## Why this is the real immediate fix

The canonical world atlas is 6000 pixels wide across 120 logical cells:

- 6000 / 120 = **50 native source pixels per cell**
- the old 12-cell close view exposed only about **600 real source pixels** across the map viewport
- the game window in the user's current layout is roughly 1200–1250 px wide

That means the old close view was displaying the raster at roughly 2× its native detail. No Lanczos/Sharp 12k or 24k derivative can add the missing painted detail.

This fix changes the closest view to **24×16 cells**, which exposes about 1200 native source pixels across the viewport and therefore sits around the atlas's native useful resolution.

Normal navigation becomes **30×20** so it remains distinct from Close.

## Removed

- `public/alpha/atlas-lod.js`
- `public/alpha/atlas-quality.css`
- `public/alpha/atlas-lod-manifest.json`
- generated `public/art/maps/lod/`
- `scripts/generate-atlas-lod.mjs`
- atlas LOD stylesheet/script references from `public/alpha/index.html`

The canonical map is NOT removed:

`public/art/maps/world_atlas_labeled_v06d_master.webp`

## Changed

Only camera presentation constants in:

- `src/game/navigationCamera.ts`
- `public/alpha/js/game/navigationCamera.js`

Changes:

- `minViewWidth`: 12 → 24
- `defaultViewWidth`: 18 → 30
- LOD presentation thresholds adjusted so 24 remains the Close band

## Not changed

- world size / scale
- ports or POIs
- marker coordinates or marker art
- navigation grid
- route/pathfinding
- travel math
- supplies/weather/encounters/economy
- save schema
- Tideworn movement interpolation
- naval combat
- naval audio

## Apply

Extract this ZIP into the repository root, then run:

```powershell
powershell -ExecutionPolicy Bypass -File ".\APPLY_NATIVE_ATLAS_ZOOM_CAP_FIX.ps1"
```

Afterward do a **Ctrl+F5** in the browser so any already-running atlas LOD JavaScript from the old page is discarded.

## Rollback

```powershell
powershell -ExecutionPolicy Bypass -File ".\ROLLBACK_NATIVE_ATLAS_ZOOM_CAP_FIX.ps1"
```
