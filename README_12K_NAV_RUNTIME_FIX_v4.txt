EBBING TIDES — 12K ATLAS REAL NAVIGATION RUNTIME FIX v4

WHY THE PRIOR PACKAGE LOOKED INSTALLED BUT NAVIGATION STILL SHOWED THE OLD MAP

The Alpha game does not execute src/data/seed/assets.ts directly in the browser.
Its browser runtime is the precompiled ESM tree under public/alpha/js/.

The earlier atlas package patched:
  src/data/seed/assets.ts
  src/game/navigationCamera.ts

but did NOT patch the compiled files actually loaded by Alpha navigation:
  public/alpha/js/data/seed/assets.js
  public/alpha/js/game/navigationCamera.js

Running `npm run build` is a Next.js build and does not rebuild that Alpha ESM tree.
The Alpha compiler is a separate `npm run alpha:build` pipeline.

THIS FIX

- installs the actual user-approved ComfyUI-derived 12000x8000 atlas runtime JPEG
- points BOTH source and compiled Alpha asset registries at it
- restores BOTH source and compiled Alpha camera to 12-cell min / 18-cell default
- syntax-checks the compiled browser ESM
- does NOT touch grid, terrain mask, ports, POIs, routes, travel math, combat, saves, or world coordinates

INSTALL

1. Extract this ZIP into the Ebbing_Tides repository root.
2. In PowerShell from the repo root run:

powershell -ExecutionPolicy Bypass -File ".\FIX_12K_ATLAS_NAV_RUNTIME_v4.ps1"

3. When it succeeds, hard-refresh the running game with Ctrl+F5.

Do NOT run npm build for this fix.
