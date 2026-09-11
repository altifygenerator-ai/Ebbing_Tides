# Alpha 0.6D — Character UI Structural Pre-Art S3

Package: `0.6.0-alpha.d.characterstruct3`  
Expected base: `0.6.0-alpha.d.characterstruct2`  
Save schema: v11 (unchanged)

## Purpose

S3 is the final small pre-R1 structural cleanup requested after manual S2 inspection. It does not add final manuscript painting and does not implement Reputation/Law R1. Its purpose is to remove now-unhelpful runtime identity chips, lock icon geometry before art, clean the Character Creator training/help interaction, and make the selected homeland/culture/faith easier to read beside the portrait.

## Changes

### Identity-symbol cleanup on structural screens
- Removes the small ancestry/homeland/religion/affiliation chip strips from Character Creator portrait preview, Captain record, named-officer record, Crew roster rows, and Ship overview art well.
- The underlying four-channel identity-symbol system remains canonical and available to other accepted surfaces.
- Final character-interface art will reintroduce identity symbolism as integrated decoration rather than floating runtime chips.

### Character Creator
- The portrait side now exposes a code-owned three-line identity summary: **Homeland**, **Culture**, and **Faith**.
- Culture/religion selection remains mechanically separate; this is presentation only.
- Attribute and skill entries now reserve 22px code-owned icon slots for the later art/icon pass.
- Training descriptions no longer use floating tooltip blocks over the checklist. Hover/focus updates one fixed **Training notes** region below the training grid.

### Captain and named officer sheets
- Attribute and skill rows now reserve matching icon slots so the final art pass can add a consistent painted icon set without changing geometry.
- Named-officer detail uses its portrait rather than a stack of identity-symbol chips.

### Crew roster
- Named rows now use portrait + name/role only in the identity cell; the redundant small symbol column is removed.
- Ordinary-company vs named-officer separation from S2 remains unchanged.

### Ship management
- Every major Ship Status row now owns the same 24px icon gutter.
- Existing suitable art is used immediately for Hull, Sails, Rigging, Morale, Cargo, and Supplies.
- Guns, Crew, Loyalty, and Crew Quality retain the slot with no fake substitute art.
- Existing refits use relevant current art where possible: Storm Rigging uses the rigging icon and Reinforced Bilge Pumps uses the flooding/bilge icon. The slot remains generic for future fittings.

## Future painted theme rule — locked for art phase

Character-interface art will use **Culture as the primary painted theme** and **Religion as a secondary accent layer**. The culture layer owns most of the palette, manuscript/material language, border/ornament style, regional imagery, and major decorative composition. It must deliberately leave reserved accent anchors for religion. Religion fills only those anchors (for example title emblem, portrait-adjacent seal, divider glyph, corner accents, footer/faith mark, and small color notes). The result must always read culture first, religion second. UI geometry does not change for culture/religion combinations.

## Verification

- TypeScript (`npm run typecheck:alpha`): PASS
- Alpha compile (`npm run alpha:build`): PASS
- Automated tests: 280/280 PASS
- Art-layout verification: 2/2 PASS
- Save schema: v11 unchanged
- Full Next build was not run successfully in this environment because the `next` executable is not installed.
- Browser screenshot automation was attempted but local navigation was blocked by the execution environment; manual runtime inspection remains required.
