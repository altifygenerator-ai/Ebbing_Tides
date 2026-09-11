# Alpha 0.6D — Phase A/B Package Manifest

Package role: **Navigation Feel Gate / continuation checkpoint**

Base lineage:

`Ebbing_Tides_Alpha_0.6C_Main_Identity_Symbol_Cleanup_2026-09-08`

Current package version:

`0.6.0-alpha.d.phase-ab`

## Milestone status

- `functionalStatus`: **PASS**
- `visualStatus`: **PENDING MANUAL APPROVAL**
- `feelStatus`: **PENDING MANUAL APPROVAL**
- Save schema: **v10 unchanged**

This package intentionally stops after Alpha 0.6D Phase B. Do **not** begin Phase C or later phases until the navigation interaction has been manually reviewed and accepted.

## Included 0.6D work

### Phase A — Audit / remove noise

- UI noise audit
- RPG gameplay audit
- direct player-managed Attunement removed from normal Character Creation
- exact Attunement meter removed from normal player/NPC presentation
- qualitative derived Arcane/Industrial specialization
- development/milestone noise removed from normal runtime UI
- superseded manual navigation tick/pan controls removed

### Phase B — Navigation recovery

- bounded chart camera
- drag-to-pan with click/drag disambiguation
- smooth cursor-anchored wheel zoom
- 120×80 far strategic atlas
- approximately 18×12 default navigation view
- approximately 12×8 close navigation view
- high-resolution Skeldra regional art registered into the same global coordinate system
- regional/global art transition
- sharp dynamic route/marker/label overlays
- initial marker and label level-of-detail rules
- click destination → immediate route/distance/ETA/hazard summary
- Sail Until Interrupted
- voyage cancellation/stop
- automatic continuation after resolved interruptions where appropriate
- Search Waters
- strategic sighting before tactical combat distance

## Required continuation order

1. Manually review navigation drag/zoom/selection/Sail/Search Waters feel.
2. Correct Phase B issues if required.
3. Only after manual acceptance begin Phase C — contextual port flow.
4. Continue Phase D/E/F/G in the order required by the Alpha 0.6D Master Implementation Directive.
5. Do not activate large world-population expansion at the end of 0.6D without manual approval.

## Final packaging regression gate

Executed against this exact source tree immediately before packaging:

- Node regression suite: **197 / 197 PASS**
- Alpha TypeScript typecheck: **PASS**
- Alpha standalone compilation: **PASS**
- Art-layout verification: **PASS — 3 layouts, 0 failures**

## Primary 0.6D documentation

- `docs/ALPHA_0.6D_PHASE_AB_CHECKPOINT.md`
- `docs/BUILD_VERIFICATION_ALPHA_06D_PHASE_AB.md`
- `docs/ALPHA_0.6D_NAVIGATION_EXPERIENCE.md`
- `docs/ALPHA_0.6D_UI_NOISE_AUDIT.md`
- `docs/ALPHA_0.6D_RPG_GAMEPLAY_AUDIT.md`
- `docs/ALPHA_0.6D_MAP_ART_RESOLUTION_AUDIT.md`
- `docs/ARCANE_INDUSTRIAL_SPECIALIZATION.md`
- `docs/IMPLEMENTATION_STATUS.md`

## Preservation rule

Continue to preserve the accepted UI Production Architecture Recovery infrastructure, four-channel main identity system, canonical physical world model, simulation foundations, and save compatibility unless a later approved milestone explicitly changes them.

---

## Superseding navigation feel-gate correction

This original Phase A/B package manifest is retained for lineage. The current continuation checkpoint supersedes its packaging status with:

`docs/ALPHA_0.6D_NAVIGATION_FEEL_GATE_CORRECTION_1_PACKAGE_MANIFEST.md`

Current regression gate after Correction 1: **199 / 199 PASS**, TypeScript PASS, Alpha build PASS, art-layout verification PASS (3 layouts, 0 failures). Phase C remains blocked pending manual navigation visual/feel approval.
