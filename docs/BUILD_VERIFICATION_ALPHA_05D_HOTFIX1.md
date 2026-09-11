# Alpha 0.5D Hotfix 1 — Creator Viewport Stability

## Scope

This is a presentation-only correction over commit `bc51ea1` / Alpha 0.5D. It preserves save schema 6 and does not alter simulation, map coordinates, route geometry, art IDs, progression, NPC brains, economy, combat, or persistence.

## Fixed

- Character creation now uses an explicit viewport-height panel rather than a max-height-only grid, preventing the panel from shrinking/re-anchoring after portrait interaction.
- The creator scroll body is vertically scrollable but horizontally clipped; wide child grids are constrained to the local pane.
- Portrait radios use a bounded visually-hidden focus target and preserve keyboard focus indication on the selected card.
- Portrait filtering now runs only when sex, ancestry, culture, or religion changes. Clicking a portrait no longer triggers an unnecessary gallery filter/reflow pass.
- Crew inspector and dialogue reveal behavior now scroll the nearest intentional internal pane rather than using document-level `scrollIntoView()`.
- Compact-height creator rules keep the header/body/footer coherent on common laptop-height viewports.

## Regression / audit

The fixed-shell audit covers Navigation, Town/port surfaces, Market, Captain/Gear, Crew, Journal, conversations, encounters, personal combat, POIs, arrival screens, and character creation. Whole-document scrolling remains disabled; overflow is confined to deliberate internal panes.

Automated acceptance includes:

- fixed creator viewport height
- no creator horizontal overflow
- portrait click does not re-filter/reflow the gallery
- no `scrollIntoView()` remains in source interactions
- crew/dialogue use nearest local scroll pane
- previous Alpha 0.1–0.5D simulation and UI regressions remain passing
