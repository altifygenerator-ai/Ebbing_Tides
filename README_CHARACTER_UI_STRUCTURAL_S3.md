# Ebbing Tides Alpha 0.6D — Character UI Structural Pre-Art S3

**Package:** `0.6.0-alpha.d.characterstruct3`  
**Expected base:** `0.6.0-alpha.d.characterstruct2`  
**Save schema:** v11 (unchanged)

S3 is a focused structural cleanup after manual S2 inspection. It does **not** add final painted manuscript presentation and it does not start Reputation/Relationships/Law R1. Its purpose is to remove now-unhelpful identity-symbol chips, reserve stable icon geometry before art, clean the Character Creator training-help interaction, and make selected homeland/culture/faith more obvious beside the portrait.

## Structural changes

### Character Creator
- Removes the little ancestry/homeland/religion/affiliation symbol-chip strip from the portrait area.
- Replaces the compressed identity caption with a clearer three-line **Homeland / Culture / Faith** summary.
- Reserves consistent 22px icon gutters for every attribute and skill entry. They remain visually empty until the final icon/art phase unless suitable runtime art is deliberately assigned later.
- Replaces overlapping floating Training tooltips with one fixed **Training notes** region below the checklist. Hover/focus changes the note without covering neighboring skills.

### Captain and named-officer records
- Removes structural identity-chip stacks from the record presentation.
- Reserves the same attribute/skill icon gutters used by the Creator so final iconography can be introduced without shifting geometry.
- Named-officer detail continues to use the small portrait treatment established in S2.

### Crew roster
- Removes the redundant identity-symbol column from named crew rows.
- Keeps the S2 separation between the aggregate **Ordinary Company** and individual **Officers & Specialists**, including collective company sentiment and individual relationships toward the captain.

### Ship management
- Removes the small identity chip from the main ship-art well.
- Gives every major Ship Status fact a stable 24px icon gutter.
- Uses existing suitable art immediately for **Hull, Sails, Rigging, Morale, Cargo, and Supplies**.
- **Guns, Crew, Loyalty, and Crew Quality** keep the same reserved slot without fake substitute art.
- Existing refits reuse relevant current art where it makes sense: Storm Rigging uses the rigging icon and Reinforced Bilge Pumps uses the flooding/bilge icon.

### Identity-symbol system
The underlying approved four-channel identity system remains canonical. S3 only removes the little floating structural chips from these character/crew/ship surfaces. Symbols are intentionally deferred to the final painted composition where they can be integrated naturally rather than occupy separate UI widgets.

## Art-phase theme rule (locked, not implemented here)
Character-interface art will use **Culture as the primary painted theme** and **Religion as a secondary accent layer**. Culture owns the main palette/material/ornament/regional imagery. Culture artwork deliberately leaves reserved religion anchors such as title emblem, portrait-adjacent seal, divider glyph, corner accents, and footer/faith mark. Religion fills only those anchors, so a combination such as Skeldran + Covenant still reads Skeldran first and Covenant second. The code layout does not change between combinations.

## Verification

On the reconstructed accepted S2 baseline with S3 source changes:
- TypeScript (`npm run typecheck:alpha`): **PASS**
- Alpha compile (`npm run alpha:build`): **PASS**
- Automated tests: **280/280 PASS**
- Art-layout verification: **2/2 PASS**
- Save schema: **v11 unchanged**

The full Next production build could not be completed in this execution environment because the local `next` executable is unavailable. Automated browser screenshot QA was also attempted, but loopback navigation was blocked by the environment. Manual runtime inspection remains required before the structure is considered visually locked.
