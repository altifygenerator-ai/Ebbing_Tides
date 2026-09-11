# Alpha 0.6D — Navigation Feel Gate Correction 1 Package Manifest

Package role: **Phase A/B corrected navigation feel-gate / continuation checkpoint**

Base lineage:

`Ebbing_Tides_Alpha_0.6D_Phase_AB_Navigation_Feel_Gate_2026-09-08`

Original 0.6D lineage:

`Ebbing_Tides_Alpha_0.6C_Main_Identity_Symbol_Cleanup_2026-09-08`

Current package version:

`0.6.0-alpha.d.phase-ab.nav-feel-fix1`

## Milestone status

- `functionalStatus`: **PASS**
- `visualStatus`: **PENDING MANUAL APPROVAL**
- `feelStatus`: **PENDING MANUAL APPROVAL**
- Save schema: **v10 unchanged**
- Phase C: **NOT STARTED / BLOCKED BY NAVIGATION FEEL GATE**

This package remains intentionally stopped after corrected Alpha 0.6D Phase B. Do **not** begin contextual port-flow work or later 0.6D phases until navigation interaction and map presentation are manually accepted.

## Manual feel-gate corrections in this package

### 1. Destination selection is no longer Ironhaven-biased

- Removed the hard-coded Ironhaven initial selection.
- Opening the chart while docked and with no active route now frames the player's known core Skeldran ports in a regional overview.
- Known valid destination markers can be selected directly; selecting another destination replaces the previous target and route immediately.
- Port marker hit areas were enlarged without changing visible marker geometry.
- Arrival clears the selected destination rather than silently preserving an old target.

### 2. Supplies are a voyage consequence, not a routine stop condition

- Running out of supplies no longer interrupts an ordinary Sail Until Interrupted voyage.
- Supply consumption continues to be simulated underneath.
- Crossing into exhausted stores records a world event but does not seize control from the player.
- Arrival carries a voyage report summarizing:
  - routed distance travelled
  - elapsed voyage time
  - supplies used
  - supplies remaining / exhausted state
  - net Hull damage
  - net Sails damage
  - net Rigging damage
- The report is shown on arrival and summarized in the arrival notification.

### 3. Atlas and regional navigation art rendering tightened

- Added a **3600×2400** canonical 3:2 world-atlas runtime master so the browser no longer continuously stretches the old 4:3 source into the 120×80 world rectangle.
- Added a lossless **4096×2926** Skeldra regional runtime PNG with restrained source-preserving sharpening.
- Removed the SVG dim filter from map art and reduced the runtime wash that softened chart detail.
- Functional overlays remain separate and screen-resolution sharp.
- The current Skeldra regional chart remains **PROVISIONAL for native painted detail**: if manual review still finds it too soft, the correct next step is a genuinely new high-resolution registered regional painting, not stronger sharpening filters.

## Required continuation order

1. Manually review free destination selection, chart drag/zoom, atlas/regional sharpness, route clarity, Sail, voyage report and Search Waters feel.
2. Correct any remaining Phase B issues.
3. Only after manual acceptance begin Phase C — contextual port flow.
4. Continue Phase D/E/F/G in the order required by the Alpha 0.6D Master Implementation Directive.
5. Do not activate large world-population expansion at the end of 0.6D without manual approval.

## Regression additions

The automated gate now includes checks for:

- no hard-coded Ironhaven initial target
- known-port regional overview camera framing
- supplies exhausting without producing a voyage stop
- arrival voyage-report accounting
- existing Sail Until Interrupted, Search Waters, route-distance, camera, zoom, Attunement and prior-system regressions

## Final packaging regression gate

Run against this corrected source tree before packaging:

- Node regression suite: **199 / 199 PASS**
- Alpha TypeScript typecheck: **PASS**
- Alpha standalone compilation: **PASS**
- Art-layout verification: **PASS — 3 layouts, 0 failures**

## Primary 0.6D documentation

- `docs/ALPHA_0.6D_NAVIGATION_FEEL_GATE_CORRECTION_1.md`
- `docs/ALPHA_0.6D_NAVIGATION_FEEL_GATE_CORRECTION_1_PACKAGE_MANIFEST.md`
- `docs/ALPHA_0.6D_PHASE_AB_CHECKPOINT.md`
- `docs/ALPHA_0.6D_NAVIGATION_EXPERIENCE.md`
- `docs/ALPHA_0.6D_MAP_ART_RESOLUTION_AUDIT.md`
- `docs/ALPHA_0.6D_UI_NOISE_AUDIT.md`
- `docs/ALPHA_0.6D_RPG_GAMEPLAY_AUDIT.md`
- `docs/ARCANE_INDUSTRIAL_SPECIALIZATION.md`
- `docs/IMPLEMENTATION_STATUS.md`

## Preservation rule

Continue preserving the accepted UI Production Architecture Recovery infrastructure, four-channel main identity system, canonical physical world model, simulation foundations and save compatibility unless a later approved milestone explicitly changes them.

## Continuation archive size note

To keep this corrected continuation checkpoint transportable, the archive does not duplicate three categories of **non-runtime historical evidence already preserved in the immediately preceding Phase A/B package**:

- exploratory `public/art/library/candidate-reference` image files
- original `public/art/ui/ability-library/Source_Sheets` image sheets
- Phase 2 / Phase 3 UI-recovery screenshot archives under `docs/visual-qa`

These omissions do not affect runtime art, current approved identity references, gameplay source, tests, build output, calibration data, current documentation, or the 0.6D navigation correction. Placeholder notes remain in the two art source directories. Use the predecessor checkpoint when archival source-sheet / old visual-QA evidence is needed.
