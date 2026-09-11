# Apply Character / RPG Pass 1D — Manuscript Integration Cleanup

Apply this overlay to the accepted **Alpha 0.6D Character / RPG Pass 1C** project.

1. Back up the current project.
2. Copy the contents of `ET_Alpha_0.6D_Character_RPG_Pass_1D_PATCH/` into the project root, preserving paths and overwriting matching files.
3. Run `npm test`.
4. Run `npm run typecheck:alpha`.
5. Run `npm run alpha:build`.
6. Run `npm run alpha:art-layouts`.
7. Launch the Alpha build and manually inspect Character Creator, Captain Sheet, one named Officer Sheet, Crew Roster, and Journal at normal desktop zoom.

Expected package version: `0.6.0-alpha.d.character1d`.
Expected save schema: `v11` (unchanged).

This pass is presentation-only. It does not implement Reputation/Law Phase 2 mechanics.
