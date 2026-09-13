PASS 6

# Ebbing Tides — True Close LOD Fix Pass 5

This is the corrective atlas-runtime pass for the map blur that remained after Pass 4.

## Root cause found

The 24k close tier could be selected by the manifest, but the runtime kept tile DOM nodes in a map keyed only by `col,row`.
The 12k and 24k tiers use different world-size tiles but overlapping numeric tile keys, so when zooming from 12k to 24k the controller could reuse old 12k tile nodes instead of replacing them with the 24k versions.

That means the UI could report a 24k LOD while still displaying stale lower-resolution tiles. This matches the observed close-zoom blur.

## Pass 5 correction

- tile cache keys now include the LOD level id;
- switching from 12k to 24k clears the previous tile group first;
- 24k tiles are generated losslessly to avoid adding another compression-softening step;
- marker and label styles remain untouched by the atlas runtime;
- all world coordinates, markers, POIs, approaches, grid, movement, combat, audio, and saves remain unchanged.

## Apply

Extract to the Ebbing_Tides repo root and run:

```powershell
powershell -ExecutionPolicy Bypass -File ".\APPLY_MAP_FINISH_TRUE_CLOSE_LOD_FIX_PASS5.ps1"
```

The installer rebuilds the 12k tier and the 24k close tier from the exact local canonical atlas at:

`public/art/maps/world_atlas_labeled_v06d_master.webp`

It then runs the registration guards and confirms gameplay/navigation source files were not modified.
