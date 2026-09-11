# Apply — Character Creator + Captain Purpose-Painted Lock Pass 1A

Base: accepted Alpha 0.6D R2 build. This correction is also safe to apply over the rejected Character Art Pass 1 attempt; it replaces the runtime source/CSS and supersedes its test file.

1. Extract this ZIP into the Ebbing Tides project root and replace matching files.
2. If you previously installed the rejected Character Art Pass 1, optionally run:

   `powershell -ExecutionPolicy Bypass -File .\CLEAN_REJECTED_CHARACTER_ART_PASS_1.ps1`

   The old image-under-UI assets are no longer referenced even if you leave them in place; the cleanup script only removes those obsolete files.
3. Run:

   `npm run typecheck:alpha`

   `npm run alpha:build`

   `npm test`

   `npm run alpha:art-layouts`

Expected full suite: **466 / 466 PASS**.

## Manual visual acceptance

Check all six Character Creator steps plus the Captain Character Sheet.

The pass is correct only if:

- painted art reads as frames/edges/ornament **around** the live UI rather than an illustration underneath it;
- form controls and changing text remain clean and unobstructed;
- the center of every painted frame is visually the live code-owned panel;
- switching Skeldran + Old Gods to Skeldran + Covenant changes only the secondary faith accent;
- switching to an unimplemented culture removes the Skeldran frame pack rather than borrowing it;
- no other game screen changes appearance.
