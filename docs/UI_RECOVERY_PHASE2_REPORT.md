# Ebbing Tides — UI Production Architecture Recovery
## Phase 2 Gold-Standard Report

**Source checkpoint:** `ebbing-tides-alpha-0.6c-hotfix10-final-alignment-pass`  
**Recovery build label:** `Alpha 0.6C UI Recovery P2`  
**Date:** 2026-09-08

Phase 2 intentionally stops after the two gold-standard screens. Crew, Journal, Character Creator, Ship Management, and Naval Combat have **not** been migrated under the recovery architecture in this phase.

## A. Files changed

Major production/recovery files changed or added:

- `src/ui/GameViewport.ts`
- `src/ui/screenArchitecture.ts`
- `src/artLayouts/ArtScreenHost.ts`
- `src/artLayouts/ArtDirectedCanvas.ts`
- `src/artLayouts/ReferenceGhost.ts`
- `src/artLayouts/types.ts`
- `src/artLayouts/registry.ts`
- `src/artLayouts/character/equipmentMale.ts`
- `src/artLayouts/character/equipmentFemale.ts`
- `src/alpha/main.ts`
- `src/data/seed/assets.ts`
- `public/alpha/styles.css`
- `public/art/ui/runtime/equipment_male_runtime_v2.png`
- `public/art/ui/runtime/equipment_female_runtime_v2.png`
- `public/art/ui/reference/equipment_male_content_reference.png`
- `public/art/ui/reference/equipment_female_content_reference.png`
- `public/art/ui/reference/market_reference_crop.png`
- `public/art/ui/kit/parchment_tile.png`
- `public/art/ui/kit/dark_naval_panel.png`
- `public/art/ui/kit/brass_panel_strip.png`
- `tests/alpha-06c-ui-recovery-phase2.test.mjs`
- `docs/UI_PRODUCTION_ARCHITECTURE.md`
- `docs/UI_ART_ASSET_PIPELINE.md`
- `docs/canon/ART_FIRST_UI_PRESENTATION_RULE.md`
- `docs/canon/ART_LAYOUT_CALIBRATION_SYSTEM.md`
- `docs/visual-qa/ui-recovery/current-screen-audit.json`
- `docs/visual-qa/ui-recovery-phase2/*`

## B. Architecture created

### Global production architecture

- Logical game viewport: **1600×900**.
- Logical main content design space: **1428×844**.
- UI scale derives from the measured game/screen content rectangle, not PNG native dimensions.
- `ArtScreenHost` uses both available width and available height and centers anchored content with controlled letterboxing.
- Every major player-facing screen now has an architecture declaration: Art-Anchored, Art-Skinned Dynamic, Environment, Hybrid, or Utility.
- Scroll ownership is explicit.
- `ReferenceGhost` provides Live / Both / Reference / Blink and opacity control through **Alt+Shift+G**.
- Art calibration remains available for anchored regions through **Alt+Shift+C**.

### Gold Standard 1 — Inventory / Equipment

**Architecture:** Hybrid.

ART owns:
- paper-doll composition
- male/female figure
- exact equipment slot frames
- decorative structural frame

CODE owns:
- equipment hitboxes
- equipped item icons
- inventory grid geometry
- inventory item icons
- filters/modes
- character values/meters
- item detail
- inventory paging

Male and female use separate runtime bases and separate region manifests.

### Gold Standard 2 — Market

**Architecture:** Art-Skinned Dynamic.

ART owns:
- Veyrholm environment backdrop
- reusable parchment/naval/brass materials and visual language

CODE owns:
- ledger frame
- table header
- rows
- columns
- commodity values
- Buy/Sell controls
- pagination
- ship/purse summary

The old 494×288 painted-table base is not rendered by the Phase 2 Market.

## C. Old code / assets removed from production behavior

- Removed Market from the ArtDirectedCanvas registry and deleted `src/artLayouts/market/market.ts`.
- Removed the old `equipment_male_empty.png` and `equipment_female_empty.png` runtime files.
- Market no longer renders the low-resolution `market_base.png` as runtime geometry.
- Inventory no longer relies on a painted duplicate inventory-cell grid as its geometry owner; code owns the actual 6×5 grid.
- Reference mockups are explicitly reference-only and do not become runtime layout authority.

## D. Inventory screenshots

