# Alpha 0.6D — Contextual Location Presentation Cleanup 2

## Scope
Tight presentation correction only. No new gameplay mechanics and no save-schema changes.

## Changes
- Contextual location scroll ownership moved from the mechanics-only lower pane to the entire inner location surface.
- The local return/context bar remains fixed.
- Scene art, centered dynamic heading, and mechanics now scroll together.
- Applied to Market, Tavern, Harbor/Shipyard, Royal Palace/Government, Temple, People, and docked Ship contextual presentation.
- Tavern adjacent-panel inherited top margin removed.
- Tavern mechanic panels and action areas now share one aligned grid baseline.

## Validation
- 225/225 tests PASS
- TypeScript PASS
- Alpha build PASS
- Art layout validation 3/3 PASS
- Save schema remains v10

## Manual visual gate
Pending user inspection.
