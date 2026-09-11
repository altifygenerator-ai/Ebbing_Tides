# Ebbing Tides — Alpha 0.6C Hotfix 9
## Art-Directed Screen Integration, Viewport Fit & Scroll Ownership

Hotfix 9 preserves the accepted gameplay systems and corrects presentation integration around the shared Art-First infrastructure.

## Shared architecture

- `ArtDirectedCanvas` remains the normalized overlay/calibration layer.
- `ArtScreenHost` now sizes mapped screens from the **actual available host width and height**, fits the native art ratio with `contain`, centers the canvas, and exposes one shared art-scale variable.
- Runtime layout authority is separated from reference art through `referenceAssetId`, `runtimeBaseAssetId`, and `artUsage` metadata.
- Fixed art screens explicitly declare `screenScroll`; mapped regions declare their own scroll policy where needed.
- Runtime base image natural dimensions are checked against the manifest in development/calibration mode.
- Geometry is manifest-owned. CSS styles region contents but no longer owns the important x/y/width/height placement for migrated screens.

## Migrated screens

1. Captain Equipment / Inventory — male runtime base
2. Captain Equipment / Inventory — female runtime base
3. Ship Management
4. Market
5. Crew Roster
6. Journal / Intelligence
7. Naval Encounter
8. Character Creator

All eight are registered in `src/artLayouts/registry.ts` and rendered through `ArtScreenHost` / `ArtDirectedCanvas`.

## Equipment / Inventory correction

The original full-screen equipment references are retained as reference art. Live runtime uses content-only derivatives:

- `public/art/ui/runtime/equipment_male_empty.png`
- `public/art/ui/runtime/equipment_female_empty.png`

The runtime derivatives remove duplicate global chrome and fixed sample state. Gameplay values, item icons, meter fill, selected state and equipment state are code-driven. Inventory uses a fixed visible grid with paging rather than arbitrary scroll.

## Scroll ownership

- Equipment male/female: `none`
- Ship Management: `none`
- Market: `none` with paging
- Crew Roster: `none` with paging
- Journal: `none` with tab/page navigation
- Character Creator: `none` with six creation steps
- Naval Encounter: `region_only`; only the mapped combat log may scroll

No migrated fixed art screen is permitted to force outer document scrolling.

## Production-art status

High-resolution runtime bases:
- Equipment male/female — 1672×799 content-area derivatives
- Ship Management — 1672×941
- Character Creator — 1672×941

Explicitly provisional low-resolution runtime bases:
- Market — 494×288
- Crew Roster — 494×270
- Journal — 492×288
- Naval Encounter — 492×289

The provisional assets are legal runtime bases for this infrastructure pass because they are explicitly marked provisional and do not masquerade as final high-resolution production art. They should be replaced when higher-resolution production derivatives are available without changing their underlying gameplay systems.

## Live browser QA

Real served-browser geometry was validated at:

- 1920×1080
- 1600×900
- 1440×900
- 1366×768

For every migrated screen, QA records the real topbar/nav/main/host/canvas rectangles and verifies:

- canvas contained inside host
- no horizontal document scroll
- no vertical document scroll on fixed screens
- host scroll policy satisfied
- runtime image natural dimensions match the manifest
- only explicitly allowed mapped regions overflow

Artifacts:

- `docs/visual-qa/art-screen-integration/browser-geometry.json`
- `docs/visual-qa/art-screen-integration/screen-audit.json`
- 96 full-runtime screenshots: live, calibration, and populated states across all four target resolutions for all eight screens
- `docs/visual-qa/art-screen-integration/asset-audit.json`

## Verification gate

Final Hotfix 9 gate:

- Alpha TypeScript check: PASS
- Alpha standalone compile: PASS
- art-layout manifest verification: PASS (8 layouts)
- functional regression tests: PASS (157/157)
- real-browser geometry: PASS (8 screens × 4 resolutions × 3 states)
- runtime art-path audit: PASS
- image decode audit: PASS
- served Alpha smoke: PASS

The ordinary Next production build was not part of the accepted standalone Alpha gate in this container because the local package copy does not include the `next` executable. The standalone Alpha build and actual served-browser runtime are the tested deliverable for this checkpoint.

## Visual QA note

The market summary overlay received a final fit correction after live visual review so text no longer collapses vertically inside the painted side well at 1366×768.

## Definition-of-done result

Hotfix 9 keeps gameplay and canonical state intact while separating five responsibilities:

1. approved reference = intended visual direction
2. clean runtime base = actual screen foundation
3. manifest = dynamic geometry
4. ArtScreenHost = viewport fit / letterboxing / scroll ownership
5. game systems = changing state and behavior

That division is now the production pattern for future art-first screens.
