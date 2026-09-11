# Ebbing Tides — UI Production Architecture Recovery
## Phase 3 Migration Report

**Source checkpoint:** UI Recovery Phase 2 Gold Standards — manually approved  
**Build label:** Alpha 0.6C UI Recovery P3  
**Date:** 2026-09-08

## Scope

Phase 3 was executed in the required order after manual approval of the two Phase 2 gold standards:

1. Crew Roster
2. Journal / Intelligence
3. Character Creator
4. Ship Management
5. Naval Encounter / Combat

The first four screens were migrated. Naval Encounter reached an explicit ART BLOCKER and was not falsely marked complete.

## Crew Roster

**Architecture:** Art-Skinned Dynamic UI.

ART owns only the reusable parchment/naval material language. CODE owns the roster frame, columns, four visible rows, morale/loyalty/skill values, Inspect controls, pagination, and port actions.

The old 494×270 roster image is no longer runtime geometry and is used only for Reference Ghost comparison.

## Journal / Intelligence

**Architecture:** Art-Skinned Dynamic UI.

The production screen now uses code-owned two-page book geometry with reusable parchment/naval materials. CODE owns tabs, page layout, entry flow, icons, and page navigation. The old 492×288 blurred book image is reference-only and is no longer stretched underneath crisp dynamic text.

## Character Creator

**Architecture:** Art-Skinned Dynamic UI.

The six-step flow is preserved:

1. Identity
2. Homeland / Culture / Faith
3. Background / Profession
4. Training / Attributes / Skills
5. Portrait
6. Review

CODE owns the step rail, form layout, fields, validation surfaces, portrait-frame geometry, and footer controls. Portrait images remain content art. The prior 1672×941 composition is Reference Ghost only, avoiding duplicate painted form/input geometry.

## Ship Management

**Architecture:** Hybrid.

The ship illustration remains art/content. CODE owns its presentation frame plus all changing status, refit, cargo, and action geometry. The prior 1672×941 whole-screen composition is retained only as the approved reference ghost; its painted cargo/refit grids are not runtime geometry.

## Naval Encounter / Combat

**Architecture target:** Hybrid.

Final migration is **blocked** because the only current tactical-sea runtime base is approximately 492×289. Stretching that mockup is prohibited by the recovery directive. Gameplay/combat code remains untouched and functional. The required production-art specification is recorded in `docs/ART_BLOCKERS_PHASE3.md`.

## Geometry / viewport QA

Evidence: `docs/visual-qa/ui-recovery-phase3/viewport-geometry.json`.

Actual served-game checks were run at:

- 1920×1080
- 1600×900
- 1440×900
- 1366×768

Measured states included:

- Character Creator
- Crew Roster
- Journal / Intelligence
- Ship Management
- Market regression
- Inventory / Equipment regression

**24/24 measured states:** no document horizontal scroll and no document vertical scroll.

## Screenshots

Live screenshots are included for the target resolution matrix under:

`docs/visual-qa/ui-recovery-phase3/`

Reference Ghost evidence at 1600×900 is included for:

- Character Creator
- Crew Roster
- Journal / Intelligence
- Ship Management

## Asset audit

Evidence: `docs/visual-qa/ui-recovery-phase3/asset-resolution-audit.json`.

- Crew and Journal low-resolution images are reference-only after migration.
- Character Creator and Ship Management high-resolution prior compositions are reference-only after migration.
- Reusable runtime material assets use the UI art kit.
- Naval Encounter low-resolution tactical base is explicitly `replace` / ART BLOCKER.

Image decode audit: `275/275` PASS, `0` failures.

## Automated validation

- TypeScript: PASS
- Alpha standalone build: PASS
- Art layout validation: PASS — 3 remaining exact-coordinate layouts, 0 failures
- Regression tests: **176/176 PASS**
- Served runtime smoke: PASS
- Image decode audit: **275/275 PASS**
- Save/gameplay systems preserved


## Cleanup pass 1 — pre-symbol polish

Applied after manual review of the Phase 3 screens, before the planned insignia/rune/symbol pass.

- Character Creator / Training: core-skill labels now use dark ink contrast on the parchment-backed option rows instead of inheriting the pale global `.check` text color.
- Journal / History: world-event summaries are now the primary entry text, with a readable formatted campaign date/time beneath them. The opaque `H0` / `H<n>` debug-style hour marker is no longer used as the visible history heading.
- No screen architecture, geometry ownership, gameplay rules, save schema, or content canon changed.
- Added a regression assertion covering both cleanup fixes.

## Manual visual approval

**PENDING USER APPROVAL** for:

- Crew Roster
- Journal / Intelligence
- Character Creator
- Ship Management

Naval Encounter is not offered for final visual approval because its required production art is blocked.
