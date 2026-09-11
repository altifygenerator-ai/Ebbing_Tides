# Alpha 0.6C Hotfix 8 — Verification & QA

## Final automated gate

- `npm run typecheck:alpha` — **PASS**
- `npm run alpha:build` — **PASS**
- `npm run alpha:art-layouts` — **PASS: 2 registered layouts, 0 failures**
- `npm test` — **PASS: 149 / 149**

## Art Layout Calibration infrastructure checks

The Hotfix 8 regression suite verifies that:

- `ArtDirectedCanvas` exists as reusable presentation infrastructure
- the permanent calibration directive is committed under `docs/canon/ART_LAYOUT_CALIBRATION_SYSTEM.md`
- male and female equipment layouts are separate normalized manifests
- both manifests reference logical asset IDs in the asset registry
- every mapped region stays inside the normalized `0.0 → 1.0` art coordinate space
- equipment slots, inventory grid, filter hitboxes, dynamic text, and selected-item detail are structured mapped regions
- the current Captain/companion equipment renderer consumes `ArtDirectedCanvas`
- former hardcoded equipment percentage maps have been removed from `src/alpha/main.ts`
- the base art uses one fixed aspect-ratio canvas and is not independently `cover`-cropped
- proportional region geometry shows **0 normalized drift** in the required resolution checks

## Required resolution checks

Validated by `npm run alpha:art-layouts` at:

- 1920 × 1080
- 1600 × 900
- 1440 × 900
- 1366 × 768

Machine-readable results:

- `docs/visual-qa/art-layout-calibration/resolution-verification.json`

Because overlays and artwork use the same normalized coordinate space, resizing scales the complete composition as one unit rather than independently reflowing the UI.

## Calibration mode QA

Calibration mode supports:

- visible region outlines and region names
- normalized x / y / width / height
- region center point
- native-art dimensions
- live rendered-art dimensions
- scale readout
- live normalized cursor position
- region selection
- drag-to-move
- Shift-drag resize
- lower-right resize handle
- copyable normalized region JSON

Enable it with either:

- `?artCalibration=1`
- **Alt+Shift+C**

## Visual proof set

Stored under `docs/visual-qa/art-layout-calibration/`:

### Male

- `equipment_male_A_calibration.png`
- `equipment_male_B_production.png`
- `equipment_male_C_populated.png`

### Female

- `equipment_female_A_calibration.png`
- `equipment_female_B_production.png`
- `equipment_female_C_populated.png`

The calibration images show mapped regions directly over the production artwork. The populated images show representative dynamic item art occupying the mapped equipment and inventory regions.

## Art / asset QA

- Runtime `/art/...` reference audit — **PASS: 111 / 111 resolve**
- Image decode audit — **PASS: 266 / 266 images decode**
- Equipment male base asset — **PASS**
- Equipment female base asset — **PASS**
- Both equipment bases are registered through logical asset IDs

Machine-readable audit:

- `docs/visual-qa/art-layout-calibration/asset-audit.json`

## Served smoke check

Standalone Alpha server returned HTTP 200 for:

- `/alpha/index.html`
- `/alpha/js/alpha/main.js`
- `/alpha/js/artLayouts/ArtDirectedCanvas.js`
- `/art/ui/equipment_template_male.png`
- `/art/ui/equipment_template_female.png`

## Gameplay regression safety

The full 149-test suite continues to cover navigation, world simulation, progression, NPC planning, economy/market behavior, inventory/equipment rules, ship refits, naval combat, boarding/personal combat, save migration, physical-distance rules, content registry behavior, and the prior Art-First presentation integration.

This hotfix changes presentation infrastructure and equipment layout geometry. It does **not** rewrite the underlying gameplay systems.
