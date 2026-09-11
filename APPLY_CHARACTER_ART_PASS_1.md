# Apply — Character Creator / Captain Purpose-Painted Art Pass 1

Base: accepted **Alpha 0.6D R2 + R2 Readiness Gate** build.

1. Extract this overlay into the project root and replace matching files.
2. Run:

```powershell
npm run typecheck:alpha
npm run alpha:build
npm test
npm run alpha:art-layouts
```

Expected automated result for this overlay: **466/466 tests passing**, including **9/9 dedicated Character Art Pass 1 tests**, and art-layout verification **2/2 PASS**.

## Manual visual acceptance
Before calling this pack locked:
1. Start a new character. Confirm the default Skeldran + Old Gods creator has the painted Skeldran culture treatment.
2. On Homeland / Culture / Faith, switch Religion between Old Gods and Covenant. The cultural structure should stay Skeldran while the secondary accent/mark changes.
3. Switch Culture to Asterian (or another unimplemented culture). It should return to the neutral locked layout rather than reusing Skeldran art.
4. Switch back to Skeldran and finish creation. Open Captain -> Character Sheet. It should use the same saved culture/religion combination.
5. Check all six creator pages for clipping, scroll ownership, tooltip readability, and button hit areas.
6. Check Captain Origins, Attributes & Skills, and Body / Injury sections at normal desktop width. Dynamic content must remain readable and expandable.

No Supabase migration is required. Save schema remains v12. Package semver intentionally remains `0.6.0-alpha.d.r2` because this is a presentation-only overlay.

Clean-overlay verification against the accepted R2 tree: **PASS** (466/466 full suite; 45/45 focused R2/readiness/durability; art layouts 2/2).
