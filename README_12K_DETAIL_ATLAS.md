# Ebbing Tides — 12K Detail Atlas Integration

This overlay installs the approved ComfyUI-enhanced full world atlas as the active navigation painting while leaving the existing world simulation, terrain mask, port coordinates, routes, and 120×80 logical grid unchanged.

## What changes

- Adds `public/art/maps/world_atlas_labeled_v06d_detail_master_12k.jpg`
  - 12000×8000
  - q98 JPEG, 4:4:4 chroma
  - runtime derivative of the lossless `ComfyUI_00002_.png` source
- Updates only the `map.world_atlas.labeled_v06d` asset registry entry to point at the new 12K painting and record its 12000×8000 native dimensions.
- Restores navigation camera close zoom from the temporary 24-cell cap to the intended 12-cell minimum, with the default view restored from 30 to 18 cells.

## What does NOT change

- `WORLD_TERRAIN_MASK_V06D_LABELED`
- world size: 120×80
- grid/cell coordinates
- port positions
- POI positions
- passability
- pathfinding
- route/voyage mechanics
- Tideworn directional navigation work
- naval combat/audio
- save schema

The existing `public/art/maps/world_atlas_labeled_v06d_master.webp` 6000×4000 atlas is left in place as a fallback.

## Install

1. Extract this ZIP **into the root of your Ebbing_Tides repository**.
2. Open PowerShell in that repository root.
3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\INSTALL_12K_DETAIL_ATLAS.ps1
```

To install and immediately run the normal project build:

```powershell
powershell -ExecutionPolicy Bypass -File .\INSTALL_12K_DETAIL_ATLAS.ps1 -RunBuild
```

The installer creates a timestamped `.atlas-12k-detail-backup-*` folder before changing project files.

## Roll back

```powershell
powershell -ExecutionPolicy Bypass -File .\ROLLBACK_12K_DETAIL_ATLAS.ps1
```

Rollback uses the newest `.atlas-12k-detail-backup-*` folder.

## Runtime registration

The atlas remains registered to the same world rectangle:

- global logical bounds: `x 0, y 0, width 120, height 80`
- runtime visual dimensions: `12000×8000`
- 100 rendered source pixels per logical world cell

The SVG/navigation layer still mounts the painting into the same 120×80 world-space rectangle, so no port/grid coordinate rescaling is introduced by this package.
