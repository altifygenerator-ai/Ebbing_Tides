# Alpha 0.6D — Contextual Location Presentation Cleanup 1

## Scope
Presentation-only cleanup after Contextual Location Presentation Pass 1. No gameplay mechanics, save schema, or screen architecture were changed.

## Changes
- All six Skeldran contextual scene frames now use the exact normalized runtime aspect ratio (2172×500 / 4.344:1), preventing the left baked category-symbol plaque from being cropped by a shallower `object-fit: cover` viewport.
- Removed responsive fixed-height overrides that reintroduced horizontal crop at smaller desktop widths.
- Tavern mechanics now use equal-width columns, equal-height panels, and bottom-aligned action areas for a symmetrical CRPG presentation.
- Mobile behavior remains single-column below 800px.

## Preserved
- MARKET / TAVERN / HARBOR / ROYAL PALACE / TEMPLE / PEOPLE scene art.
- Dynamic code-owned location/entity names.
- Existing mechanics and contextual port flow.
- UI Production Architecture Recovery rule: one visual structure = one geometry owner.
- Save schema v10.

## Acceptance
Manual visual review should confirm the complete left plaque is visible on all six scene banners and the two Tavern mechanics panels align cleanly.
