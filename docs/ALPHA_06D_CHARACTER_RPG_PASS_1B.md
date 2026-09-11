# Alpha 0.6D — Character / RPG Pass 1B: Manuscript Tightening

Pass 1B is a presentation-only refinement over the manually reviewed Pass 1A manuscript direction.

## Target

**Rich at the edges, quiet at the content.** The painted manuscript shells should carry the atmosphere, framing, wear, binding, maritime ornament and page identity. Live fields, headings, rows, relationship entries, journal text, buttons and other dynamic data must sit on protected low-noise parchment wells so painted linework never competes with readable UI.

## Changes

- Added protected inner parchment wells to Captain/Officer records, Character Creator, and Crew Muster pages. These masks sit above the decorative shell and below live HTML, so linework cannot pass through functional content.
- Reduced title-flourish opacity and width and constrained folio/corner ornament to non-content edges.
- Enlarged the Crew Muster ledger and reduced surrounding dead space.
- Enlarged the Journal to a viewport-dominant open-book spread, widened its reading columns, reduced the gutter, and gave each live page a quiet parchment surface above the painted open-book art.
- Tightened Character Creator proportions: narrower leather index, more room for the manuscript leaf, calmer field wells, and a more integrated portrait folio.
- Increased Captain/Officer page presence and reduced gaps while preserving a single vertical scroll owner.
- No gameplay, reputation, crime, law, smuggling, privateering, save schema, voyage, crew, combat, or world-state logic changed.

## Architecture

The existing Alpha 0.6D rule remains intact: **ONE VISUAL STRUCTURE = ONE GEOMETRY OWNER.** Painted assets own material and ornament. Code owns all dynamic geometry and content. Pass 1B uses code-positioned quiet parchment wells to protect readability rather than baking gameplay geometry into art.
