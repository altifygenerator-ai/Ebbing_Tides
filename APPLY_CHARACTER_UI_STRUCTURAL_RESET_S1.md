# APPLY — Alpha 0.6D Character UI Structural Reset / Pre-Art S1

## Base
Apply this overlay over the current **0.6.0-alpha.d.character1d** project. This is intentionally a presentation reset, not an endorsement of Pass 1D.

## What this does
- Removes the Character Creator, Captain Sheet, named Crew sheets, Crew Roster, and Journal from the active manuscript-skin runtime path.
- Preserves the useful Character/RPG Pass 1 functionality and data already added.
- Re-establishes simple, explicit, code-owned geometry so later reputation/law/smuggling/privateering functions can be added before final visual art is painted.
- Leaves the old manuscript assets in the repository as discarded/reference experiment material; they are not required by these runtime screens.
- Does not change save schema 11.

## Structural target in this build
- Creator: step rail / live form / portrait-actions columns.
- Captain: identity portrait column / flexible record column.
- Crew: plain code-owned muster ledger.
- Journal: local section rail / two live reading pages.
- Repeated card/frame styling is deliberately flattened; current styling is functional scaffolding, not final art.

## Verification
- `npm run typecheck:alpha` — PASS
- `npm run alpha:build` — PASS
- `npm test` — 266/266 PASS
- `npm run alpha:art-layouts` — PASS (2/2)

## Manual review
This build is **not** an art milestone. Review only information placement, sizing, scroll ownership, readability, and whether the live controls have sensible homes. Final geometry should remain provisional until the missing Character RPG / Reputation / Law systems are implemented.
