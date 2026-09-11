# Ebbing Tides Alpha 0.6D — Character Creator / Captain Reference-Locked Production 1E

## Frame & Vignette Authenticity Pass

Production 1E is a **targeted refinement over the accepted Production 1D baseline**. It does not redesign the Character Creator or Captain Sheet and does not change gameplay mechanics, save data, creator flow, or screen ownership.

The pass addresses the two remaining visual problems called out during manual review:

- repeated use of the same painted harbor/city vignette;
- manuscript/menu housings that still read as rectangular CSS-skinned panels rather than painted physical construction.

## What changed

### Distinct vignette roles

The Review header keeps the harbor-register scene, while the Captain pages now use distinct imagery:

- Personal History — coast / ship approach;
- Capabilities — chart / compass treatment;
- Condition — ship treatment;
- Captain profile lower accent — ship/seal treatment.

This removes the obvious repeated city-strip effect without adding random decoration.

### Painted manuscript construction

The creator's main manuscript page and all three Captain manuscript pages now use independent painted runtime pieces:

- top lintel;
- bottom sill;
- left and right manuscript stiles;
- four painted corner pieces.

The live DOM still owns geometry, scrolling, text, forms, accordions, and data. The art pieces surround those safe content regions and have `pointer-events: none`.

### Open section housings

The remaining box-like Creator and Captain sections were opened up. The rectangular border treatment was removed from targeted sections and replaced by three varied painted manuscript lintels plus quiet parchment field shifts. This applies to areas such as the Creator mechanical-impact/toolbox/effects sections and the Captain standing/relationship/local-standing accordions.

## What did not change

- Character Creator mechanics or choices;
- Captain data or progression;
- gameplay systems;
- save schema (still v12);
- culture/religion runtime ownership;
- any screen outside Character Creator and Captain.

Religion remains the secondary accent layer. Skeldran remains the primary culture visual pack.

## Verification

Final Production 1E working-tree verification:

- `npm run typecheck:alpha` — PASS
- `npm run alpha:build` — PASS
- `npm test` — **480 / 480 PASS**
- dedicated Production 1E tests — **8 / 8 PASS**
- `npm run alpha:art-layouts` — **2 / 2 PASS**

The runtime screenshots under `docs/visual-qa/character-art-production-1e/` are captures of the actual compiled Alpha runtime, not standalone concept mockups.

A fresh clean-overlay application onto the reconstructed accepted Production 1D baseline passed the same four gates: TypeScript, Alpha build, **480/480** full tests, and **2/2** art layouts.
