# Apply Character UI Structural Pre-Art S3

Apply this overlay to the accepted **Character UI Structural Pre-Art S2** project (`0.6.0-alpha.d.characterstruct2`).

1. Back up the current project.
2. Extract this ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.characterstruct3`.
4. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`
5. Manually inspect:
   - Character Creator portrait identity summary and Training page help behavior.
   - Attribute/skill icon gutters in Creator, Captain, and named-officer records.
   - Captain/Crew/Ship screens for removal of the small identity-symbol chip strips.
   - Ship Status icon alignment, including the reserved blank gutters where final icons do not yet exist.
   - Refits & Modules icon slots.

No save migration is required; schema remains v11.

This is still a **pre-art structural pass**. Empty attribute/skill/status icon slots are intentional geometry reservations, not missing final artwork. The culture-primary / religion-accent painted theme system is deferred to the later art phase after functional/UI geometry approval.
