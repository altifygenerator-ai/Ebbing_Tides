# Apply Character UI Structural Pre-Art S2

Apply this overlay to the accepted **Character UI Structural Reset / Pre-Art S1** project (`0.6.0-alpha.d.characterstruct1`).

1. Back up the current project.
2. Extract this ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.characterstruct2`.
4. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`
5. Manually inspect Creator Review, Captain Sheet, Crew, Ship, and Port Outfitter at normal desktop zoom.

No save migration is required; schema remains v11.

Do not treat the temporary named-crew portrait stand-ins or reserved fitting icon slots as final art. This is still a pre-art structural pass.
