# Alpha 0.6D — Character / RPG Pass 1C: Painted Manuscript Integration

Pass 1C is the second visual recovery/tightening step for the Character Creator, Captain/Officer records, Crew Muster and Journal. It responds directly to the manual review that Pass 1B was mechanically clean but still read too much like a digital layout wearing parchment.

## Target

**Painted manuscript first; live UI second.** The runtime should feel like an illustrated captain's ledger/open book in the same visual family as the approved reference material, while preserving the permanent rule that dynamic content and mechanics remain code-owned.

## Changes

- Added new runtime-safe painted folio shells with deliberately quiet content regions and hand-painted coastal/harbor marginalia outside those regions.
- Replaced the ruled parchment texture inside the live content area with an unruled, irregular painted parchment texture so straight background rules no longer compete with headings, fields or rows.
- Removed Pass 1B's opaque rectangular content-safe overlay wells. The art asset itself now owns a clean safe zone, allowing more of the painting to remain visible.
- Reduced modern card/table language across Captain and Officer records: facts, skills, standing and relationship entries now read as manuscript rules/ledger entries rather than boxed dashboard cards.
- Reworked the portrait column to echo the reference composition with a framed miniature and a non-functional painted ship vignette in the lower margin.
- Reworked the Character Creator so the page reads as a painted opening folio: less black framing, a dark ship illustration in the bound index, quieter live fields, and a reserved painted harbor margin beneath the form.
- Reworked Crew Muster summary/table styling toward a ship's ledger rather than a grid of UI cards.
- Journal now reveals the painted open-book asset directly. The two code-owned pages are transparent writing layers on top of the book rather than opaque digital parchment rectangles; bottom marginalia are kept beneath a reserved reading margin.
- Added painterly outer-desk props (brass compass/chart details) only in non-interactive screen edges.
- No gameplay, law/reputation, crime, smuggling, privateering, combat, voyage, crew simulation, save schema, or world-state logic changed.

## Runtime Art Safety

The new art contains no baked names, stats, buttons, tabs, portraits, relationship values, journal text, or other sample gameplay state. Decorative artwork is confined to margins and reserved zones. Live HTML/CSS continues to own every changing field, row, control, title, value and portrait slot.

## Manual Acceptance Focus

Check the Character Creator, Captain Sheet, one named Officer sheet, Crew Roster, and Journal at normal desktop zoom. Pass 1C should be accepted only if the overall read is much closer to an illustrated painted manuscript than a themed web layout, while remaining crisp, legible, and mechanically unchanged.
