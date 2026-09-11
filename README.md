# Ebbing Tides Alpha 0.6D — Character / RPG Pass 1D

**Manuscript Integration Cleanup**

This pass responds directly to the live Pass 1C screenshots. It keeps the painted manuscript direction, but removes the frame stacking and art/content collisions that made parts of the Character Creator, Captain Sheet, Crew Roster, and Journal still read like digital panels with decoration laid over them.

Key changes:

- Reworked the active manuscript page and muster-book paintings into quieter runtime-safe interiors while preserving the painted binding/page edge treatment.
- Cleaned the Journal writing pages so the painted open book remains the physical surface without decorative art intruding into live entries.
- Removed extra full-screen brass/chart corner overlays from manuscript screens.
- Removed duplicated cornerwork, decorative header overlays, repeated painted subsection frames, and other layers that were visually colliding with live UI.
- Character Creator now uses one dominant folio surface; its portrait + navigation side is one parchment side folio instead of separate framed cards.
- Captain/Officer records now enforce horizontal containment and use a quieter parchment portrait column with no extra ship vignette behind live information.
- Crew Roster uses a cleaner painted muster ledger with code-owned rows and summary strips unobstructed.
- Journal remains large and dominant, but page-edge tabs and live writing are separated cleanly from the book painting.
- Manuscript-local controls remain readable but use a softer leather/ink treatment instead of heavy black digital frames.
- No gameplay, Reputation/Law, crime, smuggling, privateering, or save-schema changes.

Automated gate on the development tree:

- Tests: 281/281 PASS
- TypeScript: PASS
- Alpha build: PASS
- Art-layout verification: 2/2 PASS
- Save schema: v11

Manual visual approval is still required before Phase 1 is locked and Phase 2 begins.