All are actual served-game captures.

Live male:
- `inventory-male-live-1920x1080.jpg`
- `inventory-male-live-1600x900.jpg`
- `inventory-male-live-1440x900.jpg`
- `inventory-male-live-1366x768.jpg`

Live female:
- `inventory-female-live-1920x1080.jpg`
- `inventory-female-live-1600x900.jpg`
- `inventory-female-live-1440x900.jpg`
- `inventory-female-live-1366x768.jpg`

Calibration:
- `inventory-male-calibration-1600x900.jpg`
- `inventory-female-calibration-1600x900.jpg`

Reference Ghost at ~50%:
- `inventory-male-ghost50-1600x900.jpg`
- `inventory-female-ghost50-1600x900.jpg`

## E. Market screenshots

Live:
- `market-live-1920x1080.jpg`
- `market-live-1600x900.jpg`
- `market-live-1440x900.jpg`
- `market-live-1366x768.jpg`

Reference Ghost at ~50%:
- `market-ghost50-1600x900.jpg`

## F. Viewport geometry results

Evidence: `docs/visual-qa/ui-recovery-phase2/viewport-geometry.json`

Test matrix:

- 1920×1080
- 1600×900
- 1440×900
- 1366×768

Screens/states measured:

- male Inventory / Equipment
- female Inventory / Equipment
- Market

**12/12 measured states:** no document horizontal scroll and no document vertical scroll.

The report records viewport, actual `.main` rectangle, `--ui-scale`, anchored art host/canvas rectangles, inventory grid/item-detail rectangles, and Market body/ledger/summary rectangles.

## G. High-resolution asset audit

Evidence: `docs/visual-qa/ui-recovery-phase2/asset-resolution-audit.json`

Key results:

- Male equipment runtime base: **1672×799**, production runtime base.
- Female equipment runtime base: **1672×799**, production runtime base.
- Male/female content references: **1672×799**, reference-only.
- Veyrholm environment: **1536×1024**, production environment art.
- Market reference crop: **560×253**, explicitly reference-only and never runtime geometry.
- UI kit textures/components are treated as tile/slice components; their source pixel dimensions do not control UI scale.
- **Production overscale failures: 0.**

Image-decode audit:

- `275/275` art images decoded successfully.
- Evidence: `docs/visual-qa/ui-recovery-phase2/image-decode-audit.json`.

## H. Remaining provisional assets / ART BLOCKERS

These remain outside Phase 2 and are deliberately not papered over:

- Crew Roster low-resolution provisional base: 494×270.
- Journal low-resolution provisional base: 492×288.
- Naval Encounter low-resolution provisional base: approximately 492×289.
- Character Creator / Ship Management still require Phase 3 migration decisions under the new architecture even though higher-resolution art exists.
- Legacy low-resolution Market base remains in the asset library only as old/provisional evidence; it is no longer a Phase 2 runtime dependency.

No new final art was silently invented for these screens.

## I. Typecheck result

`npm run typecheck:alpha` — **PASS**.

## J. Test result

`npm test` — **170/170 PASS** after adding Phase 2 recovery regressions, including Reference Ghost wiring for Equipment.

## K. Build result

- `npm run alpha:build` — **PASS**.
- `npm run alpha:art-layouts` — **PASS**, 7 remaining anchored/hybrid layout manifests, 0 failures.
- Served runtime smoke — **PASS**:
  - `/alpha/` → HTTP 200
  - male equipment runtime asset → HTTP 200
  - female equipment runtime asset → HTTP 200
  - Veyrholm environment asset → HTTP 200

## L. Known remaining visual issues / approval state

### Phase 2 automated acceptance

**PASS.**

- one game shell
- no page scroll at target desktop sizes
- no low-resolution Market runtime base
- no duplicate Market table geometry
- code-owned inventory grid
- art-owned exact equipment frames
- male/female runtime bases present
- Reference Ghost available for both gold standards
- no production raster overscale failure in the audited assets
- functional tests remain green

### Manual visual acceptance

**PASS — USER APPROVED.**

The screenshots are intentionally included so the user can decide whether the two gold-standard implementations meet the visual bar. Automated fit does not promote either screen to manual visual PASS.

Inventory / Equipment and Market were subsequently visually accepted by the user, unlocking Phase 3 migration work.
