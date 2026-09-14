EBBING TIDES - 12K DETAIL ATLAS REAL NAVIGATION RUNTIME FIX v5

This supersedes v4, which had a Windows PowerShell parser bug caused by strings like "$Label:".
v5 uses ${Label}: and also makes the registry patch idempotent and updates the atlas pixel metadata.

INSTALL
1. Copy/extract this package's CONTENTS into the Ebbing_Tides_Alpha_0_1 project root.
2. From that root run:
   powershell -ExecutionPolicy Bypass -File ".\FIX_12K_ATLAS_NAV_RUNTIME_v5.ps1"
3. When it says REAL 12K NAVIGATION RUNTIME FIX APPLIED, hard-refresh the running game with Ctrl+F5.

DO NOT run npm build for this direct Alpha runtime fix.

The script patches BOTH:
- src/data/seed/assets.ts
- public/alpha/js/data/seed/assets.js
- src/game/navigationCamera.ts
- public/alpha/js/game/navigationCamera.js

It also installs the actual 12000x8000 ComfyUI detail atlas at:
public/art/maps/world_atlas_labeled_v06d_detail_master_12k.jpg

Logical 120x80 world coordinates, ports, POIs, passability, routes and travel mechanics are not changed.
